import React, { useState } from 'react';
import { phraseService } from '../../services/phraseLibraryService';
import { ISLSignReference, PhraseCategory } from '../../types';
import { PhraseDetailCard } from './PhraseDetailCard';
import { Modal } from '../common/Modal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  Hospital, 
  ShieldAlert, 
  GraduationCap, 
  Building2, 
  Bus, 
  MessageCircle,
  FlipHorizontal,
  Play,
  Pause,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { ttsService } from '../../services/textToSpeech';
import { SignDemonstrationPlayer } from '../textToSign/SignDemonstrationPlayer';

export const PhraseLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | 'all'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [activeSignModal, setActiveSignModal] = useState<ISLSignReference | null>(null);
  const [isMirror, setIsMirror] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const CATEGORIES: { id: PhraseCategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Phrases', icon: BookOpen },
    { id: 'Greetings', label: 'Greetings', icon: MessageCircle },
    { id: 'Medical Needs', label: 'Medical Needs', icon: Hospital },
    { id: 'Emergency', label: 'Emergency', icon: ShieldAlert },
    { id: 'Travel', label: 'Travel & Public Places', icon: Bus },
    { id: 'Food', label: 'Food & Essentials', icon: Sparkles },
    { id: 'Daily Conversation', label: 'Daily Conversation', icon: Building2 }
  ];

  const allPhrases = phraseService.getAllPhrases();

  const filteredPhrases = allPhrases.filter(p => {
    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    // Urgency filter
    if (selectedUrgency !== 'all' && p.urgencyLevel !== selectedUrgency) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inPhrase = p.phrase.toLowerCase().includes(q);
      const inHindi = p.hindiGloss && p.hindiGloss.toLowerCase().includes(q);
      const inTags = p.tags.some(t => t.toLowerCase().includes(q));
      const inDesc = p.handshapeDescription.toLowerCase().includes(q);
      if (!inPhrase && !inHindi && !inTags && !inDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>Categorized Quick Phrase Library</span>
            </h2>
            <p className="text-xs text-navy-500 mt-0.5">
              Instant access to verified Indian Sign Language phrases across clinical, educational, and public sectors.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full">
            {filteredPhrases.length} Reference Phrases Available
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases by English keywords, Hindi words, or symptoms (e.g., 'pain', 'doctor', 'dawai', 'ticket')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-xs text-navy-900 font-medium"
          />
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 shrink-0 transition ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-navy-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Phrase Cards */}
      {filteredPhrases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-navy-100 space-y-2">
          <p className="text-sm font-bold text-navy-800">No matching phrases found</p>
          <p className="text-xs text-navy-500 max-w-sm mx-auto">
            Try adjusting your search keywords or clear your category filter. You can also request this phrase via the feedback button.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPhrases.map((phrase) => (
            <PhraseDetailCard
              key={phrase.id}
              phrase={phrase}
              onViewSign={(item) => setActiveSignModal(item)}
            />
          ))}
        </div>
      )}

      {/* Sign Demonstration Modal */}
      {activeSignModal && (
        <Modal
          isOpen={!!activeSignModal}
          onClose={() => setActiveSignModal(null)}
          title={activeSignModal.phrase}
          description={activeSignModal.hindiGloss || 'Indian Sign Language Demonstration'}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <SignDemonstrationPlayer
              phrase={activeSignModal}
              isMirrorMode={isMirror}
              onToggleMirror={() => setIsMirror(!isMirror)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
