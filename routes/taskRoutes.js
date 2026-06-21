import express from 'express';
import { check } from 'express-validator';
import taskController from '../controllers/taskController.js';
import authMiddleware from '../middleware/auth.js';
import validationMiddleware from '../middleware/validation.js';

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = taskController;

const { protect } = authMiddleware;
const { validate } = validationMiddleware;

const router = express.Router();

// Protect all routes
router.use(protect);

// Helper function
const inAllowed = (value, allowedArray) => {
  if (!value) return true;
  return allowedArray.includes(String(value).trim().toLowerCase());
};

// Validation for creating task
const taskCreateValidationRules = [
  check('title', 'Title must be at least 5 characters')
    .isLength({ min: 5 })
    .trim(),

  check('description', 'Description must be at least 20 characters')
    .isLength({ min: 20 })
    .trim(),

  check('dueDate', 'Due date is required and cannot be in the past')
    .custom((value) => {
      if (!value) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selected = new Date(value);
      return selected >= today;
    }),

  check('status')
    .optional()
    .custom((value) =>
      inAllowed(value, ['pending', 'in progress', 'completed'])
    )
    .withMessage('Status must be Pending, In Progress, or Completed'),


];

// Validation for updating task
const taskUpdateValidationRules = [
  check('title', 'Title must be at least 5 characters')
    .optional()
    .isLength({ min: 5 })
    .trim(),

  check('description', 'Description must be at least 20 characters')
    .optional()
    .isLength({ min: 20 })
    .trim(),

  check('dueDate', 'Due date cannot be in the past')
    .optional()
    .custom((value) => {
      if (!value) return true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selected = new Date(value);
      return selected >= today;
    }),

  check('status')
    .optional()
    .custom((value) =>
      inAllowed(value, ['pending', 'in progress', 'completed'])
    )
    .withMessage('Status must be Pending, In Progress, or Completed'),

  check('priority')
    .optional()
    .custom((value) =>
      inAllowed(value, ['low', 'medium', 'high'])
    )
    .withMessage('Priority must be Low, Medium, or High'),
];

// Routes
router.get('/stats', getTaskStats);

router
  .route('/')
  .get(getTasks)
  .post(taskCreateValidationRules, validate, createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(taskUpdateValidationRules, validate, updateTask)
  .delete(deleteTask);

export default router;