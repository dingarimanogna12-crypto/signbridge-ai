import React, { useState } from 'react';
import { 
  Hand, 
  Mic, 
  Camera, 
  MessagesSquare, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Users, 
  Award,
  ArrowRight,
  HeartPulse,
  Radio,
  FileText,
  Layers,
  Settings,
  Volume2
} from 'lucide-react';
import { useAuthRole, ROLE_LABELS } from '../context/AuthRoleContext';
import { useSession } from '../context/SessionContext';
import { NavTab } from '../components/layout/Sidebar';
import { SessionSetupModal } from '../components/conversation/SessionSetupModal';
import { phraseService } from '../services/phraseLibraryService';
import { signVocabulary, VOCABULARY_BOOK_CATEGORIES } from '../services/recognition/signVocabulary';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenFeedback: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate, 
  onOpenFeedback 
}) => {
  const { role, profile } = useAuthRole();
  const { activeSession, pastSessions } = useSession();
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const roleInfo = ROLE_LABELS[role];
  const allPhrases = phraseService.getAllPhrases();
  const vocabMetrics = signVocabulary.getMetrics();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Inclusive Communication Ready • ISL Standards Compliant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to <span className="text-teal-400">SignBridge AI</span>
          </h2>

          <p className="text-sm text-navy-200 leading-relaxed">
            Bridging Deaf, hard-of-hearing, and hearing conversations across hospitals, classrooms, government offices, and workplaces with verified Indian Sign Language demonstrations, speech captioning, and on-device camera tracking.
          </p>

          {/* Primary Quick Actions: Start Conversation & Explore ISL */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSetupModalOpen(true)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition transform hover:-translate-y-0.5"
            >
              <MessagesSquare className="w-4 h-4" />
              <span>Start Conversation</span>
            </button>

            <button
              onClick={() => onNavigate('vocabulary')}
              className="px-5 py-2.5 bg-navy-800/90 hover:bg-navy-700 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Explore ISL</span>
            </button>

            <button
              onClick={() => onNavigate('sign-to-text')}
              className="px-4 py-2 bg-navy-800/60 hover:bg-navy-700 text-white border border-navy-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Camera className="w-3.5 h-3.5 text-teal-400" />
              <span>Camera Sign-to-Text</span>
            </button>

            <button
              onClick={() => onNavigate('text-to-sign')}
              className="px-4 py-2 bg-navy-800/60 hover:bg-navy-700 text-white border border-navy-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Hand className="w-3.5 h-3.5 text-indigo-400" />
              <span>Text to Sign</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark SVG */}
        <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
          <Hand className="w-56 h-56 text-teal-300" />
        </div>
      </div>

      {/* Live Session Notice (if active) */}
      {activeSession && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-teal-950">
                Live Session in Progress: {activeSession.title}
              </h4>
              <p className="text-xs text-teal-700">
                {activeSession.turns.length} exchange(s) recorded • {activeSession.hearingParticipantName} &amp; {activeSession.deafParticipantName}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('session')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs"
          >
            <span>Open Session Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Hero Actions (Requirement 6) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Primary Actions</span>
          </h2>
          <span className="text-xs text-navy-500 font-medium">
            Two direct pathways: Camera Signing or Learning Demonstrations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HERO ACTION 1: "Show a Sign" */}
          <div
            onClick={() => onNavigate('sign-to-text')}
            className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all cursor-pointer border border-teal-800/80 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 group-hover:scale-110 transition shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
                  Live Camera AI
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-teal-200 transition">
                  Show a Sign
                </h3>
                <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed mt-2">
                  Use your webcam to sign. SignBridge AI tracks 21 hand landmarks in real time with calibrated Euclidean centroids, discrete finger extension masks, and temporal stroke evaluation.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Hello', 'Thank you', 'Yes', 'No', 'Help', 'Doctor', 'Pain', 'Water'].map((sign) => (
                  <span key={sign} className="px-2.5 py-1 rounded-lg bg-teal-800/60 border border-teal-700 text-[11px] font-semibold text-teal-100">
                    {sign}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-teal-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 group-hover:text-white transition flex items-center gap-1.5">
                Launch Live Camera Recognition
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-navy-950 flex items-center justify-center font-bold group-hover:translate-x-1 transition shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* HERO ACTION 2: "Learn or Show a Sign" */}
          <div
            onClick={() => onNavigate('text-to-sign')}
            className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all cursor-pointer border border-navy-800 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition shadow-inner">
                  <Hand className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                  Text-to-Sign & Directory
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-indigo-200 transition">
                  Learn or Show a Sign
                </h3>
                <p className="text-xs sm:text-sm text-navy-200 leading-relaxed mt-2">
                  Type any phrase or browse 12 comprehensive categories inspired by sign curriculum. Watch multi-stage instructional diagrams (handshape, start, movement, hold) and authentic ISLRTC references.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('text-to-sign');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs"
                >
                  Text-to-Sign Player
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('vocabulary');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-teal-300 border border-teal-500/40 text-xs font-bold transition"
                >
                  Explore ISL ({vocabMetrics.total} signs)
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 group-hover:text-white transition flex items-center gap-1.5">
                Explore Instructional Demonstrations
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-navy-950 flex items-center justify-center font-bold group-hover:translate-x-1 transition shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-xs font-semibold">Curriculum Topics</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{VOCABULARY_BOOK_CATEGORIES.length} Categories</div>
          <span className="text-[11px] text-teal-700 font-medium">15 Official ISL categories</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-xs font-semibold">Verified ISL Signs</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{vocabMetrics.total} Entries</div>
          <span className="text-[11px] text-blue-700 font-medium">ISLRTC Portal cited</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-xs font-semibold">Live Camera Signs</span>
            <Camera className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{vocabMetrics.modelSupported} Evaluated</div>
          <span className="text-[11px] text-teal-700 font-medium">Centroid + stroke engine</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-xs font-semibold">Privacy Architecture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">100% Local</div>
          <span className="text-[11px] text-emerald-700 font-medium">Zero server video storage</span>
        </div>
      </div>

      {/* Secondary Communication Launchers */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
          Secondary Communication & Practice Tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* Launcher 1: Speech to Text */}
          <div
            onClick={() => onNavigate('speech-to-text')}
            className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 group-hover:text-teal-700 transition">
                Speech to Text Captions
              </h4>
              <p className="text-xs text-navy-600 leading-relaxed">
                Convert live speech into large, readable captions with sound wave visualizers and clinical simulation scenarios.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-teal-700 pt-2 border-t border-navy-100">
              <span>Open Captioner</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Launcher 2: Text to Speech */}
          <div
            onClick={() => onNavigate('text-to-speech')}
            className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 group-hover:text-teal-700 transition">
                Text to Speech Voice
              </h4>
              <p className="text-xs text-navy-600 leading-relaxed">
                Assistive speech synthesizer with pitch and speed modulation for Deaf communicators speaking to hearing partners.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-teal-700 pt-2 border-t border-navy-100">
              <span>Open Voice Synthesizer</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Launcher 3: Quick Phrase Library */}
          <div
            onClick={() => onNavigate('library')}
            className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 group-hover:text-teal-700 transition">
                Quick Phrase Library
              </h4>
              <p className="text-xs text-navy-600 leading-relaxed">
                Browse emergency triage, doctor consultation, classroom, railway, and front-desk phrases with TTS speech output.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-teal-700 pt-2 border-t border-navy-100">
              <span>Browse Phrases</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Launcher 4: Two-Way Inclusive Session */}
          <div
            onClick={() => onNavigate('session')}
            className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 group-hover:text-teal-700 transition">
                Live 2-Way Session
              </h4>
              <p className="text-xs text-navy-600 leading-relaxed">
                Dual turn-taking conversation mode between Deaf signer and hearing conversationalist with instant transcripts.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-teal-700 pt-2 border-t border-navy-100">
              <span>Open Dual Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Launcher 5: Sign Vocabulary Guide */}
          <div
            onClick={() => onNavigate('vocabulary')}
            className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-900 group-hover:text-teal-700 transition">
                Vocabulary Guide
              </h4>
              <p className="text-xs text-navy-600 leading-relaxed">
                Explore {vocabMetrics.total} signs across {VOCABULARY_BOOK_CATEGORIES.length} categories with stage breakdowns, search, and flashcards.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-teal-700 pt-2 border-t border-navy-100">
              <span>View Guide</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </div>

      {/* Session Setup Modal */}
      <SessionSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onStarted={() => onNavigate('session')}
      />
    </div>
  );
};
