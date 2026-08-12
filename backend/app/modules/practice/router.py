from fastapi import APIRouter, HTTPException
from app.modules.practice.schemas import CheckAnswerRequest, CheckAnswerResponse
from app.modules.practice.services import compare_answers
from app.core.database import get_db

router = APIRouter(prefix="/api", tags=["Assessment Engine"])

@router.post("/segments/{segment_id}/check", response_model=CheckAnswerResponse)
async def check_segment_answer(segment_id: str, request: CheckAnswerRequest):
    db = get_db()
    
    # 1. Fetch the expected segment
    segment = await db["segments"].find_one({"_id": segment_id})
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
        
    expected_text = segment["text"]
    
    # 2. Compare answers
    score, is_correct, mistakes = compare_answers(expected_text, request.answer)
    
    # Optional: Save attempt to database (Segment_Attempts) for analytics later
    
    return CheckAnswerResponse(
        score=score,
        correct=is_correct,
        mistakes=mistakes
    )
