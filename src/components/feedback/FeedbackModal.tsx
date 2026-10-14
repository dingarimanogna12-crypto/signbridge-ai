import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuthRole } from '../../context/AuthRoleContext';
import { storageService } from '../../services/storageService';
import { UserFeedback } from '../../types';
import { CheckCircle2, MessageSquareWarning, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledPhrase?: string;
  prefilledType?: UserFeedback['type'];
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  prefilledPhrase = '',
  prefilledType = 'sign_inaccuracy'
}) => {
  const { role } = useAuthRole();
  const [type, setType] = useState<UserFeedback['type']>(prefilledType);
  const [phraseText, setPhraseText] = useState(prefilledPhrase);
  const [detectedSign, setDetectedSign] = useState('');
  const [expectedSign, setExpectedSign] = useState('');
  const [description, setDescription] = useState('');
  const [userContact, setUserContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    storageService.submitFeedback({
      type,
      phraseText: phraseText.trim() || undefined,
      detectedSign: detectedSign.trim() || undefined,
      expectedSign: expectedSign.trim() || undefined,
      description: description.trim(),
      reportedByRole: role,
      userContact: userContact.trim() || undefined
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      // Reset form
      setDescription('');
      setDetectedSign('');
      setExpectedSign('');
    }, 1800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Inaccuracy or Feedback"
      description="Help our ISL Certified Experts improve sign accuracy and speech caption quality."
      maxWidth="lg"
    >
      {isSubmitted ? (
        <div className="py-8 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-navy-900">
            Feedback Submitted Successfully
          </h4>
          <p className="text-xs text-navy-600 max-w-sm mx-auto">
            Your report has been received for review and continuous dictionary refinement.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Issue Type */}
          <div className="space-y-1">
            <label className="block font-semibold text-navy-700">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'sign_inaccuracy', label: 'Sign Inaccuracy' },
                { id: 'caption_error', label: 'Caption Error' },
                { id: 'missing_phrase', label: 'Missing Vocabulary' },
                { id: 'camera_recognition_issue', label: 'Camera / AI Glitch' },
                { id: 'other', label: 'Other Issue' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setType(item.id as UserFeedback['type'])}
                  className={`p-2 rounded-xl text-left border transition font-medium ${
                    type === item.id
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                      : 'border-navy-200 text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Phrase */}
          <div className="space-y-1">
            <label className="block font-semibold text-navy-700">
              Target Phrase / Word (if applicable)
            </label>
            <input
              type="text"
              value={phraseText}
              onChange={(e) => setPhraseText(e.target.value)}
              placeholder="e.g. Where is the emergency ward? / I have chest pain"
              className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900"
            />
          </div>

          {/* Detected vs Expected Signs (for Sign Inaccuracies) */}
          {(type === 'sign_inaccuracy' || type === 'camera_recognition_issue') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-navy-700">
                  Detected / Displayed Sign
                </label>
                <input
                  type="text"
                  value={detectedSign}
                  onChange={(e) => setDetectedSign(e.target.value)}
                  placeholder="e.g. Stomach pain"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-navy-700">
                  Expected / Correct Sign
                </label>
                <input
                  type="text"
                  value={expectedSign}
                  onChange={(e) => setExpectedSign(e.target.value)}
                  placeholder="e.g. Chest pain (clutched hand)"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="block font-semibold text-navy-700">
              Details &amp; Suggestions <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe why this sign or caption was incorrect, any regional dialect context, or the missing vocabulary needed..."
              className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900 leading-relaxed"
            />
          </div>

          {/* Contact (Optional) */}
          <div className="space-y-1">
            <label className="block font-semibold text-navy-700">
              Contact Email / WhatsApp (Optional, for follow-up)
            </label>
            <input
              type="text"
              value={userContact}
              onChange={(e) => setUserContact(e.target.value)}
              placeholder="you@hospital.org or +91 98765 43210"
              className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-navy-100 flex items-center justify-between">
            <span className="text-[11px] text-navy-500">
              Submitting as: <strong className="capitalize">{role.replace(/_/g, ' ')}</strong>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-navy-200 text-navy-700 rounded-xl hover:bg-navy-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
