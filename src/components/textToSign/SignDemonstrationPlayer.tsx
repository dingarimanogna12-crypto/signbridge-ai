import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FlipHorizontal, 
  CheckCircle2, 
  Volume2, 
  Sparkles,
  Video,
  AlertTriangle,
  Info,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Subtitles,
  ChevronRight,
  ChevronLeft,
  Activity,
  Layers,
  MapPin,
  Compass,
  Upload,
  Link,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { ISLSignReference, SequentialSignStep } from '../../types';
import { ttsService } from '../../services/textToSpeech';
import { phraseService } from '../../services/phraseLibraryService';
import { InstructionalStageViewer } from '../common/InstructionalStageViewer';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/youtube';

interface SignDemonstrationPlayerProps {
  phrase: ISLSignReference;
  isMirrorMode: boolean;
  onToggleMirror: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onRequestVerification?: (phrase: string) => void;
  onVideoAttached?: (url: string) => void;
}

export const SignDemonstrationPlayer: React.FC<SignDemonstrationPlayerProps> = ({
  phrase,
  isMirrorMode,
  onToggleMirror,
  playbackSpeed,
  onChangeSpeed,
  onRequestVerification,
  onVideoAttached
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);

  // Asset Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrlInput, setImportUrlInput] = useState('');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sequential steps
  const steps: SequentialSignStep[] = phrase.sequentialSigns && phrase.sequentialSigns.length > 0
    ? phrase.sequentialSigns
    : [
        {
          stepIndex: 1,
          signGloss: phrase.phrase.toUpperCase(),
          englishTerm: phrase.phrase,
          durationMs: 1400,
          description: phrase.movementDescription,
          handshape: phrase.handshapeDescription,
          movement: phrase.movementDescription,
          bodyAnchor: 'chest'
        }
      ];

  const currentStep = steps[currentStepIndex] || steps[0];
  const hasAuthenticVideo = Boolean(phrase.videoUrl && !videoError);

  // Reset on phrase change
  useEffect(() => {
    setVideoError(false);
    setIsPlaying(true);
    setVideoProgress(0);
    setCurrentStepIndex(0);
    setStepProgress(0);
    setIsImportModalOpen(false);
    setImportSuccessMessage(null);
  }, [phrase.id]);

  // Handle animation timer for sequential multi-sign steps when video is absent
  useEffect(() => {
    if (hasAuthenticVideo || !isPlaying) return;

    const duration = (currentStep.durationMs || 1200) / playbackSpeed;
    const intervalTime = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setStepProgress(pct);

      if (elapsed >= duration) {
        clearInterval(timer);
        setStepProgress(0);
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [hasAuthenticVideo, isPlaying, currentStepIndex, playbackSpeed, steps.length, currentStep.durationMs]);

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, hasAuthenticVideo]);

  // Sync video play/pause
  useEffect(() => {
    if (hasAuthenticVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, hasAuthenticVideo]);

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setCurrentStepIndex(0);
    setStepProgress(0);
    setIsPlaying(true);
  };

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    setStepProgress(0);
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => (prev - 1 + steps.length) % steps.length);
    setStepProgress(0);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Save imported video URL
  const handleSaveImportedUrl = (url: string) => {
    if (!url.trim()) return;
    phraseService.addCustomVideoUrl(phrase.id, url.trim());
    setVideoError(false);
    setImportSuccessMessage('Video demonstration linked successfully!');
    if (onVideoAttached) onVideoAttached(url.trim());
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportSuccessMessage(null);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      handleSaveImportedUrl(objectUrl);
    }
  };

  const isYouTube = isYouTubeUrl(phrase.videoUrl);

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-2xl border border-navy-100 shadow-sm p-4 sm:p-6 space-y-5 transition-all ${
        isFullScreen ? 'p-8 flex flex-col justify-between h-screen w-screen overflow-y-auto' : ''
      }`}
    >
      {/* Top Bar: Phrase Title, Hindi Gloss, and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-lg font-black text-navy-900 tracking-tight">
              {phrase.phrase}
            </h3>
            {phrase.hindiGloss && (
              <span className="text-xs text-navy-500 font-hindi px-2 py-0.5 rounded-md bg-navy-50 border border-navy-100">
                {phrase.hindiGloss}
              </span>
            )}
          </div>
          <p className="text-xs text-navy-500 mt-1">
            Category: <strong className="capitalize text-navy-700">{phrase.category}</strong> • Urgency: <strong className="uppercase text-teal-700">{phrase.urgencyLevel || 'routine'}</strong>
            {steps.length > 1 && (
              <span className="ml-2 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Compound Phrase ({steps.length} sequential signs)
              </span>
            )}
          </p>
        </div>

        {/* Global Demonstration Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mirror Toggle */}
          <button
            onClick={onToggleMirror}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isMirrorMode
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-navy-50 border border-navy-200 text-navy-700 hover:bg-navy-100'
            }`}
            title="Mirror View (flips horizontally for sign learner practice)"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Mirror</span>
          </button>

          {/* Captions Toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              showCaptions
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-navy-50 border border-navy-200 text-navy-600 hover:bg-navy-100'
            }`}
            title="Toggle Closed Captions overlay"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>CC</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-navy-100 p-0.5 rounded-xl text-xs border border-navy-200">
            {[0.5, 0.75, 1.0].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                  playbackSpeed === spd
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 text-xs font-semibold flex items-center transition shadow-xs"
            title={isFullScreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Speak Aloud Button */}
          <button
            onClick={() => ttsService.speak(phrase.phrase)}
            className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold flex items-center transition"
            title="Speak phrase out loud for hearing partner"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Attach / Import Video Asset Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="Attach or import an authentic ISL video clip"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Attach Video</span>
          </button>
        </div>
      </div>

      {/* Sequential Multi-Sign Step Progress Bar (when phrase is compound) */}
      {steps.length > 1 && (
        <div className="bg-navy-50/80 p-2.5 rounded-xl border border-navy-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-navy-700">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>ISL Compound Sign Sequence: Step {currentStepIndex + 1} of {steps.length}</span>
            </span>
            <span className="text-teal-700 font-mono">
              Active: <strong>[{currentStep.signGloss}]</strong> ({currentStep.englishTerm})
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setStepProgress(0);
                }}
                className={`flex-1 min-w-[120px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between border ${
                  idx === currentStepIndex
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white border-navy-200 text-navy-700 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                <span>{idx + 1}. {step.signGloss}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  idx === currentStepIndex ? 'bg-teal-700 text-white' : 'bg-navy-100 text-navy-600'
                }`}>
                  {step.englishTerm}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Demonstration Stage */}
      {hasAuthenticVideo ? (
        /* 1. Authentic Video Player Stage */
        <div className="space-y-3">
          <div className={`relative w-full h-80 sm:h-96 md:h-[420px] bg-black rounded-2xl overflow-hidden border-2 border-navy-800 shadow-inner flex items-center justify-center ${
            isMirrorMode ? 'scale-x-[-1]' : ''
          }`}>
            {isYouTube ? (
              <iframe
                src={getYouTubeEmbedUrl(phrase.videoUrl)}
                title={phrase.phrase}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                ref={videoRef}
                src={phrase.videoUrl}
                playsInline
                loop
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    const pct = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100;
                    setVideoProgress(pct);
                  }
                }}
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain"
              />
            )}

            {/* Video Scrubber bar */}
            {!isYouTube && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-navy-900/60">
                <div 
                  className="h-full bg-teal-500 transition-all duration-100" 
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            )}

            {/* Closed Captions Overlay */}
            {showCaptions && (
              <div className="absolute bottom-4 inset-x-6 flex justify-center pointer-events-none z-20">
                <div className={`px-4 py-2 rounded-xl bg-black/85 border border-white/20 text-white text-center shadow-lg backdrop-blur-sm ${
                  isMirrorMode ? 'scale-x-[-1]' : ''
                }`}>
                  <p className="text-sm font-bold tracking-wide text-teal-300">
                    {currentStep.signGloss}
                  </p>
                  <p className="text-xs text-white/90">
                    {phrase.phrase}
                  </p>
                </div>
              </div>
            )}

            {isMirrorMode && (
              <div className="absolute top-3 left-3 bg-teal-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm scale-x-[-1]">
                MIRROR VIEW ACTIVE
              </div>
            )}
          </div>

          {/* Video Playback Controls & Direct Source Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-navy-50 rounded-2xl border border-navy-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRestart}
                className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-navy-800 hover:text-teal-700 border border-navy-200 hover:border-teal-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                title="Replay demonstration from start"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                <span>Replay Sign</span>
              </button>

              {phrase.videoUrl && (
                <a
                  href={getYouTubeWatchUrl(phrase.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  title="Watch official source demonstration on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                  <span>Watch official demonstration ↗</span>
                </a>
              )}
            </div>

            <div className="text-right">
              <span className="text-[11px] text-navy-500 font-medium">
                Source: <strong className="text-navy-800">{phrase.verifiedBy || 'Official ISL Reference'}</strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Educational Movement Demonstration Stage (No Confusing SVG Avatar!) */
        <div className="space-y-3">
          {/* Honest Video Pending Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demonstration Video Pending:</strong> Video demonstration is awaiting publication from official ISLRTC repository or certified deaf educator archive. Do not guess movements without verified visual references.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={phrase.islrtcReferenceUrl || 'https://islrtc.nic.in/'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition"
                title="Search on official ISLRTC repository"
              >
                ISLRTC Portal ↗
              </a>
              <a
                href="https://indiansignlanguage.org/search-dictionary/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-navy-800 hover:bg-navy-900 text-amber-200 border border-amber-400/40 rounded-lg text-[10px] font-bold shrink-0 transition"
                title="Search on IndianSignLanguage.org dictionary"
              >
                ISL Dictionary ↗
              </a>
            </div>
          </div>

          <div className={`relative w-full bg-gradient-to-b from-navy-950 to-navy-900 rounded-2xl border-2 border-navy-800 shadow-inner flex flex-col justify-between p-4 sm:p-6 ${
            isMirrorMode ? 'scale-x-[-1]' : ''
          }`}>
            {/* Top Stage Badges */}
            <div className={`flex items-center justify-between w-full z-10 pb-3 border-b border-navy-800/60 ${
              isMirrorMode ? 'scale-x-[-1]' : ''
            }`}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-teal-950/90 text-teal-300 border border-teal-700/60 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>SIGN: {currentStep.signGloss}</span>
                </span>
                {currentStep.bodyAnchor && (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-navy-900/90 text-indigo-300 border border-navy-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>Anchor: {currentStep.bodyAnchor.toUpperCase()}</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-mono text-navy-400 bg-navy-900/80 px-2 py-1 rounded-md border border-navy-800">
                Step {currentStepIndex + 1} / {steps.length}
              </span>
            </div>

            {/* Instructional Visual Breakdown Stage */}
            <div className={`w-full max-w-xl mx-auto z-10 my-auto ${
              isMirrorMode ? 'scale-x-[-1]' : ''
            }`}>
              <InstructionalStageViewer
                stages={currentStep.visualStages || phrase.visualStages || [
                  {
                    stageNumber: 1,
                    stageName: 'Handshape & Orientation',
                    description: currentStep.handshape || phrase.handshapeDescription,
                    handshape: currentStep.handshape || phrase.handshapeDescription,
                    bodyAnchor: currentStep.bodyAnchor || 'neutral_space',
                    movementTrajectory: 'Initial hand formation'
                  },
                  {
                    stageNumber: 2,
                    stageName: 'Starting Position',
                    description: `Position hand at ${currentStep.bodyAnchor || 'chest'} level.`,
                    handshape: currentStep.handshape || phrase.handshapeDescription,
                    bodyAnchor: currentStep.bodyAnchor || 'chest',
                    movementTrajectory: 'Anchor contact'
                  },
                  {
                    stageNumber: 3,
                    stageName: 'Movement Direction',
                    description: currentStep.movement || phrase.movementDescription,
                    handshape: currentStep.handshape || phrase.handshapeDescription,
                    bodyAnchor: currentStep.bodyAnchor || 'neutral_space',
                    movementTrajectory: currentStep.movement || phrase.movementDescription
                  },
                  {
                    stageNumber: 4,
                    stageName: 'Ending Hold & Expression',
                    description: phrase.nonManualFeatures || 'Hold terminal sign position with clear eye contact.',
                    handshape: currentStep.handshape || phrase.handshapeDescription,
                    bodyAnchor: currentStep.bodyAnchor || 'neutral_space',
                    movementTrajectory: 'Terminal hold (1s)'
                  }
                ]}
                signName={currentStep.signGloss}
                gloss={currentStep.englishTerm}
                meaning={phrase.phrase}
                islrtcUrl={phrase.islrtcReferenceUrl || 'https://islrtc.nic.in/'}
                isMirrorMode={isMirrorMode}
                playbackSpeed={playbackSpeed}
              />
            </div>

            {/* Closed Captions Overlay (CC) */}
            {showCaptions && (
              <div className={`w-full flex justify-center z-20 ${
                isMirrorMode ? 'scale-x-[-1]' : ''
              }`}>
                <div className="px-5 py-2 rounded-xl bg-black/90 border border-teal-500/30 text-white text-center shadow-xl backdrop-blur-md max-w-lg">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-black text-teal-300 tracking-wide font-mono">
                      [{currentStep.signGloss}]
                    </span>
                    <span className="text-xs font-semibold text-white/90">
                      • {currentStep.englishTerm}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-navy-900">
              <div 
                className="h-full bg-teal-500 transition-all duration-75"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Universal Playback Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-700 text-xs flex items-center transition"
            title="Replay from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {steps.length > 1 && (
            <div className="flex items-center gap-1 pl-1">
              <button
                onClick={handlePrevStep}
                className="p-2 rounded-xl bg-white border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs flex items-center transition"
                title="Previous sign in phrase"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextStep}
                className="p-2 rounded-xl bg-white border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs flex items-center transition"
                title="Next sign in phrase"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-navy-500 font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>
            {hasAuthenticVideo
              ? 'Authentic Indian Sign Language Video Demonstration'
              : 'Plain-English Step-by-Step Movement Instructions'}
          </span>
        </div>
      </div>

      {/* Active Step Linguistic Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 space-y-1">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Handshape Configuration
          </span>
          <p className="text-xs text-navy-800 leading-relaxed font-medium">
            {currentStep.handshape || phrase.handshapeDescription}
          </p>
        </div>

        <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 space-y-1">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Movement &amp; Trajectory
          </span>
          <p className="text-xs text-navy-800 leading-relaxed font-medium">
            {currentStep.movement || phrase.movementDescription}
          </p>
        </div>

        <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 space-y-1">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Non-Manual Markers (Face/Head)
          </span>
          <p className="text-xs text-navy-800 leading-relaxed font-medium">
            {phrase.nonManualFeatures || 'Neutral face, attentive direct eye contact.'}
          </p>
        </div>
      </div>

      {/* Truthful Verification Attribution Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl text-xs border ${
        phrase.isVerified
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-navy-50 border-navy-200 text-navy-800'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${phrase.isVerified ? 'text-emerald-600' : 'text-navy-500'}`} />
          <span>
            {phrase.isVerified ? (
              <>Verified by: <strong>{phrase.verifiedBy || 'Certified ISL Reviewer'}</strong></>
            ) : (
              <>Status: <strong>Community Reference</strong> (Awaiting Certified Deaf Panel Validation)</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-navy-500">
            {phrase.sourceNote || 'Standard ISL Gloss Definition'}
          </span>
        </div>
      </div>

      {/* Asset Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-navy-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Upload className="w-4 h-4" />
                <span>Attach Authentic ISL Video</span>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-navy-100 text-navy-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-600 leading-relaxed">
              Attach an authentic video demonstration for <strong>"{phrase.phrase}"</strong>. You can paste an MP4, WebM, or YouTube URL, or upload a local video file from your device.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-navy-700 block mb-1">
                  Video URL (MP4 / WebM / YouTube):
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={importUrlInput}
                    onChange={(e) => setImportUrlInput(e.target.value)}
                    placeholder="https://example.com/signs/hello.mp4"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-navy-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <Link className="w-3.5 h-3.5 text-navy-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="text-center text-[11px] font-semibold text-navy-400">
                — OR —
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy-700 block mb-1">
                  Upload Video File:
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-navy-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            {importSuccessMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{importSuccessMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-100">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-navy-200 text-xs font-semibold text-navy-600 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveImportedUrl(importUrlInput)}
                disabled={!importUrlInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-sm transition"
              >
                Save &amp; Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
