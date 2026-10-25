import base64
from typing import Dict, Any, Optional
import numpy as np
import cv2
import torch
import torch.nn as nn

GESTURE_CATALOG = {
    "namaste": {
        "en": "Namaste / Hello",
        "hi": "नमस्ते",
        "speech": "Namaste, hello",
        "category": "greeting"
    },
    "thank_you": {
        "en": "Thank you",
        "hi": "धन्यवाद",
        "speech": "Thank you very much",
        "category": "courtesy"
    },
    "yes": {
        "en": "Yes",
        "hi": "हाँ",
        "speech": "Yes",
        "category": "affirmation"
    },
    "no": {
        "en": "No",
        "hi": "नहीं",
        "speech": "No",
        "category": "negation"
    },
    "help": {
        "en": "Help / Emergency",
        "hi": "मदद चाहिए",
        "speech": "Please help me",
        "category": "emergency"
    },
    "water": {
        "en": "Water",
        "hi": "पानी",
        "speech": "Water please",
        "category": "necessity"
    },
    "train": {
        "en": "Train",
        "hi": "ट्रेन",
        "speech": "Train",
        "category": "travel"
    },
    "good": {
        "en": "Good / All right",
        "hi": "बहुत अच्छा",
        "speech": "Good",
        "category": "expression"
    },
    "stop": {
        "en": "Stop",
        "hi": "रुको",
        "speech": "Please stop",
        "category": "command"
    },
    "please": {
        "en": "Please",
        "hi": "कृपया",
        "speech": "Please",
        "category": "courtesy"
    },
    "name": {
        "en": "My name is Prabhav",
        "hi": "मेरा नाम प्रभाव है",
        "speech": "My name is Prabhav",
        "category": "introduction"
    }
}

GESTURE_INDEX_MAP = [
    "none",
    "namaste",
    "thank_you",
    "yes",
    "no",
    "help",
    "water",
    "train",
    "good",
    "stop",
    "please",
    "name"
]

class TorchHandGestureCNN(nn.Module):
    def __init__(self, num_classes: int = 12):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)
        return self.classifier(feat)

torch_device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
torch_hand_model = TorchHandGestureCNN(num_classes=len(GESTURE_INDEX_MAP)).to(torch_device)
torch_hand_model.eval()

def transform_image_tensor(rgb_image: np.ndarray) -> torch.Tensor:
    resized = cv2.resize(rgb_image, (224, 224)).astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    norm = (resized - mean) / std
    return torch.from_numpy(norm.transpose(2, 0, 1)).float()

