from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.content.router import router as content_router
from app.modules.practice.router import router as practice_router

app = FastAPI(title="Listenly API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, in production change to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content_router)
app.include_router(practice_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Listenly API"}

