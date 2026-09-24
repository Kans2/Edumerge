import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  addComment,
  getActivities,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', upload.array('attachments', 5), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicket);
router.patch('/:id', authorize('staff', 'admin', 'hod'), updateTicket);
router.delete('/:id', authorize('admin'), deleteTicket);

// Comments & Activities
router.post('/:id/comments', upload.array('attachments', 3), addComment);
router.get('/:id/activities', getActivities);

export default router;
