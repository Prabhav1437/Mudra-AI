import io
import os
import tempfile
import wave
import numpy as np
from typing import Optional, Dict, Any

_models = {}
DEFAULT_MODEL_SIZE = os.getenv("WHISPER_MODEL", "small")
PROMPT_EN = "Mudra AI, Indian Sign Language, ISL, Hindi, English, gestures, translation."
PROMPT_HI = "मुद्रा एआई, भारतीय सांकेतिक भाषा, हिंदी, मेरा नाम, अनुवाद"

def get_model(model_size: Optional[str] = None):
    global _models
    size = model_size or DEFAULT_MODEL_SIZE
    if size not in _models:
        from faster_whisper import WhisperModel
        _models[size] = WhisperModel(size, device="cpu", compute_type="int8")
    return _models[size]

def decode_wav_to_float32(audio_bytes: bytes) -> Optional[np.ndarray]:
    try:
        with io.BytesIO(audio_bytes) as bio, wave.open(bio, "rb") as wf:
            channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            framerate = wf.getframerate()
            frames = wf.readframes(wf.getnframes())
            if sample_width == 2:
                audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
            elif sample_width == 1:
                audio = (np.frombuffer(frames, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
            elif sample_width == 4:
                audio = np.frombuffer(frames, dtype=np.int32).astype(np.float32) / 2147483648.0
            else:
                return None

            if channels > 1:
                audio = audio.reshape(-1, channels).mean(axis=1)

            if framerate != 16000 and framerate > 0:
                step = framerate / 16000.0
                indices = np.round(np.arange(0, len(audio), step)).astype(int)
                indices = indices[indices < len(audio)]
                audio = audio[indices]

            return np.ascontiguousarray(audio, dtype=np.float32)
    except Exception:
        return None

def transcribe_audio_source(
    audio_source: Any,
    language: Optional[str] = None,
    model_size: Optional[str] = None
) -> Dict[str, Any]:
    model = get_model(model_size=model_size)
    lang_code = None
    initial_prompt = PROMPT_EN

    if language:
        lang_lower = language.lower()
        if lang_lower in ["hindi", "hi"]:
            lang_code = "hi"
            initial_prompt = PROMPT_HI
        elif lang_lower in ["english", "en"]:
            lang_code = "en"
            initial_prompt = PROMPT_EN
        else:
            lang_code = language

    segments, info = model.transcribe(
        audio_source,
        language=lang_code,
        beam_size=5,
        temperature=0.0,
        vad_filter=True,
        initial_prompt=initial_prompt,
        condition_on_previous_text=False
    )

    text_segments = []
    full_text = []
    for segment in segments:
        text_segments.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })
        full_text.append(segment.text.strip())

    return {
        "text": " ".join(full_text).strip(),
        "detected_language": info.language,
        "language_probability": round(info.language_probability, 3),
        "duration": round(info.duration, 2),
        "model_used": model_size or DEFAULT_MODEL_SIZE,
        "segments": text_segments
    }

def transcribe_audio_file(
    file_path: str,
    language: Optional[str] = None,
    model_size: Optional[str] = None
) -> Dict[str, Any]:
    return transcribe_audio_source(file_path, language=language, model_size=model_size)

def transcribe_audio_bytes(
    audio_bytes: bytes,
    file_ext: str = ".wav",
    language: Optional[str] = None,
    model_size: Optional[str] = None
) -> Dict[str, Any]:
    if file_ext.lower() in [".wav", "wav"]:
        decoded = decode_wav_to_float32(audio_bytes)
        if decoded is not None and len(decoded) > 0:
            return transcribe_audio_source(decoded, language=language, model_size=model_size)

    with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as temp_audio:
        temp_audio.write(audio_bytes)
        temp_path = temp_audio.name
    try:
        return transcribe_audio_file(temp_path, language=language, model_size=model_size)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
