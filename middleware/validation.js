import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first validation error message for simplicity or all of them
    const messages = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({
      success: false,
      message: messages,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export default { validate };
