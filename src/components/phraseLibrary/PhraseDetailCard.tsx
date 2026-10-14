import React from 'react';
import { ISLSignReference } from '../../types';
import { 
  Hand, 
  Volume2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Tag 
} from 'lucide-react';
import { ttsService } from '../../services/textToSpeech';

interface PhraseDetailCardProps {
  phrase: ISLSignReference;
  onViewSign: (phrase: ISLSignReference) => void;
}

export const PhraseDetailCard: React.FC<PhraseDetailCardProps> = ({ 
  phrase, 
  onViewSign 
}) => {
  const getUrgencyBadge = () => {
    switch (phrase.urgencyLevel) {
      case 'emergency':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'urgent':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-navy-50 text-navy-600 border-navy-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 group">
      <div className="space-y-2">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {phrase.category}
          </span>

          {phrase.urgencyLevel && phrase.urgencyLevel !== 'routine' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge()}`}>
              {phrase.urgencyLevel.toUpperCase()}
            </span>
          )}
        </div>

        {/* Phrase Title & Hindi Gloss */}
        <div>
          <h4 className="text-sm font-bold text-navy-900 group-hover:text-teal-700 transition leading-snug">
            {phrase.phrase}
          </h4>
          {phrase.hindiGloss && (
            <p className="text-xs text-navy-500 font-hindi mt-0.5">
              {phrase.hindiGloss}
            </p>
          )}
        </div>

        {/* Handshape snippet */}
        <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
          {phrase.handshapeDescription}
        </p>
      </div>

      {/* Bottom Actions & Verification Stamp */}
      <div className="pt-2 border-t border-navy-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <ShieldCheck className={`w-3.5 h-3.5 ${phrase.isVerified ? 'text-emerald-600' : 'text-navy-400'}`} />
          <span className={`hidden sm:inline ${phrase.isVerified ? 'text-emerald-700 font-bold' : 'text-navy-500'}`}>
            {phrase.isVerified ? 'Locally Verified' : 'Prototype Ref'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => ttsService.speak(phrase.phrase)}
            className="p-2 rounded-xl text-navy-600 hover:text-navy-900 hover:bg-navy-100 transition"
            title="Speak phrase aloud for hearing partner"
            aria-label={`Speak ${phrase.phrase}`}
          >
            <Volume2 className="w-4 h-4 text-navy-500" />
          </button>

          <button
            onClick={() => onViewSign(phrase)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>View Sign</span>
          </button>
        </div>
      </div>
    </div>
  );
};
