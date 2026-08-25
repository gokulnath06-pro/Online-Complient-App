import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router
  .route('/:complaintId')
  .get(getMessages)
  .post(upload.array('attachments', 3), sendMessage);

export default router;
