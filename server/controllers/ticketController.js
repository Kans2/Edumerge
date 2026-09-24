import Ticket from '../models/Ticket.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import generateTicketNumber from '../utils/generateTicketNumber.js';
import { calculateSLADeadline } from '../utils/slaCalculator.js';
import { sendEmail } from '../utils/emailService.js';
import { emitNotification } from '../utils/socket.js';

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private (Student)
 */
export const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, subcategory, priority, department, tags } = req.body;

    const ticketNumber = await generateTicketNumber();
    const slaDeadline = calculateSLADeadline(priority || 'medium');

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          filename: file.originalname,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    const ticket = await Ticket.create({
      ticketNumber,
      title,
      description,
      category,
      subcategory,
      priority: priority || 'medium',
      department: department || req.user.department,
      createdBy: req.user._id,
      slaDeadline,
      tags,
      attachments,
    });

    // Log activity
    await Activity.create({
      ticketId: ticket._id,
      performedBy: req.user._id,
      action: 'created',
      newValue: `Ticket ${ticketNumber} created`,
    });

    // Populate creator info
    await ticket.populate('createdBy', 'name email role department');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tickets (role-filtered)
 * @route   GET /api/tickets
 * @access  Private
 */
export const getTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      assignedTo,
      department,
    } = req.query;

    // Build query based on role
    const query = { isDeleted: false };

    // Role-based filtering
    if (req.user.role === 'student') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'staff') {
      query.assignedTo = req.user._id;
    }
    // admin and hod can see all

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (department) query.department = department;

    // Search by title or ticket number
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('createdBy', 'name email role department studentId')
        .populate('assignedTo', 'name email role department staffId')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Ticket.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single ticket
 * @route   GET /api/tickets/:id
 * @access  Private
 */
