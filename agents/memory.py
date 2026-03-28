from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import faiss
import os

class MemoryAgent:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store_path = "faiss_index"
        
        if os.path.exists(self.vector_store_path):
            self.vector_store = FAISS.load_local(self.vector_store_path, self.embeddings, allow_dangerous_deserialization=True)
        else:
            self.vector_store = FAISS.from_texts(["MACRS system initialized."], self.embeddings)
            self.vector_store.save_local(self.vector_store_path)

    async def retrieve(self, query: str) -> str:
        docs = self.vector_store.similarity_search(query, k=3)
        return "\n".join([doc.page_content for doc in docs])

    async def store(self, text: str):
        self.vector_store.add_texts([text])
        self.vector_store.save_local(self.vector_store_path)
