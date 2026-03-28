from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from core.database import connect_to_mongo, close_mongo_connection
from api.routes import api_router
from contextlib import asynccontextmanager
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="MACRS AI Backend", description="Multi-Agent Cognitive Reasoning System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8081", "http://127.0.0.1:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "MACRS API is running"}

@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    from agents.executor import ExecutorAgent
    executor = ExecutorAgent()
    try:
        while True:
            data = await websocket.receive_text()
            await executor.execute(data, websocket)
    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")
