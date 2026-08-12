import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.modules.shadowing.schemas import GenerateShadowingRequest, ShadowingResponse
from app.modules.shadowing.services import generate_shadowing_content, TEMP_AUDIO_DIR

router = APIRouter(prefix="/api/shadowing", tags=["Shadowing Studio"])

@router.post("/generate", response_model=ShadowingResponse)
async def generate_shadowing(request: GenerateShadowingRequest):
    try:
        return await generate_shadowing_content(request)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audio/{session_id}.mp3")
async def get_audio(session_id: str):
    file_path = os.path.join(TEMP_AUDIO_DIR, f"{session_id}.mp3")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found or expired")
    return FileResponse(file_path, media_type="audio/mpeg")
