from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Video(BaseModel):
    youtube_id: str
    title: str
    duration: float = 0.0
    thumbnail: str
    language: str = "en"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Segment(BaseModel):
    index: int
    start: float
    end: float
    text: str
    difficulty: str = "B1"

class Lesson(BaseModel):
    video_id: str
    status: str = "processing" # processing, ready, failed
    level: str = "B1"
    total_segments: int = 0
    segments: List[Segment] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# API Request/Response Models
class AnalyzeRequest(BaseModel):
    youtube_url: str

class AnalyzeResponse(BaseModel):
    lesson_id: str
    status: str

class LessonResponse(BaseModel):
    status: str
    total_segments: int
    youtube_id: Optional[str] = None
    segments: List[Segment] = []
