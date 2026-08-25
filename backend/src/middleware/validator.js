import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: errorMessages[0] || 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['USER', 'AGENT', 'ADMIN'])
    .withMessage('Invalid role specified'),
  validate,
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Complaint creation validation
export const complaintValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Complaint title is required')
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be between 5 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Complaint description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('category')
    .optional()
    .isIn(['Technical', 'Billing', 'Service', 'Hardware', 'Product', 'Other'])
    .withMessage('Invalid category specified'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority specified'),
  validate,
];

// Status update validation
export const statusUpdateValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Invalid complaint status'),
  body('note').optional().trim(),
  body('resolutionNotes').optional().trim(),
  validate,
];

// Feedback validation
export const feedbackValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Overall rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().trim(),
  body('speedRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Speed rating must be between 1 and 5'),
  body('serviceRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  validate,
];
