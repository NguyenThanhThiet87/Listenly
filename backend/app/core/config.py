from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "listenly"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    YOUTUBE_PROXY: Optional[str] = None
    YOUTUBE_COOKIES_FILE: Optional[str] = None
    ELEVENLABS_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
