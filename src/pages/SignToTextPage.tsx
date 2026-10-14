import React from 'react';
import { SignToTextPanel } from '../components/signToText/SignToTextPanel';
import { SupportedSignsGuide } from '../components/signToText/SupportedSignsGuide';
import { Camera, ShieldCheck, AlertTriangle } from 'lucide-react';

export const SignToTextPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-7 shadow-xs space-y-1">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>Computer Vision Sign Tracking</span>
        </div>
        <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">
          Sign to Text Camera Recognition Studio
        </h2>
        <p className="text-xs text-navy-600 max-w-2xl">
          Powered by Google MediaPipe Tasks Vision Hand Landmarker for 21-joint 3D hand tracking with a pluggable model interface. In Tracking Only mode, no words are fabricated; in Verified Baseline mode, only documented ISLRTC gestures with ≥75% calibrated confidence are recognized.
        </p>
      </div>

      {/* Main Camera Recognition Panel */}
      <SignToTextPanel />

      {/* Vocabulary Catalog */}
      <SupportedSignsGuide />
    </div>
  );
};
