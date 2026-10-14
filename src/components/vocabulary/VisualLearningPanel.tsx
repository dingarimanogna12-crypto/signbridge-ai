import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Camera, 
  FlipHorizontal, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Info,
  Repeat,
  Compass,
  MapPin,
  Activity,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  SignVocabularyItem, 
  getCoreCategory, 
  signVocabulary 
} from '../../services/recognition/signVocabulary';
import { ttsService } from '../../services/textToSpeech';

export interface VisualLearningPanelProps {
  sign: SignVocabularyItem;
  onPractice?: (sign: SignVocabularyItem) => void;
  onSelectRelated?: (sign: SignVocabularyItem) => void;
  onClose?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

import { 
  isYouTubeUrl, 
  getYouTubeEmbedUrl, 
  getYouTubeWatchUrl 
} from '../../utils/youtube';

export { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeWatchUrl };

export const VisualLearningPanel: React.FC<VisualLearningPanelProps> = ({
  sign,
  onPractice,
  onSelectRelated,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMirrorMode, setIsMirrorMode] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const isVerified = sign.verificationStatus === 'verified_isl';
  const hasVideo = Boolean(sign.videoUrl && !videoError);
  const isYouTube = isYouTubeUrl(sign.videoUrl);
  const coreCategory = getCoreCategory(sign);
  const relatedSigns = signVocabulary.getRelatedSigns(sign, 4);

  // Reset errors when sign changes
  useEffect(() => {
    setVideoError(false);
    setIsPlaying(true);
    setIframeKey(prev => prev + 1);
  }, [sign.id]);

  // Sync playback speed with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, sign.id]);

  // Sync play/pause with HTML video
  useEffect(() => {
    if (videoRef.current && !isYouTube) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isYouTube, sign.id]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    if (isYouTube) {
      // Reload iframe by updating key
      setIframeKey(prev => prev + 1);
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl space-y-6 text-navy-900">
      {/* 1. Header Information Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-100 pb-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
              {sign.name}
            </h2>
            <span className="text-xs font-mono font-bold bg-navy-100 text-teal-800 px-2.5 py-0.5 rounded-lg border border-navy-200">
              [{sign.gloss}]
            </span>
          </div>

          <p className="text-sm text-navy-600 font-medium leading-relaxed">
            {sign.meaning}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* Category Tag */}
            <span className="px-2.5 py-0.5 rounded-md font-semibold bg-navy-100 text-navy-700 border border-navy-200">
              Category: {coreCategory}
            </span>

            {/* Language Tag */}
            <span className="px-2.5 py-0.5 rounded-md font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Indian Sign Language (ISL)
            </span>

            {/* Verification Status */}
            {isVerified ? (
              <span className="px-2.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified ISL Entry</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Sample Prototype</span>
              </span>
            )}
          </div>
        </div>

        {/* ISLRTC External Verification Portal Link & Watch Demonstration */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasVideo && sign.videoUrl && (
            <a
              href={getYouTubeWatchUrl(sign.videoUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Watch official demonstration video on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch official demonstration</span>
            </a>
          )}
          <a
            href={sign.islrtcDictionaryUrl || 'https://islrtc.nic.in/'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs hover:border-teal-400"
            title="Search this sign on official Indian Sign Language Research and Training Centre portal"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Official ISLRTC Portal</span>
            <ExternalLink className="w-3 h-3 text-navy-400" />
          </a>
        </div>
      </div>

      {/* 2. Primary Demonstration Stage (Large, Clear, High-Contrast) */}
      <div className="space-y-3">
        {hasVideo ? (
          <div className="space-y-3">
            <div 
              className={`relative w-full h-80 sm:h-96 md:h-[460px] lg:h-[500px] bg-black rounded-2xl overflow-hidden border-2 border-navy-900 shadow-xl flex items-center justify-center ${
                isMirrorMode ? 'scale-x-[-1]' : ''
              }`}
            >
              {isYouTube ? (
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={getYouTubeEmbedUrl(sign.videoUrl)}
                  title={`Indian Sign Language demonstration for ${sign.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={sign.videoUrl}
                  playsInline
                  loop={isLooping}
                  autoPlay={isPlaying}
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-contain"
                />
              )}

              {/* Mirror Mode Visual Watermark */}
              {isMirrorMode && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-teal-600/90 text-white text-[11px] font-bold font-mono tracking-wider scale-x-[-1] pointer-events-none shadow-md backdrop-blur-xs">
                  MIRROR ACTIVE (PRACTICE VIEW)
                </div>
              )}
            </div>

            {/* Video Playback Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-navy-50 rounded-2xl border border-navy-200">
              <div className="flex flex-wrap items-center gap-2">
                {!isYouTube && (
                  <button
                    onClick={handleTogglePlay}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                )}

                <button
                  onClick={handleReplay}
                  className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-navy-800 hover:text-teal-700 border border-navy-200 hover:border-teal-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  title="Replay demonstration from start"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                  <span>Replay Sign</span>
                </button>

                {sign.videoUrl && (
                  <a
                    href={getYouTubeWatchUrl(sign.videoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                    title="Watch official source demonstration on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                    <span>Watch official demonstration ↗</span>
                  </a>
                )}

                <button
                  onClick={() => setIsMirrorMode(!isMirrorMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    isMirrorMode 
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' 
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-100'
                  }`}
                  title="Mirror mode flips video horizontally to mirror the signer like a reflection"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Mirror View</span>
                </button>

                {!isYouTube && (
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                      isLooping 
                        ? 'bg-navy-800 text-white border-navy-800 shadow-2xs' 
                        : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-100'
                    }`}
                    title="Toggle continuous sign looping"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Loop</span>
                  </button>
                )}
              </div>

              {/* Speed & Source Citation */}
              <div className="flex items-center gap-3">
                {!isYouTube && (
                  <div className="flex items-center bg-white border border-navy-200 rounded-xl p-0.5 text-xs font-bold">
                    <span className="text-[10px] text-navy-400 uppercase tracking-wider px-2">Speed</span>
                    {[0.5, 0.75, 1.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-1 rounded-lg text-[11px] transition ${
                          playbackSpeed === spd 
                            ? 'bg-teal-600 text-white shadow-xs' 
                            : 'text-navy-600 hover:text-navy-950'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-right">
                  <span className="text-[11px] text-navy-500 font-medium block">
                    Source: <strong className="text-navy-800">{sign.source || 'Official ISLRTC Syllabus'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 2B. Clear, Honest "Demonstration Not Yet Available" Panel */
          <div className="rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border-2 border-navy-800 text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6 text-teal-400" />
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Demonstration Not Yet Available
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    MEDIA PENDING ARCHIVE RELEASE
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-navy-200 leading-relaxed max-w-2xl">
                  Official verified video footage for <strong className="text-white font-semibold">"{sign.name}"</strong> has not yet been ingested into our local index from the public Indian Sign Language Research and Training Centre (ISLRTC) archive.
                </p>

                <p className="text-xs text-navy-400 italic">
                  SignBridge AI strictly adheres to authentic linguistic integrity: we do not substitute unrelated American Sign Language (ASL) gestures, duplicate random internet clips, or fabricate synthetic hand movements.
                </p>
              </div>
            </div>

            {/* Official Resource Access */}
            <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                  Official Reference
                </span>
                <p className="text-xs text-navy-300">
                  {sign.sourceNote || 'Official ISLRTC Dictionary Standard. Check the national repository or SignLearn app.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={sign.islrtcDictionaryUrl || 'https://islrtc.nic.in/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition shadow-sm"
                >
                  <span>Search on ISLRTC Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://indiansignlanguage.org/search-dictionary/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-teal-300 border border-navy-700 flex items-center gap-1.5 transition"
                  title="Search word in IndianSignLanguage.org dictionary"
                >
                  <span>Search IndianSignLanguage.org</span>
                  <ExternalLink className="w-3 h-3 text-navy-400" />
                </a>

                <a
                  href="https://play.google.com/store/apps/details?id=com.islrtc.signlearn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-teal-300 border border-navy-700 flex items-center gap-1.5 transition"
                >
                  <span>SignLearn App</span>
                  <ExternalLink className="w-3 h-3 text-navy-400" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Visual Learning Specifications & Kinematics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Form & Anatomy */}
        <div className="p-5 rounded-2xl bg-navy-50/70 border border-navy-100 space-y-3">
          <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2 border-b border-navy-200 pb-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Sign Formation &amp; Anatomical Parameters</span>
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-navy-100">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                Handshape
              </span>
              <p className="text-navy-900 font-semibold">{sign.handshape}</p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-navy-100">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                Palm Orientation
              </span>
              <p className="text-navy-900 font-semibold">{sign.palmOrientation}</p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-navy-100">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                Starting Position &amp; Body Anchor
              </span>
              <p className="text-navy-900 font-semibold capitalize">
                {sign.bodyAnchor.replace(/_/g, ' ')} ({sign.twoHanded ? 'Two-handed sign' : 'Single dominant hand'})
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-navy-100">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                Movement Trajectory
              </span>
              <p className="text-navy-900 font-semibold">{sign.movementDescription}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Practice Instructions for Beginners */}
        <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-2 border-b border-teal-200 pb-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Step-by-Step Practice Instructions</span>
            </h4>

            <div className="space-y-2">
              {sign.visualStages && sign.visualStages.length > 0 ? (
                sign.visualStages.map((stage, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-teal-100 flex items-start gap-2.5 text-xs shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {stage.stageNumber || idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-navy-900 font-bold block">{stage.stageName}</strong>
                      <p className="text-navy-700 leading-relaxed">{stage.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-teal-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-navy-900 font-bold block">Starting Formation</strong>
                      <p className="text-navy-700">Form {sign.handshape} with your dominant hand.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-teal-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-navy-900 font-bold block">Placement Anchor</strong>
                      <p className="text-navy-700">Position hand at {sign.bodyAnchor.replace(/_/g, ' ')} level.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-teal-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-navy-900 font-bold block">Execution</strong>
                      <p className="text-navy-700">{sign.movementDescription}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ASL Linguistic Contrast Callout */}
          {sign.aslComparisonNote && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1 text-indigo-950 text-xs mt-3">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                Linguistic Note vs American Sign Language (ASL):
              </span>
              <p className="leading-relaxed text-[11px] text-indigo-900 font-medium">
                {sign.aslComparisonNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Related Signs Lateral Navigation */}
      {relatedSigns.length > 0 && (
        <div className="p-4 bg-navy-50/70 rounded-2xl border border-navy-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>Related Signs in {coreCategory}:</span>
            </span>
            <span className="text-[10px] text-navy-500 font-medium">
              Click to explore sign demonstration directly
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {relatedSigns.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onSelectRelated && onSelectRelated(rel)}
                className="px-3 py-1.5 bg-white border border-navy-200 hover:border-teal-500 hover:bg-teal-50 text-navy-900 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5 group"
              >
                <span>{rel.name.split(' (')[0].split(' /')[0]}</span>
                <ArrowRight className="w-3 h-3 text-teal-600 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Bottom Action Controls & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-navy-100">
        <div className="flex items-center gap-2">
          {onPrevious && (
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="px-3.5 py-2 bg-navy-50 hover:bg-navy-100 disabled:opacity-40 text-navy-800 rounded-xl font-bold flex items-center gap-1.5 transition text-xs border border-navy-200"
              title="Previous sign in vocabulary"
            >
              <ChevronLeft className="w-4 h-4 text-teal-600" />
              <span>Previous</span>
            </button>
          )}

          {onNext && (
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="px-3.5 py-2 bg-navy-50 hover:bg-navy-100 disabled:opacity-40 text-navy-800 rounded-xl font-bold flex items-center gap-1.5 transition text-xs border border-navy-200"
              title="Next sign in vocabulary"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-teal-600" />
            </button>
          )}

          <button
            onClick={() => ttsService.speak(sign.name)}
            className="px-4 py-2 bg-navy-100 hover:bg-navy-200 text-navy-800 rounded-xl font-bold flex items-center gap-2 transition text-xs shadow-2xs"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>Hear Pronunciation</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {sign.isModelSupported && onPractice && (
            <button
              onClick={() => onPractice(sign)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 transition text-xs shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Practice with Webcam</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-navy-50 hover:bg-navy-100 text-navy-700 rounded-xl font-bold transition text-xs border border-navy-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
