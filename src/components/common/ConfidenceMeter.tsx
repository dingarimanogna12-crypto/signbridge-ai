import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number; // 0.0 to 1.0
  isUncertain?: boolean;
  message?: string;
  compact?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  isUncertain = false,
  message,
  compact = false
}) => {
  const percent = Math.min(100, Math.max(0, Math.round(confidence * 100)));

  // Determination: If percent < 70 or isUncertain, treat as unreliable
  const isReliable = percent >= 75 && !isUncertain;
  const isModerate = percent >= 70 && percent < 75 && !isUncertain;

  const barColor = isReliable
    ? 'bg-teal-600'
    : isModerate
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const badgeBg = isReliable
    ? 'bg-teal-50 text-teal-800 border-teal-200'
    : isModerate
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-rose-50 text-rose-800 border-rose-300';

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
        {isReliable ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        )}
        <span>{percent}% Confidence</span>
        {isUncertain && <span className="underline ml-1">Uncertain</span>}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-navy-100 p-3.5 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Recognition Confidence
          </span>
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-navy-400 cursor-pointer" />
            <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 w-60 p-2 bg-navy-900 text-white text-xs rounded-lg shadow-lg z-20">
              Confidence is derived from joint geometry, landmark stability, and lighting adequacy.
            </div>
          </div>
        </div>

        <div className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeBg}`}>
          {percent}% Match
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-navy-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Explicit Uncertainty Alert if unreliable */}
      {(!isReliable || isUncertain) && (
        <div className="flex items-start gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs mt-1 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Uncertain — please repeat</p>
            <p className="text-rose-700">
              {message || 'The sign was not recognized with high certainty. Please ensure full hand visibility and adjust lighting.'}
            </p>
          </div>
        </div>
      )}

      {isReliable && (
        <p className="text-xs text-teal-700 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          Optimal landmark match detected
        </p>
      )}
    </div>
  );
};
