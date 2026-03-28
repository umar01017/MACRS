from agents.planner import PlannerAgent
from agents.research import ResearchAgent
from agents.memory import MemoryAgent
from agents.critic import CriticAgent
from fastapi.websockets import WebSocket
import asyncio

class ExecutorAgent:
    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearchAgent()
        self.memory = MemoryAgent()
        self.critic = CriticAgent()

    async def execute(self, user_input: str, websocket: WebSocket):
        try:
            await websocket.send_text("📝 Planning execution...\n")
            plan = await self.planner.plan(user_input)
            await websocket.send_text(f"{plan}\n\n")

            await websocket.send_text("🔍 Researching information...\n")
            research_findings = await self.researcher.research(plan, user_input)
            await websocket.send_text(f"{research_findings}\n\n")

            await websocket.send_text("🧠 Retrieving memories...\n")
            memories = await self.memory.retrieve(user_input)
            
            draft_response = f"Research:\n{research_findings}\n\nPast Query Context:\n{memories}"

            await websocket.send_text("⚖️ Critiquing response...\n")
            final_response = await self.critic.critique(user_input, draft_response)
            
            await self.memory.store(f"Q: {user_input} A: {final_response}")

            await websocket.send_text(f"✅ Final MACRS Response:\n{final_response}")
        except Exception as e:
            import traceback
            traceback.print_exc()
            await websocket.send_text(f"❌ Error occurred: {str(e)}")
