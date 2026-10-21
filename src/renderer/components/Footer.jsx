import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/70 backdrop-blur-sm px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
      <div>Mudra-AI Desktop &bull; Built with Electron, React 19, Tailwind CSS v4 &amp; FastAPI</div>
      <div className="font-mono text-[11px] text-slate-400">
        FastAPI: <code className="text-emerald-400">http://127.0.0.1:8000</code> &bull; Dev Client: <code className="text-indigo-400">localhost:5173</code>
      </div>
    </footer>
  );
}
