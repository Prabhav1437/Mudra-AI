import React from 'react';
import { Activity, Camera, Radio } from 'lucide-react';

export default function IslToSpeechTab({ gestureOutput, onTestGestureApi }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sign Gesture Recognition to Speech</h2>
              <p className="text-xs text-slate-400">Live optical landmark capture with synthesized speech</p>
            </div>
          </div>

          <button
            onClick={onTestGestureApi}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-cyan-600/30"
          >
            <Activity className="w-3.5 h-3.5" />
            Test Gesture Endpoint
          </button>
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

        {gestureOutput && (
          <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Recognized Translation:</div>
              <div className="text-sm font-bold text-white mt-0.5">{gestureOutput.recognized_text}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Confidence Score:</div>
              <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                {Math.round(gestureOutput.confidence * 100)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
