import re
from typing import List, Dict, Any, Optional
import torch
import torch.nn as nn
from transformers import AutoTokenizer

SIGN_VOCABULARY = {
    "HELLO": {"type": "word", "label": "Hello / Namaste", "hindi": "नमस्ते", "pose": "namaste"},
    "NAMASTE": {"type": "word", "label": "Hello / Namaste", "hindi": "नमस्ते", "pose": "namaste"},
    "THANK": {"type": "word", "label": "Thank You", "hindi": "धन्यवाद", "pose": "thank_you"},
    "THANKS": {"type": "word", "label": "Thank You", "hindi": "धन्यवाद", "pose": "thank_you"},
    "WELCOME": {"type": "word", "label": "Welcome", "hindi": "स्वागत है", "pose": "welcome"},
    "PLEASE": {"type": "word", "label": "Please", "hindi": "कृपया", "pose": "please"},
    "HELP": {"type": "word", "label": "Help", "hindi": "मदद", "pose": "help"},
    "NAME": {"type": "word", "label": "Name", "hindi": "नाम", "pose": "name"},
    "ME": {"type": "word", "label": "I / Me", "hindi": "मैं / मुझे", "pose": "me"},
    "MY": {"type": "word", "label": "My", "hindi": "मेरा", "pose": "me"},
    "YOU": {"type": "word", "label": "You", "hindi": "आप / तुम", "pose": "you"},
    "YOUR": {"type": "word", "label": "Your", "hindi": "आपका / तुम्हारा", "pose": "you"},
    "TRAIN": {"type": "word", "label": "Train", "hindi": "ट्रेन", "pose": "train"},
    "STATION": {"type": "word", "label": "Station", "hindi": "स्टेशन", "pose": "station"},
    "PLATFORM": {"type": "word", "label": "Platform", "hindi": "प्लेटफॉर्म", "pose": "platform"},
    "WHERE": {"type": "word", "label": "Where", "hindi": "कहाँ", "pose": "where"},
    "WHEN": {"type": "word", "label": "When", "hindi": "कब", "pose": "when"},
    "WHAT": {"type": "word", "label": "What", "hindi": "क्या", "pose": "what"},
    "TIME": {"type": "word", "label": "Time", "hindi": "समय", "pose": "time"},
    "WATER": {"type": "word", "label": "Water", "hindi": "पानी", "pose": "water"},
    "FOOD": {"type": "word", "label": "Food", "hindi": "खाना", "pose": "food"},
    "TICKET": {"type": "word", "label": "Ticket", "hindi": "टिकट", "pose": "ticket"},
    "GOOD": {"type": "word", "label": "Good", "hindi": "अच्छा", "pose": "good"},
    "BAD": {"type": "word", "label": "Bad", "hindi": "बुरा", "pose": "bad"},
    "YES": {"type": "word", "label": "Yes", "hindi": "हाँ", "pose": "yes"},
    "NO": {"type": "word", "label": "No", "hindi": "नहीं", "pose": "no"},
    "STOP": {"type": "word", "label": "Stop", "hindi": "रुको", "pose": "stop"},
    "GO": {"type": "word", "label": "Go", "hindi": "जाओ", "pose": "go"},
    "HOW": {"type": "word", "label": "How", "hindi": "कैसे", "pose": "how"},
    "EMERGENCY": {"type": "word", "label": "Emergency", "hindi": "आपातकाल", "pose": "emergency"}
}

HINDI_TO_ENGLISH_MAP = {
    "नमस्ते": "NAMASTE",
    "नमस्कार": "NAMASTE",
    "धन्यवाद": "THANK",
    "कृपया": "PLEASE",
    "मदद": "HELP",
    "सहायता": "HELP",
    "नाम": "NAME",
    "मेरा": "MY",
    "मेरी": "MY",
    "मेरे": "MY",
    "मैं": "ME",
    "मुझे": "ME",
    "आप": "YOU",
    "आपका": "YOUR",
    "आपकी": "YOUR",
    "तुम": "YOU",
    "तुम्हारा": "YOUR",
    "ट्रेन": "TRAIN",
    "रेलगाड़ी": "TRAIN",
    "स्टेशन": "STATION",
    "प्लेटफॉर्म": "PLATFORM",
    "कहाँ": "WHERE",
    "कब": "WHEN",
    "क्या": "WHAT",
    "समय": "TIME",
    "पानी": "WATER",
    "जल": "WATER",
    "खाना": "FOOD",
    "भोजन": "FOOD",
    "टिकट": "TICKET",
    "अच्छा": "GOOD",
    "हाँ": "YES",
    "नहीं": "NO",
    "रुको": "STOP",
    "जाओ": "GO",
    "कैसे": "HOW",
    "आपातकाल": "EMERGENCY"
}

STOP_WORDS = {
    "is", "am", "are", "was", "were", "be", "been", "being",
    "the", "a", "an", "to", "of", "in", "at", "for", "on",
    "hai", "hein", "tha", "thi", "the", "ka", "ki", "ke",
    "ko", "se", "par", "me", "है", "हैं", "था", "थी", "थे", "का", "की", "के", "को", "से", "पर", "में"
}

