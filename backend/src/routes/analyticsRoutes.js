import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardAnalytics);

export default router;
