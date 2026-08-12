import os
import uuid
import httpx
from fastapi import HTTPException
from app.core.config import settings
from app.modules.shadowing.schemas import GenerateShadowingRequest, ShadowingResponse, WordTimestamp

# Temp directory to store audio files
TEMP_AUDIO_DIR = os.path.join(os.getcwd(), "temp_audio")
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)

async def generate_shadowing_content(request: GenerateShadowingRequest) -> ShadowingResponse:
    if not settings.ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{request.voice_id}/with-timestamps"
    
    headers = {
        "Accept": "application/json",
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "text": request.text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            print("ElevenLabs API Error:", response.text)
            raise HTTPException(status_code=response.status_code, detail="Error generating audio from ElevenLabs")
            
        result = response.json()
        
    # Result contains 'audio_base64' and 'alignment'
    import base64
    audio_bytes = base64.b64decode(result["audio_base64"])
    
    # Generate unique ID and save to temp file
    session_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_AUDIO_DIR, f"{session_id}.mp3")
    with open(file_path, "wb") as f:
        f.write(audio_bytes)
        
    alignment = result.get("alignment", {})
    characters = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])
    
    # Reconstruct words from characters
    words = []
    current_word = ""
    current_start = 0.0
    
    for i, char in enumerate(characters):
        if char == " " or i == len(characters) - 1:
            if char != " ":
                current_word += char
            
            if current_word.strip():
                # End of word
                end_time = ends[i]
                words.append(WordTimestamp(
                    text=current_word.strip(),
                    start=current_start,
                    end=end_time
                ))
            current_word = ""
            if i + 1 < len(characters):
                current_start = starts[i+1]
        else:
            if not current_word:
                current_start = starts[i]
            current_word += char

    duration = words[-1].end if words else 0.0

    return ShadowingResponse(
        id=session_id,
        audio_url=f"/api/shadowing/audio/{session_id}",
        duration=duration,
        words=words
    )
