import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface PrivacyNoticeBadgeProps {
  detailed?: boolean;
}

export const PrivacyNoticeBadge: React.FC<PrivacyNoticeBadgeProps> = ({ detailed = false }) => {
  if (detailed) {
    return (
      <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            Strict Privacy & Local Processing Guarantee
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Camera frames, microphone audio, and live computer vision models run <strong>100% on-device</strong> inside your browser sandbox. No video or audio recordings are uploaded, stored remotely, or shared without your explicit consent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span>Private &amp; On-Device Only</span>
    </div>
  );
};
