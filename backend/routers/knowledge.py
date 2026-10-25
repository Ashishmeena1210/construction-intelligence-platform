from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, AnalysisHistory
from ai_service import query_knowledge
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge"])


class KnowledgeRequest(BaseModel):
    query: str
    category: Optional[str] = "General"


@router.post("/query")
async def knowledge_query(req: KnowledgeRequest, db: Session = Depends(get_db)):
    result = await query_knowledge(req.query, req.category or "General")
    record = AnalysisHistory(
        module="knowledge",
        input_summary=f"[{req.category}] {req.query[:200]}",
        result_json=json.dumps(result),
        created_at=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"success": True, "data": result, "analysis_id": record.id}


@router.get("/categories")
def get_categories():
    return {
        "categories": [
            "General", "Structural Engineering", "Safety & OSHA",
            "Concrete & Masonry", "Steel Construction", "MEP Systems",
            "Project Management", "Building Codes", "Sustainability", "Materials"
        ]
    }


@router.get("/history")
def get_knowledge_history(db: Session = Depends(get_db)):
    records = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.module == "knowledge")
        .order_by(AnalysisHistory.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "history": [
            {"id": r.id, "query": r.input_summary, "result": json.loads(r.result_json), "created_at": r.created_at.isoformat()}
            for r in records
        ]
    }
