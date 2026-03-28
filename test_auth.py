import traceback
import asyncio
from core.database import connect_to_mongo, close_mongo_connection
from core.database import get_db
from api.auth import register_user
from models.user import UserCreate

async def test():
    await connect_to_mongo()
    db = get_db()
    user_data = UserCreate(username="testrunner", email="test_runner@test.com", password="password")
    try:
        res = await register_user(user_data, db)
        print("Result:", res)
    except Exception as e:
        traceback.print_exc()
    await close_mongo_connection()

asyncio.run(test())
