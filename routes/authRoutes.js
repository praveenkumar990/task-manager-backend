import express from 'express';
import { check } from 'express-validator';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import validationMiddleware from '../middleware/validation.js';

const { registerUser, loginUser, getMe } = authController;
const { protect } = authMiddleware;
const { validate } = validationMiddleware;

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    validate
  ],
  registerUser
);

// Login route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    validate
  ],
  loginUser
);

// Get current user route
router.get('/me', protect, getMe);

export default router;
