import uuid
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.modules.content.schemas import AnalyzeRequest, AnalyzeResponse, LessonResponse
from app.modules.content.services import extract_video_id
from app.workers.llm_worker import process_video_background
from app.core.database import get_db

router = APIRouter(prefix="/api", tags=["Content Engine"])

@router.post("/videos/analyze", response_model=AnalyzeResponse)
async def analyze_video(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    youtube_id = extract_video_id(request.youtube_url)
    if not youtube_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
    db = get_db()
    
    # Check if video already exists
    video = await db["videos"].find_one({"youtube_id": youtube_id})
    if not video:
        video_id = str(uuid.uuid4())
        await db["videos"].insert_one({
            "_id": video_id,
            "youtube_id": youtube_id,
            "title": "Unknown Title", # In a full version, fetch from YouTube API
            "thumbnail": f"https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg",
            "created_at": datetime.utcnow()
        })
    else:
        video_id = video["_id"]
        
    # Check if lesson already exists
    existing_lesson = await db["lessons"].find_one({"video_id": video_id})
    if existing_lesson:
        # If lesson previously failed, clean up and reprocess
        if existing_lesson["status"] == "failed":
            old_lesson_id = existing_lesson["_id"]
            await db["lessons"].delete_one({"_id": old_lesson_id})
            await db["segments"].delete_many({"lesson_id": old_lesson_id})
        else:
            return AnalyzeResponse(lesson_id=existing_lesson["_id"], status=existing_lesson["status"])
        
    # Create new lesson entry
    lesson_id = str(uuid.uuid4())
    await db["lessons"].insert_one({
        "_id": lesson_id,
        "video_id": video_id,
        "status": "processing",
        "level": "B1",
        "total_segments": 0,
        "created_at": datetime.utcnow()
    })
    
    # Trigger background task
    background_tasks.add_task(process_video_background, youtube_id, lesson_id)
    
    return AnalyzeResponse(lesson_id=lesson_id, status="processing")

@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson_status(lesson_id: str):
    db = get_db()
    lesson = await db["lessons"].find_one({"_id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    segments = []
    youtube_id = None
    
    # Fetch youtube_id from the videos collection
    video_doc = await db["videos"].find_one({"_id": lesson["video_id"]})
    if video_doc:
        youtube_id = video_doc.get("youtube_id")
    
    if lesson["status"] == "ready":
        # Fetch segments
        cursor = db["segments"].find({"lesson_id": lesson_id}).sort("sequence", 1)
        async for doc in cursor:
            segments.append({
                "index": doc["sequence"],
                "start": doc["start_time"],
                "end": doc["end_time"],
                "text": doc["text"],
                "difficulty": doc.get("difficulty", "B1")
            })
            
    return LessonResponse(
        status=lesson["status"],
        total_segments=lesson["total_segments"],
        youtube_id=youtube_id,
        segments=segments
    )
