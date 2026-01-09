const express = require('express');
const router = express.Router();
const {
  createCalculation,
  getCalculations,
  deleteCalculation,
  clearCalculations,
} = require('../controllers/calculationController');
const { calculationValidator } = require('../validators/calculationValidators');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Allow guests to calculate (optionalAuth)
router.post('/', optionalAuth, calculationValidator, createCalculation);

// Allow guests to request history (will return empty with message)
router.get('/', optionalAuth, getCalculations);

// Require authentication for delete operations
router.delete('/:id', authenticateToken, deleteCalculation);
router.delete('/', authenticateToken, clearCalculations);

module.exports = router;
