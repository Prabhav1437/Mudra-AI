import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  Layers,
  Mic,
  Radio,
  Sparkles,
  Terminal,
  Volume2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [versions, setVersions] = useState({
    electron: '-',
    chrome: '-',
    node: '-',
    platform: '-'
  });
  const [ipcStatus, setIpcStatus] = useState({ state: 'idle', message: 'Ready to test bridge' });
  const [speechInput, setSpeechInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [demoOutput, setDemoOutput] = useState(null);

  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.getVersions === 'function') {
      try {
        const v = window.electronAPI.getVersions();
        setVersions(v);
      } catch (err) {
        console.error('Failed to get versions:', err);
      }
    }
  }, []);

  const handleTestIPC = async () => {
    if (window.electronAPI && typeof window.electronAPI.ping === 'function') {
      setIpcStatus({ state: 'loading', message: 'Pinging main process...' });
      const start = performance.now();
      try {
        const res = await window.electronAPI.ping();
        const duration = Math.round(performance.now() - start);
        setIpcStatus({
          state: 'success',
          message: `IPC response: "${res.toUpperCase()}" (${duration}ms)`
        });
      } catch (error) {
        setIpcStatus({
          state: 'error',
          message: `Error: ${error.message}`
        });
      }
    } else {
      setIpcStatus({
        state: 'error',
        message: 'Electron IPC API unavailable in web mode'
      });
    }
  };

  const handleTranslateDemo = () => {
    if (!speechInput.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      setDemoOutput({
        tokens: speechInput.trim().split(' ').map((w) => w.toUpperCase()),
        gloss: speechInput.toUpperCase() + ' [ISL GLOSS]'
      });
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans overflow-hidden">
      <div className="pointer-events-none fixed -top-24 -right-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -left-12 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />

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
                  React + Tailwind
                </span>
              </div>
              <p className="text-xs text-slate-400">Bidirectional Indian Sign Language &amp; Speech Bridge</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              Desktop App Online
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm px-6">
        <div className="max-w-6xl mx-auto flex gap-2 py-2">
          {[
            { id: 'overview', label: 'Dashboard & Specs', icon: Layers },
            { id: 'audio-to-isl', label: 'Audio → ISL', icon: Mic },
            { id: 'isl-to-speech', label: 'ISL → Speech', icon: Camera }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <div className="max-w-2xl">
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 mb-3">
                  Migrated to React &amp; Tailwind CSS v4
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Welcome to Mudra AI Desktop
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Electron app now powered by React 19, Tailwind CSS v4, and Vite for instant HMR. Designed to power accessibility tools for real-time bidirectional translation between spoken languages (English / Hindi) and Indian Sign Language (ISL).
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleTestIPC}
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
                onClick={() => setActiveTab('audio-to-isl')}
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
                  Transcribes spoken English and Hindi, interprets contextual intent, and synthesizes 3D avatar sign sequences.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    Speech Recognition
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    Avatar Rigging
                  </span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('isl-to-speech')}
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
                    MediaPipe / Vision
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    Text-to-Speech
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                <Cpu className="w-3.5 h-3.5" />
                Runtime Diagnostic Matrix
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Electron', val: versions.electron ? `v${versions.electron}` : '-' },
                  { name: 'Chromium', val: versions.chrome ? `v${versions.chrome}` : '-' },
                  { name: 'Node.js', val: versions.node ? `v${versions.node}` : '-' },
                  { name: 'Platform', val: versions.platform || '-' }
                ].map((spec) => (
                  <div key={spec.name} className="p-3 rounded-xl bg-black/25 border border-white/5">
                    <div className="text-[11px] text-slate-400">{spec.name}</div>
                    <div className="font-mono text-sm font-semibold text-white mt-0.5">{spec.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio-to-isl' && (
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
                    onClick={handleTranslateDemo}
                    disabled={isTranslating}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    {isTranslating ? 'Processing...' : 'Translate to ISL'}
                  </button>
                </div>
              </div>

              {demoOutput && (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="text-xs font-medium text-slate-400 mb-2">Simulated ISL Sign Pipeline:</div>
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
        )}

        {activeTab === 'isl-to-speech' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sign Gesture Recognition to Speech</h2>
                  <p className="text-xs text-slate-400">Live optical landmark capture with synthesized speech</p>
                </div>
              </div>

              <div className="relative rounded-xl border border-dashed border-white/15 bg-black/40 h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Camera Feed Viewport</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Ready for MediaPipe Hands or OpenCV model integration. Video capture permissions will bind seamlessly in Electron.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70 backdrop-blur-sm px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
        <div>Mudra-AI Desktop &bull; Built with Electron, React 19 &amp; Tailwind CSS v4</div>
        <div className="font-mono text-[11px] text-slate-400">
          Dev Server: <code className="text-indigo-400">localhost:5173</code>
        </div>
      </footer>
    </div>
  );
}
