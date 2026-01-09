const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/metrics/summary
 * Get comprehensive metrics summary
 * Requires authentication
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await metricsService.getMetricsSummary();
    res.json(summary);
  } catch (error) {
    console.error('Get metrics summary error:', error);
    res.status(500).json({ error: 'Failed to get metrics summary' });
  }
});

/**
 * GET /api/metrics/active-users
 * Get active users in the last hour
 * Requires authentication
 */
router.get('/active-users', authenticateToken, async (req, res) => {
  try {
    const activeUsers = await metricsService.getActiveUsers();
    res.json(activeUsers);
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

/**
 * GET /api/metrics/calculations
 * Get calculation statistics
 * Query params: limit (default: 24)
 * Requires authentication
 */
router.get('/calculations', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 24;
    const stats = await metricsService.getCalculationStats(limit);
    res.json({ stats });
  } catch (error) {
    console.error('Get calculation stats error:', error);
    res.status(500).json({ error: 'Failed to get calculation stats' });
  }
});

/**
 * GET /api/metrics/performance
 * Get performance statistics
 * Query params: operation_type, limit (default: 24)
 * Requires authentication
 */
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const operationType = req.query.operation_type || null;
    const limit = parseInt(req.query.limit) || 24;
    const stats = await metricsService.getPerformanceStats(operationType, limit);
    res.json({ stats });
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json({ error: 'Failed to get performance stats' });
  }
});

/**
 * POST /api/metrics/cleanup
 * Clean old metrics data
 * Body: { daysToKeep: number }
 * Requires authentication
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.body.daysToKeep) || 30;
    await metricsService.cleanOldMetrics(daysToKeep);
    res.json({ message: `Cleaned metrics older than ${daysToKeep} days` });
  } catch (error) {
    console.error('Clean metrics error:', error);
    res.status(500).json({ error: 'Failed to clean metrics' });
  }
});

module.exports = router;
