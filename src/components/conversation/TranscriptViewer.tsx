import React, { useState } from 'react';
import { ConversationTurn, CommunicationSession } from '../../types';
import { 
  Volume2, 
  Download, 
  FileText, 
  CheckCircle2, 
  User, 
  Hand, 
  Mic, 
  Keyboard, 
  Sparkles,
  Edit3,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { ttsService } from '../../services/textToSpeech';
import { useSession } from '../../context/SessionContext';

interface TranscriptViewerProps {
  session: CommunicationSession;
  compact?: boolean;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ 
  session, 
  compact = false 
}) => {
  const { exportSession, updateTurn, deleteTurn } = useSession();
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);

  const getModeIcon = (mode: ConversationTurn['mode']) => {
    switch (mode) {
      case 'speech_to_text':
        return <Mic className="w-3.5 h-3.5 text-blue-600" />;
      case 'sign_to_text':
        return <Hand className="w-3.5 h-3.5 text-teal-600" />;
      case 'quick_phrase':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Keyboard className="w-3.5 h-3.5 text-navy-600" />;
    }
  };

  const handleStartEdit = (turn: ConversationTurn) => {
    setEditingTurnId(turn.id);
    setEditContent(turn.content);
  };

  const handleSaveEdit = (turnId: string) => {
    if (!editContent.trim()) return;
    updateTurn(turnId, editContent.trim());
    setEditingTurnId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingTurnId(null);
    setEditContent('');
  };

  const handleSpeakTurn = (turnId: string, content: string) => {
    setSpeakingTurnId(turnId);
    ttsService.speak(content, {
      onEnd: () => setSpeakingTurnId(null),
      onError: () => setSpeakingTurnId(null)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-4 sm:p-5 flex flex-col h-full space-y-4">
      {/* Header & Export Toolbar */}
      <div className="flex items-center justify-between border-b border-navy-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Session Transcript</span>
          </h3>
          <p className="text-[11px] text-navy-500">
            {session.turns.length} exchange(s) recorded. Messages can be edited inline or spoken aloud.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => exportSession('txt', session)}
            className="px-2.5 py-1.5 rounded-lg border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs font-semibold flex items-center gap-1 transition"
            title="Download plain text transcript"
          >
            <Download className="w-3 h-3 text-navy-500" />
            <span>TXT</span>
          </button>

          <button
            onClick={() => exportSession('json', session)}
            className="px-2.5 py-1.5 rounded-lg border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs font-semibold flex items-center gap-1 transition"
            title="Download structured JSON transcript"
          >
            <Download className="w-3 h-3 text-navy-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Transcript Turns List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px]">
        {session.turns.length === 0 ? (
          <div className="text-center py-12 text-navy-400 text-xs space-y-1">
            <p className="font-semibold text-navy-500">No conversation turns yet</p>
            <p>Start speaking into the mic or signing in front of the camera.</p>
          </div>
        ) : (
          session.turns.map((turn) => {
            const isHearing = turn.senderRole === 'hearing_user';
            const isCurrentlyEditing = editingTurnId === turn.id;
            const isSpeakingThis = speakingTurnId === turn.id;

            return (
              <div
                key={turn.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-2 transition ${
                  isHearing
                    ? 'bg-blue-50/50 border-blue-200/80 mr-4'
                    : 'bg-teal-50/50 border-teal-200/80 ml-4'
                }`}
              >
                {/* Turn Header */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={isHearing ? 'text-blue-900' : 'text-teal-900'}>
                      {turn.senderName}
                    </span>
                    <span className="text-[10px] font-medium text-navy-400">
                      ({isHearing ? 'Hearing' : 'Deaf / HoH'})
                    </span>
                    <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.2 bg-white rounded border border-navy-100 text-[10px] text-navy-600">
                      {getModeIcon(turn.mode)}
                      <span className="capitalize">{turn.mode.replace(/_/g, ' ')}</span>
                    </span>
                    {turn.content.includes('[SIMULATED]') && (
                      <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold border border-amber-300">
                        [SIMULATED]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-navy-400 font-mono text-[10px]">
                    {turn.confidence !== undefined && (
                      <span className="text-emerald-700 font-semibold">
                        {Math.round(turn.confidence * 100)}%
                      </span>
                    )}
                    <span>{turn.timestamp}</span>
                  </div>
                </div>

                {/* Content: Inline Edit or Readonly Text */}
                {isCurrentlyEditing ? (
                  <div className="space-y-2 bg-white p-2.5 rounded-xl border border-teal-300">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full text-sm font-medium text-navy-900 border border-navy-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-navy-600 hover:bg-navy-100 transition flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={() => handleSaveEdit(turn.id)}
                        disabled={!editContent.trim()}
                        className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-navy-900 leading-relaxed">
                    "{turn.content}"
                  </p>
                )}

                {/* Turn Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-navy-100/60">
                  <div>
                    {turn.isVerifiedSign && (
                      <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        Verified Sign
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isCurrentlyEditing && (
                      <>
                        <button
                          onClick={() => handleStartEdit(turn)}
                          className="p-1 text-navy-400 hover:text-navy-700 hover:bg-white rounded transition"
                          title="Edit this message"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteTurn(turn.id)}
                          className="p-1 text-navy-400 hover:text-rose-600 hover:bg-white rounded transition"
                          title="Delete this message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleSpeakTurn(turn.id, turn.content)}
                      className={`p-1 rounded transition ${
                        isSpeakingThis 
                          ? 'text-teal-600 bg-teal-50 animate-pulse' 
                          : 'text-navy-400 hover:text-navy-700 hover:bg-white'
                      }`}
                      title="Speak this turn aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
