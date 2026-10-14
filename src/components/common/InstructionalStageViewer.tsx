import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Activity, 
  FlipHorizontal, 
  ExternalLink, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { VisualInstructionStage } from '../../types';
import { HandSignPictorialDiagram } from './HandSignPictorialDiagram';

interface InstructionalStageViewerProps {
  stages: VisualInstructionStage[];
  signName: string;
  gloss: string;
  meaning?: string;
  islrtcUrl?: string;
  isMirrorMode?: boolean;
  playbackSpeed?: number;
}

export const InstructionalStageViewer: React.FC<InstructionalStageViewerProps> = ({
  stages,
  signName,
  gloss,
  meaning,
  islrtcUrl = 'https://divyangjan.depwd.gov.in/islrtc/',
  isMirrorMode = false,
  playbackSpeed = 1.0
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressPct, setProgressPct] = useState(0);

  const safeStages = stages && stages.length > 0 ? stages : [
    {
      stageNumber: 1,
      stageName: 'Handshape & Orientation',
      description: 'Form the canonical handshape facing outward.',
      handshape: 'Standard posture',
      bodyAnchor: 'neutral_space',
      movementTrajectory: 'Held steady'
    }
  ];

  const currentStage = safeStages[currentStageIdx] || safeStages[0];

  // Auto-play through stages
  useEffect(() => {
    if (!isPlaying) return;

    const stageDuration = 2400 / playbackSpeed;
    const intervalTime = 60;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalTime;
      const pct = Math.min((elapsed / stageDuration) * 100, 100);
      setProgressPct(pct);

      if (elapsed >= stageDuration) {
        clearInterval(timer);
        setProgressPct(0);
        setCurrentStageIdx((prev) => (prev + 1) % safeStages.length);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, currentStageIdx, playbackSpeed, safeStages.length]);

  const handleNext = () => {
    setProgressPct(0);
    setCurrentStageIdx((prev) => (prev + 1) % safeStages.length);
  };

  const handlePrev = () => {
    setProgressPct(0);
    setCurrentStageIdx((prev) => (prev - 1 + safeStages.length) % safeStages.length);
  };

  const handleRestart = () => {
    setProgressPct(0);
    setCurrentStageIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className="bg-navy-950 text-white rounded-2xl p-5 border border-navy-800 shadow-xl space-y-4">
      {/* Top Header & Stage Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-800/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <h4 className="text-base font-black text-white tracking-wide">
              {signName}
            </h4>
            <span className="text-[11px] font-mono text-teal-300 px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
              [{gloss}]
            </span>
          </div>
          {meaning && (
            <p className="text-xs text-navy-300 font-medium">{meaning}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={islrtcUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 border border-navy-700 text-teal-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition"
            title="Search this sign on official ISLRTC Dictionary Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Official ISLRTC Portal</span>
            <ExternalLink className="w-3 h-3 text-navy-400" />
          </a>
        </div>
      </div>

      {/* Stage Progression Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {safeStages.map((st, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentStageIdx(idx);
              setProgressPct(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
              idx === currentStageIdx
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-600/30'
                : 'bg-navy-900 border-navy-800 text-navy-300 hover:bg-navy-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">
              {idx + 1}
            </span>
            <span>{st.stageName}</span>
          </button>
        ))}
      </div>

      {/* Main Instructional Visualization Display */}
      <div className={`relative bg-gradient-to-b from-navy-900 to-navy-950 rounded-2xl border border-navy-800 p-6 min-h-[260px] flex flex-col justify-between overflow-hidden ${
        isMirrorMode ? 'scale-x-[-1]' : ''
      }`}>
        {/* Stage Badge & Body Anchor */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Step {currentStageIdx + 1} of {safeStages.length}: {currentStage.stageName}</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="capitalize">{currentStage.bodyAnchor} Contact</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-navy-400">
            {Math.round(((currentStageIdx + 1) / safeStages.length) * 100)}%
          </span>
        </div>

        {/* Center Graphic: Authentic Anatomical Vector Pictorial Diagram */}
        <div className="my-auto py-2 max-w-2xl mx-auto w-full space-y-3">
          <HandSignPictorialDiagram
            handshapeDescription={currentStage.handshape || 'Standard formation'}
            bodyAnchor={currentStage.bodyAnchor || 'neutral_space'}
            movementTrajectory={currentStage.movementTrajectory || 'Standard stroke'}
            signGloss={gloss}
            signName={signName}
            stageNumber={currentStageIdx + 1}
          />

          <div className="space-y-1 text-center">
            <p className="text-xs text-navy-200 leading-relaxed font-medium bg-black/40 p-2.5 rounded-xl border border-navy-800 max-w-xl mx-auto">
              {currentStage.description}
            </p>
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="h-full bg-teal-400 transition-all duration-75"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-navy-300 hover:text-white border border-navy-800 transition"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="px-2.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-navy-300 hover:text-white border border-navy-800 text-xs font-semibold flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Step</span>
          </button>

          <button
            onClick={handleNext}
            className="px-2.5 py-1.5 rounded-xl bg-teal-900/60 hover:bg-teal-800/80 text-teal-200 border border-teal-700/50 text-xs font-semibold flex items-center gap-1 transition"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Attribution & Official Disclaimer */}
      <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-[11px] text-navy-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>Curriculum guided by official Indian Sign Language (ISLRTC) linguistic structures.</span>
        </span>
        <span className="text-teal-400/90 font-mono">ISL Default</span>
      </div>
    </div>
  );
};
