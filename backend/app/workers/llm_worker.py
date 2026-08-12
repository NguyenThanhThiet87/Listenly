import uuid
import traceback
from app.modules.content.services import get_transcript, generate_segments
from app.core.database import get_db

async def process_video_background(youtube_id: str, lesson_id: str):
    print(f"[Worker] Starting: youtube_id={youtube_id}, lesson_id={lesson_id}")
    db = get_db()
    
    # 1. Fetch Transcript
    try:
        raw_transcript, formatted_transcript = get_transcript(youtube_id)
    except Exception as e:
        print(f"[Worker] Exception in get_transcript: {e}")
        traceback.print_exc()
        await db["lessons"].update_one({"_id": lesson_id}, {"$set": {"status": "failed"}})
        return
    
    print(f"[Worker] Transcript fetched: {bool(formatted_transcript)}, chars={len(formatted_transcript) if formatted_transcript else 0}")
    if not formatted_transcript:
        print("[Worker] No transcript, marking failed")
        await db["lessons"].update_one(
            {"_id": lesson_id},
            {"$set": {"status": "failed"}}
        )
        return
        
    # 2. Call LLM (Gemini)
    try:
        segments_data = await generate_segments(formatted_transcript)
    except Exception as e:
        print(f"[Worker] Exception in generate_segments: {e}")
        traceback.print_exc()
        await db["lessons"].update_one({"_id": lesson_id}, {"$set": {"status": "failed"}})
        return
    
    print(f"[Worker] Segments generated: {len(segments_data) if segments_data else 0}")
    if not segments_data:
        print("[Worker] No segments, marking failed")
        await db["lessons"].update_one(
            {"_id": lesson_id},
            {"$set": {"status": "failed"}}
        )
        return
        
    # 3. Save segments to DB
    total_segments = len(segments_data)
    segments_to_insert = []
    
    for seg in segments_data:
        segments_to_insert.append({
            "_id": str(uuid.uuid4()),
            "lesson_id": lesson_id,
            "sequence": seg.get("index"),
            "start_time": seg.get("start"),
            "end_time": seg.get("end"),
            "text": seg.get("text"),
            "difficulty": seg.get("difficulty", "B1")
        })
        
    if segments_to_insert:
        await db["segments"].insert_many(segments_to_insert)
        
    # 4. Update Lesson Status
    await db["lessons"].update_one(
        {"_id": lesson_id},
        {"$set": {
            "status": "ready",
            "total_segments": total_segments
        }}
    )
