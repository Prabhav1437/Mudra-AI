# Mudra AI Architecture & Data Flow

Mudra AI provides bidirectional translation between spoken languages (English and Hindi) and Indian Sign Language (ISL). The platform is built as an Electron desktop application powered by a React frontend and a local FastAPI backend running Whisper speech-to-text models.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Client ["Desktop Application (Electron + Chromium)"]
        UI["React 19 + Tailwind CSS UI"]
        Rec["MediaRecorder (Web Audio)"]
        Preload["Preload Context Bridge (preload.js)"]
        Main["Electron Main Process (main.js)"]
    end

    subgraph Server ["FastAPI Backend (Python 3.14)"]
        API["FastAPI HTTP Server (Uvicorn :8000)"]
        STT["Faster-Whisper STT Engine (Whisper Small)"]
        ISL_Gen["ISL Gloss & Tokenization Engine"]
        Gesture["Gesture Recognition Engine (Vision)"]
    end

    UI -->|Records Audio| Rec
    Rec -->|ArrayBuffer| Preload
    Preload -->|IPC invoke| Main
    Main -->|Multipart HTTP POST| API
    API --> STT
    STT --> ISL_Gen
    ISL_Gen -->|JSON Response| Main
    Main -->|IPC Resolve| UI
    UI -->|Camera Frames| API
    API --> Gesture
    Gesture -->|Speech / Text| UI
```

---

## 2. Core Workflows

### 2.1 Audio to Indian Sign Language (Live Speech -> ISL)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React UI (AudioToIslTab)
    participant Rec as MediaRecorder Utility
    participant Preload as Preload Bridge
    participant Main as Electron Main Process
    participant Backend as FastAPI Server (:8000)
    participant Whisper as Faster-Whisper (Small Model)

    User->>UI: Clicks "Record Voice Input"
    UI->>Rec: start()
    Rec->>User: Captures microphone stream via Web Audio
    User->>Rec: Speaks (e.g. "mera naam prabhav hai")
    User->>UI: Clicks stop recording
    UI->>Rec: stop()
    Rec-->>UI: Returns WebM/Opus ArrayBuffer
    UI->>Preload: transcribeAudioBuffer(buffer, filename, lang, mimeType)
    Preload->>Main: ipcRenderer.invoke('transcribe-audio-buffer', payload)
    Main->>Backend: HTTP POST /api/stt/transcribe (multipart FormData)
    Backend->>Whisper: transcribe_audio_bytes(audio_bytes, lang, vad_filter=True)
    Whisper-->>Backend: Transcribed Text + Detected Lang + Segments
    Backend->>Backend: Generate token array and ISL gloss
    Backend-->>Main: JSON { text, detected_language, tokens, gloss }
    Main-->>Preload: Resolve promise
    Preload-->>UI: Populate speechInput & demoOutput
    UI->>User: Displays Hindi text and animated ISL tokens
```

#### Detailed Steps:
1. **Microphone Capture**: The renderer queries permission via Electron's `systemPreferences` and initiates a hardware-synced `MediaRecorder` stream.
2. **Audio Volume Metering**: An `AnalyserNode` computes RMS frequency data at 60 FPS to drive the reactive visual soundbars in the UI.
3. **Format Packaging**: Audio chunks are combined into a WebM container with native Opus encoding to preserve pitch, tempo, and hardware clock fidelity.
4. **IPC Forwarding**: The raw buffer is passed securely across the isolated context bridge to Electron's main process.
5. **Backend Dispatch**: Node's native `fetch` streams the buffer to `POST /api/stt/transcribe` with boundary-delimited multipart form data.
6. **Inference with VAD**: Faster-Whisper (`small` model) strips silence via Voice Activity Detection, applies domain context conditioning, and transcribes speech into text.
7. **ISL Token Sequence**: Text is mapped into sequential ISL token cards and formatted gloss notation for downstream avatar visualization.

---

### 2.2 Indian Sign Language to Speech (Vision -> Speech)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React UI (IslToSpeechTab)
    participant Camera as Camera Stream
    participant Backend as FastAPI Server (:8000)
    participant Vision as Gesture Recognition Model
    participant TTS as Speech Synthesizer

    User->>UI: Navigates to "ISL -> Speech"
    UI->>Camera: Requests camera video stream
    Camera-->>UI: Live video frames
    UI->>Backend: HTTP POST /api/isl-to-speech (Frame/landmark data)
    Backend->>Vision: Landmark tracking and gesture classification
    Vision-->>Backend: Recognized sign phrase + confidence score
    Backend->>TTS: Generate audio speech synthesis
    Backend-->>UI: JSON { recognized_text, confidence, audio_url }
    UI->>User: Displays recognized text and speaks translation
