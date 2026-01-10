from fastapi import FastAPI
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from datetime import datetime

from app.database import init_db
from app.services.aggregator import collect_metrics

import asyncio

app = FastAPI(title="Monitoring Service")

metrics_call_count = 0


@app.on_event("startup")
async def startup():
    print("🚀 Starting Monitoring Service...")
    await init_db()
    print("⏰ Starting periodic metrics collection (every 60s)...")
    asyncio.create_task(periodic_collect())
    print("✅ Startup complete\n")


async def periodic_collect():
    while True:
        try:
            await collect_metrics()
        except Exception as e:
            print(f"❌ Error in periodic collection: {e}")
        await asyncio.sleep(60)


@app.get("/metrics")
def metrics():
    global metrics_call_count
    metrics_call_count += 1
    print(f"\n🔔 /metrics endpoint called (#{metrics_call_count}) at {datetime.utcnow()}")
    result = generate_latest()
    print(f"📤 Returning {len(result)} bytes of metrics\n")
    return Response(
        result,
        media_type=CONTENT_TYPE_LATEST
    )


@app.get("/health")
def health():
    return {"status": "ok", "metrics_calls": metrics_call_count}


@app.post("/collect-now")
async def collect_now():
    print("🔄 Manual metrics collection triggered")
    await collect_metrics()
    return {"status": "collected"}
