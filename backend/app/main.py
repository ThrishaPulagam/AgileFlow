from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.routes import router
from app.auth import auth_router
from fastapi.middleware.cors import CORSMiddleware
# Create database tables
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="AgileFlow API",
    description="Agile Project Management Tool for Small Teams",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(auth_router)
@app.get("/")
def home():
    return {
        "message": "Welcome to AgileFlow API",
        "status": "Running successfully"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }