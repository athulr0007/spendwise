const { body, validationResult } = require('express-validator');

// Validation rules for Expense creation and update
const expenseValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => {
      const val = parseFloat(value);
      if (isNaN(val) || val <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return true;
    }),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'])
    .withMessage('Invalid category. Must be one of: Food, Transport, Shopping, Bills, Entertainment, Other'),
  
  body('date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date format. Must be a valid ISO8601 date (YYYY-MM-DD)'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
];

// Middleware to capture and return validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  expenseValidationRules,
  validate
};
