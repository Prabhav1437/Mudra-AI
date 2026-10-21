from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Mudra AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    text: str
    language: Optional[str] = "English"

class TranslationResponse(BaseModel):
    original_text: str
    language: str
    tokens: List[str]
    gloss: str
    status: str

class GestureRecognitionRequest(BaseModel):
    gesture_data: Optional[str] = None
    frame_count: Optional[int] = 0

class GestureRecognitionResponse(BaseModel):
    recognized_text: str
    confidence: float
    status: str

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Mudra AI Backend",
        "version": "0.1.0"
    }

@app.post("/api/audio-to-isl", response_model=TranslationResponse)
def translate_audio_to_isl(payload: TranslationRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text query cannot be empty")
    tokens = [w.upper() for w in payload.text.strip().split()]
    gloss = f"{' '.join(tokens)} [ISL GLOSS]"
    return TranslationResponse(
        original_text=payload.text,
        language=payload.language or "English",
        tokens=tokens,
        gloss=gloss,
        status="processed"
    )

@app.post("/api/isl-to-speech", response_model=GestureRecognitionResponse)
def translate_isl_to_speech(payload: GestureRecognitionRequest):
    return GestureRecognitionResponse(
        recognized_text="Namaste, welcome to Mudra AI",
        confidence=0.96,
        status="recognized"
    )
