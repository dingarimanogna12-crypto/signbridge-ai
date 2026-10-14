import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSession } from '../../context/SessionContext';
import { CommunicationSession } from '../../types';
import { Building2, GraduationCap, Hospital, ShieldAlert, Users, Sparkles } from 'lucide-react';

interface SessionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarted?: () => void;
}

export const SessionSetupModal: React.FC<SessionSetupModalProps> = ({
  isOpen,
  onClose,
  onStarted
}) => {
  const { startSession } = useSession();

  const [context, setContext] = useState<CommunicationSession['context']>('hospital');
  const [title, setTitle] = useState('Outpatient Medical Consultation');
  const [hearingParticipantName, setHearingParticipantName] = useState('Dr. Ananya Sen');
  const [deafParticipantName, setDeafParticipantName] = useState('Rahul Sharma');

  const CONTEXT_PRESETS = [
    {
      id: 'hospital' as const,
      label: 'Hospital / Clinic',
      icon: Hospital,
      defaultTitle: 'Outpatient Medical Consultation',
      defaultHearing: 'Attending Physician',
      defaultDeaf: 'Patient'
    },
    {
      id: 'classroom' as const,
      label: 'Classroom / Lecture',
      icon: GraduationCap,
      defaultTitle: 'Lecture & Lab Consultation',
      defaultHearing: 'Instructor',
      defaultDeaf: 'Student'
    },
    {
      id: 'government_office' as const,
      label: 'Govt Office / Public Desk',
      icon: Building2,
      defaultTitle: 'Citizen Service Inquiries',
      defaultHearing: 'Officer / Helpdesk',
      defaultDeaf: 'Citizen'
    },
    {
      id: 'emergency' as const,
      label: 'Emergency / Triage',
      icon: ShieldAlert,
      defaultTitle: 'Emergency Room Triage',
      defaultHearing: 'Paramedic / Triage Nurse',
      defaultDeaf: 'Patient / Escort'
    },
    {
      id: 'public_place' as const,
      label: 'Public Transit / Everyday',
      icon: Users,
      defaultTitle: 'Station / Public Assistance',
      defaultHearing: 'Station Assistant',
      defaultDeaf: 'Commuter'
    }
  ];

  const handleSelectPreset = (preset: typeof CONTEXT_PRESETS[0]) => {
    setContext(preset.id);
    setTitle(preset.defaultTitle);
    setHearingParticipantName(preset.defaultHearing);
    setDeafParticipantName(preset.defaultDeaf);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    startSession({
      title,
      context,
      hearingParticipantName,
      deafParticipantName
    });
    onClose();
    if (onStarted) onStarted();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Communication Session"
      description="Configure participants and environment context for inclusive two-way translation."
      maxWidth="lg"
    >
      <form onSubmit={handleStart} className="space-y-4 text-xs">
        {/* Context preset picker */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-navy-700">
            Select Interaction Context:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTEXT_PRESETS.map((p) => {
              const Icon = p.icon;
              const isSelected = context === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                      : 'border-navy-200 text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-teal-600' : 'text-navy-400'}`} />
                  <span className="text-[11px] leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="block font-semibold text-navy-700">
            Session Title / Purpose:
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900 font-medium"
          />
        </div>

        {/* Participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold text-navy-700">
              Hearing Participant Name:
            </label>
            <input
              type="text"
              required
              value={hearingParticipantName}
              onChange={(e) => setHearingParticipantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-navy-700">
              Deaf / HoH Participant Name:
            </label>
            <input
              type="text"
              required
              value={deafParticipantName}
              onChange={(e) => setDeafParticipantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-navy-900"
            />
          </div>
        </div>

        {/* Start button */}
        <div className="pt-3 border-t border-navy-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-navy-200 text-navy-700 rounded-xl hover:bg-navy-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Live Session</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
