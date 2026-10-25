from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, AnalysisHistory
from ai_service import analyze_crack
import json
from datetime import datetime

router = APIRouter(prefix="/api/crack", tags=["Crack Detection"])


@router.post("/analyze")
async def analyze_crack_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    image_bytes = await file.read()
    result = await analyze_crack(image_bytes)
    record = AnalysisHistory(
        module="crack",
        input_summary=f"Image: {file.filename}",
        result_json=json.dumps(result),
        created_at=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"success": True, "data": result, "analysis_id": record.id}


@router.get("/history")
def get_crack_history(db: Session = Depends(get_db)):
    records = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.module == "crack")
        .order_by(AnalysisHistory.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "history": [
            {"id": r.id, "input": r.input_summary, "result": json.loads(r.result_json), "created_at": r.created_at.isoformat()}
            for r in records
        ]
    }
