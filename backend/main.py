import math
import struct
import wave
import io
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from backend.stt import transcribe_audio_bytes, DEFAULT_MODEL_SIZE
from backend.isl_grammar import convert_to_isl_gloss, SIGN_VOCABULARY
from backend.gesture import recognize_sign_gesture, GESTURE_CATALOG

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
    isl_gloss: str
    tokens: List[str]
    animations: List[Dict[str, Any]]
    token_count: int
    animation_steps: int
    status: str

class GestureRecognitionRequest(BaseModel):
    image_base64: Optional[str] = None
    gesture_hint: Optional[str] = None
    frame_count: Optional[int] = 0

class GestureRecognitionResponse(BaseModel):
    gesture_id: str
    recognized_text_en: str
    recognized_text_hi: str
    speech: str
    confidence: float
    status: str
    features: Optional[Dict[str, Any]] = None

class STTResponse(BaseModel):
    text: str
    detected_language: str
    language_probability: float
    duration: float
    model_used: str
    isl_gloss: str
    tokens: List[str]
    animations: List[Dict[str, Any]]
    segments: List[Dict[str, Any]]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Mudra AI Backend",
        "version": "0.1.0"
    }

@app.get("/api/stt/status")
def stt_status():
    return {
        "model": f"whisper-{DEFAULT_MODEL_SIZE}",
        "engine": "faster-whisper",
        "vision_model": "TorchHandGestureCNN",
        "grammar_model": "DistilBert-ISLNeuralGrammar",
        "languages": ["en", "hi", "multilingual"],
        "ready": True
    }

@app.get("/api/isl/dictionary")
def get_isl_dictionary():
    letters = [chr(i) for i in range(ord('A'), ord('Z') + 1)]
    numbers = [str(i) for i in range(0, 10)]
    dataset_alphabets = {l: f"/isl_dataset/alphabets/{l}.jpg" for l in letters}
    dataset_digits = {n: f"/isl_dataset/digits/{n}.jpg" for n in numbers}
    dataset_words = {
        "HELLO": "/isl_dataset/words/HELLO.jpg",
        "NAMASTE": "/isl_dataset/words/NAMASTE.jpg",
        "ME": "/isl_dataset/words/ME.jpg",
        "MY": "/isl_dataset/words/MY.jpg",
        "THANK": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "THANKS": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "HELP": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "WATER": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "TRAIN": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "FOOD": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "GOOD": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "YES": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "NO": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "STOP": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "EMERGENCY": "/isl_dataset/reference/ISL_Sign_Chart.png"
    }
    return {
        "words": SIGN_VOCABULARY,
        "letters": letters,
        "numbers": numbers,
        "gestures": GESTURE_CATALOG,
        "dataset": {
            "alphabets": dataset_alphabets,
            "digits": dataset_digits,
            "words": dataset_words,
            "chart": "/isl_dataset/reference/ISL_Sign_Chart.png",
            "model": {
                "name": "PyTorch ISL Gesture LSTM",
                "classes": ["HELP", "HI", "I", "LOVE", "OK", "THANK YOU", "WANT", "WATER", "YOU"]
            }
        }
    }

@app.get("/api/isl/dataset")
def get_isl_dataset():
    letters = [chr(i) for i in range(ord('A'), ord('Z') + 1)]
    numbers = [str(i) for i in range(0, 10)]
    return {
        "version": "1.0.0",
        "total_alphabets": 26,
        "total_digits": 10,
        "alphabets": {l: f"/isl_dataset/alphabets/{l}.jpg" for l in letters},
        "digits": {n: f"/isl_dataset/digits/{n}.jpg" for n in numbers},
        "words": {
            "HELLO": "/isl_dataset/words/HELLO.jpg",
            "NAMASTE": "/isl_dataset/words/NAMASTE.jpg",
            "ME": "/isl_dataset/words/ME.jpg",
            "MY": "/isl_dataset/words/MY.jpg",
            "THANK": "/isl_dataset/reference/ISL_Sign_Chart.png",
            "HELP": "/isl_dataset/reference/ISL_Sign_Chart.png",
            "WATER": "/isl_dataset/reference/ISL_Sign_Chart.png"
        },
        "chart": "/isl_dataset/reference/ISL_Sign_Chart.png",
        "model": {
            "name": "PyTorch ISL Gesture LSTM",
            "weights": "backend/models/sign_lstm_torch.pth",
            "classes": ["HELP", "HI", "I", "LOVE", "OK", "THANK YOU", "WANT", "WATER", "YOU"]
        }
    }

