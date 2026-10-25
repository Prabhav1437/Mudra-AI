import React, { useState } from 'react';
import { Mic, Square, Copy, Check, Play, Pause, Maximize2, Volume2, Sparkles, ChevronDown } from 'lucide-react';
import SignVisualizer from './SignVisualizer.jsx';

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
  const [selectedSpeed, setSelectedSpeed] = useState('1.0x');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Speech to Indian Sign Language
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Speak in English or Hindi and see the ISL translation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-3xl bg-[#0D1424] border border-white/5 p-8 flex flex-col items-center justify-between min-h-[500px] shadow-2xl relative overflow-hidden">
          <div className="w-full flex justify-end">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Whisper Small
            </span>
          </div>

          <div className="flex flex-col items-center text-center my-auto space-y-5">
            {!isRecording ? (
              <div className="relative group flex items-center justify-center">
                <div className="absolute -inset-4 rounded-full bg-blue-600/20 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
                <button
                  onClick={onStartRecording}
                  disabled={isProcessingAudio}
                  className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-2xl shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  <div className="w-28 h-28 rounded-full border border-white/30 flex items-center justify-center">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-5 rounded-full bg-rose-600/30 blur-2xl animate-pulse" />
                <button
                  onClick={onStopRecording}
                  className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-2xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <div className="w-28 h-28 rounded-full border border-white/30 flex items-center justify-center">
                    <Mic className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </button>
              </div>
            )}

            {!isRecording ? (
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {isProcessingAudio ? 'Transcribing with Whisper...' : 'Click to start recording'}
                </h3>
                <p className="text-xs text-slate-400">
                  Speak in English or Hindi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-rose-500 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, Math.min(28, (audioVolume * 28 * ((i % 4) + 1)) / 3))}px`
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-0.5">
                  <div className="text-xl font-mono font-bold text-white">
                    {formatTimer(recordingDuration)}
                  </div>
                  <p className="text-xs text-rose-400 font-medium">Recording...</p>
                </div>

                <button
                  onClick={onStopRecording}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all mx-auto"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-full pt-4 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 bg-[#080D18] p-1.5 rounded-2xl border border-white/5">
              {['Auto Detect', 'English', 'Hindi'].map((lang) => {
                const isActive = selectedLang === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => onLangChange(lang)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
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
          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Transcribed Text
              </span>
              <button
                onClick={handleCopyText}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="min-h-24 flex flex-col justify-center">
              {output?.text ? (
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                    {output.text}
                  </p>
                  {output?.detected_language && (
                    <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Detected: {output.detected_language.toUpperCase()} ({Math.round((output.language_probability || 0.96) * 100)}%)
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Your speech will appear here...
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0D1424] border border-white/5 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                ISL Translation
              </span>
              {tokens.length > 0 && (
                <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  {tokens.length} Sign Tokens
                </span>
              )}
            </div>

            {animations.length > 0 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {animations.slice(0, 4).map((anim, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`cursor-pointer rounded-2xl bg-[#090E1A] border p-3 flex flex-col items-center justify-between gap-2 transition-all ${
                        activeStep === idx
                          ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/20 scale-102'
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="w-full h-24 rounded-xl bg-slate-900/80 flex items-center justify-center text-3xl">
                        {anim.pose === 'namaste' ? '🙏' : anim.pose === 'thank_you' ? '🤲' : anim.pose === 'me' ? '🙋' : anim.pose === 'train' ? '🚆' : '🤟'}
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-300 bg-black/40 px-2.5 py-1 rounded-full border border-white/5 w-full text-center truncate">
                        {anim.token}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#090E1A] border border-white/5">
                  <SignVisualizer
                    animationData={output}
                    currentText={output?.text}
                  />
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center">
                  🤟
                </div>
                <p className="text-sm text-slate-500">
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
