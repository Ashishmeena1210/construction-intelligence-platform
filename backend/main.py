
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import (
    safety,
    crack,
    valuation,
    planning,
    weather,
    assistant,
    knowledge,
)

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("[Server] Database initialized.")
    yield
    print("[Server] Shutting down.")


app = FastAPI(
    title="Construction Intelligence Platform API",
    description="AI-Powered Multimodal Construction Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
# Set CORS_ORIGINS in Render's Environment settings.
# Include your deployed frontend URL without a trailing slash.
default_origins = (
    "http://localhost:5173,"
    "http://localhost:5174,"
    "http://localhost:3000"
)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", default_origins
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(safety.router)
app.include_router(crack.router)
app.include_router(valuation.router)
app.include_router(planning.router)
app.include_router(weather.router)
app.include_router(assistant.router)
app.include_router(knowledge.router)


@app.get("/")
def root():
    return {
        "message": "Construction Intelligence Platform API",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "construction-platform-api",
    }


@app.get("/api/history")
def get_all_history():
    from database import SessionLocal, AnalysisHistory

    db = SessionLocal()

    try:
        records = (
            db.query(AnalysisHistory)
            .order_by(AnalysisHistory.created_at.desc())
            .limit(50)
            .all()
        )

        return {
            "history": [
                {
                    "id": record.id,
                    "module": record.module,
                    "input": record.input_summary,
                    "created_at": record.created_at.isoformat(),
                }
                for record in records
            ]
        }
    finally:
        db.close()
