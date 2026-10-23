import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles } from 'lucide-react';

const POSES = {
  default: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [105, 110],
    rShoulder: [195, 110],
    lElbow: [90, 165],
    rElbow: [210, 165],
    lWrist: [95, 220],
    rWrist: [205, 220],
    torso: [150, 210]
  },
  namaste: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [115, 155],
    rElbow: [185, 155],
    lWrist: [142, 135],
    rWrist: [158, 135],
    torso: [150, 210]
  },
  thank_you: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [180, 140],
    lWrist: [95, 220],
    rWrist: [160, 85],
    torso: [150, 210]
  },
  welcome: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [80, 150],
    rElbow: [220, 150],
    lWrist: [65, 130],
    rWrist: [235, 130],
    torso: [150, 210]
  },
  please: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [175, 150],
    lWrist: [95, 220],
    rWrist: [150, 140],
    torso: [150, 210]
  },
  help: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [110, 165],
    rElbow: [165, 155],
    lWrist: [140, 165],
    rWrist: [145, 140],
    torso: [150, 210]
  },
  me: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [175, 150],
    lWrist: [95, 220],
    rWrist: [150, 130],
    torso: [150, 210]
  },
  you: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [180, 145],
    lWrist: [95, 220],
    rWrist: [190, 105],
    torso: [150, 210]
  },
  train: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [120, 150],
    rElbow: [180, 150],
    lWrist: [140, 145],
    rWrist: [160, 145],
    torso: [150, 210]
  },
  station: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [100, 155],
    rElbow: [200, 155],
    lWrist: [120, 155],
    rWrist: [180, 155],
    torso: [150, 210]
  },
  water: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [175, 140],
    lWrist: [95, 220],
    rWrist: [155, 80],
    torso: [150, 210]
  },
  good: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [185, 145],
    lWrist: [95, 220],
    rWrist: [185, 105],
    torso: [150, 210]
  },
  yes: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [180, 145],
    lWrist: [95, 220],
    rWrist: [175, 115],
    torso: [150, 210]
  },
  no: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [185, 145],
    lWrist: [95, 220],
    rWrist: [165, 110],
    torso: [150, 210]
  },
  stop: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [195, 140],
    lWrist: [95, 220],
    rWrist: [195, 85],
    torso: [150, 210]
  }
};

export default function SignVisualizer({ animations = [] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef(null);

  const activeAnimation = animations[currentStep] || null;

  useEffect(() => {
    setCurrentStep(0);
    if (animations.length > 0) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [animations]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && animations.length > 0) {
      const duration = (activeAnimation?.duration || 1000) / speed;
      timer = setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev >= animations.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, animations, speed, activeAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const poseKey = activeAnimation?.pose && POSES[activeAnimation.pose] ? activeAnimation.pose : 'default';
    const pose = POSES[poseKey];

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.beginPath();
    ctx.arc(150, 140, 110, 0, Math.PI * 2);
    ctx.fill();

    const drawBone = (p1, p2, color = '#818cf8', lw = 5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    };

    const drawJoint = (p, radius = 6, color = '#c7d2fe') => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(pose.head[0], pose.head[1], 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawBone(pose.head, pose.neck, '#a5b4fc', 6);
    drawBone(pose.neck, pose.torso, '#a5b4fc', 8);

    drawBone(pose.neck, pose.lShoulder, '#818cf8', 6);
    drawBone(pose.lShoulder, pose.lElbow, '#818cf8', 5);
    drawBone(pose.lElbow, pose.lWrist, '#6366f1', 5);

    drawBone(pose.neck, pose.rShoulder, '#22d3ee', 6);
    drawBone(pose.rShoulder, pose.rElbow, '#22d3ee', 5);
    drawBone(pose.rElbow, pose.rWrist, '#06b6d4', 5);

    drawJoint(pose.neck, 5);
    drawJoint(pose.lShoulder, 6, '#818cf8');
    drawJoint(pose.rShoulder, 6, '#22d3ee');
    drawJoint(pose.lElbow, 6, '#818cf8');
    drawJoint(pose.rElbow, 6, '#22d3ee');
    drawJoint(pose.lWrist, 9, '#a5b4fc');
    drawJoint(pose.rWrist, 9, '#67e8f9');

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`Pose: ${poseKey.toUpperCase()}`, 150, 270);
  }, [activeAnimation]);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(animations.length - 1, prev + 1));
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const toggleSpeed = () => {
    if (speed === 1) setSpeed(1.5);
    else if (speed === 1.5) setSpeed(0.5);
    else setSpeed(1);
  };

  if (!animations || animations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-sm font-semibold text-slate-200">ISL Sign Visualizer Ready</div>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Record speech or type a prompt above to generate and play animated sign sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            ISL Avatar Gesture Player
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Step {currentStep + 1} of {animations.length}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-300">
            {speed}x Speed
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
            <canvas ref={canvasRef} width={300} height={290} className="block" />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-indigo-300">
              {activeAnimation?.type === 'fingerspelling' ? 'FINGERSPELLING' : 'WORD SIGN'}
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Active Sign Token
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-white font-mono">
                {activeAnimation?.token}
              </span>
              <span className="text-sm font-semibold text-indigo-400">
                {activeAnimation?.label}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                ({activeAnimation?.hindi})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Sequence Timeline
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {animations.map((anim, idx) => {
                const isActive = idx === currentStep;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(idx);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 scale-105'
                        : 'bg-black/30 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {anim.token}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === animations.length - 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={handleReplay}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={toggleSpeed}
              className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5 text-indigo-400" />
              <span>{speed}x</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
