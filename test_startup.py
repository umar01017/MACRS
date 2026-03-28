import sys
import traceback
try:
    import main
    print("Main imported successfully")
    from fastapi.testclient import TestClient
    client = TestClient(main.app)
    with client:
        response = client.get("/")
        print("Response:", response.json())
except Exception as e:
    print("Exception during startup:", e)
    traceback.print_exc()
