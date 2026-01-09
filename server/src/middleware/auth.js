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
    console.log(' optionalAuth middleware');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - guest mode
      console.log('  No auth header - guest mode');
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    console.log(' Token found, length:', token.length);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(' Token verified, userId:', decoded.userId);

      // Verify user still exists
      const userResult = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [
        decoded.userId,
      ]);

      if (userResult.rows.length === 0) {
        // User not found - treat as guest
        console.log(' User not found in DB - guest mode');
        req.user = null;
        return next();
      }

      req.user = userResult.rows[0];
      console.log(' User authenticated:', req.user.email);
      next();
    } catch (error) {
      // Invalid or expired token - treat as guest
      console.log(' Token verification failed:', error.message);
      req.user = null;
      next();
    }
  } catch (error) {
    console.log(' optionalAuth error:', error.message);
    req.user = null;
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };
