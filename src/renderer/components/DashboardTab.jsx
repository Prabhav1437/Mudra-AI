import React from 'react';
import { ArrowRight, Camera, Cpu, Mic, Server, Terminal } from 'lucide-react';

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
            Modular Component Architecture
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Welcome to Mudra AI Desktop
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Desktop client integrated with a local high-performance FastAPI Python server. Enables AI model serving for sign gesture recognition and speech animation pipelines.
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

      <div className="grid md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate('audio-to-isl')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-indigo-500/40 p-5 transition-all backdrop-blur-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-between">
            Audio &rarr; Indian Sign Language
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Transcribes spoken English and Hindi, interprets contextual intent, and synthesizes 3D avatar sign sequences via FastAPI.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
              POST /api/audio-to-isl
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
              Avatar Rigging
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('isl-to-speech')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40 p-5 transition-all backdrop-blur-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-between">
            Indian Sign Language &rarr; Speech
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Captures camera gesture streams, tracks hand landmarks, and synthesizes natural audio output in real-time.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
              POST /api/isl-to-speech
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
              Text-to-Speech
            </span>
          </div>
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
