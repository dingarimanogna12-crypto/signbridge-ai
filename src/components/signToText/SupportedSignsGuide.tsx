import React, { useState } from 'react';
import { SUPPORTED_SIGNS_LIST } from '../../services/handLandmarkDetector';
import { BookOpen, Hand, Sparkles, CheckCircle2, ShieldCheck, Video } from 'lucide-react';

interface SupportedSignsGuideProps {
  onSelectSign?: (signName: string) => void;
  highlightedSign?: string | null;
}

export const SupportedSignsGuide: React.FC<SupportedSignsGuideProps> = ({ 
  onSelectSign,
  highlightedSign 
}) => {
  const [filterMode, setFilterMode] = useState<'model_supported' | 'all'>('model_supported');

  const modelSupportedSigns = SUPPORTED_SIGNS_LIST.filter(s => s.isModelSupported);
  const displayedSigns = filterMode === 'model_supported' ? modelSupportedSigns : SUPPORTED_SIGNS_LIST;

  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-bold text-navy-900">
              Verified ISLRTC Baseline Handshapes
            </h3>
            <p className="text-[11px] text-navy-500">
              Grounded in published Indian Sign Language Research and Training Centre (ISLRTC) specifications.
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-navy-50 p-1 rounded-xl border border-navy-200 text-xs">
          <button
            onClick={() => setFilterMode('model_supported')}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterMode === 'model_supported'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Camera Supported ({modelSupportedSigns.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              filterMode === 'all'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <span>All ISL Signs ({SUPPORTED_SIGNS_LIST.length})</span>
          </button>
        </div>
      </div>

      <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/70 text-xs text-navy-700 leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy-900 block font-semibold">Strict Anti-Fabrication Rule:</strong>
          When in <em>Tracking Only</em> mode, MediaPipe streams 21 raw 3D joint landmarks without fabricating words. When the <em>Verified Baseline Classifier</em> is enabled, only gestures matching published ISLRTC specifications with calibrated confidence (≥75%) are recognized. Transitions and unsupported hand positions are flagged honestly as uncertain.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedSigns.map((sign, idx) => {
          const isHighlighted = highlightedSign && (
            highlightedSign.toLowerCase().includes(sign.name.toLowerCase()) ||
            sign.name.toLowerCase().includes(highlightedSign.toLowerCase())
          );

          return (
            <div
              key={sign.id || idx}
              onClick={() => onSelectSign && onSelectSign(sign.name)}
              className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 group relative ${
                isHighlighted
                  ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-400/50'
                  : 'bg-navy-50/40 hover:bg-teal-50/30 border-navy-100 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`font-bold text-xs flex items-center gap-1.5 ${
                  isHighlighted ? 'text-teal-900' : 'text-navy-900 group-hover:text-teal-700'
                }`}>
                  <Hand className={`w-3.5 h-3.5 ${isHighlighted ? 'text-teal-600' : 'text-teal-500'}`} />
                  {sign.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {sign.videoUrl && (
                    <span className="p-1 rounded bg-teal-100/70 text-teal-800" title="Includes verified video demonstration">
                      <Video className="w-3 h-3" />
                    </span>
                  )}
                  {sign.isModelSupported ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Live Model
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-navy-100 text-navy-600">
                      Learn Guide
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-navy-600 leading-relaxed line-clamp-2">
                {sign.description || sign.movementDescription}
              </p>

              <div className="flex items-center justify-between text-[10px] text-navy-500 pt-1 border-t border-navy-100/60 font-medium">
                <span className="truncate max-w-[140px]">{sign.category}</span>
                <span className="text-teal-700 font-semibold group-hover:underline">
                  {sign.twoHanded ? 'Two-handed' : 'One-handed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
