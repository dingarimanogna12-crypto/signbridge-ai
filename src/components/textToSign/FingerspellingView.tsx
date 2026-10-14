import React, { useState, useEffect } from 'react';
import { getFingerspellingForText } from '../../services/fingerspellingService';
import { FingerspellingLetter } from '../../types';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Info, 
  Sparkles 
} from 'lucide-react';

interface FingerspellingViewProps {
  text: string;
  autoplay?: boolean;
}

export const FingerspellingView: React.FC<FingerspellingViewProps> = ({ 
  text, 
  autoplay = false 
}) => {
  const letters = getFingerspellingForText(text);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [speedMs, setSpeedMs] = useState(1200);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [text]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && letters.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= letters.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, letters.length, speedMs]);

  if (letters.length === 0) {
    return (
      <div className="p-6 text-center text-navy-500 bg-navy-50 rounded-2xl border border-navy-100">
        <p className="text-sm font-semibold">No alphabetic characters to fingerspell</p>
        <p className="text-xs mt-1">Please enter English text or words.</p>
      </div>
    );
  }

  const current = letters[currentIndex] || letters[0];

  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-5 space-y-4 shadow-sm">
      {/* Title & Speed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
            ISL
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900">
              ISL Fingerspelling Demonstration
            </h4>
            <p className="text-[11px] text-navy-500">
              Spelling letter-by-letter according to official Indian Sign Language standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-navy-500 font-medium">Speed:</span>
          {[
            { label: '0.75x', ms: 1600 },
            { label: '1.0x', ms: 1200 },
            { label: '1.5x', ms: 800 }
          ].map(spd => (
            <button
              key={spd.label}
              onClick={() => setSpeedMs(spd.ms)}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                speedMs === spd.ms
                  ? 'bg-teal-600 text-white'
                  : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
              }`}
            >
              {spd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Demonstration Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Left: Graphic Avatar Card */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-navy-900 to-navy-950 rounded-2xl text-white relative overflow-hidden shadow-inner min-h-[220px]">
          {/* Large Letter Badge */}
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-3xl font-black text-teal-300 shadow-lg shadow-teal-500/20 mb-3">
            {current.char}
          </div>

          {/* SVG Hand Graphic representation */}
          <div className="w-24 h-24 rounded-full bg-navy-800/80 border border-teal-500/30 flex items-center justify-center p-3">
            <svg viewBox="0 0 100 100" className="w-full h-full text-teal-400 stroke-current" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {/* Generalized two-handed ISL signing profile */}
              <circle cx="50" cy="50" r="40" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M35 70 V45 C35 38 45 38 45 45 V65" />
              <path d="M45 45 C45 35 55 35 55 45 V65" />
              <path d="M55 45 C55 37 65 37 65 48 V68" />
              <path d="M25 55 C25 50 35 50 35 60 V75" />
              <path d="M30 75 Q50 85 70 75" />
            </svg>
          </div>

          <p className="text-[11px] text-teal-300 font-mono mt-3 uppercase tracking-wider">
            Letter {currentIndex + 1} of {letters.length}
          </p>
        </div>

        {/* Right: Technical Explanation */}
        <div className="md:col-span-7 space-y-3">
          <div className="p-3.5 bg-navy-50 rounded-xl border border-navy-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Handshape Execution
            </span>
            <p className="text-sm font-semibold text-navy-900 leading-snug">
              {current.description}
            </p>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900 space-y-1">
            <span className="font-bold text-teal-800 block">
              Two-Handed Coordination Note:
            </span>
            <p className="leading-relaxed">
              {current.twoHandedNote}
            </p>
          </div>
        </div>

      </div>

      {/* Progress Track & Letter Pills */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {letters.map((l, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(false);
              }}
              className={`w-8 h-8 rounded-lg font-bold text-xs shrink-0 transition ${
                idx === currentIndex
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105'
                  : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
              }`}
            >
              {l.char}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-navy-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                setIsPlaying(false);
              }}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40 transition"
              aria-label="Previous letter"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Sequence</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentIndex(prev => Math.min(letters.length - 1, prev + 1));
                setIsPlaying(false);
              }}
              disabled={currentIndex === letters.length - 1}
              className="p-2 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40 transition"
              aria-label="Next letter"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            className="p-2 rounded-lg text-navy-500 hover:bg-navy-100 text-xs font-medium flex items-center gap-1 transition"
            title="Restart spelling sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
