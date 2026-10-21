import React from 'react';
import { Server, Sparkles } from 'lucide-react';

export default function Header({ backendStatus, onRefreshBackend }) {
  return (
    <header className="relative z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Mudra AI
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Full Stack
              </span>
            </div>
            <p className="text-xs text-slate-400">Bidirectional Indian Sign Language &amp; Speech Bridge</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshBackend}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              backendStatus.state === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{backendStatus.state === 'online' ? 'FastAPI Online' : 'FastAPI Offline'}</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            App Ready
          </div>
        </div>
      </div>
    </header>
  );
}
