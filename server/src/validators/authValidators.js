const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
