import React, { useState } from 'react';
import { phraseService } from '../../services/phraseLibraryService';
import { ISLSignReference, PhraseCategory } from '../../types';
import { 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  BookOpen, 
  Search, 
  Sparkles,
  Award
} from 'lucide-react';
import { useAuthRole } from '../../context/AuthRoleContext';

export const AdminPhraseManager: React.FC = () => {
  const { profile } = useAuthRole();
  const [phrases, setPhrases] = useState<ISLSignReference[]>(() => phraseService.getAllPhrases());
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Form states
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newHindiGloss, setNewHindiGloss] = useState('');
  const [newCategory, setNewCategory] = useState<PhraseCategory>('healthcare');
  const [newUrgency, setNewUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [newHandshape, setNewHandshape] = useState('');
  const [newMovement, setNewMovement] = useState('');
  const [newNonManual, setNewNonManual] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim() || !newHandshape.trim() || !newMovement.trim()) return;

    const created = phraseService.addPhrase({
      phrase: newPhraseText.trim(),
      hindiGloss: newHindiGloss.trim() || undefined,
      category: newCategory,
      urgencyLevel: newUrgency,
      handshapeDescription: newHandshape.trim(),
      movementDescription: newMovement.trim(),
      nonManualFeatures: newNonManual.trim() || undefined,
      isVerified: true,
      verifiedBy: profile.name || 'ISL Expert Reviewer',
      verificationDate: new Date().toISOString(),
      accuracyRating: 5.0,
      tags: newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    });

    setPhrases(phraseService.getAllPhrases());
    setShowAddForm(false);

    // Reset form
    setNewPhraseText('');
    setNewHindiGloss('');
    setNewHandshape('');
    setNewMovement('');
    setNewNonManual('');
    setNewTags('');
  };

  const handleToggleVerification = (id: string, currentStatus: boolean) => {
    phraseService.updatePhraseVerification(id, !currentStatus, profile.name || 'ISL Certified Authority');
    setPhrases(phraseService.getAllPhrases());
  };

  const filtered = phrases.filter(p => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return p.phrase.toLowerCase().includes(q) || (p.hindiGloss && p.hindiGloss.toLowerCase().includes(q));
  });

  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-sm space-y-4">
      {/* Header and Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            <span>ISL Phrase Verification &amp; Registry</span>
          </h3>
          <p className="text-xs text-navy-500 mt-0.5">
            Approve official Indian Sign Language phrases and assign certified verification stamps.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel Form' : 'Register New Phrase'}</span>
        </button>
      </div>

      {/* Add New Phrase Form */}
      {showAddForm && (
        <form onSubmit={handleAddPhrase} className="p-4 bg-navy-50/70 rounded-2xl border border-navy-200/80 space-y-3 text-xs animate-scale-up">
          <h4 className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Register Approved Sign Translation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Phrase (English):</label>
              <input
                type="text"
                required
                value={newPhraseText}
                onChange={(e) => setNewPhraseText(e.target.value)}
                placeholder="e.g. Where is the radiology room?"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Hindi Gloss (Optional):</label>
              <input
                type="text"
                value={newHindiGloss}
                onChange={(e) => setNewHindiGloss(e.target.value)}
                placeholder="e.g. एक्स-रे रूम कहाँ है?"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white font-hindi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as PhraseCategory)}
                className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
              >
                <option value="healthcare">Healthcare &amp; Clinic</option>
                <option value="emergency">Emergencies &amp; SOS</option>
                <option value="education">Education &amp; Classroom</option>
                <option value="workplace">Workplace &amp; Admin</option>
                <option value="travel">Travel &amp; Public Places</option>
                <option value="everyday">Everyday Greetings</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Urgency Level:</label>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-navy-700">Handshape Configuration:</label>
            <textarea
              required
              rows={2}
              value={newHandshape}
              onChange={(e) => setNewHandshape(e.target.value)}
              placeholder="Detailed finger joint position, primary vs non-dominant hand setup..."
              className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-navy-700">Movement Trajectory:</label>
            <input
              type="text"
              required
              value={newMovement}
              onChange={(e) => setNewMovement(e.target.value)}
              placeholder="e.g. Two rhythmic taps on pulse point, then open palms."
              className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Non-Manual Features (Face/Head):</label>
              <input
                type="text"
                value={newNonManual}
                onChange={(e) => setNewNonManual(e.target.value)}
                placeholder="e.g. Eyebrows raised, questioning head tilt."
                className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Tags (comma-separated):</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="e.g. xray, hospital, radiology"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-navy-200 rounded-xl hover:bg-navy-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
            >
              Publish Approved Sign
            </button>
          </div>
        </form>
      )}

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter phrases in registry..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-navy-200 text-xs"
        />
        <Search className="w-3.5 h-3.5 text-navy-400 absolute left-3 top-3" />
      </div>

      {/* Phrases Table */}
      <div className="overflow-x-auto border border-navy-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-50 text-navy-700 font-semibold border-b border-navy-200/80">
            <tr>
              <th className="p-3">Phrase &amp; Gloss</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Verified By</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((phrase) => (
              <tr key={phrase.id} className="hover:bg-navy-50/50">
                <td className="p-3">
                  <div className="font-bold text-navy-900">{phrase.phrase}</div>
                  {phrase.hindiGloss && (
                    <div className="text-[11px] text-navy-500 font-hindi">{phrase.hindiGloss}</div>
                  )}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-navy-100 text-navy-700 text-[10px] font-mono capitalize">
                    {phrase.category}
                  </span>
                </td>
                <td className="p-3">
                  {phrase.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      Unverified
                    </span>
                  )}
                </td>
                <td className="p-3 text-navy-600 text-[11px]">
                  {phrase.verifiedBy || 'Pending Review'}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleToggleVerification(phrase.id, phrase.isVerified)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      phrase.isVerified
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {phrase.isVerified ? 'Revoke Approval' : 'Approve Sign'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
