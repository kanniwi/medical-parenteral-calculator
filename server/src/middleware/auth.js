const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

// Strict authentication - requires valid token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const userResult = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [
      decoded.userId,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional authentication - allows guest users
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token - continue as guest
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user still exists
      const userResult = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [
        decoded.userId,
      ]);

      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
      } else {
        req.user = null;
      }
    } catch (_error) {
      // Invalid/expired token - continue as guest
      req.user = null;
    }

    next();
  } catch (_err) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = { authenticateToken, optionalAuth };
