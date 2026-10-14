import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { TwoWaySessionView } from '../components/conversation/TwoWaySessionView';
import { SessionSetupModal } from '../components/conversation/SessionSetupModal';
import { TranscriptViewer } from '../components/conversation/TranscriptViewer';
import { 
  MessagesSquare, 
  PlusCircle, 
  History, 
  FileText, 
  Download, 
  Trash2, 
  Hospital, 
  GraduationCap, 
  Building2, 
  Users, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { CommunicationSession } from '../types';

export const LiveSessionPage: React.FC = () => {
  const { activeSession, pastSessions, deleteSession, exportSession } = useSession();
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [selectedPastSession, setSelectedPastSession] = useState<CommunicationSession | null>(null);

  if (activeSession) {
    return <TwoWaySessionView />;
  }

  const getContextIcon = (ctx: CommunicationSession['context']) => {
    switch (ctx) {
      case 'hospital':
        return <Hospital className="w-4 h-4 text-rose-600" />;
      case 'classroom':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'government_office':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'emergency':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Users className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Session Starter Banner */}
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">
              Inclusive Two-Way Communication Workspace
            </h2>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Start a structured dual session between a Deaf/HoH individual and a hearing partner. Live speech captions, sign recognition, and instant text-to-speech audio are coordinated in real-time.
          </p>
        </div>

        <button
          onClick={() => setSetupModalOpen(true)}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch New Session</span>
        </button>
      </div>

      {/* Past Sessions Archive Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <span>Saved Communication Sessions &amp; Transcripts</span>
          </h3>
          <span className="text-xs text-navy-500 font-mono">
            {pastSessions.length} Archived Session(s)
          </span>
        </div>

        {pastSessions.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-navy-100 text-center text-navy-400 text-xs">
            No completed sessions recorded yet. Launch your first session above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 bg-white rounded-2xl border border-navy-100 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-navy-50 text-navy-700 border border-navy-200">
                      {getContextIcon(sess.context)}
                      <span>{sess.context.replace(/_/g, ' ')}</span>
                    </span>

                    <span className="text-[11px] text-navy-400 font-mono">
                      {new Date(sess.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-navy-900 leading-snug">
                    {sess.title}
                  </h4>

                  <p className="text-xs text-navy-600">
                    Participants: <strong>{sess.hearingParticipantName}</strong> &amp; <strong>{sess.deafParticipantName}</strong>
                  </p>

                  <p className="text-[11px] text-navy-500">
                    {sess.summary || `${sess.turns.length} conversational turns recorded.`}
                  </p>
                </div>

                <div className="pt-3 border-t border-navy-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPastSession(sess)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Transcript ({sess.turns.length})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportSession('txt', sess)}
                      className="p-1.5 text-navy-500 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition"
                      title="Download TXT transcript"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSession(sess.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete session log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Past Transcript Modal */}
      {selectedPastSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-navy-100 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-navy-100 flex items-center justify-between bg-navy-50">
              <h3 className="font-bold text-navy-900 text-sm">
                Transcript Archive: {selectedPastSession.title}
              </h3>
              <button
                onClick={() => setSelectedPastSession(null)}
                className="p-1 rounded text-navy-400 hover:text-navy-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <TranscriptViewer session={selectedPastSession} />
            </div>
          </div>
        </div>
      )}

      {/* Setup modal */}
      <SessionSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </div>
  );
};
