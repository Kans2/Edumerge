import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Update user role/status
 * @route   PATCH /api/admin/users/:id
 */
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    const update = {};
    if (role) update.role = role;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (department) update.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get staff members (for ticket assignment)
 * @route   GET /api/admin/staff
 */
router.get('/staff', async (req, res, next) => {
  try {
    const staff = await User.find({
      role: { $in: ['staff', 'admin'] },
      isActive: true,
    }).select('name email department role');

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
});

export default router;
