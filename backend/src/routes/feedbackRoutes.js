import express from 'express';
import {
  submitFeedback,
  getComplaintFeedback,
  getAllFeedback,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';
import { feedbackValidation } from '../middleware/validator.js';

const router = express.Router();

router.get('/complaint/:complaintId', getComplaintFeedback);

router.use(protect);

router.post('/:complaintId', authorize('USER'), feedbackValidation, submitFeedback);
router.get('/', authorize('ADMIN', 'AGENT'), getAllFeedback);

export default router;
