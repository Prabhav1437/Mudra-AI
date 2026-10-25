import React from 'react';
import { Mic, Video, ArrowRight, MessageSquare, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function DashboardTab({ onSelectTab, backendStatus }) {
  return (
    <div className="space-y-10 max-w-6xl">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A]/90 via-[#0B1120] to-[#070A12] border border-white/5 p-8 lg:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Bridge the gap <br />
              <span className="text-sky-400">with every gesture.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Translate between spoken languages and Indian Sign Language using AI.
            </p>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-blue-500/20 via-sky-600/10 to-transparent p-1 shadow-2xl flex items-center justify-center border border-blue-400/20">
              <div className="w-full h-full rounded-full bg-[#0B1120]/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-blue-500/15 to-transparent pointer-events-none" />
                <div className="text-6xl mb-2 filter drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                  🤝
                </div>
                <div className="text-xs uppercase font-mono tracking-widest text-sky-400 font-semibold">
                  Mudra Neural Core
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Whisper &bull; PyTorch &bull; MediaPipe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelectTab('audio-to-isl')}
          className="group text-left p-8 rounded-3xl bg-[#0D1424] border border-white/5 hover:border-blue-500/40 hover:bg-[#111B30] transition-all duration-300 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-blue-600/20">
              <Mic className="w-7 h-7" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
            Speech to ISL
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Speak in English or Hindi and see the ISL translation in real time.
          </p>
        </button>

        <button
          onClick={() => onSelectTab('isl-to-speech')}
          className="group text-left p-8 rounded-3xl bg-[#0D1424] border border-white/5 hover:border-sky-500/40 hover:bg-[#111B30] transition-all duration-300 relative overflow-hidden shadow-xl"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-lg shadow-sky-600/20">
              <Video className="w-7 h-7" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-sky-600 group-hover:text-white transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
            ISL to Speech
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Show ISL gestures and get the spoken translation.
          </p>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#090E1A] border border-white/5">
          <MessageSquare className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-xs font-medium text-slate-300 leading-snug">
            Hindi & English Supported
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#090E1A] border border-white/5">
          <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
          <div className="text-xs font-medium text-slate-300 leading-snug">
            Real-time Translation Powered by AI
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#090E1A] border border-white/5">
          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs font-medium text-slate-300 leading-snug">
            ISL Dictionary 1000+ Signs
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#090E1A] border border-white/5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-medium text-slate-300 leading-snug">
            Offline Desktop App Privacy First
          </div>
        </div>
      </div>
    </div>
  );
}
