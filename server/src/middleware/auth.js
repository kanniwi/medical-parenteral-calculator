const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userResult = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [
        decoded.userId,
      ]);

      if (userResult.rows.length === 0) {
        req.user = null;
        return next();
      }

      req.user = userResult.rows[0];
      next();
    } catch (_error) {
      req.user = null;
      next();
    }
  } catch (_error) {
    req.user = null;
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };
