import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAgentComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignAgent,
  deleteComplaint,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  complaintValidation,
  statusUpdateValidation,
} from '../middleware/validator.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public / open lookup by ID or ticket number
router.get('/track/:id', getComplaintById);

// Protected routes
router.use(protect);

router
  .route('/')
  .post(upload.array('attachments', 5), complaintValidation, createComplaint)
  .get(authorize('ADMIN', 'AGENT'), getAllComplaints);

router.get('/my', getMyComplaints);
router.get('/assigned', authorize('AGENT', 'ADMIN'), getAgentComplaints);

router
  .route('/:id')
  .get(getComplaintById)
  .delete(deleteComplaint);

router.put(
  '/:id/status',
  authorize('AGENT', 'ADMIN'),
  statusUpdateValidation,
  updateComplaintStatus
);

router.put('/:id/assign', authorize('ADMIN', 'AGENT'), assignAgent);

export default router;
