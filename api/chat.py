from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from core.database import get_db
from models.chat import ChatSession
import uuid

router = APIRouter()

@router.post("/sessions", response_model=ChatSession)
async def create_chat_session(user_id: str, db: Any = Depends(get_db)):
    collection = db["chat_sessions"]
    new_session = ChatSession(session_id=str(uuid.uuid4()), user_id=user_id)
    await collection.insert_one(new_session.model_dump())
    return new_session

@router.get("/sessions/{user_id}", response_model=List[ChatSession])
async def get_user_sessions(user_id: str, db: Any = Depends(get_db)):
    collection = db["chat_sessions"]
    cursor = collection.find({"user_id": user_id})
    sessions = await cursor.to_list(length=100)
    return [ChatSession(**session) for session in sessions]
