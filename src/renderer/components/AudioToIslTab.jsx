import React from 'react';
import { Mic } from 'lucide-react';

export default function AudioToIslTab({
  speechInput,
  setSpeechInput,
  selectedLang,
  setSelectedLang,
  isTranslating,
  demoOutput,
  onTranslate
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Audio to Sign Language Engine</h2>
              <p className="text-xs text-slate-400">Convert voice input into ISL sign gestures</p>
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

        <div className="space-y-3">
          <label className="text-xs text-slate-400">Test Speech Input Query:</label>
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
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-slate-400">Simulated ISL Sign Pipeline:</div>
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
            <div className="mt-3 text-xs text-slate-400 font-mono bg-black/30 p-2.5 rounded-lg border border-white/5">
              Sequence: {demoOutput.gloss}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
