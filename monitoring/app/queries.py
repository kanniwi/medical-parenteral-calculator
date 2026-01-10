from datetime import datetime, timedelta


CALCULATION_METRICS_LAST_HOURS = """
SELECT
    recorded_at,
    total_calculations,
    authenticated_calculations,
    guest_calculations
FROM calculation_metrics
WHERE recorded_at >= $1
ORDER BY recorded_at;
"""


AVG_OPERATION_DURATION = """
SELECT
    operation_type,
    AVG(duration_ms) as avg_duration
FROM performance_metrics
WHERE recorded_at >= $1
GROUP BY operation_type;
"""


ACTIVITY_COUNT = """
SELECT
    activity_type,
    COUNT(*) as count
FROM user_activity
WHERE recorded_at >= $1
GROUP BY activity_type;
"""
