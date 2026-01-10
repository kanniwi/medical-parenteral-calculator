from datetime import datetime, timedelta
from app.database import get_pool
from app import queries
from app.metrics import (
    total_calculations,
    operation_duration,
    user_activity_count
)


async def collect_metrics():
    pool = await get_pool()
    since = datetime.utcnow() - timedelta(hours=24)

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            queries.CALCULATION_METRICS_LAST_HOURS,
            since
        )
        
        total_auth = 0
        total_guest = 0
        for row in rows:
            auth = row["authenticated_calculations"]
            guest = row["guest_calculations"]
            total_auth += auth
            total_guest += guest
        
        total_calculations.labels("authenticated").set(total_auth)
        total_calculations.labels("guest").set(total_guest)

        rows = await conn.fetch(
            queries.AVG_OPERATION_DURATION,
            since
        )
        
        for row in rows:
            op_type = row["operation_type"]
            avg_dur = row["avg_duration"]
            operation_duration.labels(op_type).set(avg_dur)

        rows = await conn.fetch(
            queries.ACTIVITY_COUNT,
            since
        )
        
        for row in rows:
            activity = row["activity_type"]
            count = row["count"]
            user_activity_count.labels(activity).set(count)
