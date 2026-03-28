from langchain_groq import ChatGroq
from core.config import settings
from langchain_core.prompts import PromptTemplate

class ResearchAgent:
    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama-3.3-70b-versatile")
        self.prompt = PromptTemplate(
            input_variables=["plan", "user_input"],
            template="You are the Research Agent. Based on the user's query and the execution plan, simulate factual research or extract key concepts.\nQuery: {user_input}\nPlan:\n{plan}\nResearch Findings:"
        )
        self.chain = self.prompt | self.llm

    async def research(self, plan: str, user_input: str) -> str:
        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
            return "No actual API Key provided, returning mock research data."
        response = await self.chain.ainvoke({"plan": plan, "user_input": user_input})
        return response.content
