import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storageService';

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  fontSize: 'standard' | 'large' | 'extra-large';
  setFontSize: (size: 'standard' | 'large' | 'extra-large') => void;
  visualAlerts: boolean;
  setVisualAlerts: (val: boolean) => void;
  audioChimes: boolean;
  setAudioChimes: (val: boolean) => void;
  isFlashing: boolean;
  triggerVisualAlert: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const profile = storageService.getProfile();
  
  const [highContrast, setHighContrast] = useState<boolean>(profile.highContrastEnabled);
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'extra-large'>(profile.fontSize || 'standard');
  const [visualAlerts, setVisualAlerts] = useState<boolean>(profile.visualAlertsEnabled ?? true);
  const [audioChimes, setAudioChimes] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Apply high contrast class to root html element
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Apply font scale class to body
  useEffect(() => {
    document.body.classList.remove('font-scale-standard', 'font-scale-large', 'font-scale-extra-large');
    document.body.classList.add(`font-scale-${fontSize}`);
  }, [fontSize]);

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      const curProfile = storageService.getProfile();
      storageService.saveProfile({ ...curProfile, highContrastEnabled: next });
      return next;
    });
  };

  const triggerVisualAlert = () => {
    if (!visualAlerts) return;
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 1200);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        visualAlerts,
        setVisualAlerts,
        audioChimes,
        setAudioChimes,
        isFlashing,
        triggerVisualAlert
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
