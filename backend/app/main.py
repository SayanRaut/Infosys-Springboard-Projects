from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.db.base import Base
from app.db.session import engine

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Modern Banking Dashboard")

# --- CORS: ALLOW EVERYTHING (For Debugging) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <--- This allows localhost, 127.0.0.1, everything
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------------------

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Banking API is running"}