import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { BellRing } from 'lucide-react';

export const VisualAlertOverlay: React.FC = () => {
  const { isFlashing } = useAccessibility();

  if (!isFlashing) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 transition-all duration-300"
      style={{
        boxShadow: 'inset 0 0 0 10px rgba(13, 148, 136, 0.85), inset 0 0 40px rgba(13, 148, 136, 0.4)'
      }}
      aria-live="assertive"
      aria-label="Sound Notification Alert"
    >
      <div className="absolute top-5 right-5 bg-teal-700 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold animate-bounce">
        <BellRing className="w-5 h-5 text-teal-200" />
        <span>Audio Received / Partner Speaking</span>
      </div>
    </div>
  );
};
