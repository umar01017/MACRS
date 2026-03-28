from langchain_groq import ChatGroq
from core.config import settings
from langchain_core.prompts import PromptTemplate

class CriticAgent:
    def __init__(self):
        self.llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama-3.3-70b-versatile")
        self.prompt = PromptTemplate(
            input_variables=["user_input", "draft_response"],
            template="You are the Critic Agent. Review the user's query and the draft response. Ensure it is accurate, hallucination-free, and directly answers the question.\nQuery: {user_input}\nDraft Response:\n{draft_response}\n\nProvide your critique and a refined response:\nRefined Response:"
        )
        self.chain = self.prompt | self.llm

    async def critique(self, user_input: str, draft_response: str) -> str:
        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
            return draft_response
        response = await self.chain.ainvoke({"user_input": user_input, "draft_response": draft_response})
        return response.content
