import jwt
import time

def generate_n8n_jwt(secret: str, ttl_seconds: int = 900, subject: str = "n8n"):
    now = int(time.time())
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + ttl_seconds
    }
    return jwt.encode(payload, secret, algorithm="HS256")
