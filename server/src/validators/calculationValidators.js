const { body } = require('express-validator');

const calculationValidator = [
  body('glucose_volume').isFloat({ min: 0 }).withMessage('Glucose volume must be a positive number'),
  body('glucose_concentration')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Glucose concentration must be between 0 and 100'),
  body('amino_acids_volume')
    .isFloat({ min: 0 })
    .withMessage('Amino acids volume must be a positive number'),
  body('amino_acids_concentration')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Amino acids concentration must be between 0 and 100'),
  body('lipids_volume').isFloat({ min: 0 }).withMessage('Lipids volume must be a positive number'),
  body('lipids_concentration')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Lipids concentration must be between 0 and 100'),
  body('glucose_grams').isFloat({ min: 0 }).withMessage('Glucose grams must be a positive number'),
  body('glucose_calories')
    .isFloat({ min: 0 })
    .withMessage('Glucose calories must be a positive number'),
  body('amino_acids_grams')
    .isFloat({ min: 0 })
    .withMessage('Amino acids grams must be a positive number'),
  body('amino_acids_calories')
    .isFloat({ min: 0 })
    .withMessage('Amino acids calories must be a positive number'),
  body('lipids_grams').isFloat({ min: 0 }).withMessage('Lipids grams must be a positive number'),
  body('lipids_calories')
    .isFloat({ min: 0 })
    .withMessage('Lipids calories must be a positive number'),
  body('total_calories')
    .isFloat({ min: 0 })
    .withMessage('Total calories must be a positive number'),
  body('total_volume')
    .isFloat({ min: 0 })
    .withMessage('Total volume must be a positive number'),
];

module.exports = { calculationValidator };
