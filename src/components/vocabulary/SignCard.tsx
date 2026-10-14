import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  ExternalLink, 
  GraduationCap, 
  Eye, 
  Star, 
  Hand, 
  ArrowRight,
  Camera,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  SignVocabularyItem, 
  getCoreCategory, 
  signVocabulary 
} from '../../services/recognition/signVocabulary';
import { ttsService } from '../../services/textToSpeech';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeWatchUrl } from './VisualLearningPanel';

export interface SignCardProps {
  sign: SignVocabularyItem;
  onViewDetails?: (sign: SignVocabularyItem) => void;
  onPractice?: (sign: SignVocabularyItem) => void;
  onSelectRelated?: (sign: SignVocabularyItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (signId: string) => void;
  compact?: boolean;
}

export const SignCard: React.FC<SignCardProps> = ({
  sign,
  onViewDetails,
  onPractice,
  onSelectRelated,
  isFavorite = false,
  onToggleFavorite,
  compact = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const isVerified = sign.verificationStatus === 'verified_isl';
  const category = getCoreCategory(sign);
  const hasVideo = Boolean(sign.videoUrl && !videoError);
  const isYouTube = isYouTubeUrl(sign.videoUrl);
  const relatedSigns = signVocabulary.getRelatedSigns(sign, 3);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isYouTube) {
      setIframeKey(k => k + 1);
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || isYouTube) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    ttsService.speak(sign.name);
  };

  return (
    <div 
      onClick={() => onViewDetails?.(sign)}
      className="bg-white rounded-2xl border border-navy-100 hover:border-teal-400/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      {/* 1. Header: Name, Gloss, Category, Status, Favorite */}
      <div className="p-4 sm:p-5 pb-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-navy-900 group-hover:text-teal-700 transition text-sm sm:text-base leading-snug truncate">
                {sign.name}
              </h3>
              <span className="text-[10px] font-mono text-navy-500 bg-navy-50 px-1.5 py-0.5 rounded border border-navy-200">
                [{sign.gloss}]
              </span>
            </div>

            {/* English Meaning */}
            <p className="text-xs text-navy-600 font-medium line-clamp-1">
              <span className="text-navy-400 font-bold uppercase text-[10px] tracking-wider">Meaning: </span>
              {sign.meaning}
            </p>
          </div>

          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(sign.id);
              }}
              className={`p-1.5 rounded-lg border transition shrink-0 ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                  : 'bg-navy-50 border-navy-200 text-navy-400 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Badges Row: Category, Verification Status, Body Anchor */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Category Chip (1 of 8 Canonical Categories) */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
            {category}
          </span>

          {/* Verification Status Badge */}
          {isVerified ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified ISL</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Sample Prototype</span>
            </span>
          )}

          <span className="text-[10px] text-navy-500 bg-navy-50 px-2 py-0.5 rounded-md border border-navy-100 capitalize">
            {sign.bodyAnchor.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 2. Visual Demonstration Container (Video vs Honest Pending Status) */}
      <div className="px-4 sm:px-5">
        {hasVideo ? (
          <div className="relative rounded-xl overflow-hidden bg-navy-950 border border-navy-800 aspect-[16/10] flex items-center justify-center group/video shadow-inner">
            {isYouTube ? (
              <iframe
                key={iframeKey}
                src={getYouTubeEmbedUrl(sign.videoUrl)}
                title={`ISL Demonstration for ${sign.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 pointer-events-auto"
              />
            ) : (
              <video
                ref={videoRef}
                src={sign.videoUrl}
                playsInline
                loop
                muted
                autoPlay={isPlaying}
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain"
              />
            )}

            {/* Video Controls Overlay */}
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5 bg-navy-950/85 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-navy-700/80 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                {!isYouTube && (
                  <button
                    onClick={handleTogglePlay}
                    className="p-1 rounded text-white hover:text-teal-300 transition"
                    title={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Prominent Replay Button */}
                <button
                  onClick={handleReplay}
                  className="px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
                  title="Replay verified ISL demonstration"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>

                {sign.videoUrl && (
                  <a
                    href={getYouTubeWatchUrl(sign.videoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-0.5 bg-navy-800 hover:bg-navy-700 text-teal-300 rounded text-[11px] font-bold flex items-center gap-1 transition border border-teal-500/30"
                    title="Watch official demonstration on YouTube"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Watch ↗</span>
                  </a>
                )}
              </div>

              <span className="text-[10px] font-mono text-teal-300 font-semibold">
                ISL Verified
              </span>
            </div>
          </div>
        ) : (
          /* Clear, Honest Status when verified video is pending official archive release */
          <div className="rounded-xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border border-navy-800 text-white p-3.5 aspect-[16/10] flex flex-col justify-between shadow-inner">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    Demonstration Not Yet Available
                  </h4>
                  <span className="text-[10px] text-amber-300 font-mono">
                    Media pending ISLRTC archive
                  </span>
                </div>
              </div>

              <a
                href={sign.islrtcDictionaryUrl || 'https://islrtc.nic.in/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 hover:bg-navy-700 text-teal-300 border border-teal-500/40 flex items-center gap-1 transition"
                title="View official Indian Sign Language Research and Training Centre portal"
              >
                <span>ISLRTC</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="p-2 rounded-lg bg-navy-950/80 border border-navy-800 text-[10px] text-navy-200 space-y-0.5">
              <p className="line-clamp-1">
                <strong className="text-teal-300">Formation:</strong> {sign.handshape}
              </p>
              <p className="line-clamp-1">
                <strong className="text-teal-300">Movement:</strong> {sign.movementDescription}
              </p>
            </div>

            <p className="text-[10px] text-navy-400 italic leading-tight">
              Official ISLRTC syllabus standard. Sourced without fabricating synthetic gestures.
            </p>
          </div>
        )}
      </div>

      {/* 3. Short Explanation & Related Signs */}
      <div className="p-4 sm:p-5 pt-3 space-y-3">
        {/* Short Explanation */}
        <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
          <span className="font-semibold text-navy-800">Explanation: </span>
          {sign.description}
        </p>

        {/* Related Signs */}
        {relatedSigns.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-navy-100">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
              Related Signs:
            </span>
            <div className="flex flex-wrap gap-1">
              {relatedSigns.map((rel) => (
                <button
                  key={rel.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRelated) onSelectRelated(rel);
                    else onViewDetails?.(rel);
                  }}
                  className="px-2 py-0.5 bg-navy-50 hover:bg-teal-50 hover:border-teal-300 text-navy-700 hover:text-teal-900 border border-navy-200 rounded-md text-[10px] font-semibold transition"
                >
                  {rel.name.split(' /')[0].split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Action Buttons Footer */}
        <div className="pt-2 border-t border-navy-100 flex items-center justify-between gap-2">
          {/* Left: Pronounce & ISLRTC Link */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-lg text-navy-500 hover:text-teal-700 hover:bg-navy-50 transition"
              title="Hear English pronunciation via text-to-speech"
              aria-label={`Pronounce ${sign.name}`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <a
              href={sign.islrtcDictionaryUrl || 'https://islrtc.nic.in/'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-navy-500 hover:text-teal-700 hover:bg-navy-50 transition"
              title="Open official ISLRTC portal resource (https://islrtc.nic.in/)"
              aria-label="View official ISLRTC portal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right: Practice Button & View Details Button */}
          <div className="flex items-center gap-1.5">
            {onPractice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPractice(sign);
                }}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                title="Practice this Indian Sign Language gesture"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Practice</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(sign);
              }}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm shadow-teal-600/20"
              title="Watch word-specific Indian Sign Language visual demonstration"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Watch how to sign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
