from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Project
from ai_service import generate_project_plan
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime

router = APIRouter(prefix="/api/planning", tags=["Planning"])


class PlanningRequest(BaseModel):
    project_name: str
    project_type: str
    total_area_sqft: Optional[float] = 0
    budget: float
    duration_weeks: int
    location: str = ""
    team_size: int = 20
    special_requirements: Optional[str] = ""
    building_type: Optional[str] = "Commercial"
    floors: Optional[int] = 1


@router.post("/generate")
async def generate_plan(req: PlanningRequest, db: Session = Depends(get_db)):
    result = await generate_project_plan(req.model_dump())
    project = Project(
        name=req.project_name,
        project_type=req.project_type,
        description=req.special_requirements,
        plan_json=json.dumps(result),
        created_at=datetime.utcnow()
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"success": True, "data": result, "project_id": project.id}


@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).limit(20).all()
    return {
        "projects": [
            {"id": p.id, "name": p.name, "type": p.project_type, "plan": json.loads(p.plan_json), "created_at": p.created_at.isoformat()}
            for p in projects
        ]
    }


@router.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": project.id, "name": project.name, "type": project.project_type, "plan": json.loads(project.plan_json), "created_at": project.created_at.isoformat()}
