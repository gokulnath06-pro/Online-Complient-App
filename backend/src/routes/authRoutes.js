import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  getAgents,
  getAllUsers,
  updateUserRole,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/agents', protect, authorize('ADMIN', 'AGENT'), getAgents);
router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.put('/users/:id', protect, authorize('ADMIN'), updateUserRole);

export default router;
