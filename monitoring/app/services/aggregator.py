from datetime import datetime, timedelta
from app.database import get_pool
from app import queries
from app.metrics import (
    total_calculations,
    operation_duration,
    user_activity_count
)


async def collect_metrics():
    print(f"\n{'='*60}")
    print(f"📊 Starting metrics collection at {datetime.utcnow()}")
    print(f"{'='*60}")
    
    pool = await get_pool()
    since = datetime.utcnow() - timedelta(hours=24)
    print(f"⏰ Collecting metrics since: {since}")

    async with pool.acquire() as conn:
        # --- calculation_metrics ---
        print(f"\n🔍 Querying calculation_metrics...")
        rows = await conn.fetch(
            queries.CALCULATION_METRICS_LAST_HOURS,
            since
        )
        print(f"📈 Found {len(rows)} calculation metric rows")
        
        total_auth = 0
        total_guest = 0
        for row in rows:
            auth = row["authenticated_calculations"]
            guest = row["guest_calculations"]
            total_auth += auth
            total_guest += guest
            print(f"  ⮕ {row['recorded_at']}: auth={auth}, guest={guest}")
        
        total_calculations.labels("authenticated").set(total_auth)
        total_calculations.labels("guest").set(total_guest)
        print(f"📊 Total: authenticated={total_auth}, guest={total_guest}")

        # --- performance_metrics ---
        print(f"\n🔍 Querying performance_metrics...")
        rows = await conn.fetch(
            queries.AVG_OPERATION_DURATION,
            since
        )
        print(f"⚡ Found {len(rows)} performance metric rows")
        
        for row in rows:
            op_type = row["operation_type"]
            avg_dur = row["avg_duration"]
            print(f"  ⮕ {op_type}: {avg_dur}ms")
            operation_duration.labels(op_type).set(avg_dur)

        # --- user_activity ---
        print(f"\n🔍 Querying user_activity...")
        rows = await conn.fetch(
            queries.ACTIVITY_COUNT,
            since
        )
        print(f"👥 Found {len(rows)} activity types")
        
        for row in rows:
            activity = row["activity_type"]
            count = row["count"]
            print(f"  ⮕ {activity}: {count} events")
            user_activity_count.labels(activity).set(count)
    
    print(f"\n✅ Metrics collection completed")
    print(f"{'='*60}\n")
