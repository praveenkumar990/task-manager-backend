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

// Apply protect middleware to all task routes
router.use(protect);

// Validation rules for task creation
const taskCreateValidationRules = [
  check('title', 'Title must be at least 5 characters').isLength({ min: 5 }).trim(),
  check('description', 'Description must be at least 20 characters').isLength({ min: 20 }).trim(),
  check('dueDate', 'Due date is required and cannot be in the past').custom((value) => {
    if (!value) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(value);
    return selected >= today;
  }),
  check('status', 'Status must be Pending, In Progress, or Completed').optional().isIn(['Pending', 'In Progress', 'Completed']),
  check('priority', 'Priority must be Low, Medium, or High').optional().isIn(['Low', 'Medium', 'High']),
];

// Validation rules for task updates
const taskUpdateValidationRules = [
  check('title', 'Title must be at least 5 characters').optional().isLength({ min: 5 }).trim(),
  check('description', 'Description must be at least 20 characters').optional().isLength({ min: 20 }).trim(),
  check('dueDate', 'Due date cannot be in the past').optional().custom((value) => {
    if (!value) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(value);
    return selected >= today;
  }),
  check('status', 'Status must be Pending, In Progress, or Completed').optional().isIn(['Pending', 'In Progress', 'Completed']),
  check('priority', 'Priority must be Low, Medium, or High').optional().isIn(['Low', 'Medium', 'High']),
];

// Task Routes
router.get('/stats', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(taskCreateValidationRules, validate, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(taskUpdateValidationRules, validate, updateTask)
  .delete(deleteTask);

export default router;
