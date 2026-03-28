import asyncio
from agents.executor import ExecutorAgent

class MockWebSocket:
    async def send_text(self, text):
        print("WS OUT:", text)

async def test():
    try:
        print("Initializing ExecutorAgent...")
        executor = ExecutorAgent()
        ws = MockWebSocket()
        print("Starting execution...")
        await executor.execute("Hello, what is your name?", ws)
        print("Execution finished.")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
