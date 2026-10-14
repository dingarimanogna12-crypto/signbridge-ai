import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Camera, 
  Hand, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Filter, 
  Info,
  Star, 
  Clock, 
  Volume2, 
  ExternalLink, 
  GraduationCap, 
  Eye, 
  Check, 
  RotateCcw, 
  Globe,
  AlertTriangle,
  Play,
  Pause,
  FlipHorizontal,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Award,
  HelpCircle,
  X
} from 'lucide-react';
import { 
  signVocabulary, 
  SignVocabularyItem, 
  VOCABULARY_BOOK_CATEGORIES, 
  CORE_VOCABULARY_CATEGORIES,
  CoreVocabularyCategory,
  getCoreCategory 
} from '../services/recognition/signVocabulary';
import { vocabStorageService } from '../services/vocabularyStorageService';
import { ttsService } from '../services/textToSpeech';
import { Modal } from '../components/common/Modal';
import { InstructionalStageViewer } from '../components/common/InstructionalStageViewer';
import { SignCard } from '../components/vocabulary/SignCard';
import { VisualLearningPanel } from '../components/vocabulary/VisualLearningPanel';
import { NavTab } from '../components/layout/Sidebar';
import { SignLanguage } from '../types';

interface SignVocabularyPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectTestSign?: (signName: string) => void;
}

