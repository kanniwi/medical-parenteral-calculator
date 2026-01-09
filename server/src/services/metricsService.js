const { pool } = require('../db/pool');

/**
 * Metrics Service
 * Handles collection and aggregation of application metrics
 */

class MetricsService {
  /**
   * Record a calculation event
   * @param {boolean} isAuthenticated - Whether the user is authenticated
   */
  async recordCalculation(isAuthenticated) {
    try {
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);

      await pool.query(
        `INSERT INTO calculation_metrics (
          total_calculations,
          authenticated_calculations,
          guest_calculations,
          recorded_at
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT ((DATE_TRUNC('hour', recorded_at)))
        DO UPDATE SET
          total_calculations = calculation_metrics.total_calculations + 1,
          authenticated_calculations = calculation_metrics.authenticated_calculations + $2,
          guest_calculations = calculation_metrics.guest_calculations + $3`,
        [
          1,
          isAuthenticated ? 1 : 0,
          isAuthenticated ? 0 : 1,
          currentHour,
        ]
      );
    } catch (error) {
      console.error('❌ Failed to record calculation metric:', error);
      // Don't throw - metrics shouldn't break the main flow
    }
  }

  /**
   * Record performance metric
   * @param {number|null} userId - User ID (null for guest)
   * @param {string} operationType - Type of operation (e.g., 'history_load', 'calculation_create')
   * @param {number} durationMs - Duration in milliseconds
   */
  async recordPerformance(userId, operationType, durationMs) {
    try {
      await pool.query(
        `INSERT INTO performance_metrics (user_id, operation_type, duration_ms)
         VALUES ($1, $2, $3)`,
        [userId, operationType, durationMs]
      );
    } catch (error) {
      console.error('❌ Failed to record performance metric:', error);
    }
  }

  /**
   * Record user activity
   * @param {number|null} userId - User ID (null for guest)
   * @param {string} activityType - Type of activity (e.g., 'login', 'calculation', 'history_view')
   * @param {boolean} isGuest - Whether the user is a guest
   */
  async recordActivity(userId, activityType, isGuest = false) {
    try {
      await pool.query(
        `INSERT INTO user_activity (user_id, activity_type, is_guest)
         VALUES ($1, $2, $3)`,
        [userId, activityType, isGuest]
      );
    } catch (error) {
      console.error('❌ Failed to record user activity:', error);
    }
  }

  /**
   * Get active users in the last hour
   * @returns {Promise<Object>} Active user statistics
   */
  async getActiveUsers() {
    try {
      const result = await pool.query(`
        SELECT * FROM active_users_last_hour
      `);
      return result.rows[0] || {
        active_authenticated_users: 0,
        active_guest_sessions: 0,
        total_active_sessions: 0,
      };
    } catch (error) {
      console.error('❌ Failed to get active users:', error);
      throw error;
    }
  }

  /**
   * Get calculation statistics
   * @param {number} limit - Number of hours to retrieve (default: 24)
   * @returns {Promise<Array>} Calculation statistics
   */
  async getCalculationStats(limit = 24) {
    try {
      const result = await pool.query(
        `SELECT * FROM calculation_statistics LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get calculation stats:', error);
      throw error;
    }
  }

  /**
   * Get performance statistics
   * @param {string} operationType - Optional filter by operation type
   * @param {number} limit - Number of hours to retrieve (default: 24)
   * @returns {Promise<Array>} Performance statistics
   */
  async getPerformanceStats(operationType = null, limit = 24) {
    try {
      let query = `SELECT * FROM average_performance`;
      const params = [];

      if (operationType) {
        query += ` WHERE operation_type = $1`;
        params.push(operationType);
      }

      query += ` ORDER BY hour DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get performance stats:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive metrics summary
   * @returns {Promise<Object>} Metrics summary
   */
  async getMetricsSummary() {
    try {
      const [activeUsers, calcStats, perfStats] = await Promise.all([
        this.getActiveUsers(),
        this.getCalculationStats(1), // Last hour
        this.getPerformanceStats(null, 1), // Last hour
      ]);

      // Get total calculations from the calculations table
      const totalResult = await pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated,
          COUNT(CASE WHEN user_id IS NULL THEN 1 END) as guest
         FROM calculations`
      );

      return {
        activeUsers,
        calculations: {
          total: parseInt(totalResult.rows[0].total),
          authenticated: parseInt(totalResult.rows[0].authenticated),
          guest: parseInt(totalResult.rows[0].guest),
          lastHour: calcStats[0] || {
            total_calculations: 0,
            authenticated_calculations: 0,
            guest_calculations: 0,
          },
        },
        performance: perfStats,
      };
    } catch (error) {
      console.error('❌ Failed to get metrics summary:', error);
      throw error;
    }
  }

  /**
   * Clean old metrics data (older than specified days)
   * @param {number} daysToKeep - Number of days to keep (default: 30)
   */
  async cleanOldMetrics(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await pool.query(
        `DELETE FROM performance_metrics WHERE recorded_at < $1`,
        [cutoffDate]
      );

      await pool.query(
        `DELETE FROM user_activity WHERE recorded_at < $1`,
        [cutoffDate]
      );

      await pool.query(
        `DELETE FROM calculation_metrics WHERE recorded_at < $1`,
        [cutoffDate]
      );

      console.log(`✅ Cleaned metrics older than ${daysToKeep} days`);
    } catch (error) {
      console.error('❌ Failed to clean old metrics:', error);
      throw error;
    }
  }
}

module.exports = new MetricsService();
