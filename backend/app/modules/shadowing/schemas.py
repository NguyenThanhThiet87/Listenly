from pydantic import BaseModel
from typing import List, Optional

class GenerateShadowingRequest(BaseModel):
    text: str
    voice_id: str = "EXAVITQu4vr4xnSDxMaL" # Bella by default, or provide your own
    style: Optional[str] = "natural"

class WordTimestamp(BaseModel):
    text: str
    start: float
    end: float

class ShadowingResponse(BaseModel):
    id: str
    audio_url: str
    duration: float
    words: List[WordTimestamp]
