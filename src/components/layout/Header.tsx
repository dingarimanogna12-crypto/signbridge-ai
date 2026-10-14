import React, { useState } from 'react';
import { 
  Hand, 
  Eye, 
  Type, 
  Bell, 
  BellOff, 
  Radio, 
  UserCheck, 
  ChevronDown, 
  HelpCircle,
  X,
  Volume2
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuthRole, ROLE_LABELS } from '../../context/AuthRoleContext';
import { useSession } from '../../context/SessionContext';
import { UserRole } from '../../types';

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { 
    highContrast, 
    toggleHighContrast, 
    fontSize, 
    setFontSize, 
    visualAlerts, 
    setVisualAlerts,
    triggerVisualAlert 
  } = useAccessibility();

  const { role, setRole, profile } = useAuthRole();
  const { activeSession, endSession } = useSession();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const currentRoleInfo = ROLE_LABELS[role];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-sm px-4 lg:px-6 py-2.5 transition-colors">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left Brand & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-100 focus:ring-2 focus:ring-teal-500"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 via-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/10">
                <Hand className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-navy-900 tracking-tight leading-none">
                    SignBridge <span className="text-teal-600">AI</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    ISL Prototype Assist
                  </span>
                </div>
                <p className="text-[11px] font-medium text-navy-500 hidden sm:block">
                  AI-Powered Inclusive Communication Assistant
                </p>
              </div>
            </div>
          </div>

          {/* Center: Active Session Banner (if running) */}
          {activeSession && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full animate-pulse-subtle">
              <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
              <span className="text-xs font-semibold text-teal-900">
                Live: {activeSession.title}
              </span>
              <button
                onClick={endSession}
                className="text-[10px] uppercase font-bold px-2 py-0.5 bg-teal-600 text-white rounded hover:bg-teal-700 ml-1 transition"
              >
                End
              </button>
            </div>
          )}

          {/* Right: Accessibility Controls & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Font Scaler */}
            <div className="hidden sm:flex items-center bg-navy-100 rounded-lg p-0.5 text-xs font-medium text-navy-700" title="Font size accessibility">
              <button
                onClick={() => setFontSize('standard')}
                className={`px-2 py-1 rounded ${fontSize === 'standard' ? 'bg-white shadow-xs text-teal-700 font-bold' : 'hover:text-navy-900'}`}
                aria-label="Standard font size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded text-sm ${fontSize === 'large' ? 'bg-white shadow-xs text-teal-700 font-bold' : 'hover:text-navy-900'}`}
                aria-label="Large font size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('extra-large')}
                className={`px-2 py-1 rounded text-base font-bold ${fontSize === 'extra-large' ? 'bg-white shadow-xs text-teal-700' : 'hover:text-navy-900'}`}
                aria-label="Extra large font size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                highContrast
                  ? 'bg-black text-white border-white'
                  : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
              }`}
              title="Toggle High Contrast (WCAG AAA)"
              aria-pressed={highContrast}
            >
              <Eye className="w-4 h-4 text-teal-600" />
              <span className="hidden xl:inline">Contrast</span>
            </button>

            {/* Visual Screen Alert Test / Toggle */}
            <button
              onClick={() => {
                setVisualAlerts(!visualAlerts);
                if (!visualAlerts) triggerVisualAlert();
              }}
              className={`p-2 rounded-lg border text-xs font-semibold transition ${
                visualAlerts
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : 'bg-white text-navy-400 border-navy-200'
              }`}
              title={visualAlerts ? "Visual Screen Flash Alerts Active (for Deaf users)" : "Visual alerts disabled"}
              aria-label="Toggle visual flash notifications"
            >
              {visualAlerts ? <Bell className="w-4 h-4 text-teal-600" /> : <BellOff className="w-4 h-4 text-navy-400" />}
            </button>

            {/* Keyboard Shortcuts Help */}
            <button
              onClick={() => setShortcutsOpen(true)}
              className="p-2 rounded-lg text-navy-500 hover:bg-navy-100 hover:text-navy-800"
              title="Keyboard Accessibility Shortcuts"
              aria-label="Keyboard Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${currentRoleInfo.color}`}
                aria-haspopup="true"
                aria-expanded={roleDropdownOpen}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="max-w-[110px] truncate">{currentRoleInfo.badge}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-navy-100 p-2 z-40 animate-scale-up">
                    <div className="px-3 py-2 border-b border-navy-100 mb-1">
                      <p className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">
                        Switch Active Role
                      </p>
                      <p className="text-xs text-navy-700 mt-0.5">
                        Adapts layout and default assistant controls.
                      </p>
                    </div>

                    <div className="space-y-1">
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((rKey) => {
                        const item = ROLE_LABELS[rKey];
                        const isCurrent = role === rKey;
                        return (
                          <button
                            key={rKey}
                            onClick={() => {
                              setRole(rKey);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex flex-col gap-0.5 ${
                              isCurrent
                                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                                : 'hover:bg-navy-50 text-navy-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{item.title}</span>
                              {isCurrent && <span className="text-[10px] text-teal-600 font-bold">Active</span>}
                            </div>
                            <span className="text-[10px] text-navy-500 font-normal line-clamp-1">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Keyboard Shortcuts Dialog */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-navy-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-navy-900 text-base">
                  Accessible Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-navy-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50">
                <span>Switch to Speech to Text (Live Microphone)</span>
                <kbd className="px-2 py-1 bg-white rounded border border-navy-200 font-mono font-bold">Alt + M</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50">
                <span>Switch to Text to Speech (Voice Synthesizer)</span>
                <kbd className="px-2 py-1 bg-white rounded border border-navy-200 font-mono font-bold">Alt + T</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50">
                <span>Switch to Sign to Text (Camera Tracking)</span>
                <kbd className="px-2 py-1 bg-white rounded border border-navy-200 font-mono font-bold">Alt + C</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50">
                <span>Switch to Text to Sign (ISL Dictionary)</span>
                <kbd className="px-2 py-1 bg-white rounded border border-navy-200 font-mono font-bold">Alt + S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50">
                <span>Toggle High Contrast Theme (WCAG AAA)</span>
                <kbd className="px-2 py-1 bg-white rounded border border-navy-200 font-mono font-bold">Alt + H</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50">
                <span>Flash Screen Visual Alert (Deaf Non-Auditory)</span>
                <kbd className="px-2 py-1 bg-white rounded border border-navy-200 font-mono font-bold">Alt + V</kbd>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-100 flex justify-end">
              <button
                onClick={() => setShortcutsOpen(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
