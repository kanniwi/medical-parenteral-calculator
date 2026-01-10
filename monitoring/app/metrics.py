from prometheus_client import Counter, Gauge, Histogram

# --- расчёты ---
total_calculations = Gauge(
    "calculator_calculations_total",
    "Total number of calculations",
    ["user_type"]
)

# --- производительность ---
operation_duration = Gauge(
    "calculator_operation_avg_duration_ms",
    "Average operation duration in ms",
    ["operation_type"]
)

# --- активность ---
user_activity_count = Gauge(
    "calculator_user_activity_total",
    "User activity count",
    ["activity_type"]
)