```

#### Detailed Steps:
1. **Camera Feed**: Electron binds camera permissions and renders optical feed into the designated viewport container.
2. **Landmark Extraction**: Video frames or optical hand landmarks are captured for gesture classification.
3. **Inference**: Backend vision model evaluates landmark coordinates against ISL sign dictionaries.
4. **Speech Output**: Recognized phrases are synthesized into spoken Hindi/English voice and returned with confidence scoring.

---

## 3. IPC Architecture & Security

Electron security best practices are strictly enforced:

```
[Renderer Process]
  contextIsolation: true
  nodeIntegration: false
  sandbox: true
          │
          │ window.electronAPI (Safe exposed whitelist)
          ▼
[Preload Process (src/preload.js)]
  - getVersions()
  - ping()
  - requestMicPermission()
  - transcribeAudioBuffer(buffer, filename, lang, mimeType)
          │
          │ ipcRenderer.invoke() / ipcMain.handle()
          ▼
[Main Process (src/main.js)]
  - Window creation and lifecycle management
  - WebContents media permission request handler
  - System microphone entitlement verification
  - Native HTTP FormData streaming to FastAPI backend
```

---

## 4. API Specification

| Endpoint | Method | Input | Output | Purpose |
|---|---|---|---|---|
| `/api/health` | `GET` | None | `{ status, service, version }` | Backend health and liveness check |
| `/api/stt/status` | `GET` | None | `{ model, engine, vision_model, grammar_model, languages, ready }` | Inspects currently loaded Whisper, PyTorch Vision, and DistilBert ISL models |
| `/api/stt/transcribe` | `POST` | `multipart/form-data` (`audio`, `language`) | `{ text, detected_language, duration, tokens, gloss, animation, segments }` | Transcribes audio bytes and outputs ISL tokens & animation frames |
| `/api/stt/test` | `POST` | None | `{ status, engine, model, test_duration, message }` | Generates synthetic wave tone to verify STT pipeline |
| `/api/audio-to-isl` | `POST` | `{ text, language }` | `{ original_text, language, tokens, gloss, animation, status }` | Converts text prompt into grammar-reordered ISL gloss and pose animation via DistilBert and PyTorch |
| `/api/isl-to-speech` | `POST` | `{ image_base64, gesture_hint }` | `{ gesture_id, recognized_text_en, recognized_text_hi, speech, confidence, status, features }` | PyTorch neural hand gesture classifier with face exclusion and idle thresholding |
| `/api/isl/dictionary` | `GET` | None | `{ signs, fingerspelling, numbers, categories, total }` | Comprehensive ISL reference dictionary with pose keyframes |
| `/api/announcements` | `GET` | None | `{ announcements, total }` | Curated railway, emergency, and airport announcement presets |

---

## 5. Directory Structure

```
Mudra-AI/
├── .gitignore
├── flow.md
├── index.html
├── package.json
├── vite.config.mjs
├── backend/
│   ├── gesture.py
│   ├── isl_grammar.py
│   ├── main.py
│   ├── requirements.txt
│   └── stt.py
└── src/
    ├── main.js
    ├── preload.js
    └── renderer/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── Navigation.jsx
        │   ├── DashboardTab.jsx
        │   ├── AudioToIslTab.jsx
        │   ├── IslToSpeechTab.jsx
        │   ├── DictionaryTab.jsx
        │   ├── SignVisualizer.jsx
        │   └── Footer.jsx
        └── utils/
            └── audioRecorder.js
```

---

## 6. Execution Lifecycle

```mermaid
graph LR
    DevAll["npm run dev:all"] --> Concurrent["Concurrently"]
    Concurrent --> BE["npm run backend"]
    Concurrent --> FE["npm run dev"]

    BE --> Uvicorn["Uvicorn on :8000"]
    Uvicorn --> WhisperInit["Load Whisper Small Model"]

    FE --> Vite["Vite Dev Server on :5173"]
    FE --> Wait["wait-on tcp:5173"]
    Wait --> Electron["Electron App Window"]
    Electron --> Connect["Connect to localhost:5173 & localhost:8000"]
```

- **Development**: `npm run dev:all` concurrently launches Uvicorn (`:8000`), Vite (`:5173`), and Electron with auto-reconnect and instant React HMR.
- **Production Build**: `npm run build` bundles React and Tailwind into the `dist/` directory, which Electron loads natively via `loadFile(dist/index.html)`.
