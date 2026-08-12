import re
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai
from google.genai import types
from app.core.config import settings
import json

_genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

def extract_video_id(url: str) -> str:
    """Extracts the video ID from a YouTube URL."""
    # Match standard youtube.com/watch?v= or youtu.be/ links
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if match:
        return match.group(1)
    return ""

def get_transcript(video_id: str):
    """Fetches and normalizes the transcript for a YouTube video."""
    try:
        kwargs = {}
        if settings.YOUTUBE_PROXY:
            kwargs['proxies'] = {
                "http": settings.YOUTUBE_PROXY,
                "https": settings.YOUTUBE_PROXY,
            }
        if settings.YOUTUBE_COOKIES_FILE:
            kwargs['cookies'] = settings.YOUTUBE_COOKIES_FILE

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'], **kwargs)
        
        # Normalize the transcript to a single string with timestamps
        formatted_transcript = ""
        for entry in transcript_list:
            start = round(entry['start'], 1)
            text = entry['text'].replace('\n', ' ')
            formatted_transcript += f"[{start}] {text}\n"
            
        return transcript_list, formatted_transcript
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return None, None

async def generate_segments(transcript_text: str):
    """Calls Gemini to segment the transcript for listening practice."""
    
    prompt = f"""
You are an expert English teacher. I will provide you with a YouTube video transcript with timestamps.
Your task is to break this transcript into meaningful "listening segments" for a student to practice dictation (typing what they hear).

Rules:
1. Each segment should be a complete thought or sentence, usually lasting 2 to 10 seconds.
2. Provide the exact start time and end time for each segment.
3. Provide the EXACT text of the segment. Do NOT modify the original words.
4. Output MUST be in valid JSON format, matching this schema:
{{
    "segments": [
        {{
            "index": 1,
            "start": 12.1,
            "end": 18.5,
            "text": "So yesterday I was working on this project and I realized something."
        }}
    ]
}}

Transcript:
{transcript_text}
"""
    
    # We use the model specified in the config
    try:
        response = _genai_client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        # Parse JSON from response
        # Sometimes the model wraps JSON in markdown blocks like ```json ... ```
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        data = json.loads(response_text)
        return data.get("segments", [])
    except Exception as e:
        print(f"Error generating segments: {e}")
        return []
