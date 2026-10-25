import React from 'react';
import { Mic, Video, ArrowRight, MessageSquare, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import heroHandsImg from '../assets/hero-hands.jpg';

export default function DashboardTab({ onSelectTab, backendStatus }) {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="rounded-2xl bg-white border border-slate-200 p-8 lg:p-10 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Bridge the gap <br />
              <span className="text-blue-600">with every gesture.</span>
            </h1>
            <p className="text-base text-slate-600 max-w-xl leading-relaxed">
              Translate between spoken languages and Indian Sign Language using AI.
            </p>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border border-slate-200 shadow-md flex items-center justify-center bg-slate-50 group">
              <img
                src={heroHandsImg}
                alt="Indian Sign Language hands illustration"
                className="w-full h-full object-cover scale-105 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex flex-col justify-end items-center pb-4 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-white bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
                  Mudra Neural Core
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelectTab('audio-to-isl')}
          className="group text-left p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Mic className="w-6 h-6" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            Speech to ISL
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Speak in English or Hindi and see the ISL translation in real time.
          </p>
        </button>

        <button
          onClick={() => onSelectTab('isl-to-speech')}
          className="group text-left p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Video className="w-6 h-6" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            ISL to Speech
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Show ISL gestures and get the spoken translation.
          </p>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-xs font-semibold text-slate-700">
            Hindi & English Supported
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
          <div className="text-xs font-semibold text-slate-700">
            Real-time Translation AI
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-xs font-semibold text-slate-700">
            ISL Dictionary 1000+ Signs
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-semibold text-slate-700">
            Offline App Privacy First
          </div>
        </div>
      </div>
    </div>
  );
}
