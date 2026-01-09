-- Metrics Schema for Medical Parenteral Calculator

-- Table for calculation metrics
CREATE TABLE IF NOT EXISTS calculation_metrics (
  id SERIAL PRIMARY KEY,
  total_calculations INTEGER DEFAULT 0,
  authenticated_calculations INTEGER DEFAULT 0,
  guest_calculations INTEGER DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for performance metrics (history load time)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  operation_type VARCHAR(50) NOT NULL, -- 'history_load', 'calculation_create', etc.
  duration_ms INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for user activity tracking (active users per hour)
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'calculation', 'history_view', etc.
  is_guest BOOLEAN DEFAULT false,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calculation_metrics_recorded_at ON calculation_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON performance_metrics(operation_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_recorded_at ON user_activity(recorded_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_guest ON user_activity(is_guest);

-- View for active users in the last hour
CREATE OR REPLACE VIEW active_users_last_hour AS
SELECT 
  COUNT(DISTINCT user_id) as active_authenticated_users,
  COUNT(DISTINCT CASE WHEN is_guest THEN id END) as active_guest_sessions,
  COUNT(DISTINCT CASE WHEN NOT is_guest THEN user_id END) + 
  COUNT(DISTINCT CASE WHEN is_guest THEN id END) as total_active_sessions
FROM user_activity
WHERE recorded_at >= NOW() - INTERVAL '1 hour';

-- View for calculation statistics
CREATE OR REPLACE VIEW calculation_statistics AS
SELECT 
  COUNT(*) as total_calculations,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_calculations,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as guest_calculations,
  DATE_TRUNC('hour', created_at) as hour
FROM calculations
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- View for average performance metrics
CREATE OR REPLACE VIEW average_performance AS
SELECT 
  operation_type,
  AVG(duration_ms) as avg_duration_ms,
  MIN(duration_ms) as min_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  COUNT(*) as operation_count,
  DATE_TRUNC('hour', recorded_at) as hour
FROM performance_metrics
GROUP BY operation_type, DATE_TRUNC('hour', recorded_at)
ORDER BY hour DESC, operation_type;

-- Function to record calculation metric (incremental)
CREATE OR REPLACE FUNCTION record_calculation_metric(is_authenticated BOOLEAN)
RETURNS void AS $$
DECLARE
  current_hour TIMESTAMP;
BEGIN
  current_hour := DATE_TRUNC('hour', NOW());
  
  -- Insert or update metrics for current hour
  INSERT INTO calculation_metrics (
    total_calculations,
    authenticated_calculations,
    guest_calculations,
    recorded_at
  ) VALUES (
    1,
    CASE WHEN is_authenticated THEN 1 ELSE 0 END,
    CASE WHEN is_authenticated THEN 0 ELSE 1 END,
    current_hour
  )
  ON CONFLICT (id) 
  WHERE recorded_at = current_hour
  DO UPDATE SET
    total_calculations = calculation_metrics.total_calculations + 1,
    authenticated_calculations = calculation_metrics.authenticated_calculations + 
      CASE WHEN is_authenticated THEN 1 ELSE 0 END,
    guest_calculations = calculation_metrics.guest_calculations + 
      CASE WHEN is_authenticated THEN 0 ELSE 1 END;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for hourly metrics
CREATE UNIQUE INDEX IF NOT EXISTS idx_calculation_metrics_hour 
ON calculation_metrics (DATE_TRUNC('hour', recorded_at));

COMMENT ON TABLE calculation_metrics IS 'Aggregated calculation metrics per hour';
COMMENT ON TABLE performance_metrics IS 'Performance metrics for various operations';
COMMENT ON TABLE user_activity IS 'User activity tracking for active user analytics';
COMMENT ON VIEW active_users_last_hour IS 'Active users in the last hour';
COMMENT ON VIEW calculation_statistics IS 'Hourly calculation statistics';
COMMENT ON VIEW average_performance IS 'Average performance metrics by operation type per hour';