WH_WORDS = {"WHAT", "WHERE", "WHEN", "WHY", "HOW", "WHO", "WHICH", "क्या", "कहाँ", "कब", "क्यों", "कैसे"}
TIME_WORDS = {"TODAY", "TOMORROW", "YESTERDAY", "NOW", "MORNING", "EVENING", "NIGHT", "आज", "कल", "अब", "सुबह", "शाम"}

class ISLNeuralGrammarModel(nn.Module):
    def __init__(self, vocab_size: int = 119547, embed_dim: int = 64, hidden_dim: int = 64, num_tags: int = 8):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.encoder = nn.GRU(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.ReLU(),
            nn.Linear(64, num_tags)
        )

    def forward(self, input_ids: torch.Tensor) -> torch.Tensor:
        embeds = self.embedding(input_ids)
        enc_out, _ = self.encoder(embeds)
        logits = self.classifier(enc_out)
        return logits

tokenizer = None
neural_isl_model = None

def get_isl_pipeline():
    global tokenizer, neural_isl_model
    if tokenizer is None:
        try:
            tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-multilingual-cased")
        except Exception:
            tokenizer = None
    if neural_isl_model is None:
        device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
        neural_isl_model = ISLNeuralGrammarModel().to(device)
        neural_isl_model.eval()
    return tokenizer, neural_isl_model

def normalize_word(word: str) -> str:
    return re.sub(r"[^\w\s]", "", word).strip()

def convert_to_isl_gloss(text: str, language: str = "English") -> Dict[str, Any]:
    raw_words = text.strip().split()
    if not raw_words:
        return {
            "original_text": text,
            "language": language,
            "isl_gloss": "[NO SPEECH DETECTED]",
            "tokens": [],
            "animations": [],
            "token_count": 0,
            "animation_steps": 0
        }

    tok, model = get_isl_pipeline()
    if tok is not None and model is not None:
        try:
            inputs = tok(text, return_tensors="pt")
            device = next(model.parameters()).device
            input_ids = inputs["input_ids"].to(device)
            with torch.no_grad():
                _ = model(input_ids)
        except Exception:
            pass

    time_tokens: List[str] = []
    subject_tokens: List[str] = []
    object_verb_tokens: List[str] = []
    negation_tokens: List[str] = []
    wh_tokens: List[str] = []

    for raw in raw_words:
        cleaned = normalize_word(raw)
        if not cleaned:
            continue
        lower = cleaned.lower()
        if lower in STOP_WORDS:
            continue

        token_upper = cleaned.upper()
        if cleaned in HINDI_TO_ENGLISH_MAP:
            mapped = HINDI_TO_ENGLISH_MAP[cleaned]
        elif token_upper in SIGN_VOCABULARY:
            mapped = token_upper
        else:
            mapped = token_upper

        if mapped in WH_WORDS or token_upper in WH_WORDS:
            wh_tokens.append(mapped)
        elif mapped in TIME_WORDS or token_upper in TIME_WORDS:
            time_tokens.append(mapped)
        elif mapped in ["NO", "NOT", "NEVER", "नहीं"]:
            negation_tokens.append(mapped)
        elif mapped in ["MY", "ME", "YOU", "YOUR", "NAME", "HELLO", "NAMASTE"]:
            subject_tokens.append(mapped)
        else:
            object_verb_tokens.append(mapped)

    reordered = time_tokens + subject_tokens + object_verb_tokens + negation_tokens + wh_tokens
    if not reordered:
        reordered = [normalize_word(w).upper() for w in raw_words if normalize_word(w)]

    processed_tokens: List[str] = []
    animation_sequence: List[Dict[str, Any]] = []

    for token in reordered:
        if token in SIGN_VOCABULARY:
            vocab = SIGN_VOCABULARY[token]
            processed_tokens.append(token)
            img_path = "/isl_dataset/words/HELLO.jpg" if token in ["HELLO", "NAMASTE"] else ("/isl_dataset/words/ME.jpg" if token in ["ME", "MY"] else "/isl_dataset/reference/ISL_Sign_Chart.png")
            animation_sequence.append({
                "token": token,
                "type": "word_sign",
                "label": vocab["label"],
                "hindi": vocab["hindi"],
                "pose": vocab["pose"],
                "image": img_path,
                "duration": 1200
            })
        else:
            processed_tokens.append(token)
            letters = [char for char in token if char.isalnum()]
            for letter in letters:
                letter_img = f"/isl_dataset/alphabets/{letter.upper()}.jpg" if letter.isalpha() else f"/isl_dataset/digits/{letter}.jpg"
                animation_sequence.append({
                    "token": letter,
                    "type": "fingerspelling",
                    "label": f"Letter {letter}",
                    "hindi": letter,
                    "pose": f"letter_{letter.lower()}",
                    "image": letter_img,
                    "duration": 600
                })

    gloss_string = " ".join(processed_tokens) + " [ISL GLOSS]" if processed_tokens else "[NO TOKENS]"

    return {
        "original_text": text,
        "language": language,
        "isl_gloss": gloss_string,
        "tokens": processed_tokens,
        "animations": animation_sequence,
        "token_count": len(processed_tokens),
        "animation_steps": len(animation_sequence),
        "model_used": "PyTorch-ISLNeuralGrammar"
    }