@app.get("/api/announcements")
def get_announcements():
    return {
        "railway": [
            {
                "id": "r1",
                "title": "Train Arrival at Platform 2",
                "en": "Train number 12301 to New Delhi is arriving on platform 2.",
                "hi": "ट्रेन नंबर 12301 नई दिल्ली प्लेटफॉर्म 2 पर आ रही है।"
            },
            {
                "id": "r2",
                "title": "Platform Change Notice",
                "en": "Attention please: train to Mumbai will arrive on platform 4.",
                "hi": "कृपया ध्यान दें मुंबई जाने वाली ट्रेन प्लेटफॉर्म 4 पर आएगी।"
            },
            {
                "id": "r3",
                "title": "Ticket Counter Location",
                "en": "Ticket booking counter is available near main gate.",
                "hi": "टिकट बुकिंग काउंटर मुख्य गेट के पास उपलब्ध है।"
            },
            {
                "id": "r4",
                "title": "Drinking Water Facility",
                "en": "Drinking water facility is available near coach B3.",
                "hi": "पीने का पानी कोच बी3 के पास उपलब्ध है।"
            }
        ],
        "emergency": [
            {
                "id": "e1",
                "title": "Emergency Evacuation",
                "en": "Emergency: please move to the nearest exit immediately.",
                "hi": "आपातकाल: कृपया तुरंत निकटतम निकास द्वार की ओर जाएं।"
            },
            {
                "id": "e2",
                "title": "Medical Assistance",
                "en": "Medical emergency team is requested at platform 1.",
                "hi": "प्लेटफॉर्म 1 पर चिकित्सा सहायता टीम की आवश्यकता है।"
            }
        ],
        "conversation": [
            {
                "id": "c1",
                "title": "Greeting & Introduction",
                "en": "Hello, my name is Prabhav.",
                "hi": "नमस्ते, मेरा नाम प्रभाव है।"
            },
            {
                "id": "c2",
                "title": "Asking for Help",
                "en": "Please help me, where is the station?",
                "hi": "कृपया मेरी मदद करें, स्टेशन कहाँ है?"
            },
            {
                "id": "c3",
                "title": "Expressing Gratitude",
                "en": "Thank you very much, have a good day.",
                "hi": "बहुत बहुत धन्यवाद, आपका दिन शुभ हो।"
            }
        ]
    }

@app.post("/api/stt/transcribe", response_model=STTResponse)
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    model_size: Optional[str] = Form(None)
):
    try:
        content = await audio.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty audio content uploaded")
        ext = ".webm"
        if audio.filename and "." in audio.filename:
            ext = "." + audio.filename.rsplit(".", 1)[1].lower()

        result = transcribe_audio_bytes(
            content,
            file_ext=ext,
            language=language,
            model_size=model_size
        )
        transcribed_text = result["text"]

        isl_data = convert_to_isl_gloss(
            transcribed_text,
            language=result["detected_language"]
        ) if transcribed_text else {
            "isl_gloss": "[NO SPEECH DETECTED]",
            "tokens": [],
            "animations": []
        }

        return STTResponse(
            text=transcribed_text,
            detected_language=result["detected_language"],
            language_probability=result["language_probability"],
            duration=result["duration"],
            model_used=result["model_used"],
            isl_gloss=isl_data["isl_gloss"],
            tokens=isl_data["tokens"],
            animations=isl_data["animations"],
            segments=result["segments"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stt/test")
def test_stt_pipeline():
    sample_rate = 16000
    duration_sec = 1.0
    num_samples = int(sample_rate * duration_sec)
    freq = 440.0

    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        frames = bytearray()
        for i in range(num_samples):
            val = int(32767.0 * 0.1 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            frames.extend(struct.pack("<h", val))
        wav_file.writeframes(frames)

    audio_bytes = wav_io.getvalue()
    result = transcribe_audio_bytes(audio_bytes, file_ext=".wav", language="en")
    return {
        "status": "success",
        "engine": "faster-whisper",
        "model": result["model_used"],
        "test_duration": result["duration"],
        "detected_language": result["detected_language"],
        "message": f"Whisper {result['model_used']} model loaded and processed audio successfully"
    }

@app.post("/api/audio-to-isl", response_model=TranslationResponse)
def translate_audio_to_isl(payload: TranslationRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text query cannot be empty")

    isl_data = convert_to_isl_gloss(payload.text, language=payload.language or "English")

    return TranslationResponse(
        original_text=payload.text,
        language=payload.language or "English",
        isl_gloss=isl_data["isl_gloss"],
        tokens=isl_data["tokens"],
        animations=isl_data["animations"],
        token_count=isl_data["token_count"],
        animation_steps=isl_data["animation_steps"],
        status="processed"
    )

@app.post("/api/isl-to-speech", response_model=GestureRecognitionResponse)
def translate_isl_to_speech(payload: GestureRecognitionRequest):
    result = recognize_sign_gesture(
        image_base64=payload.image_base64,
        gesture_hint=payload.gesture_hint
    )

    return GestureRecognitionResponse(
        gesture_id=result["gesture_id"],
        recognized_text_en=result["recognized_text_en"],
        recognized_text_hi=result["recognized_text_hi"],
        speech=result["speech"],
        confidence=result["confidence"],
        status=result["status"],
        features=result.get("features")
    )
