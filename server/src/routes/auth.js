const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
