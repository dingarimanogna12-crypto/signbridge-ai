import React, { useState } from 'react';
import { 
  Hand, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Sparkles, 
  X, 
  Lightbulb,
  Filter,
  ArrowRight,
  BookOpen,
  Volume2,
  ExternalLink,
  Layers,
  GraduationCap,
  Play,
  RotateCcw
} from 'lucide-react';
import { 
  signVocabulary, 
  SignVocabularyItem,
  CORE_VOCABULARY_CATEGORIES,
  getCoreCategory 
} from '../../services/recognition/signVocabulary';
import { phraseService } from '../../services/phraseLibraryService';
import { ISLSignReference, ISLPhrase } from '../../types';
import { ttsService } from '../../services/textToSpeech';
import { FingerspellingView } from './FingerspellingView';
import { SignDemonstrationPlayer } from './SignDemonstrationPlayer';
import { SignCard } from '../vocabulary/SignCard';
import { VisualLearningPanel } from '../vocabulary/VisualLearningPanel';
import { Modal } from '../common/Modal';

function vocabularyItemToPhrase(item: SignVocabularyItem): ISLSignReference {
  const isApproved = item.verificationStatus === 'verified_isl';
  return {
    id: item.id,
    phrase: item.name,
    hindiGloss: item.gloss,
    category: getCoreCategory(item) as any,
    urgencyLevel: 'routine',
    handshapeDescription: item.handshape,
    movementDescription: item.movementDescription,
    videoUrl: item.videoUrl,
    imageUrl: item.imageUrl,
    isVerified: isApproved,
    verificationStatus: isApproved ? 'verified' : 'unverified_prototype_reference',
    sourceNote: item.sourceNote || (isApproved ? 'Official ISLRTC Dictionary Standards Citation' : 'Community Reference'),
    islrtcReferenceUrl: item.islrtcDictionaryUrl || 'https://islrtc.nic.in/',
    tags: item.tags,
    visualStages: item.visualStages,
    sequentialSigns: [
      {
        stepIndex: 1,
        signGloss: item.gloss,
        englishTerm: item.name,
        durationMs: 1400,
        description: item.description,
        handshape: item.handshape,
        movement: item.movementDescription,
        bodyAnchor: item.bodyAnchor,
        visualStages: item.visualStages
      }
    ]
  };
}

interface TextToSignPanelProps {
  onOpenFeedbackWithPhrase?: (phrase: string) => void;
  initialPhrase?: string;
  onNavigateToPractice?: (signName: string) => void;
}

