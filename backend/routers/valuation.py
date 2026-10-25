from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, AnalysisHistory
from ai_service import estimate_valuation
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

router = APIRouter(prefix="/api/valuation", tags=["Valuation"])


class ValuationRequest(BaseModel):
    location: str
    area_sqft: float
    bedrooms: int
    bathrooms: float
    year_built: int
    property_type: str = "Residential"
    condition: str = "Good"
    amenities: List[str] = []
    parking: Optional[str] = "Available"
    floors: Optional[int] = 1


@router.post("/estimate")
async def estimate_property_value(req: ValuationRequest, db: Session = Depends(get_db)):
    result = await estimate_valuation(req.model_dump())
    record = AnalysisHistory(
        module="valuation",
        input_summary=f"{req.property_type} in {req.location}, {req.area_sqft} sqft",
        result_json=json.dumps(result),
        created_at=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"success": True, "data": result, "analysis_id": record.id}


@router.get("/history")
def get_valuation_history(db: Session = Depends(get_db)):
    records = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.module == "valuation")
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
