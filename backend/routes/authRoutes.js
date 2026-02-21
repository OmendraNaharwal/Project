import express from 'express';
import {
  register,
  login,
  getMe,
  getHospitalsForRegistration
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/hospitals', getHospitalsForRegistration);

// Protected routes
router.get('/me', protect, getMe);

export default router;
