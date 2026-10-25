import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, Copy, Check, Volume2, Maximize2, RefreshCw, Radio } from 'lucide-react';

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
  { id: 'stop', label: 'Stop', hindi: 'रुको', icon: '✋' },
  { id: 'name', label: 'My Name', hindi: 'मेरा नाम प्रभाव है', icon: '🙋' }
];

export default function IslToSpeechTab({ gestureOutput, onTestGestureApi }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [activeGesture, setActiveGesture] = useState(gestureOutput || {
    gesture_id: 'name',
    recognized_text_en: 'My name is Prabhav',
    recognized_text_hi: 'मेरा नाम प्रभाव है',
    speech: 'My name is Prabhav',
    confidence: 0.92,
    status: 'recognized'
  });
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const lastSpokenRef = useRef(null);

  const speakText = (text, lang = 'hi-IN') => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setAudioProgress(0.2);
    };
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setAudioProgress(1.0);
      setTimeout(() => setAudioProgress(0), 1000);
    };
    window.speechSynthesis.speak(utterance);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
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

        const isReal = data.gesture_id && data.gesture_id !== 'none' && (data.confidence || 0) >= 0.7;
        if (isReal) {
          const phrase = selectedLanguage === 'Hindi' ? data.recognized_text_hi : data.recognized_text_en;
          if (phrase && data.gesture_id !== lastSpokenRef.current) {
            speakText(phrase, selectedLanguage);
            lastSpokenRef.current = data.gesture_id;
          }
        } else {
          lastSpokenRef.current = null;
        }
      }
    } catch (err) {
      console.error('Recognition error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      loopRef.current = setInterval(() => {
        processFrame();
      }, 1400);
    } else {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    }
    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [isCameraActive, selectedLanguage]);

  const handleCopyText = () => {
    const text = selectedLanguage === 'Hindi' ? activeGesture?.recognized_text_hi : activeGesture?.recognized_text_en;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayTranslation = () => {
    const text = selectedLanguage === 'Hindi' ? activeGesture?.recognized_text_hi : activeGesture?.recognized_text_en;
    speakText(text, selectedLanguage);
  };

  const confPercent = Math.round((activeGesture?.confidence || 0.92) * 100);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Indian Sign Language to Speech
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Show ISL gestures using your camera and get the spoken translation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0D1424] p-1.5 rounded-2xl border border-white/5">
          {['Hindi', 'English'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`py-1.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                selectedLanguage === lang
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-4 shadow-2xl relative overflow-hidden">
            <div className="relative aspect-[4/3] w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center">
                    <Radio className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Camera Standby</h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Start webcam to perform real-time optical hand tracking and sign gesture recognition.
                  </p>
                </div>
              )}

              {isCameraActive && (
                <>
                  <div className="absolute top-4 left-4 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/10">
                    <RefreshCw className="w-4 h-4" />
                  </div>

                  <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/10">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-300">Camera Active</span>
                  </div>
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="pt-4 flex justify-center">
              {isCameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-8 py-3 rounded-2xl bg-[#3B151E] hover:bg-[#4E1B28] border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Detected Sign
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {confPercent}%
                </span>
                <button
                  onClick={handleCopyText}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="py-2 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {activeGesture?.recognized_text_hi || 'मेरा नाम प्रभाव है'}
              </h2>
              <p className="text-sm text-slate-400">
                {activeGesture?.recognized_text_en || 'My name is Prabhav'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayTranslation}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 transition-all shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Play Translation</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {isPlayingAudio ? '0:02 / 0:03' : '0:00 / 0:03'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${audioProgress > 0 ? audioProgress * 100 : 35}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Confidence</span>
              <span className="font-mono font-bold text-emerald-400">{confPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 transition-all duration-500"
                style={{ width: `${confPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-5 shadow-2xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Test Sign Simulator
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {COMMON_SIGNS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => processFrame(s.id)}
                  className="p-2 rounded-xl bg-[#090E1A] hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-center transition-all"
                >
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-[10px] font-medium text-slate-300 truncate">{s.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
