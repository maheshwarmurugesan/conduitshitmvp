"""Water Plant Integration API — E-Log and future connectors."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, get_session
from elog.routes import router as elog_router
from routes_platform import router as platform_router
from routes_spec import router as spec_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    # shutdown if needed


app = FastAPI(
    title="Water Plant Integration API",
    description="Middleware: SCADA, WIMS, E-Log, CMMS. E-Log module included.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS: allow only frontend origin(s). Dev default localhost:3000; production set FRONTEND_ORIGIN.
_origins_raw = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
_allow_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount E-Log and platform (dashboard, morning review, alerts, WO, shift) under /api
app.include_router(elog_router, prefix="/api")
app.include_router(platform_router)
app.include_router(spec_router)


@app.get("/health")
def health():
    return {"status": "ok"}
