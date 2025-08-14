from fastapi import FastAPI
from .jwt_utils import generate_n8n_jwt
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

EVENT_GUESTS_JWT_SECRET = os.getenv("EVENT_GUESTS_JWT_SECRET")
GUEST_PHONE_JWT_SECRET = os.getenv("GUEST_PHONE_JWT_SECRET")
UPDATE_CONTACT_JWT_SECRET = os.getenv("UPDATE_CONTACT_JWT_SECRET")

@app.get("/generate-jwt/eventGuests")
def generate_jwt_event_guests():
    token = generate_n8n_jwt(secret=EVENT_GUESTS_JWT_SECRET)
    return {"token": token}

@app.get("/generate-jwt/guestPhone")
def generate_jwt_guest_phone():
    token = generate_n8n_jwt(secret=GUEST_PHONE_JWT_SECRET)
    return {"token": token}

@app.get("/generate-jwt/updateContact")
def generate_jwt_update_contact():
    token = generate_n8n_jwt(secret=UPDATE_CONTACT_JWT_SECRET)
    return {"token": token}