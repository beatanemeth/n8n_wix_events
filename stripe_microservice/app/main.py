from fastapi import FastAPI
from app.stripe_fetcher import get_paid_sessions
import traceback

app = FastAPI()

@app.get("/fetch-paid-sessions")
def fetch_sessions():
    try:
        result = get_paid_sessions()
        return result
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "trace": traceback.format_exc()
        }
