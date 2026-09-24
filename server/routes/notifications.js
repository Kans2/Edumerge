import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .populate('ticketId', 'ticketNumber title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments({ userId: req.user._id }),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Mark all as read
 * @route   PATCH /api/notifications/read-all
 */
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
