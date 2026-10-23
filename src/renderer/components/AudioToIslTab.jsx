import React from 'react';
import {
  CheckCircle2,
  Clock,
  Cpu,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Volume2
} from 'lucide-react';
import SignVisualizer from './SignVisualizer.jsx';

export default function AudioToIslTab({
  speechInput,
  setSpeechInput,
  selectedLang,
  setSelectedLang,
  isTranslating,
  demoOutput,
  onTranslate,
  isRecording,
  recordingDuration,
  audioVolume,
  onToggleRecord,
  isProcessingAudio,
  sttTestResult,
  isTestingStt,
  onRunSttTest
}) {
  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Microphone to ISL Pipeline</h2>
              <p className="text-xs text-slate-400">
                Capture voice through IPC &amp; transcribe via local Whisper AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg border border-white/10">
            {['English', 'Hindi'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedLang === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-black/30 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleRecord}
                disabled={isProcessingAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{isRecording ? 'Listening & Recording...' : isProcessingAudio ? 'Processing Audio via IPC...' : 'Record Voice Input'}</span>
                  {isRecording && (
                    <span className="flex items-center gap-1 text-xs text-rose-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDuration(recordingDuration)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRecording
                    ? 'Click to stop & transmit buffer to Whisper STT'
                    : isProcessingAudio
                    ? 'Converting audio stream to sign tokens'
                    : 'Click microphone to record your voice live'}
                </p>
              </div>
            </div>

            {isRecording && (
              <div className="flex items-center gap-1.5 h-8 px-4 bg-white/5 rounded-lg border border-white/10">
                {[0.2, 0.4, 0.7, 1.0, 0.6, 0.3, 0.8, 0.5].map((scale, i) => (
                  <span
                    key={i}
                    className="w-1 bg-indigo-400 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(6, Math.min(28, audioVolume * scale * 36))}px`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs text-slate-400">Transcribed / Typed Input Text:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={speechInput}
              onChange={(e) => setSpeechInput(e.target.value)}
              placeholder="e.g. Welcome to the train station, how may I help you?"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={onTranslate}
              disabled={isTranslating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isTranslating ? 'Processing...' : 'Translate to ISL'}
            </button>
          </div>
        </div>

        {demoOutput && (
          <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-slate-400">ISL Token Sequence:</div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {demoOutput.source}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {demoOutput.tokens.map((token, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-mono flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {token}
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-400 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">
              Sequence: {demoOutput.gloss}
            </div>

            <SignVisualizer animations={demoOutput.animations || []} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Whisper STT Model</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Small Engine (High Precision)</span>
              </h3>
              <p className="text-xs text-slate-400">Upgraded model with domain vocabulary conditioning for English &amp; Hindi</p>
            </div>
          </div>

          <button
            onClick={onRunSttTest}
            disabled={isTestingStt}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isTestingStt ? 'Testing Model...' : 'Test STT Pipeline'}
          </button>
        </div>

        {sttTestResult && (
          <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/10">
            {sttTestResult.state === 'success' ? (
              <div className="flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-emerald-300">
                    {sttTestResult.data.message}
                  </div>
                  <div className="font-mono text-slate-400 text-[11px]">
                    Engine: {sttTestResult.data.engine} &bull; Model: {sttTestResult.data.model} &bull; Language: {sttTestResult.data.detected_language}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-400">
                Failed to execute STT pipeline test: {sttTestResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
