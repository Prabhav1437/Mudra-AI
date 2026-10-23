import React from 'react';
import { ArrowRight, BookOpen, Camera, Cpu, Mic, Server, Terminal, Train } from 'lucide-react';

export default function DashboardTab({
  versions,
  ipcStatus,
  backendStatus,
  onTestIpc,
  onRefreshBackend,
  onNavigate
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div className="max-w-2xl">
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 mb-3">
            Full-Stack ISL Accessibility Platform
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Mudra AI Complete Desktop
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Bidirectional translation between spoken languages (English &amp; Hindi) and Indian Sign Language (ISL). Includes live Whisper STT voice input, real-time gesture computer vision, animated sign avatar, and railway announcements.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onTestIpc}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              Ping Electron IPC Bridge
            </button>
            <div
              className={`font-mono text-xs px-3 py-2 rounded-lg border transition-all ${
                ipcStatus.state === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : ipcStatus.state === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-black/30 border-white/10 text-slate-400'
              }`}
            >
              {ipcStatus.message}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('audio-to-isl')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-indigo-500/40 p-5 transition-all backdrop-blur-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
              Audio &rarr; ISL
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Live microphone capture, Whisper STT, and animated avatar gestures.
            </p>
          </div>
          <span className="text-[10px] font-mono text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 self-start">
            Whisper Small
          </span>
        </div>

        <div
          onClick={() => onNavigate('isl-to-speech')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40 p-5 transition-all backdrop-blur-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
              ISL &rarr; Speech
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Webcam gesture vision classification with instant speech synthesis.
            </p>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 self-start">
            Vision &amp; TTS
          </span>
        </div>

        <div
          onClick={() => onNavigate('announcements')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-500/40 p-5 transition-all backdrop-blur-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Train className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
              Announcements
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Preset railway and emergency public broadcasts in Hindi &amp; English.
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 self-start">
            Accessibility
          </span>
        </div>

        <div
          onClick={() => onNavigate('dictionary')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 p-5 transition-all backdrop-blur-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
              ISL Dictionary
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Interactive fingerspelling A-Z, numbers 0-9, and conversational sign lexicon.
            </p>
          </div>
          <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 self-start">
            Reference
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Client Runtime Diagnostic
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Electron', val: versions.electron ? `v${versions.electron}` : '-' },
              { name: 'Chromium', val: versions.chrome ? `v${versions.chrome}` : '-' },
              { name: 'Node.js', val: versions.node ? `v${versions.node}` : '-' },
              { name: 'Platform', val: versions.platform || '-' }
            ].map((spec) => (
              <div key={spec.name} className="p-3 rounded-xl bg-black/25 border border-white/5">
                <div className="text-[11px] text-slate-400">{spec.name}</div>
                <div className="font-mono text-xs font-semibold text-white mt-0.5">{spec.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Server className="w-3.5 h-3.5" />
              FastAPI Backend Specs
            </div>
            <button
              onClick={onRefreshBackend}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">Host &amp; Port</div>
              <div className="font-mono text-xs font-semibold text-white mt-0.5">127.0.0.1:8000</div>
            </div>
            <div className="p-3 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">Status</div>
              <div className="font-mono text-xs font-semibold text-emerald-400 mt-0.5">
                {backendStatus.state.toUpperCase()}
              </div>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[11px] text-slate-400">Info</div>
              <div className="font-mono text-xs text-slate-300 mt-0.5 truncate">{backendStatus.message}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
