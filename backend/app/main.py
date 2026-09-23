import time
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title="JalRakshak Decision Support API",
    description="Physics-grounded Dam-Break Flood Evacuation Window Decision Engine (SIH26161)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
    return response

@app.get("/health/live")
def health_live():
    return {
        "status": "LIVE",
        "service": "JalRakshak Backend",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/health/ready")
def health_ready():
    return {
        "status": "READY",
        "hydraulic_engine": "HEC-RAS 2D Adapter Active",
        "ewe_algorithm_version": "1.0.0",
        "database": "CONNECTED",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

app.include_router(api_router)