export const SignVocabularyPage: React.FC<SignVocabularyPageProps> = ({ 
  onNavigate,
  onSelectTestSign 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoreCategory, setSelectedCoreCategory] = useState<string>('all');
  const [selectedCurriculumCategory, setSelectedCurriculumCategory] = useState<string>('all');
  const [showCurriculumFilter, setShowCurriculumFilter] = useState(false);
  
  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'model_supported' | 'verified_isl' | 'unverified_samples' | 'favorites' | 'recently_viewed' | 'practice'
  >('all');

  const [selectedLanguage, setSelectedLanguage] = useState<SignLanguage>('ISL');
  const [activeModalSign, setActiveModalSign] = useState<SignVocabularyItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => vocabStorageService.getFavorites());
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => vocabStorageService.getRecentlyViewed());
  
  // Practice Sub-mode State ('flashcards' vs 'quiz')
  const [practiceSubMode, setPracticeSubMode] = useState<'flashcards' | 'quiz'>('flashcards');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredSignIds, setMasteredSignIds] = useState<string[]>([]);
  
  // Quiz State
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Modal Demonstration Player Controls State
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [modalSpeed, setModalSpeed] = useState<number>(1.0);
  const [modalMirror, setModalMirror] = useState(false);
  const [modalVideoError, setModalVideoError] = useState(false);

  const allSigns = signVocabulary.getAll();
  const metrics = signVocabulary.getMetrics();
  const verifiedCount = allSigns.filter(s => s.verificationStatus === 'verified_isl').length;
  const unverifiedCount = allSigns.filter(s => s.verificationStatus !== 'verified_isl').length;

  const handleToggleFavorite = (signId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    vocabStorageService.toggleFavorite(signId);
    setFavorites(vocabStorageService.getFavorites());
  };

  const handleOpenSignDetails = (sign: SignVocabularyItem) => {
    vocabStorageService.recordViewedSign(sign.id);
    setRecentlyViewed(vocabStorageService.getRecentlyViewed());
    setModalVideoError(false);
    setModalIsPlaying(true);
    setActiveModalSign(sign);
  };

  const handleTestInCamera = (sign: SignVocabularyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectTestSign) {
      onSelectTestSign(sign.name);
    }
    onNavigate('sign-to-text');
  };

  const handlePracticeSign = (sign: SignVocabularyItem) => {
    if (sign.isModelSupported) {
      handleTestInCamera(sign);
    } else {
      const idx = practicePool.findIndex(s => s.id === sign.id);
      if (idx >= 0) {
        setFlashcardIdx(idx);
      }
      setActiveTabFilter('practice');
      setPracticeSubMode('flashcards');
      setIsFlipped(false);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  // Filtered list
  const filteredSigns = allSigns.filter(sign => {
    // Search match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const match = 
        sign.name.toLowerCase().includes(q) ||
        sign.gloss.toLowerCase().includes(q) ||
        sign.meaning.toLowerCase().includes(q) ||
        sign.description.toLowerCase().includes(q) ||
        (sign.tags && sign.tags.some(t => t.toLowerCase().includes(q)));
      if (!match) return false;
    }

    // Core category match
    if (selectedCoreCategory !== 'all') {
      const coreCat = getCoreCategory(sign);
      if (coreCat.toLowerCase() !== selectedCoreCategory.toLowerCase()) {
        return false;
      }
    }

    // Curriculum category match (if active)
    if (showCurriculumFilter && selectedCurriculumCategory !== 'all') {
      if (sign.category !== selectedCurriculumCategory) {
        return false;
      }
    }

    // Tab filter
    if (activeTabFilter === 'model_supported' && !sign.isModelSupported) {
      return false;
    }
    if (activeTabFilter === 'verified_isl' && sign.verificationStatus !== 'verified_isl') {
      return false;
    }
    if (activeTabFilter === 'unverified_samples' && sign.verificationStatus === 'verified_isl') {
      return false;
    }
    if (activeTabFilter === 'favorites' && !favorites.includes(sign.id)) {
      return false;
    }
    if (activeTabFilter === 'recently_viewed' && !recentlyViewed.includes(sign.id)) {
      return false;
    }

    return true;
  });

  // Practice Pool
  const practicePool = filteredSigns.length > 0 ? filteredSigns : allSigns;
  const currentFlashcard = practicePool[flashcardIdx % practicePool.length];

  // Generate 4 Quiz Choices for current quiz sign
  const currentQuizSign = practicePool[quizQuestionIdx % practicePool.length];
  const quizOptions = React.useMemo(() => {
    if (!currentQuizSign) return [];
    const correctName = currentQuizSign.name;
    const others = allSigns
      .filter(s => s.id !== currentQuizSign.id)
      .slice(0, 10)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(s => s.name);
    
    // Deterministic shuffle
    const combined = Array.from(new Set([correctName, ...others])).sort();
    return combined;
  }, [currentQuizSign?.id]);

  const handleSelectQuizAnswer = (idx: number, optName: string) => {
    if (quizAnswered) return;
    setSelectedAnswerIdx(idx);
    setQuizAnswered(true);
    if (optName === currentQuizSign.name) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswerIdx(null);
    setQuizAnswered(false);
    setQuizQuestionIdx(prev => (prev + 1) % practicePool.length);
  };

  const handleMarkMastered = (signId: string) => {
    if (!masteredSignIds.includes(signId)) {
      setMasteredSignIds(prev => [...prev, signId]);
    }
    setIsFlipped(false);
    setFlashcardIdx(prev => (prev + 1) % practicePool.length);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
                Learn ISL Vocabulary Library
              </h1>
              <span className="text-xs text-navy-500 font-medium">
                Verified Indian Sign Language repository with genuine handshapes, movement trajectory guides, and practice modes.
              </span>
            </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>{metrics.modelSupported} Camera Signs</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{verifiedCount} Verified ISL Approved</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{unverifiedCount} Sample Prototype</span>
          </div>
        </div>
      </div>

      {/* ISL Linguistic Scope & Integrity Standard Banner */}
      <div className="p-4 bg-gradient-to-r from-navy-900 to-navy-950 text-white rounded-2xl border border-navy-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                Official Linguistic Standard: Indian Sign Language (ISL)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-950 border border-teal-700 text-teal-300">
                ISLRTC Citations Grounded
              </span>
            </div>
            <p className="text-[11px] text-navy-300 leading-relaxed mt-0.5">
              Indian Sign Language is distinct from ASL, utilizing natural two-handed spatial grammar and official ISLRTC standards. Signs marked "Verified ISL Approved" adhere strictly to verified Deaf community references without artificial avatar fabrication.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-navy-800 p-1 rounded-xl border border-navy-700 text-xs">
          <button
            onClick={() => setSelectedLanguage('ISL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedLanguage === 'ISL'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-navy-300 hover:text-white'
            }`}
          >
            🇮🇳 ISL (Approved)
          </button>
          <button
            onClick={() => setSelectedLanguage('ASL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              selectedLanguage === 'ASL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-navy-300 hover:text-white'
            }`}
            title="View comparative ASL differences"
          >
            🇺🇸 ASL Comparisons
          </button>
        </div>
      </div>

      {/* 15 Canonical ISL Categories Filter Bar */}
      <div className="space-y-2.5 bg-white rounded-2xl border border-navy-100 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>15 ISL Vocabulary Categories:</span>
          </span>
          <span className="text-[11px] text-navy-500 font-medium">
            {allSigns.length} Total Curated Signs
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCoreCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition border ${
              selectedCoreCategory === 'all'
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-navy-50 border-navy-200 text-navy-700 hover:bg-navy-100'
            }`}
          >
            All Categories ({allSigns.length})
          </button>

          {CORE_VOCABULARY_CATEGORIES.map((cat) => {
            const count = allSigns.filter(s => getCoreCategory(s) === cat).length;
            const isEmergency = cat === 'Healthcare and emergencies';
            return (
              <button
                key={cat}
                onClick={() => setSelectedCoreCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition border flex items-center gap-1.5 ${
                  selectedCoreCategory === cat
                    ? isEmergency
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : isEmergency
                      ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      : 'bg-navy-50 border-navy-200 text-navy-700 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCoreCategory === cat ? 'bg-white/20 text-white' : 'bg-navy-200 text-navy-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTabFilter('all')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition border ${
            activeTabFilter === 'all'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>All Vocabulary</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('model_supported')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition border ${
            activeTabFilter === 'model_supported'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-teal-500" />
          <span>Live-Camera Model ({metrics.modelSupported})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('verified_isl')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition border ${
            activeTabFilter === 'verified_isl'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white border-navy-200 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified ISL Approved ({verifiedCount})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('unverified_samples')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition border ${
            activeTabFilter === 'unverified_samples'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white border-navy-200 text-amber-800 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Sample References ({unverifiedCount})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('favorites')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition border ${
            activeTabFilter === 'favorites'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Favourites ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('practice')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition border ${
            activeTabFilter === 'practice'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Practice &amp; Quiz Mode</span>
        </button>
      </div>

      {/* PRACTICE & QUIZ MODE (Interactive Flashcards + Multiple Choice Quiz) */}
      {activeTabFilter === 'practice' && (
        <div className="bg-gradient-to-br from-indigo-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-700/60 shadow-xl space-y-6">
          {/* Sub-mode selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-base text-white">
                Interactive ISL Practice Studio
              </h3>
            </div>

            <div className="flex items-center bg-navy-800 p-1 rounded-xl border border-indigo-700/50 text-xs">
              <button
                onClick={() => setPracticeSubMode('flashcards')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  practiceSubMode === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Flashcards Mode
              </button>
              <button
                onClick={() => {
                  setPracticeSubMode('quiz');
                  setSelectedAnswerIdx(null);
                  setQuizAnswered(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  practiceSubMode === 'quiz'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Sign Quiz Challenge
              </button>
            </div>
          </div>

          {/* SUB-MODE 1: FLASHCARDS */}
          {practiceSubMode === 'flashcards' && currentFlashcard && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span className="font-mono font-bold">
                  Card {(flashcardIdx % practicePool.length) + 1} of {practicePool.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-700 text-[11px] font-bold">
                    {getCoreCategory(currentFlashcard)}
                  </span>
                  <span className="text-[11px] text-teal-300 font-semibold">
                    Mastered: {masteredSignIds.length}
                  </span>
                </div>
              </div>

              {/* Flipped Card */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-8 text-center min-h-[260px] flex flex-col items-center justify-center transition-all shadow-lg backdrop-blur-xs select-none group"
              >
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold block">
                      What is the Indian Sign Language (ISL) movement? (Click to reveal)
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white group-hover:scale-105 transition">
                      {currentFlashcard.name}
                    </h3>
                    <p className="text-xs text-indigo-200 max-w-sm mx-auto leading-relaxed">
                      {currentFlashcard.meaning}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-teal-300 uppercase tracking-wider bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-700">
                      Click anywhere on card to flip
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in w-full max-w-lg mx-auto">
                    <span className="text-xs uppercase tracking-widest text-teal-300 font-bold block">
                      ISL Gloss &amp; Formation:
                    </span>
                    <h4 className="text-2xl font-black text-teal-300 font-mono">
                      [{currentFlashcard.gloss}]
                    </h4>
                    <div className="p-4 bg-black/50 rounded-xl text-left text-xs text-navy-200 space-y-1.5 border border-white/10">
                      <p><strong className="text-teal-300">Handshape:</strong> {currentFlashcard.handshape}</p>
                      <p><strong className="text-teal-300">Anchor:</strong> {currentFlashcard.bodyAnchor}</p>
                      <p><strong className="text-teal-300">Movement:</strong> {currentFlashcard.movementDescription}</p>
                      <p><strong className="text-teal-300">Face / Marker:</strong> Neutral, direct eye contact</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Flashcard Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIdx((prev) => (prev - 1 + practicePool.length) % practicePool.length);
                    }}
                    className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIdx(Math.floor(Math.random() * practicePool.length));
                    }}
                    className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-indigo-300 rounded-xl text-xs font-bold transition"
                    title="Shuffle card"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenSignDetails(currentFlashcard)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Watch Demonstration</span>
                  </button>

                  <button
                    onClick={() => handleMarkMastered(currentFlashcard.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>I Know This!</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setFlashcardIdx((prev) => (prev + 1) % practicePool.length);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODE 2: MULTIPLE CHOICE QUIZ */}
          {practiceSubMode === 'quiz' && currentQuizSign && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span className="font-mono font-bold">
                  Question {(quizQuestionIdx % practicePool.length) + 1} of {practicePool.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-950 border border-teal-700 text-teal-300 font-bold">
                  Score: {quizScore}
                </span>
              </div>

              {/* Question Box */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20 space-y-2">
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                  Identify the ISL Sign:
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  "{currentQuizSign.meaning}"
                </h4>
                <p className="text-xs text-indigo-200">
                  Formation clues: Handshape: <em>{currentQuizSign.handshape}</em> • Anchor: <em>{currentQuizSign.bodyAnchor}</em>
                </p>
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizOptions.map((opt, idx) => {
                  const isSelected = selectedAnswerIdx === idx;
                  const isCorrect = opt === currentQuizSign.name;
                  let btnStyle = 'bg-navy-800 hover:bg-navy-700 text-white border-navy-700';

                  if (quizAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-600 text-white border-rose-500 font-bold';
                    } else {
                      btnStyle = 'bg-navy-900/60 text-navy-400 border-navy-800';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectQuizAnswer(idx, opt)}
                      disabled={quizAnswered}
                      className={`p-4 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-200" />}
                      {quizAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-200" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next */}
              {quizAnswered && (
                <div className="p-4 rounded-xl bg-navy-800/80 border border-indigo-700/50 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <div>
                    <span className="text-xs font-bold text-teal-300 block">
                      Correct Answer: {currentQuizSign.name} [{currentQuizSign.gloss}]
                    </span>
                    <p className="text-[11px] text-navy-300 mt-0.5">
                      {currentQuizSign.description}
                    </p>
                  </div>
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    Next Question
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-navy-100 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search signs by English name, meaning, gloss, or tags (e.g. 'doctor', 'namaste', 'water', 'emergency')..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-navy-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 p-0.5 text-navy-400 hover:text-navy-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Vocabulary Cards */}
      {filteredSigns.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-navy-100 space-y-2">
          <p className="text-sm font-bold text-navy-800">No matching vocabulary entries found</p>
          <p className="text-xs text-navy-500 max-w-sm mx-auto">
            Try adjusting your search terms or switch your category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSigns.map((sign) => (
            <SignCard
              key={sign.id}
              sign={sign}
              isFavorite={favorites.includes(sign.id)}
              onToggleFavorite={handleToggleFavorite}
              onViewDetails={handleOpenSignDetails}
              onPractice={handlePracticeSign}
              onSelectRelated={(relSign) => handleOpenSignDetails(relSign)}
            />
          ))}
        </div>
      )}

      {/* Comprehensive Visual Learning Panel Modal with Previous/Next Navigation */}
      {activeModalSign && (() => {
        const pool = filteredSigns.length > 0 ? filteredSigns : allSigns;
        const currentIdx = pool.findIndex(s => s.id === activeModalSign.id);
        const hasPrev = currentIdx > 0;
        const hasNext = currentIdx >= 0 && currentIdx < pool.length - 1;

        return (
          <Modal
            isOpen={Boolean(activeModalSign)}
            onClose={() => setActiveModalSign(null)}
            title={`Watch How to Sign: ${activeModalSign.name}`}
          >
            <VisualLearningPanel
              sign={activeModalSign}
              hasPrevious={hasPrev}
              hasNext={hasNext}
              onPrevious={() => {
                if (hasPrev) handleOpenSignDetails(pool[currentIdx - 1]);
              }}
              onNext={() => {
                if (hasNext) handleOpenSignDetails(pool[currentIdx + 1]);
              }}
              onPractice={(s) => {
                setActiveModalSign(null);
                handlePracticeSign(s);
              }}
              onSelectRelated={handleOpenSignDetails}
              onClose={() => setActiveModalSign(null)}
            />
          </Modal>
        );
      })()}
    </div>
  );
};
