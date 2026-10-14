import React from 'react';
import { TextToSignPanel } from '../components/textToSign/TextToSignPanel';
import { Hand, Award, ShieldCheck, HelpCircle } from 'lucide-react';

interface TextToSignPageProps {
  onOpenFeedbackWithPhrase?: (phrase: string) => void;
}

export const TextToSignPage: React.FC<TextToSignPageProps> = ({ 
  onOpenFeedbackWithPhrase 
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-7 shadow-xs space-y-1">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
          <Hand className="w-4 h-4" />
          <span>ISL Linguistic Demonstration Player</span>
        </div>
        <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">
          Text to Sign Demonstration
        </h2>
        <p className="text-xs text-navy-600 max-w-2xl">
          Enter words or questions to view approved Indian Sign Language (ISL) demonstrations. For unverified phrases, our honest translator clearly marks unavailability and provides official two-handed ISL fingerspelling.
        </p>
      </div>

      <TextToSignPanel onOpenFeedbackWithPhrase={onOpenFeedbackWithPhrase} />

      {/* ISL Verification Standards Note */}
      <div className="p-5 bg-navy-50 rounded-2xl border border-navy-100 text-xs text-navy-700 space-y-2">
        <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-teal-600" />
          Indian Sign Language (ISL) Certification &amp; Integrity Policy
        </h4>
        <p className="leading-relaxed">
          Indian Sign Language is a recognized natural language with distinct grammar, spatial syntax, two-handed fingerspelling traditions, and non-manual facial markers. SignBridge AI strictly refuses to fabricate synthetic avatar translations for unverified phrases. Phrases must be reviewed and accredited by certified ISL interpreters.
        </p>
      </div>
    </div>
  );
};