export const TextToSignPanel: React.FC<TextToSignPanelProps> = ({ 
  onOpenFeedbackWithPhrase,
  initialPhrase = '',
  onNavigateToPractice
}) => {
  const [inputText, setInputText] = useState(initialPhrase);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Search result state
  const [matchedSigns, setMatchedSigns] = useState<SignVocabularyItem[]>(() => {
    if (!initialPhrase) return [];
    const res = signVocabulary.searchVocabulary(initialPhrase);
    return res.matchedSigns;
  });
  const [unmatchedTerms, setUnmatchedTerms] = useState<string[]>([]);
  const [isMultiWordQuery, setIsMultiWordQuery] = useState(false);
  
  // Single phrase for dedicated player
  const [featuredPhrase, setFeaturedPhrase] = useState<ISLPhrase | undefined>(() => {
    if (!initialPhrase) return undefined;
    const res = signVocabulary.searchVocabulary(initialPhrase);
    if (res.exactMatch) return vocabularyItemToPhrase(res.exactMatch);
    if (res.matchedSigns.length === 1 && res.unmatchedTerms.length === 0) {
      return vocabularyItemToPhrase(res.matchedSigns[0]);
    }
    return phraseService.findPhrase(initialPhrase);
  });

  // Modal inspection state for sign details
  const [activeModalSign, setActiveModalSign] = useState<SignVocabularyItem | null>(null);
  const [isMirrorMode, setIsMirrorMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showFingerspellingFallback, setShowFingerspellingFallback] = useState(false);

  // Active step in multi-word sequence viewer
  const [activeSequenceIndex, setActiveSequenceIndex] = useState(0);

  const CATEGORIES = [
    'all',
    ...CORE_VOCABULARY_CATEGORIES
  ];

  const handleSearch = (query: string) => {
    setInputText(query);
    setActiveSequenceIndex(0);
    if (!query.trim()) {
      setMatchedSigns([]);
      setUnmatchedTerms([]);
      setFeaturedPhrase(undefined);
      setIsMultiWordQuery(false);
      return;
    }

    const norm = query.toLowerCase().trim();

    // 1. Core synchronized vocabulary search
    const vocabResult = signVocabulary.searchVocabulary(norm);

    if (vocabResult.exactMatch) {
      setMatchedSigns([vocabResult.exactMatch]);
      setUnmatchedTerms([]);
      setFeaturedPhrase(vocabularyItemToPhrase(vocabResult.exactMatch));
      setIsMultiWordQuery(false);
      return;
    }

    if (vocabResult.matchedSigns.length > 0) {
      setMatchedSigns(vocabResult.matchedSigns);
      setUnmatchedTerms(vocabResult.unmatchedTerms);
      setIsMultiWordQuery(vocabResult.isMultiWord);

      if (vocabResult.matchedSigns.length === 1 && vocabResult.unmatchedTerms.length === 0) {
        setFeaturedPhrase(vocabularyItemToPhrase(vocabResult.matchedSigns[0]));
      } else {
        setFeaturedPhrase(undefined);
      }
      return;
    }

    // 2. Fallback check in phraseService for legacy compound phrases
    const fallbackPhrase = phraseService.findPhrase(norm);
    if (fallbackPhrase) {
      setFeaturedPhrase(fallbackPhrase);
      setMatchedSigns([]);
      setUnmatchedTerms([]);
      setIsMultiWordQuery(false);
      return;
    }

    // 3. No match found
    setMatchedSigns([]);
    setUnmatchedTerms(query.split(/\s+/).filter(w => w.trim().length > 0));
    setFeaturedPhrase(undefined);
    setIsMultiWordQuery(query.trim().includes(' '));
  };

  const handleClear = () => {
    setInputText('');
    setMatchedSigns([]);
    setUnmatchedTerms([]);
    setFeaturedPhrase(undefined);
    setIsMultiWordQuery(false);
    setActiveSequenceIndex(0);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat !== 'all') {
      const signsInCat = signVocabulary.getByCoreCategory(cat);
      if (signsInCat.length > 0) {
        handleSearch(signsInCat[0].name);
      }
    }
  };

  // Quick suggestions across categories
  const SUGGESTIONS = [
    'Hello / Namaste',
    'Thank you',
    'Hello Doctor',
    'Water please',
    'Where is the doctor?',
    'Where is the hospital?',
    'Mother and Father',
    'School / College',
    'Help / Urgent',
    'Stop'
  ];

  const hasInput = inputText.trim().length > 0;
  const hasMatchedSigns = matchedSigns.length > 0 || Boolean(featuredPhrase);

  // Find related verified alternatives when input is not found or partially found
  const relatedVerifiedSigns = !hasMatchedSigns && hasInput
    ? signVocabulary.getAll().filter(item => {
        const norm = inputText.toLowerCase().trim();
        const words = norm.split(/\s+/);
        return words.some(w => 
          w.length > 2 && (
            item.name.toLowerCase().includes(w) ||
            item.meaning.toLowerCase().includes(w) ||
            item.tags.some(t => t.toLowerCase() === w)
          )
        );
      }).slice(0, 4)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Hand className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-navy-900">
              Text to Sign ISL Demonstration Player
            </h2>
          </div>
          <p className="text-xs text-navy-500 mt-0.5">
            Search verified Indian Sign Language demonstrations or enter words and short phrases to watch authentic visual demonstrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://islrtc.nic.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800 hover:bg-teal-100 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Official ISLRTC Resources ↗</span>
          </a>
        </div>
      </div>

      {/* Core Category Filter Chips (8 Canonical Categories) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-navy-500 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-teal-600" />
          Category:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelectCategory(cat)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition border ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-navy-50 border-navy-200 text-navy-700 hover:bg-teal-50 hover:border-teal-300'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Input Search Box */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-navy-700">
          Enter Word or Short Phrase:
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type a word or short phrase (e.g. 'Hello', 'Thank you', 'Hello Doctor', 'Water please', 'Hospital')..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-sm font-medium text-navy-900 shadow-xs"
          />
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
          {hasInput && (
            <button
              onClick={handleClear}
              className="absolute right-3.5 top-3.5 p-0.5 rounded-full hover:bg-navy-100 text-navy-400 hover:text-navy-600 transition"
              title="Clear input"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-[11px] font-semibold text-navy-500 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-teal-600" />
            Try:
          </span>
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => handleSearch(item)}
              className={`px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 transition ${
                inputText.toLowerCase().trim() === item.toLowerCase().trim()
                  ? 'bg-teal-600 border-teal-600 text-white shadow-xs font-bold'
                  : 'border-navy-200 bg-navy-50 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 text-navy-700'
              }`}
            >
              {item.split(' /')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Results Area */}
      {!hasInput ? (
        /* Empty State */
        <div className="p-8 sm:p-10 bg-navy-50/70 border border-navy-100 rounded-2xl text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
            <Hand className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-navy-900">
              Enter Text to View Indian Sign Language Video Demonstration
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Type words or phrases to view verified ISL visual demonstrations. For multi-word phrases, matching demonstrations appear in sequence. Unverified phrases are honestly reported without fabricating gestures.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {SUGGESTIONS.slice(0, 4).map((phrase) => (
              <button
                key={phrase}
                onClick={() => handleSearch(phrase)}
                className="px-3 py-1.5 bg-white border border-navy-200 hover:border-teal-400 hover:bg-teal-50/80 rounded-xl text-xs font-semibold text-navy-800 transition shadow-2xs"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      ) : matchedSigns.length === 1 && unmatchedTerms.length === 0 ? (
        /* Single Sign Exact / Direct Match: Full Visual Learning Panel */
        <div className="space-y-4 animate-fade-in">
          <VisualLearningPanel
            sign={matchedSigns[0]}
            onPractice={(s) => {
              if (onNavigateToPractice) onNavigateToPractice(s.name);
              else setActiveModalSign(s);
            }}
            onSelectRelated={(rel) => handleSearch(rel.name)}
          />

          {/* Related Signs Lateral Navigation */}
          <div className="p-4 bg-navy-50/80 rounded-2xl border border-navy-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Explore Related Verified Signs:</span>
              </span>
              <span className="text-[10px] text-navy-500 font-medium">
                Click any sign to view demonstration
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {signVocabulary.getRelatedSigns(matchedSigns[0].name, 5).map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => handleSearch(rel.name)}
                  className="px-3 py-1.5 bg-white border border-navy-200 hover:border-teal-500 hover:bg-teal-50 text-navy-900 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1 group"
                >
                  <span>{rel.name.split(' (')[0].split(' /')[0]}</span>
                  <ArrowRight className="w-3 h-3 text-teal-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : matchedSigns.length > 0 ? (
        /* Multi-Word Sequence Demonstrations (Requirement: Display individual verified signs in sequence) */
        <div className="space-y-5 animate-fade-in">
          {/* Multi-Word Summary Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2.5 text-teal-950">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-teal-800">
                  Multi-Word Sentence Match ({matchedSigns.length} Demonstration{matchedSigns.length > 1 ? 's' : ''})
                </span>
              </div>
              <span className="text-[11px] font-mono text-teal-700 font-semibold bg-white/70 px-2 py-0.5 rounded-md border border-teal-200">
                Synchronized ISL Catalog
              </span>
            </div>

            {/* Sequence Flow Indicators & Active Word Selector */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {matchedSigns.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => setActiveSequenceIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      activeSequenceIndex === idx
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white text-navy-800 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <span className="text-[10px] opacity-75 font-mono">#{idx + 1}</span>
                    <span>{s.name.split(' /')[0].split(' (')[0]}</span>
                    {activeSequenceIndex === idx && (
                      <span className="text-[10px] bg-teal-800 px-1.5 py-0.2 rounded text-teal-100">Active</span>
                    )}
                  </button>
                  {idx < matchedSigns.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Partial Unmatched Terms Notice */}
          {unmatchedTerms.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Missing vocabulary notice:
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  No verified ISL demonstration exists for <strong>"{unmatchedTerms.join('", "')}"</strong>. SignBridge AI strictly displays authentic verified signs only and will never fabricate gestures for unknown words.
                </p>
              </div>
            </div>
          )}

          {/* Active Sequential Sign Visual Learning Panel */}
          {matchedSigns[activeSequenceIndex] && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-navy-700 px-1">
                <span>Displaying Sequence Step #{activeSequenceIndex + 1} Demonstration:</span>
                <span className="text-teal-700 font-mono">[{matchedSigns[activeSequenceIndex].gloss}]</span>
              </div>
              <VisualLearningPanel
                sign={matchedSigns[activeSequenceIndex]}
                onPractice={(s) => {
                  if (onNavigateToPractice) onNavigateToPractice(s.name);
                  else setActiveModalSign(s);
                }}
                onSelectRelated={(rel) => handleSearch(rel.name)}
              />
            </div>
          )}

          {/* Stepper / Grid of Matching Sign Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-navy-600 px-1">
              <span className="font-bold text-navy-900">
                All Sequence Steps ({matchedSigns.length}):
              </span>
              <span className="text-[11px] text-navy-500">
                Click any card or "Watch how to sign" to inspect
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedSigns.map((sign, idx) => (
                <div 
                  key={sign.id} 
                  className={`relative rounded-2xl transition cursor-pointer ${
                    activeSequenceIndex === idx ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                  }`}
                  onClick={() => setActiveSequenceIndex(idx)}
                >
                  {/* Sequence Badge */}
                  <div className="absolute -top-2.5 -left-2 z-10 w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    {idx + 1}
                  </div>
                  <SignCard
                    sign={sign}
                    onViewDetails={() => {
                      setActiveSequenceIndex(idx);
                      setActiveModalSign(sign);
                    }}
                    onPractice={(s) => {
                      if (onNavigateToPractice) onNavigateToPractice(s.name);
                      else setActiveModalSign(s);
                    }}
                    onSelectRelated={(rel) => handleSearch(rel.name)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : featuredPhrase ? (
        /* Legacy Fallback Phrase Player (when phrase not in signVocabulary catalog) */
        <div className="space-y-4 animate-fade-in">
          <SignDemonstrationPlayer
            phrase={featuredPhrase}
            isMirrorMode={isMirrorMode}
            onToggleMirror={() => setIsMirrorMode(!isMirrorMode)}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
            onRequestVerification={onOpenFeedbackWithPhrase}
            onVideoAttached={(url) => {
              const updated = phraseService.findPhrase(featuredPhrase.phrase);
              if (updated) setFeaturedPhrase({ ...updated });
            }}
          />
        </div>
      ) : (
        /* Honest "Demonstration Not Available" State */
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h4 className="font-bold text-sm">
                Demonstration not available yet for "{inputText}"
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              This phrase does not currently exist in the verified Indian Sign Language catalog. 
              SignBridge AI strictly avoids hallucinating synthetic movements or inventing signs. True Indian Sign Language uses conceptual spatial grammar, distinct two-handed formations, and facial markers rather than literal English translations.
            </p>

            {/* Official ISLRTC Resource Citation */}
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-navy-900">
                  Official Standard Source:
                </span>
                <p className="text-[11px] text-navy-600">
                  Indian Sign Language Research and Training Centre (ISLRTC)
                </p>
              </div>
              <a
                href="https://islrtc.nic.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-navy-800 hover:bg-navy-900 text-teal-300 rounded-lg font-bold flex items-center gap-1 transition text-xs shrink-0"
              >
                <span>Visit ISLRTC Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Related Verified Phrases Chips */}
            {relatedVerifiedSigns.length > 0 && (
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Available verified signs you can try instead:
                </span>
                <div className="flex flex-wrap gap-2">
                  {relatedVerifiedSigns.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => handleSearch(rel.name)}
                      className="px-3 py-1.5 bg-white border border-navy-200 hover:border-teal-500 hover:bg-teal-50 text-xs font-semibold text-navy-900 rounded-xl shadow-xs transition flex items-center gap-1 group"
                    >
                      <span>"{rel.name}"</span>
                      <ArrowRight className="w-3 h-3 text-teal-600 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/80">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="optInFingerspelling"
                  checked={showFingerspellingFallback}
                  onChange={(e) => setShowFingerspellingFallback(e.target.checked)}
                  className="rounded border-amber-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <label 
                  htmlFor="optInFingerspelling" 
                  className="text-xs font-semibold text-amber-900 cursor-pointer select-none"
                >
                  Show ISL Fingerspelling (Recommended for names and proper nouns only)
                </label>
              </div>

              {onOpenFeedbackWithPhrase && (
                <button
                  onClick={() => onOpenFeedbackWithPhrase(inputText)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Request Demonstration</span>
                </button>
              )}
            </div>
          </div>

          {/* Optional Fingerspelling fallback for names */}
          {showFingerspellingFallback && (
            <div className="pt-2 border-t border-navy-100">
              <div className="mb-2 text-xs font-bold text-navy-700">
                Indian Sign Language Two-Handed Fingerspelling:
              </div>
              <FingerspellingView text={inputText} />
            </div>
          )}
        </div>
      )}

      {/* Modal for Detailed Visual Learning Breakdown */}
      {activeModalSign && (
        <Modal
          isOpen={Boolean(activeModalSign)}
          onClose={() => setActiveModalSign(null)}
          title={`${activeModalSign.name} — Demonstration Details`}
        >
          <VisualLearningPanel
            sign={activeModalSign}
            onPractice={(s) => {
              setActiveModalSign(null);
              if (onNavigateToPractice) onNavigateToPractice(s.name);
            }}
            onSelectRelated={(rel) => {
              setActiveModalSign(null);
              handleSearch(rel.name);
            }}
          />
        </Modal>
      )}
    </div>
  );
};
