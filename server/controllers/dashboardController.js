import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { getAgeingBucket } from '../utils/slaCalculator.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const query = { isDeleted: false };

    // Role-based filtering
    if (req.user.role === 'student') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'staff') {
      query.assignedTo = req.user._id;
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      slaBreachedTickets,
      criticalTickets,
      pendingTickets,
    ] = await Promise.all([
      Ticket.countDocuments(query),
      Ticket.countDocuments({ ...query, status: 'open' }),
      Ticket.countDocuments({ ...query, status: 'in_progress' }),
      Ticket.countDocuments({ ...query, status: 'resolved' }),
      Ticket.countDocuments({ ...query, status: 'closed' }),
      Ticket.countDocuments({ ...query, slaBreached: true, status: { $nin: ['closed', 'resolved'] } }),
      Ticket.countDocuments({ ...query, priority: 'critical', status: { $nin: ['closed', 'resolved'] } }),
      Ticket.countDocuments({ ...query, status: { $in: ['pending_student', 'pending_approval'] } }),
    ]);

    // Average resolution time (for resolved/closed tickets)
    const resolvedTicketsData = await Ticket.find({
      ...query,
      resolvedAt: { $ne: null },
    })
      .select('createdAt resolvedAt')
      .lean();

    let avgResolutionHours = 0;
    if (resolvedTicketsData.length > 0) {
      const totalHours = resolvedTicketsData.reduce((sum, t) => {
        return sum + (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedTicketsData.length) * 10) / 10;
    }

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        slaBreachedTickets,
        criticalTickets,
        pendingTickets,
        avgResolutionHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category breakdown
 * @route   GET /api/dashboard/categories
 * @access  Private (Admin/HOD)
 */
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Ticket.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ageing report
 * @route   GET /api/dashboard/ageing
 * @access  Private (Admin/HOD)
 */
export const getAgeingReport = async (req, res, next) => {
  try {
    const activeTickets = await Ticket.find({
      isDeleted: false,
      status: { $nin: ['closed', 'resolved'] },
    })
      .select('createdAt priority status category')
      .lean();

    const buckets = { fresh: 0, normal: 0, ageing: 0, critical: 0 };
    activeTickets.forEach((ticket) => {
      const bucket = getAgeingBucket(ticket.createdAt);
      buckets[bucket]++;
    });

    res.status(200).json({
      success: true,
      data: buckets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff performance
 * @route   GET /api/dashboard/staff-performance
 * @access  Private (Admin/HOD)
 */
export const getStaffPerformance = async (req, res, next) => {
  try {
    const performance = await Ticket.aggregate([
      {
        $match: {
          isDeleted: false,
          assignedTo: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
          open: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
          },
          slaBreached: {
            $sum: { $cond: ['$slaBreached', 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff',
        },
      },
      { $unwind: '$staff' },
      {
        $project: {
          _id: 1,
          name: '$staff.name',
          email: '$staff.email',
          department: '$staff.department',
          totalAssigned: 1,
          resolved: 1,
          open: 1,
          slaBreached: 1,
          resolutionRate: {
            $cond: [
              { $gt: ['$totalAssigned', 0] },
              { $round: [{ $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { resolutionRate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};
