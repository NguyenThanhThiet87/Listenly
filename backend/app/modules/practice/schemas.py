from pydantic import BaseModel
from typing import List

class CheckAnswerRequest(BaseModel):
    answer: str

class MistakeDetail(BaseModel):
    expected: str
    actual: str

class CheckAnswerResponse(BaseModel):
    score: int
    correct: bool
    mistakes: List[MistakeDetail]
