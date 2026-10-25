import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles } from 'lucide-react';

const POSES = {
  default: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [226, 168],
    lWrist: [102, 222],
    rWrist: [218, 222]
  },
  namaste: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [120, 162],
    rElbow: [200, 162],
    lWrist: [152, 142],
    rWrist: [168, 142]
  },
  thank_you: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [194, 142],
    lWrist: [102, 222],
    rWrist: [164, 82]
  },
  welcome: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [76, 154],
    rElbow: [244, 154],
    lWrist: [58, 134],
    rWrist: [262, 134]
  },
  please: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [186, 154],
    lWrist: [102, 222],
    rWrist: [156, 142]
  },
  help: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [116, 172],
    rElbow: [190, 162],
    lWrist: [146, 182],
    rWrist: [156, 168]
  },
  name: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [112, 168],
    rElbow: [196, 148],
    lWrist: [144, 142],
    rWrist: [166, 136]
  },
  me: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [178, 162],
    lWrist: [102, 222],
    rWrist: [158, 152]
  },
  you: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [222, 144],
    lWrist: [102, 222],
    rWrist: [238, 118]
  },
  train: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [106, 166],
    rElbow: [214, 166],
    lWrist: [142, 166],
    rWrist: [178, 166]
  },
  water: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [194, 134],
    lWrist: [102, 222],
    rWrist: [168, 76]
  },
  food: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [190, 128],
    lWrist: [102, 222],
    rWrist: [158, 72]
  },
  good: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [206, 154],
    lWrist: [102, 222],
    rWrist: [202, 112]
  },
  yes: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [202, 148],
    lWrist: [102, 222],
    rWrist: [192, 126]
  },
  no: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [214, 148],
    lWrist: [102, 222],
    rWrist: [232, 140]
  },
  stop: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [218, 138],
    lWrist: [102, 222],
    rWrist: [214, 86]
  },
  emergency: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [82, 128],
    rElbow: [238, 128],
    lWrist: [72, 74],
    rWrist: [248, 74]
  },
  prabhav: {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    rElbow: [198, 144],
    lWrist: [102, 222],
    rWrist: [176, 108]
  }
};

const getLetterPose = (letter) => {
  const code = (letter || 'A').toUpperCase().charCodeAt(0) - 65;
  const clampedCode = Math.max(0, Math.min(25, isNaN(code) ? 0 : code));
  const radiusOffset = (clampedCode % 4) * 4;
  return {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    lWrist: [102, 222],
    rElbow: [198 + (clampedCode % 3) * 4, 146 - (clampedCode % 4) * 3],
    rWrist: [174 + (clampedCode % 5) * 5 - 10, 108 + radiusOffset - 6]
  };
};

const getNumberPose = (num) => {
  const val = parseInt(num, 10) || 0;
  return {
    head: [160, 62],
    neck: [160, 98],
    lShoulder: [116, 118],
    rShoulder: [204, 118],
    torso: [160, 226],
    lElbow: [94, 168],
    lWrist: [102, 222],
    rElbow: [196 + (val % 3) * 4, 148 - (val % 2) * 4],
    rWrist: [178 + (val % 5) * 4, 112 + (val % 3) * 6]
  };
};

const resolvePose = (poseKey, token) => {
  if (poseKey && POSES[poseKey]) return POSES[poseKey];
  if (poseKey && poseKey.startsWith('letter_')) {
    return getLetterPose(poseKey.replace('letter_', ''));
  }
  if (token) {
    const t = String(token).trim().toLowerCase();
    if (POSES[t]) return POSES[t];
    if (t.length === 1) {
      if (/[0-9]/.test(t)) return getNumberPose(t);
      if (/[a-z]/i.test(t)) return getLetterPose(t);
    }
    const sum = t.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return getLetterPose(String.fromCharCode(65 + (sum % 26)));
  }
  return POSES.default;
};

