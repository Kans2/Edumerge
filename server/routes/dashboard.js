import express from 'express';
import {
  getDashboardStats,
  getCategoryBreakdown,
  getAgeingReport,
  getStaffPerformance,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/categories', authorize('admin', 'hod'), getCategoryBreakdown);
router.get('/ageing', authorize('admin', 'hod'), getAgeingReport);
router.get('/staff-performance', authorize('admin', 'hod'), getStaffPerformance);

export default router;
