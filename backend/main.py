from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers import safety, crack, valuation, planning, weather, assistant, knowledge
import os
from dotenv import load_dotenv

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
    lifespan=lifespan
)

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",  # allow any localhost port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(safety.router)
app.include_router(crack.router)
app.include_router(valuation.router)
app.include_router(planning.router)
app.include_router(weather.router)
app.include_router(assistant.router)
app.include_router(knowledge.router)


@app.get("/")
def root():
    return {"message": "Construction Intelligence Platform API", "version": "1.0.0", "status": "operational"}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "construction-platform-api"}


@app.get("/api/history")
def get_all_history():
    from database import SessionLocal, AnalysisHistory
    import json
    db = SessionLocal()
    try:
        records = db.query(AnalysisHistory).order_by(AnalysisHistory.created_at.desc()).limit(50).all()
        return {"history": [{"id": r.id, "module": r.module, "input": r.input_summary, "created_at": r.created_at.isoformat()} for r in records]}
    finally:
        db.close()
