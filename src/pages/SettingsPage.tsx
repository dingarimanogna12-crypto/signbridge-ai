import React, { useState } from 'react';
import { useAuthRole, ROLE_LABELS } from '../context/AuthRoleContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { storageService } from '../services/storageService';
import { UserRole } from '../types';
import { 
  Settings, 
  User, 
  Eye, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Bell,
  Type
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { role, profile, setRole, updateProfile } = useAuthRole();
  const { 
    highContrast, 
    toggleHighContrast, 
    fontSize, 
    setFontSize, 
    visualAlerts, 
    setVisualAlerts 
  } = useAccessibility();

  const [name, setName] = useState(profile.name);
  const [institution, setInstitution] = useState(profile.institution || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [preferredSign, setPreferredSign] = useState(profile.preferredSignLanguage || 'ISL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isSupabaseLive = storageService.isSupabaseConfigured();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      institution,
      department,
      preferredSignLanguage: preferredSign as any
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all sessions and custom phrases to original demo defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in text-xs">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-7 shadow-xs space-y-1">
        <div className="flex items-center gap-2 text-teal-600 font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Preferences &amp; Connectivity</span>
        </div>
        <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">
          Settings &amp; Configuration
        </h2>
        <p className="text-navy-600">
          Manage your accessible interface preferences, personal profile, and backend database integrations.
        </p>
      </div>

      {/* User Profile Card */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-navy-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-100 pb-3">
          <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>User Persona &amp; Identity</span>
          </h3>
          {savedSuccess && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-navy-700">Display Name:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-navy-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-navy-700">Active Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-navy-900 bg-white"
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r].title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-navy-700">Institution / Hospital / School:</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Apollo Hospital Delhi or Delhi University"
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-navy-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-navy-700">Preferred Sign Language Standard:</label>
            <select
              value={preferredSign}
              onChange={(e) => setPreferredSign(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-navy-900 bg-white"
            >
              <option value="ISL">Indian Sign Language (ISL - Default)</option>
              <option value="ASL">American Sign Language (ASL)</option>
              <option value="BSL">British Sign Language (BSL)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-sm"
          >
            Save Profile
          </button>
        </div>
      </form>

      {/* Accessibility Preferences */}
      <div className="bg-white rounded-2xl border border-navy-100 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-navy-100 pb-3">
          <Eye className="w-4 h-4 text-teal-600" />
          <span>Accessibility Preferences</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50">
            <div>
              <p className="font-bold text-navy-900">High Contrast Mode (WCAG AAA)</p>
              <p className="text-navy-500">Increases contrast borders and text luminance for maximum clarity.</p>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                highContrast ? 'bg-black text-white border-white' : 'bg-white text-navy-700 border-navy-200'
              }`}
            >
              {highContrast ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50">
            <div>
              <p className="font-bold text-navy-900">Deaf Non-Auditory Visual Flash</p>
              <p className="text-navy-500">Pulses viewport edges with teal color when speech is received.</p>
            </div>
            <button
              onClick={() => setVisualAlerts(!visualAlerts)}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                visualAlerts ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-navy-700 border-navy-200'
              }`}
            >
              {visualAlerts ? 'Active' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50">
            <div>
              <p className="font-bold text-navy-900">Base Typography Scale</p>
              <p className="text-navy-500">Standard (16px), Large (20px), Extra Large (24px).</p>
            </div>
            <div className="flex gap-1">
              {(['standard', 'large', 'extra-large'] as const).map(sz => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase transition ${
                    fontSize === sz ? 'bg-teal-600 text-white' : 'bg-white text-navy-700 border border-navy-200'
                  }`}
                >
                  {sz === 'extra-large' ? 'XL' : sz[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Supabase & Cloud Backend Connectivity Card */}
      <div className="bg-white rounded-2xl border border-navy-100 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-navy-100 pb-3">
          <Database className="w-4 h-4 text-teal-600" />
          <span>Cloud Database (Supabase) Integration</span>
        </h3>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-navy-50/70 border-navy-100">
          <div className={`w-3 h-3 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <div className="flex-1">
            <p className="font-bold text-navy-900">
              {isSupabaseLive ? 'Supabase Connected & Synchronized' : 'Offline-First Mode (Browser LocalStorage)'}
            </p>
            <p className="text-navy-500 text-[11px] mt-0.5">
              {isSupabaseLive 
                ? 'Sessions, feedback, and custom phrases are synced to your cloud database.'
                : 'Application is currently operating in offline-first mode with automatic browser persistence.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-navy-50 rounded-xl space-y-2 text-navy-700">
          <p className="font-bold text-navy-900">To connect Supabase Cloud:</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Create a project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-semibold">Supabase</a>.</li>
            <li>Execute the full DDL table script from <code className="bg-white px-1 py-0.5 rounded border border-navy-200">supabase/schema.sql</code> in the Supabase SQL Editor.</li>
            <li>Set your environment variables in <code className="bg-white px-1 py-0.5 rounded border border-navy-200">.env</code>:
              <pre className="mt-1 p-2 bg-navy-900 text-teal-300 rounded-lg font-mono text-[10px]">
                VITE_SUPABASE_URL=https://your-project.supabase.co
                VITE_SUPABASE_ANON_KEY=your-anon-key
              </pre>
            </li>
          </ol>
        </div>

        <div className="pt-2 border-t border-navy-100 flex items-center justify-between">
          <span className="text-[11px] text-navy-500">
            Local browser storage usage: Active
          </span>
          <button
            onClick={handleResetData}
            className="px-3 py-1.5 rounded-xl text-rose-700 border border-rose-200 hover:bg-rose-50 text-[11px] font-bold flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* About SignBridge AI & Implementation Status Card */}
      <div className="bg-white rounded-2xl border border-navy-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-navy-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>About SignBridge AI &amp; Technical Capabilities</span>
            </h3>
            <p className="text-[11px] text-navy-500">
              Clear, transparent disclosures distinguishing live working features from prototype AI modules.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
            ISL Standard v2.4
          </span>
        </div>

        {/* Mission & Linguistic Integrity */}
        <div className="p-4 bg-navy-50 rounded-xl space-y-2 text-navy-800">
          <h4 className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Linguistic Grounding: Indian Sign Language (ISL)</span>
          </h4>
          <p className="text-[11px] leading-relaxed text-navy-600">
            SignBridge AI is designed specifically for Indian Sign Language (ISL) based on standards published by the Indian Sign Language Research and Training Centre (ISLRTC), Department of Empowerment of Persons with Disabilities, Ministry of Social Justice and Empowerment, Government of India.
          </p>
          <p className="text-[11px] leading-relaxed text-navy-600">
            Unlike many Western tools that conflate American Sign Language (ASL) with ISL, SignBridge AI preserves genuine two-handed ISL grammar. The system enforces strict integrity: if an ISL sign is not verified, it is clearly labeled as an unverified sample rather than inventing synthetic gestures.
          </p>
        </div>

        {/* Feature Matrix: Working vs Prototype */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fully Working Features */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
            <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified &amp; Fully Functional Modules</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-emerald-900 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>MediaPipe Tasks Vision:</strong> Real-time on-device 21-joint 3D hand tracking with 60 FPS GPU acceleration and CPU fallback.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Pluggable ISL Model Interface:</strong> Honest status reporting ("Model not connected") ensuring zero fabricated gestures.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Speech-to-Text:</strong> Real-time microphone captions with Indian English (<code>en-IN</code>) &amp; Hindi (<code>hi-IN</code>), editable draft buffers, and volume meters.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Text-to-Speech:</strong> Voice synthesis with pitch, rate, and volume tuning, and emergency triage presets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>2-Way Inclusive Session:</strong> Dual-turn live conversation workspace with turn editing, deletion, and TXT transcript export.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Learn ISL Library:</strong> Searchable vocabulary across 12 categories with 4-stage visual breakdowns and interactive flashcard/quiz modes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><strong>Accessibility Suite:</strong> WCAG 2.1 AAA high contrast theme, scalable typography (A / A+ / A++), and Deaf visual screen flash pulses.</span>
              </li>
            </ul>
          </div>

          {/* Prototype / In-Development Disclosures */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2.5">
            <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Prototype Features &amp; Research Disclosures</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-amber-900 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Continuous Sentence Recognition:</strong> Continuous sentence-level sign language recognition remains an open research problem globally. SignBridge AI provides static landmark tracking and baseline classification without fabricating fluent sentence translations.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Offline-First Default:</strong> Cloud persistence requires connecting a Supabase instance; by default, all data resides in local browser storage.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Browser Speech Engine:</strong> Web Speech API relies on the underlying browser (recommended: Google Chrome, Microsoft Edge, Safari).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Clinical Review:</strong> Before deployment in critical healthcare or legal settings, signs must be reviewed by certified ISL interpreters.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Privacy & Zero-Data-Collection Guarantee */}
        <div className="p-4 bg-navy-900 text-white rounded-xl space-y-1.5">
          <h4 className="font-bold text-teal-300 text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy &amp; Data Security Guarantee</span>
          </h4>
          <p className="text-[11px] text-navy-200 leading-relaxed">
            All camera vision processing (MediaPipe Hand Landmarker) and speech synthesis operate 100% on-device in your web browser. Video frames and microphone audio streams are analyzed in volatile memory and are strictly never recorded, stored, or transmitted to any external server.
          </p>
        </div>
      </div>
    </div>
  );
};
