from fastapi import APIRouter, UploadFile, File, Form
from ai_service import chat_assistant, analyze_site_image
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/assistant", tags=["Assistant"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    history: List[Message] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    history_dicts = [h.model_dump() for h in req.history]
    result = await chat_assistant(req.message, history_dicts)
    return {"success": True, "data": result, "session_id": req.session_id}


@router.post("/analyze-site")
async def analyze_site(
    file: UploadFile = File(...),
    question: str = Form(default="What do you observe in this construction site image?")
):
    image_bytes = await file.read()
    result = await analyze_site_image(image_bytes, question)
    return {"success": True, "data": result}
