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
    rElbow: [175, 160],
    lWrist: [135, 180],
    rWrist: [145, 165],
    torso: [150, 210]
  },
  name: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [180, 145],
    lWrist: [95, 220],
    rWrist: [165, 120],
    torso: [150, 210]
  },
  me: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [170, 155],
    lWrist: [95, 220],
    rWrist: [150, 150],
    torso: [150, 210]
  },
  you: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [210, 140],
    lWrist: [95, 220],
    rWrist: [230, 120],
    torso: [150, 210]
  },
  train: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [100, 160],
    rElbow: [200, 160],
    lWrist: [130, 160],
    rWrist: [170, 160],
    torso: [150, 210]
  },
  water: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [185, 130],
    lWrist: [95, 220],
    rWrist: [165, 75],
    torso: [150, 210]
  },
  food: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [180, 125],
    lWrist: [95, 220],
    rWrist: [155, 70],
    torso: [150, 210]
  },
  good: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [195, 150],
    lWrist: [95, 220],
    rWrist: [195, 110],
    torso: [150, 210]
  },
  yes: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [190, 145],
    lWrist: [95, 220],
    rWrist: [185, 125],
    torso: [150, 210]
  },
  no: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [205, 145],
    lWrist: [95, 220],
    rWrist: [225, 140],
    torso: [150, 210]
  },
  stop: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [95, 165],
    rElbow: [210, 135],
    lWrist: [95, 220],
    rWrist: [210, 85],
    torso: [150, 210]
  },
  emergency: {
    head: [150, 60],
    neck: [150, 95],
    lShoulder: [110, 110],
    rShoulder: [190, 110],
    lElbow: [85, 125],
    rElbow: [215, 125],
    lWrist: [75, 75],
    rWrist: [225, 75],
    torso: [150, 210]
  }
};

export default function SignVisualizer({ animationData, currentText }) {
  const canvasRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const animations = animationData?.animations || [];
  const activeAnimation = animations[currentStep] || null;

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, [animationData]);

  useEffect(() => {
    if (!isPlaying || animations.length <= 1) return;

    const currentDuration = (activeAnimation?.duration || 1000) / speed;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % animations.length);
    }, currentDuration);

    return () => clearTimeout(timer);
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

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
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

    ctx.fillStyle = 'rgba(37, 99, 235, 0.06)';
    ctx.beginPath();
    ctx.arc(150, 140, 110, 0, Math.PI * 2);
    ctx.fill();

    const drawBone = (p1, p2, color = '#2563eb', lw = 5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    };

    const drawJoint = (p, radius = 6, color = '#60a5fa') => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(pose.head[0], pose.head[1], 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawBone(pose.head, pose.neck, '#3b82f6', 6);
    drawBone(pose.neck, pose.torso, '#3b82f6', 8);

    drawBone(pose.neck, pose.lShoulder, '#2563eb', 6);
    drawBone(pose.lShoulder, pose.lElbow, '#2563eb', 5);
    drawBone(pose.lElbow, pose.lWrist, '#1d4ed8', 5);

    drawBone(pose.neck, pose.rShoulder, '#0284c7', 6);
    drawBone(pose.rShoulder, pose.rElbow, '#0284c7', 5);
    drawBone(pose.rElbow, pose.rWrist, '#0369a1', 5);

    drawJoint(pose.neck, 5);
    drawJoint(pose.lShoulder, 6, '#60a5fa');
    drawJoint(pose.rShoulder, 6, '#38bdf8');
    drawJoint(pose.lElbow, 6, '#60a5fa');
    drawJoint(pose.rElbow, 6, '#38bdf8');
    drawJoint(pose.lWrist, 9, '#93c5fd');
    drawJoint(pose.rWrist, 9, '#7dd3fc');

    ctx.fillStyle = '#475569';
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-sm font-semibold text-slate-800">ISL Sign Visualizer Ready</div>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Record speech or type a prompt above to generate and play animated sign sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            ISL Avatar Gesture Player
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Step {currentStep + 1} of {animations.length}</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-blue-700">
            {speed}x Speed
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <canvas ref={canvasRef} width={300} height={290} className="block" />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 backdrop-blur-md border border-slate-200 text-[11px] font-mono font-medium text-slate-700">
              {activeAnimation?.type === 'fingerspelling' ? 'FINGERSPELLING' : 'WORD SIGN'}
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Active Sign Token
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {activeAnimation?.token}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {activeAnimation?.label}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                ({activeAnimation?.hindi})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
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
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {anim.token}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === animations.length - 1}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={handleReplay}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={toggleSpeed}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5 text-blue-600" />
              <span>{speed}x</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
