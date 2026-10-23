import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Camera,
  CameraOff,
  CheckCircle2,
  Copy,
  Radio,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

const COMMON_SIGNS = [
  { id: 'namaste', label: 'Namaste', hindi: 'नमस्ते', icon: '🙏' },
  { id: 'thank_you', label: 'Thank You', hindi: 'धन्यवाद', icon: '🤲' },
  { id: 'help', label: 'Help', hindi: 'मदद', icon: '🆘' },
  { id: 'water', label: 'Water', hindi: 'पानी', icon: '💧' },
  { id: 'train', label: 'Train', hindi: 'ट्रेन', icon: '🚆' },
  { id: 'yes', label: 'Yes', hindi: 'हाँ', icon: '👍' },
  { id: 'no', label: 'No', hindi: 'नहीं', icon: '☝️' },
  { id: 'good', label: 'Good', hindi: 'अच्छा', icon: '✨' },
  { id: 'please', label: 'Please', hindi: 'कृपया', icon: '🤝' },
  { id: 'stop', label: 'Stop', hindi: 'रुको', icon: '✋' }
];

export default function IslToSpeechTab({ gestureOutput, onTestGestureApi, onRecognizeFrame }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [isContinuous, setIsContinuous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [transcript, setTranscript] = useState([]);
  const [activeGesture, setActiveGesture] = useState(gestureOutput || null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const continuousTimerRef = useRef(null);
  const lastSpokenRef = useRef(null);

  const speakText = (text, lang = 'en-US') => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' || lang === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const startCamera = async () => {
    try {
      if (window.electronAPI && typeof window.electronAPI.requestMicPermission === 'function') {
        try {
          await window.electronAPI.requestMicPermission();
        } catch {}
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      alert(`Camera access error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (continuousTimerRef.current) {
      clearInterval(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }
    setIsContinuous(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureFrameBase64 = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 320, 240);
    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const processFrame = async (hint = null) => {
    setIsProcessing(true);
    let frameBase64 = null;
    if (isCameraActive) {
      frameBase64 = captureFrameBase64();
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/isl-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: frameBase64,
          gesture_hint: hint,
          frame_count: 1
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveGesture(data);

        const isRealSign = data.gesture_id && data.gesture_id !== 'none' && (data.confidence || 0) >= 0.7;

        if (isRealSign) {
          const phraseToSpeak = selectedLanguage === 'Hindi' ? data.recognized_text_hi : data.recognized_text_en;

          if (isAutoSpeak && phraseToSpeak && data.gesture_id !== lastSpokenRef.current) {
            speakText(phraseToSpeak, selectedLanguage);
          }

          if (data.gesture_id !== lastSpokenRef.current) {
            lastSpokenRef.current = data.gesture_id;
            setTranscript((prev) => [
              ...prev,
              {
                id: Date.now(),
                en: data.recognized_text_en,
                hi: data.recognized_text_hi,
                confidence: data.confidence,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              }
            ]);
          }
        } else {
          lastSpokenRef.current = null;
        }
      }
    } catch (err) {
      console.error('Gesture recognition error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isContinuous && isCameraActive) {
      continuousTimerRef.current = setInterval(() => {
        processFrame();
      }, 1200);
    } else {
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
    }
    return () => {
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
    };
  }, [isContinuous, isCameraActive, selectedLanguage, isAutoSpeak]);

  const handleSpeakCurrent = () => {
    if (!activeGesture || activeGesture.gesture_id === 'none') return;
    const text = selectedLanguage === 'Hindi' ? activeGesture.recognized_text_hi : activeGesture.recognized_text_en;
    speakText(text, selectedLanguage);
  };

  const handleSpeakAll = () => {
    if (transcript.length === 0) return;
    const fullText = transcript
      .map((item) => (selectedLanguage === 'Hindi' ? item.hi : item.en))
      .join('. ');
    speakText(fullText, selectedLanguage);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Sign Gesture to Speech</h2>
              <p className="text-xs text-slate-400">
                Visual hand landmark recognition translated to synthesized voice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              {['English', 'Hindi'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedLanguage === lang ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAutoSpeak(!isAutoSpeak)}
              className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                isAutoSpeak
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-black/40 border-white/10 text-slate-400'
              }`}
              title="Toggle Auto Speak"
            >
              {isAutoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl border border-white/15 bg-black/60 overflow-hidden aspect-video flex items-center justify-center shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                    <Radio className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-white">Webcam Feed Inactive</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Start camera to perform real-time optical hand tracking and gesture recognition.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Webcam</span>
                  </button>
                </div>
              )}

              {isCameraActive && (
                <>
                  <div className="absolute inset-x-12 inset-y-8 pointer-events-none border-2 border-dashed border-cyan-400/40 rounded-2xl flex items-center justify-center">
                    <span className="text-[11px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Position Sign In Box
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-mono border border-rose-500/30 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-600/30 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Camera</span>
                  </button>
                )}

                <button
                  onClick={() => processFrame()}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Analyzing...' : 'Recognize Sign'}</span>
                </button>
              </div>

              {isCameraActive && (
                <button
                  onClick={() => setIsContinuous(!isContinuous)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isContinuous
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Continuous: {isContinuous ? 'ON (1.2s)' : 'OFF'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Recognized Translation
                </span>
                {activeGesture && activeGesture.gesture_id !== 'none' ? (
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {Math.round((activeGesture.confidence || 0) * 100)}% Confidence
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded border border-white/5">
                    PyTorch Ready
                  </span>
                )}
              </div>

              <div className="py-2">
                <div className="text-xl font-bold text-white">
                  {activeGesture && activeGesture.gesture_id !== 'none'
                    ? (selectedLanguage === 'Hindi' ? activeGesture.recognized_text_hi : activeGesture.recognized_text_en)
                    : (selectedLanguage === 'Hindi' ? 'संकेत की प्रतीक्षा है...' : 'Awaiting sign gesture...')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {activeGesture && activeGesture.gesture_id !== 'none'
                    ? (selectedLanguage === 'Hindi' ? activeGesture.recognized_text_en : activeGesture.recognized_text_hi)
                    : (selectedLanguage === 'Hindi' ? 'हाथ को कैमरे के सामने लाएं' : 'Bring hand into camera detection box')}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={handleSpeakCurrent}
                  disabled={!activeGesture || activeGesture.gesture_id === 'none'}
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak Translation</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Conversation Transcript ({transcript.length})
                </span>
                {transcript.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSpeakAll}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Speak All
                    </button>
                    <span className="text-slate-600">&bull;</span>
                    <button
                      onClick={() => setTranscript([])}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 max-h-48 overflow-y-auto space-y-2 pr-1">
                {transcript.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-6 text-center">
                    Recognized phrases will appear here as you sign.
                  </div>
                ) : (
                  transcript.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {selectedLanguage === 'Hindi' ? item.hi : item.en}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {selectedLanguage === 'Hindi' ? item.en : item.hi}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">
              Interactive Sign Simulator Presets (Click to Test Gesture):
            </span>
            <span className="text-[11px] text-slate-500">Quick Verification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {COMMON_SIGNS.map((sign) => (
              <button
                key={sign.id}
                onClick={() => processFrame(sign.id)}
                className="p-3 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">
                  {sign.icon}
                </div>
                <div className="text-xs font-semibold text-white">{sign.label}</div>
                <div className="text-[10px] text-slate-400 font-hindi">{sign.hindi}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