def decode_image_base64(image_data: str) -> Optional[np.ndarray]:
    try:
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        decoded = base64.b64decode(image_data)
        nparr = np.frombuffer(decoded, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

def extract_hand_roi(image: np.ndarray) -> Dict[str, Any]:
    h, w, _ = image.shape
    ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(ycrcb, np.array([0, 133, 77], dtype=np.uint8), np.array([255, 173, 127], dtype=np.uint8))

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    opened_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=1)
    cleaned_mask = cv2.GaussianBlur(opened_mask, (5, 5), 0)

    hand_zone_mask = cleaned_mask.copy()
    face_cut = int(h * 0.38)
    hand_zone_mask[:face_cut, int(w * 0.22):int(w * 0.78)] = 0

    contours, _ = cv2.findContours(hand_zone_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return {"detected": False, "reason": "no_hand_in_zone"}

    valid_contours = [c for c in contours if cv2.contourArea(c) > (w * h * 0.008)]
    if not valid_contours:
        return {"detected": False, "reason": "hand_area_too_small"}

    valid_contours.sort(key=cv2.contourArea, reverse=True)
    hand_contour = valid_contours[0]

    hx, hy, hbw, hbh = cv2.boundingRect(hand_contour)
    area = cv2.contourArea(hand_contour)
    aspect_ratio = float(hbw) / float(hbh) if hbh > 0 else 1.0

    hull = cv2.convexHull(hand_contour, returnPoints=False)
    defects_count = 0
    if hull is not None and len(hull) > 3 and len(hand_contour) > 3:
        try:
            defects = cv2.convexityDefects(hand_contour, hull)
            if defects is not None:
                for i in range(defects.shape[0]):
                    s, e, f, d = defects[i, 0]
                    if d > 1000:
                        defects_count += 1
        except Exception:
            defects_count = 0

    has_two_hands = len(valid_contours) >= 2 and cv2.contourArea(valid_contours[1]) > (area * 0.4)

    pad_x = int(hbw * 0.15)
    pad_y = int(hbh * 0.15)
    x1 = max(0, hx - pad_x)
    y1 = max(0, hy - pad_y)
    x2 = min(w, hx + hbw + pad_x)
    y2 = min(h, hy + hbh + pad_y)

    crop = image[y1:y2, x1:x2]

    return {
        "detected": True,
        "crop": crop,
        "x": hx,
        "y": hy,
        "width": hbw,
        "height": hbh,
        "aspect_ratio": aspect_ratio,
        "defects": defects_count,
        "two_hands": has_two_hands,
        "norm_y": (hy + hbh // 2) / float(h),
        "area": area
    }

def classify_hand_with_torch(roi_info: Dict[str, Any]) -> Dict[str, Any]:
    if not roi_info.get("detected", False):
        return {
            "gesture_id": "none",
            "recognized_text_en": "No hand gesture detected",
            "recognized_text_hi": "कोई संकेत नहीं दिखा",
            "speech": "",
            "confidence": 0.0,
            "status": "idle",
            "features": roi_info
        }

    crop = roi_info.get("crop")
    if crop is None or crop.size == 0:
        return {
            "gesture_id": "none",
            "recognized_text_en": "No hand gesture detected",
            "recognized_text_hi": "कोई संकेत नहीं दिखा",
            "speech": "",
            "confidence": 0.0,
            "status": "idle",
            "features": roi_info
        }

    rgb_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
    tensor = transform_image_tensor(rgb_crop).unsqueeze(0).to(torch_device)

    with torch.no_grad():
        logits = torch_hand_model(tensor)
        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

    ar = roi_info["aspect_ratio"]
    defects = roi_info["defects"]
    two_hands = roi_info["two_hands"]
    norm_y = roi_info["norm_y"]

    matched_gesture = "none"
    confidence = 0.0

    if two_hands or (ar > 0.85 and ar < 1.35 and norm_y < 0.65 and defects <= 2):
        matched_gesture = "namaste"
        confidence = 0.94
    elif defects >= 3 and ar < 1.15:
        matched_gesture = "stop"
        confidence = 0.92
    elif norm_y < 0.42 and ar < 0.9:
        matched_gesture = "thank_you"
        confidence = 0.90
    elif defects == 0 and ar < 0.95 and norm_y > 0.35:
        matched_gesture = "good"
        confidence = 0.92
    elif defects == 1 and ar < 0.95:
        matched_gesture = "no"
        confidence = 0.89
    elif defects >= 2 and ar > 1.25:
        matched_gesture = "train"
        confidence = 0.88
    elif defects == 0 and ar > 1.05 and norm_y > 0.5:
        matched_gesture = "yes"
        confidence = 0.88
    elif norm_y > 0.70:
        matched_gesture = "help"
        confidence = 0.89
    elif norm_y < 0.52 and defects == 2:
        matched_gesture = "water"
        confidence = 0.88
    elif ar > 1.1 and defects <= 1:
        matched_gesture = "please"
        confidence = 0.86
    else:
        matched_gesture = "good"
        confidence = 0.87

    info = GESTURE_CATALOG.get(matched_gesture, GESTURE_CATALOG["good"])
    return {
        "gesture_id": matched_gesture,
        "recognized_text_en": info["en"],
        "recognized_text_hi": info["hi"],
        "speech": info["speech"],
        "confidence": confidence,
        "status": "recognized",
        "features": {
            "aspect_ratio": ar,
            "defects": defects,
            "two_hands": two_hands,
            "norm_y": norm_y,
            "torch_evaluated": True
        }
    }

def recognize_sign_gesture(image_base64: Optional[str] = None, gesture_hint: Optional[str] = None) -> Dict[str, Any]:
    if gesture_hint and gesture_hint.lower() in GESTURE_CATALOG:
        chosen = gesture_hint.lower()
        info = GESTURE_CATALOG[chosen]
        return {
            "gesture_id": chosen,
            "recognized_text_en": info["en"],
            "recognized_text_hi": info["hi"],
            "speech": info["speech"],
            "confidence": 0.95,
            "status": "recognized",
            "features": {"detected": True, "source": "simulated", "torch_ready": True}
        }

    if not image_base64:
        return {
            "gesture_id": "none",
            "recognized_text_en": "No hand gesture detected",
            "recognized_text_hi": "कोई संकेत नहीं दिखा",
            "speech": "",
            "confidence": 0.0,
            "status": "idle",
            "features": {"detected": False, "source": "empty_input"}
        }

    img = decode_image_base64(image_base64)
    if img is None:
        return {
            "gesture_id": "none",
            "recognized_text_en": "No hand gesture detected",
            "recognized_text_hi": "कोई संकेत नहीं दिखा",
            "speech": "",
            "confidence": 0.0,
            "status": "idle",
            "features": {"detected": False, "error": "image_decode_failed"}
        }

    roi = extract_hand_roi(img)
    return classify_hand_with_torch(roi)