export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate('createdBy', 'name email role department studentId phone')
      .populate('assignedTo', 'name email role department staffId phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Students can only view their own tickets
    if (
      req.user.role === 'student' &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket.',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ticket (status, priority, assignee)
 * @route   PATCH /api/tickets/:id
 * @access  Private (Staff/Admin)
 */
export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    const { status, priority, assignedTo, department, tags } = req.body;
    const activities = [];

    // Status change
    if (status && status !== ticket.status) {
      const oldStatus = ticket.status;
      ticket.status = status;

      // Track resolution time
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (status === 'closed') {
        ticket.closedAt = new Date();
      } else if (status === 'reopened') {
        ticket.reopenedCount += 1;
        ticket.resolvedAt = null;
      }

      // Track first response
      if (!ticket.firstResponseAt && status === 'in_progress') {
        ticket.firstResponseAt = new Date();
      }

      activities.push({
        ticketId: ticket._id,
        performedBy: req.user._id,
        action: status === 'resolved' ? 'resolved' : status === 'closed' ? 'closed' : status === 'reopened' ? 'reopened' : 'status_changed',
        oldValue: oldStatus,
        newValue: status,
      });

      // Notify student of status change
      const notif = await Notification.create({
        userId: ticket.createdBy,
        ticketId: ticket._id,
        message: `Your ticket ${ticket.ticketNumber} status changed to ${status.replace('_', ' ').toUpperCase()}`,
        type: 'status_update',
      });
      emitNotification(ticket.createdBy, notif);
      
      // Also send email
      const student = await ticket.populate('createdBy');
      if (student.createdBy && student.createdBy.email) {
        await sendEmail({
          email: student.createdBy.email,
          subject: `[Update] Ticket ${ticket.ticketNumber} Status Changed`,
          message: `Your ticket ${ticket.ticketNumber} (${ticket.title}) status has been changed to ${status.replace('_', ' ').toUpperCase()}.`
        });
      }
    }

    // Priority change
    if (priority && priority !== ticket.priority) {
      const oldPriority = ticket.priority;
      ticket.priority = priority;
      ticket.slaDeadline = calculateSLADeadline(priority, ticket.createdAt);

      activities.push({
        ticketId: ticket._id,
        performedBy: req.user._id,
        action: 'priority_changed',
        oldValue: oldPriority,
        newValue: priority,
      });
    }

    // Assignment
    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      ticket.assignedTo = assignedTo;

      activities.push({
        ticketId: ticket._id,
        performedBy: req.user._id,
        action: 'assigned',
        newValue: assignedTo,
      });

      // Notify assigned staff
      const staffNotif = await Notification.create({
        userId: assignedTo,
        ticketId: ticket._id,
        message: `Ticket ${ticket.ticketNumber} has been assigned to you`,
        type: 'assignment',
      });
      emitNotification(assignedTo, staffNotif);
      
      const ticketWithStaff = await ticket.populate('assignedTo');
      if (ticketWithStaff.assignedTo && ticketWithStaff.assignedTo.email) {
        await sendEmail({
          email: ticketWithStaff.assignedTo.email,
          subject: `[Assigned] Ticket ${ticket.ticketNumber}`,
          message: `Ticket ${ticket.ticketNumber} (${ticket.title}) has been assigned to you.`
        });
      }
    }

    if (department) ticket.department = department;
    if (tags) ticket.tags = tags;

    await ticket.save();

    // Bulk create activities
    if (activities.length > 0) {
      await Activity.insertMany(activities);
    }

    await ticket.populate('createdBy', 'name email role department');
    await ticket.populate('assignedTo', 'name email role department');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to ticket
 * @route   POST /api/tickets/:id/comments
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  try {
    const { comment, isInternal } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required.',
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Students can't add internal notes
    const isInternalNote = req.user.role === 'student' ? false : isInternal;

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          filename: file.originalname,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    const activity = await Activity.create({
      ticketId: ticket._id,
      performedBy: req.user._id,
      action: 'commented',
      comment,
      isInternal: isInternalNote || false,
      attachments,
    });

    await activity.populate('performedBy', 'name email role avatar');

    // Notify relevant parties
    if (req.user.role === 'student' && ticket.assignedTo) {
      const notif = await Notification.create({
        userId: ticket.assignedTo,
        ticketId: ticket._id,
        message: `New comment on ticket ${ticket.ticketNumber}`,
        type: 'comment',
      });
      emitNotification(ticket.assignedTo, notif);
      
      const staff = await ticket.populate('assignedTo');
      if (staff.assignedTo && staff.assignedTo.email) {
        await sendEmail({
          email: staff.assignedTo.email,
          subject: `[New Comment] Ticket ${ticket.ticketNumber}`,
          message: `The student added a new comment to ticket ${ticket.ticketNumber} (${ticket.title}).\n\nComment: ${comment}`
        });
      }
    } else if (req.user.role !== 'student' && !isInternalNote) {
      const notif = await Notification.create({
        userId: ticket.createdBy,
        ticketId: ticket._id,
        message: `Staff responded to your ticket ${ticket.ticketNumber}`,
        type: 'comment',
      });
      emitNotification(ticket.createdBy, notif);
      
      const student = await ticket.populate('createdBy');
      if (student.createdBy && student.createdBy.email) {
        await sendEmail({
          email: student.createdBy.email,
          subject: `[Response] Ticket ${ticket.ticketNumber}`,
          message: `A staff member responded to your ticket ${ticket.ticketNumber} (${ticket.title}).\n\nResponse: ${comment}`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ticket activity log
 * @route   GET /api/tickets/:id/activities
 * @access  Private
 */
export const getActivities = async (req, res, next) => {
  try {
    const query = { ticketId: req.params.id };

    // Students can't see internal notes
    if (req.user.role === 'student') {
      query.isInternal = false;
    }

    const activities = await Activity.find(query)
      .populate('performedBy', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete ticket (soft delete, Admin only)
 * @route   DELETE /api/tickets/:id
 * @access  Private (Admin)
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
