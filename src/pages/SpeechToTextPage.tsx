import React from 'react';
import { SpeechToTextPanel } from '../components/speechToText/SpeechToTextPanel';
import { Mic, Info, Volume2, ShieldCheck } from 'lucide-react';

export const SpeechToTextPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-7 shadow-xs space-y-1">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
          <Mic className="w-4 h-4" />
          <span>Real-Time Assistive Captioning</span>
        </div>
        <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">
          Speech to Text Captions
        </h2>
        <p className="text-xs text-navy-600 max-w-2xl">
          Speak naturally into your device microphone. Speech is transcribed in real-time with large accessible typography, instant pause/resume, and manual text fallback.
        </p>
      </div>

      <SpeechToTextPanel />

      {/* Acoustic & Environment Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-navy-100 space-y-1 text-xs">
          <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-teal-600" />
            Clear Speech Cadence
          </h4>
          <p className="text-navy-600 leading-relaxed">
            Speak at a steady, measured pace. The speech engine supports clinical terminology, numerical dosages, and Indian English accents across multiple regional dialects.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-navy-100 space-y-1 text-xs">
          <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            Browser Support Realities
          </h4>
          <p className="text-navy-600 leading-relaxed">
            Speech Recognition uses the W3C Web Speech API. It is natively supported in Google Chrome, Microsoft Edge, and Safari. In Firefox, live audio capture requires enabling flags or using our manual text fallback.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-navy-100 space-y-1 text-xs">
          <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero Background Recording
          </h4>
          <p className="text-navy-600 leading-relaxed">
            Microphone access is never requested automatically. It only triggers when you explicitly click "Start Live Captions". Captions stay private in your browser session.
          </p>
        </div>
      </div>
    </div>
  );
};
