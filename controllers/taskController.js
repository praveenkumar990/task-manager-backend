import Task from '../models/Task.js';
import { Types } from 'mongoose';

const normalizeEnumValue = (value) => {
  if (typeof value !== 'string') return value;
  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;
  return trimmedValue
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeTaskPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const normalized = { ...payload };

  if (normalized.status) {
    normalized.status = normalizeEnumValue(normalized.status);
  }
  if (normalized.priority) {
    normalized.priority = normalizeEnumValue(normalized.priority);
  }

  return normalized;
};

// @desc    Get all user tasks (with search, filter, pagination, sort)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const query = { user: req.user.id };

    // Search query q (searches title and description case-insensitively)
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Sorting
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);

    const tasks = await Task.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      tasks,
      currentPage: page,
      totalPages,
      totalTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const normalizedBody = normalizeTaskPayload(req.body);
    const { title, description, status, priority, dueDate } = normalizedBody;
    console.log('Creating task with data:', { title, description, status, priority, dueDate, user: req.user.id });
    const task = await Task.create({
      title,
      description,
      status,
      priority: normalizeEnumValue(req.body.priority) || "Low",
      dueDate,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    const normalizedBody = normalizeTaskPayload(req.body);
    task = await Task.findByIdAndUpdate(req.params.id, normalizedBody, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Task.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0
    };

    // Remove the aggregate group ID
    delete result._id;

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
