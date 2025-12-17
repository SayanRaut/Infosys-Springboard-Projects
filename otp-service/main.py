from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import random, time

from email_service import send_email_otp

app = FastAPI(title="OTP Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

otp_store = {}

class SendOTP(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str

@app.get("/")
def health():
    return {"status": "OTP service running"}

@app.post("/send-otp")
def send_otp(data: SendOTP):
    otp = str(random.randint(100000, 999999))
    otp_store[data.email] = {
        "otp": otp,
        "expires": time.time() + 300
    }

    if not send_email_otp(data.email, otp):
        raise HTTPException(status_code=500, detail="Email sending failed")

    return {"message": "OTP sent"}

@app.post("/verify-otp")
def verify_otp(data: VerifyOTP):
    record = otp_store.get(data.email)

    if not record:
        raise HTTPException(status_code=400, detail="OTP not found")

    if time.time() > record["expires"]:
        del otp_store[data.email]
        raise HTTPException(status_code=400, detail="OTP expired")

    if record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    del otp_store[data.email]
    return {"message": "OTP verified"}
