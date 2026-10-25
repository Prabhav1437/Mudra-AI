import React, { useState, useEffect } from 'react';
import { Mic, Square, Copy, Check, Hand, Sparkles, Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';

const GIF_MAP = {
  HELLO: '/isl_dataset/gifs/HELLO.gif',
  NAMASTE: '/isl_dataset/gifs/HELLO.gif',
  HELP: '/isl_dataset/gifs/HELP.gif',
  NAME: '/isl_dataset/gifs/NAME.gif',
  GOOD: '/isl_dataset/gifs/GOOD.gif',
  IS: '/isl_dataset/gifs/GOOD.gif',
  STATION: '/isl_dataset/gifs/STATION.gif',
  PLEASE: '/isl_dataset/gifs/PLEASE.gif',
  WELCOME: '/isl_dataset/gifs/WELCOME.gif'
};

const PHOTO_MAP = {
  'I / MY': '/isl_dataset/words/ME.jpg',
  ME: '/isl_dataset/words/ME.jpg',
  MY: '/isl_dataset/words/MY.jpg',
  I: '/isl_dataset/words/ME.jpg'
};

const getAnimImage = (anim) => {
  if (anim?.image) return anim.image;
  const token = anim?.token?.trim().toUpperCase();
  if (gifMap[token]) return gifMap[token];
  if (photoMap[token]) return photoMap[token];
  if (token && token.length === 1) {
    if (/[A-Z]/i.test(token)) return `/isl_dataset/alphabets/${token.toUpperCase()}.jpg`;
    if (/[0-9]/.test(token)) return `/isl_dataset/digits/${token}.jpg`;
  }
  if (token && token.length > 1) {
    const first = token[0].toUpperCase();
    if (/[A-Z]/.test(first)) return `/isl_dataset/alphabets/${first}.jpg`;
  }
  return '/isl_dataset/words/HELLO.jpg';
};

export default function AudioToIslTab({
  speechInput,
  onSpeechInputChange,
  selectedLang,
  onLangChange,
  isTranslating,
  onTranslate,
  output,
  isRecording,
  recordingDuration,
  audioVolume,
  onStartRecording,
  onStopRecording,
  isProcessingAudio
}) {
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const handleCopyText = () => {
    const textToCopy = output?.text || speechInput;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const tokens = output?.tokens || [];
  const animations = output?.animations || [];
  const activeAnimation = animations[currentStep] || animations[0] || null;

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, [output]);

  useEffect(() => {
    if (!isPlaying || animations.length <= 1) return;
    const duration = (activeAnimation?.duration || 1200) / speed;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % animations.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, animations, speed, activeAnimation]);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(animations.length - 1, prev + 1));
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const toggleSpeed = () => {
    if (speed === 1) setSpeed(1.5);
    else if (speed === 1.5) setSpeed(0.5);
    else setSpeed(1);
  };

  const resolveImage = (anim) => {
    if (anim?.image) return anim.image;
    const t = anim?.token?.trim().toUpperCase();
    if (GIF_MAP[t]) return GIF_MAP[t];
    if (PHOTO_MAP[t]) return PHOTO_MAP[t];
    if (t && t.length === 1) {
      if (/[A-Z]/i.test(t)) return `/isl_dataset/alphabets/${t.toUpperCase()}.jpg`;
      if (/[0-9]/.test(t)) return `/isl_dataset/digits/${t}.jpg`;
    }
    if (t && t.length > 1) {
      const firstChar = t[0].toUpperCase();
      if (/[A-Z]/.test(firstChar)) return `/isl_dataset/alphabets/${firstChar}.jpg`;
    }
    return '/isl_dataset/words/HELLO.jpg';
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Speech to Indian Sign Language
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Speak in English or Hindi and view authentic ISL sign images and demonstrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-between min-h-[480px] shadow-sm">
          <div className="w-full flex justify-end">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Whisper Small
            </span>
          </div>

          <div className="flex flex-col items-center text-center my-auto space-y-5">
            {!isRecording ? (
              <div className="flex items-center justify-center">
                <button
                  onClick={onStartRecording}
                  disabled={isProcessingAudio}
                  className="w-32 h-32 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  onClick={onStopRecording}
                  className="w-32 h-32 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all duration-200 animate-pulse"
                >
                  <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                </button>
              </div>
            )}

            {!isRecording ? (
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {isProcessingAudio ? 'Transcribing with Whisper...' : 'Click to start recording'}
                </h3>
                <p className="text-xs text-slate-500">
                  Speak in English or Hindi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-7">
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-rose-500 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, Math.min(24, (audioVolume * 24 * ((i % 4) + 1)) / 3))}px`
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-0.5">
                  <div className="text-xl font-mono font-bold text-slate-900">
                    {formatTimer(recordingDuration)}
                  </div>
                  <p className="text-xs text-rose-600 font-medium">Recording...</p>
                </div>

                <button
                  onClick={onStopRecording}
                  className="px-5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 transition-all mx-auto"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-full pt-4 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {['Auto Detect', 'English', 'Hindi'].map((lang) => {
                const isActive = selectedLang === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => onLangChange(lang)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Transcribed Text
              </span>
              <button
                onClick={handleCopyText}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="min-h-20 flex flex-col justify-center">
              {output?.text ? (
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                    {output.text}
                  </p>
                  {output?.detected_language && (
                    <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      Detected: {output.detected_language.toUpperCase()} ({Math.round((output.language_probability || 0.96) * 100)}%)
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Your speech will appear here...
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                ISL Translation Signs
              </span>
              {tokens.length > 0 && (
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {tokens.length} Sign Tokens
                </span>
              )}
            </div>

            {animations.length > 0 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {animations.slice(0, 4).map((anim, idx) => {
                    const imgSrc = resolveImage(anim);
                    const isActive = idx === currentStep;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStep(idx);
                        }}
                        className={`cursor-pointer rounded-xl bg-slate-50 border p-2.5 flex flex-col items-center justify-between gap-2 transition-all ${
                          isActive
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-300'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-20 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={imgSrc}
                            alt={anim.token}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 w-full text-center truncate">
                          {anim.token}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Authentic ISL Sign Display
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <span>Step {currentStep + 1} of {animations.length}</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700">
                        {speed}x Speed
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-72 sm:h-80 md:h-[320px] rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-4 relative shadow-sm">
                    <img
                      key={currentStep}
                      src={resolveImage(activeAnimation)}
                      alt={activeAnimation?.token || 'ISL sign'}
                      className="max-w-full max-h-full object-contain drop-shadow-sm select-none"
                    />

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-2xs">
                      {activeAnimation?.type === 'fingerspelling' ? 'FINGERSPELLING' : 'WORD SIGN'}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-blue-50/95 backdrop-blur-md border border-blue-200 text-[10px] font-mono font-bold text-blue-700 shadow-2xs">
                      {activeAnimation?.token}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">
                        {activeAnimation?.token}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {activeAnimation?.label}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        ({activeAnimation?.hindi})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={currentStep === animations.length - 1}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleReplay}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={toggleSpeed}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1"
                      >
                        <FastForward className="w-3 h-3 text-blue-600" />
                        <span>{speed}x</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {animations.map((anim, idx) => {
                      const isActive = idx === currentStep;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStep(idx);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {anim.token}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Hand className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm text-slate-400">
                  ISL signs will appear here...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
