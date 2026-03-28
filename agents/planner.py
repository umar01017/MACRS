from langchain_groq import ChatGroq
from core.config import settings
from langchain_core.prompts import PromptTemplate

class PlannerAgent:
    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama-3.3-70b-versatile")
        self.prompt = PromptTemplate(
            input_variables=["user_input"],
            template="You are the Planner Agent. Break down the user's query into a logical step-by-step execution plan.\nUser Query: {user_input}\nPlan:"
        )
        self.chain = self.prompt | self.llm

    async def plan(self, user_input: str) -> str:
        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
            return "1. Connect Groq API Key\n2. Execute user request"
        response = await self.chain.ainvoke({"user_input": user_input})
        return response.content