const renderHand = (wrist, elbow, isRight, isSigning) => {
  const dx = wrist[0] - elbow[0];
  const dy = wrist[1] - elbow[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const perpX = -uy;
  const perpY = ux;

  const f1x = wrist[0] + ux * 13 + perpX * 3;
  const f1y = wrist[1] + uy * 13 + perpY * 3;

  const f2x = wrist[0] + ux * 15;
  const f2y = wrist[1] + uy * 15;

  const f3x = wrist[0] + ux * 13 - perpX * 3;
  const f3y = wrist[1] + uy * 13 - perpY * 3;

  const thumbSide = isRight ? -1 : 1;
  const tx = wrist[0] + ux * 6 + perpX * 8 * thumbSide;
  const ty = wrist[1] + uy * 6 + perpY * 8 * thumbSide;

  return (
    <g>
      {isSigning && (
        <circle
          cx={wrist[0]}
          cy={wrist[1]}
          r="19"
          fill="rgba(56, 189, 248, 0.2)"
          stroke="rgba(56, 189, 248, 0.45)"
          strokeWidth="1.5"
          className="animate-pulse"
        />
      )}
      <circle
        cx={wrist[0]}
        cy={wrist[1]}
        r="7"
        fill={isRight ? '#0284c7' : '#2563eb'}
        stroke={isRight ? '#bae6fd' : '#bfdbfe'}
        strokeWidth="2"
      />
      <line
        x1={wrist[0]}
        y1={wrist[1]}
        x2={f1x}
        y2={f1y}
        stroke={isRight ? '#38bdf8' : '#60a5fa'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={wrist[0]}
        y1={wrist[1]}
        x2={f2x}
        y2={f2y}
        stroke={isRight ? '#7dd3fc' : '#93c5fd'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={wrist[0]}
        y1={wrist[1]}
        x2={f3x}
        y2={f3y}
        stroke={isRight ? '#38bdf8' : '#60a5fa'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={wrist[0]}
        y1={wrist[1]}
        x2={tx}
        y2={ty}
        stroke={isRight ? '#bae6fd' : '#bfdbfe'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx={wrist[0]}
        cy={wrist[1]}
        r="2.5"
        fill="#ffffff"
      />
    </g>
  );
};

export default function SignVisualizer({ animationData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const animations = animationData?.animations || [];
  const activeAnimation = animations[currentStep] || null;

  const targetPose = resolvePose(activeAnimation?.pose, activeAnimation?.token);
  const [currentPose, setCurrentPose] = useState(targetPose);
  const targetRef = useRef(targetPose);
  targetRef.current = targetPose;

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
    let animId;
    const animate = () => {
      let isDone = true;
      setCurrentPose((prev) => {
        const target = targetRef.current;
        const next = { ...prev };
        const keys = ['lElbow', 'rElbow', 'lWrist', 'rWrist'];
        for (const k of keys) {
          const px = prev[k][0];
          const py = prev[k][1];
          const tx = target[k][0];
          const ty = target[k][1];
          const dx = tx - px;
          const dy = ty - py;
          if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
            isDone = false;
            next[k] = [px + dx * 0.28, py + dy * 0.28];
          } else {
            next[k] = [tx, ty];
          }
        }
        return next;
      });

      if (!isDone) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
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

  const activePoseName = activeAnimation?.pose
    ? activeAnimation.pose.replace('letter_', 'Letter ').toUpperCase()
    : activeAnimation?.token
    ? activeAnimation.token.toUpperCase()
    : 'READY';

  const isFingerspelling = activeAnimation?.type === 'fingerspelling';

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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[280px] rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-50 to-blue-50/20 p-2 shadow-xs flex flex-col items-center">
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-2xs">
              {isFingerspelling ? 'FINGERSPELLING' : 'WORD SIGN'}
            </div>

            <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-md bg-blue-50/95 backdrop-blur-md border border-blue-200 text-[10px] font-mono font-bold text-blue-700 shadow-2xs max-w-[110px] truncate">
              {activeAnimation?.token || 'READY'}
            </div>

            <svg
              viewBox="0 0 320 330"
              className="w-full h-auto aspect-[320/330] select-none block"
            >
              <defs>
                <pattern id="avatar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                </pattern>
                <linearGradient id="torso-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="60%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="waist-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="arm-l" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="arm-r" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              <rect width="320" height="330" rx="14" fill="#f8fafc" />
              <rect width="320" height="330" rx="14" fill="url(#avatar-grid)" />

              <ellipse cx="160" cy="286" rx="88" ry="18" fill="rgba(37, 99, 235, 0.05)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="1.5" />
              <ellipse cx="160" cy="286" rx="56" ry="11" fill="rgba(37, 99, 235, 0.07)" stroke="rgba(37, 99, 235, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
              <ellipse cx="160" cy="286" rx="24" ry="5" fill="rgba(37, 99, 235, 0.12)" />

              <polygon points="152,88 168,88 171,114 149,114" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />

              <polygon
                points="120,118 200,118 184,188 136,188"
                fill="url(#torso-grad)"
                stroke="#93c5fd"
                strokeWidth="1.5"
              />
              <polygon
                points="136,188 184,188 174,230 146,230"
                fill="url(#waist-grad)"
                stroke="#60a5fa"
                strokeWidth="1.5"
              />

              <line x1="160" y1="118" x2="160" y2="230" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="160" cy="154" r="5" fill="#38bdf8" />
              <circle cx="160" cy="154" r="2.5" fill="#ffffff" />

              <path d="M 116,118 Q 160,132 204,118" fill="none" stroke="#60a5fa" strokeWidth="2.5" />

              <g>
                <ellipse cx="160" cy="62" rx="20" ry="24" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                <rect x="146" y="55" width="28" height="9" rx="4.5" fill="#38bdf8" />
                <rect x="148" y="57" width="10" height="3" rx="1.5" fill="#ffffff" opacity="0.85" />
                <circle cx="138" cy="62" r="3" fill="#60a5fa" />
                <circle cx="182" cy="62" r="3" fill="#60a5fa" />
              </g>

              <line
                x1={currentPose.lShoulder[0]}
                y1={currentPose.lShoulder[1]}
                x2={currentPose.lElbow[0]}
                y2={currentPose.lElbow[1]}
                stroke="url(#arm-l)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <line
                x1={currentPose.lShoulder[0]}
                y1={currentPose.lShoulder[1]}
                x2={currentPose.lElbow[0]}
                y2={currentPose.lElbow[1]}
                stroke="#bfdbfe"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />

              <circle
                cx={currentPose.lShoulder[0]}
                cy={currentPose.lShoulder[1]}
                r="11"
                fill="#1d4ed8"
                stroke="#93c5fd"
                strokeWidth="2"
              />
              <circle
                cx={currentPose.lShoulder[0]}
                cy={currentPose.lShoulder[1]}
                r="4"
                fill="#bfdbfe"
              />

              <circle
                cx={currentPose.lElbow[0]}
                cy={currentPose.lElbow[1]}
                r="8"
                fill="#1e40af"
                stroke="#93c5fd"
                strokeWidth="2"
              />
              <circle
                cx={currentPose.lElbow[0]}
                cy={currentPose.lElbow[1]}
                r="3"
                fill="#ffffff"
              />

              <line
                x1={currentPose.lElbow[0]}
                y1={currentPose.lElbow[1]}
                x2={currentPose.lWrist[0]}
                y2={currentPose.lWrist[1]}
                stroke="url(#arm-l)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <line
                x1={currentPose.lElbow[0]}
                y1={currentPose.lElbow[1]}
                x2={currentPose.lWrist[0]}
                y2={currentPose.lWrist[1]}
                stroke="#bfdbfe"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />

              {renderHand(currentPose.lWrist, currentPose.lElbow, false, false)}

              <line
                x1={currentPose.rShoulder[0]}
                y1={currentPose.rShoulder[1]}
                x2={currentPose.rElbow[0]}
                y2={currentPose.rElbow[1]}
                stroke="url(#arm-r)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <line
                x1={currentPose.rShoulder[0]}
                y1={currentPose.rShoulder[1]}
                x2={currentPose.rElbow[0]}
                y2={currentPose.rElbow[1]}
                stroke="#bae6fd"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />

              <circle
                cx={currentPose.rShoulder[0]}
                cy={currentPose.rShoulder[1]}
                r="11"
                fill="#0369a1"
                stroke="#7dd3fc"
                strokeWidth="2"
              />
              <circle
                cx={currentPose.rShoulder[0]}
                cy={currentPose.rShoulder[1]}
                r="4"
                fill="#bae6fd"
              />

              <circle
                cx={currentPose.rElbow[0]}
                cy={currentPose.rElbow[1]}
                r="8"
                fill="#0369a1"
                stroke="#7dd3fc"
                strokeWidth="2"
              />
              <circle
                cx={currentPose.rElbow[0]}
                cy={currentPose.rElbow[1]}
                r="3"
                fill="#ffffff"
              />

              <line
                x1={currentPose.rElbow[0]}
                y1={currentPose.rElbow[1]}
                x2={currentPose.rWrist[0]}
                y2={currentPose.rWrist[1]}
                stroke="url(#arm-r)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <line
                x1={currentPose.rElbow[0]}
                y1={currentPose.rElbow[1]}
                x2={currentPose.rWrist[0]}
                y2={currentPose.rWrist[1]}
                stroke="#bae6fd"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />

              {renderHand(currentPose.rWrist, currentPose.rElbow, true, true)}
            </svg>

            <div className="w-full pt-1.5 pb-0.5 px-2 flex items-center justify-between border-t border-slate-100 text-[11px] font-mono text-slate-500">
              <span className="truncate max-w-[190px]">Pose: {activePoseName}</span>
              <span className="text-emerald-600 font-semibold uppercase text-[10px]">Active</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Active Sign Token
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
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

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
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
