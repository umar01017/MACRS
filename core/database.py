from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_state = Database()

async def connect_to_mongo():
    db_state.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_state.db = db_state.client[settings.MONGO_DB_NAME]
    print("Connected to MongoDB")

async def close_mongo_connection():
    if db_state.client:
        db_state.client.close()
    print("Closed MongoDB connection")

def get_db():
    return db_state.db
