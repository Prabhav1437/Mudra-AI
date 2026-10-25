import React, { useState } from 'react';
import { Mic, Square, Copy, Check, Hand, Sparkles } from 'lucide-react';
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Speech to Indian Sign Language
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Speak in English or Hindi and see the ISL translation.
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
                ISL Translation
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
                  {animations.slice(0, 4).map((anim, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`cursor-pointer rounded-xl bg-slate-50 border p-3 flex flex-col items-center justify-between gap-2 transition-all ${
                        activeStep === idx
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                        <Hand className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 w-full text-center truncate">
                        {anim.token}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <SignVisualizer
                    animationData={output}
                    currentText={output?.text}
                  />
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
