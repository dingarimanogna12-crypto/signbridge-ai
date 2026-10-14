import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CommunicationSession, ConversationTurn } from '../types';
import { storageService } from '../services/storageService';
import { ttsService } from '../services/textToSpeech';
import { useAccessibility } from './AccessibilityContext';

interface SessionContextType {
  activeSession: CommunicationSession | null;
  pastSessions: CommunicationSession[];
  startSession: (params: {
    title: string;
    context: CommunicationSession['context'];
    hearingParticipantName: string;
    deafParticipantName: string;
  }) => CommunicationSession;
  addTurn: (turn: Omit<ConversationTurn, 'id' | 'sessionId' | 'timestamp'>) => void;
  updateTurn: (turnId: string, newContent: string) => void;
  deleteTurn: (turnId: string) => void;
  endSession: () => void;
  exportSession: (format: 'txt' | 'json', session?: CommunicationSession) => void;
  deleteSession: (id: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { triggerVisualAlert } = useAccessibility();
  const [pastSessions, setPastSessions] = useState<CommunicationSession[]>(() => 
    storageService.getSessions()
  );
  const [activeSession, setActiveSession] = useState<CommunicationSession | null>(null);

  const startSession = (params: {
    title: string;
    context: CommunicationSession['context'];
    hearingParticipantName: string;
    deafParticipantName: string;
  }): CommunicationSession => {
    const newSession: CommunicationSession = {
      id: `sess-${Date.now()}`,
      title: params.title || `${params.context.toUpperCase()} Session`,
      context: params.context,
      hearingParticipantName: params.hearingParticipantName || 'Hearing Partner',
      deafParticipantName: params.deafParticipantName || 'Deaf Participant',
      startedAt: new Date().toISOString(),
      status: 'active',
      turns: []
    };

    setActiveSession(newSession);
    return newSession;
  };

  const addTurn = (turnData: Omit<ConversationTurn, 'id' | 'sessionId' | 'timestamp'>) => {
    if (!activeSession) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newTurn: ConversationTurn = {
      ...turnData,
      id: `turn-${Date.now()}`,
      sessionId: activeSession.id,
      timestamp: timeStr
    };

    const updatedSession: CommunicationSession = {
      ...activeSession,
      turns: [...activeSession.turns, newTurn]
    };

    setActiveSession(updatedSession);
    storageService.saveSession(updatedSession);
    setPastSessions(storageService.getSessions());

    // Accessibility alert: Flash screen for Deaf participant when hearing partner speaks
    if (turnData.senderRole === 'hearing_user') {
      triggerVisualAlert();
    }

    // Audio readout: Speak Deaf participant's sign/typed output for hearing partner
    if (turnData.senderRole === 'deaf_user' && turnData.content) {
      ttsService.speak(turnData.content);
    }
  };

  const endSession = () => {
    if (!activeSession) return;

    const completed: CommunicationSession = {
      ...activeSession,
      status: 'completed',
      endedAt: new Date().toISOString(),
      summary: `Completed session with ${activeSession.turns.length} exchange(s). Context: ${activeSession.context}.`
    };

    storageService.saveSession(completed);
    setPastSessions(storageService.getSessions());
    setActiveSession(null);
  };

  const exportSession = (format: 'txt' | 'json', targetSession?: CommunicationSession) => {
    const sess = targetSession || activeSession;
    if (!sess) return;

    let blob: Blob;
    let filename: string;

    if (format === 'json') {
      const dataStr = JSON.stringify(sess, null, 2);
      blob = new Blob([dataStr], { type: 'application/json' });
      filename = `${sess.title.replace(/\s+/g, '_')}_transcript.json`;
    } else {
      let txt = `========================================================\n`;
      txt += `SIGNBRIDGE AI — ACCESSIBLE COMMUNICATION TRANSCRIPT\n`;
      txt += `========================================================\n`;
      txt += `Session Title: ${sess.title}\n`;
      txt += `Context: ${sess.context.toUpperCase()}\n`;
      txt += `Participants: ${sess.hearingParticipantName} & ${sess.deafParticipantName}\n`;
      txt += `Started: ${new Date(sess.startedAt).toLocaleString()}\n`;
      if (sess.endedAt) txt += `Ended: ${new Date(sess.endedAt).toLocaleString()}\n`;
      txt += `Total Turns: ${sess.turns.length}\n`;
      txt += `--------------------------------------------------------\n\n`;

      sess.turns.forEach((turn, idx) => {
        const sender = turn.senderRole === 'hearing_user' ? 'Hearing Partner' : 'Deaf / HoH User';
        txt += `[${turn.timestamp}] ${turn.senderName} (${sender}) via ${turn.mode.replace(/_/g, ' ')}:\n`;
        txt += `"${turn.content}"\n`;
        if (turn.confidence !== undefined) {
          txt += `Confidence: ${Math.round(turn.confidence * 100)}%\n`;
        }
        txt += `\n`;
      });

      txt += `========================================================\n`;
      txt += `Privacy Notice: This transcript was processed locally on-device.\n`;
      txt += `========================================================\n`;

      blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      filename = `${sess.title.replace(/\s+/g, '_')}_transcript.txt`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateTurn = (turnId: string, newContent: string) => {
    if (!activeSession) return;
    const updatedTurns = activeSession.turns.map(t =>
      t.id === turnId ? { ...t, content: newContent } : t
    );
    const updatedSession: CommunicationSession = {
      ...activeSession,
      turns: updatedTurns
    };
    setActiveSession(updatedSession);
    storageService.saveSession(updatedSession);
    setPastSessions(storageService.getSessions());
  };

  const deleteTurn = (turnId: string) => {
    if (!activeSession) return;
    const updatedTurns = activeSession.turns.filter(t => t.id !== turnId);
    const updatedSession: CommunicationSession = {
      ...activeSession,
      turns: updatedTurns
    };
    setActiveSession(updatedSession);
    storageService.saveSession(updatedSession);
    setPastSessions(storageService.getSessions());
  };

  const deleteSession = (id: string) => {
    storageService.deleteSession(id);
    setPastSessions(storageService.getSessions());
    if (activeSession?.id === id) {
      setActiveSession(null);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        pastSessions,
        startSession,
        addTurn,
        updateTurn,
        deleteTurn,
        endSession,
        exportSession,
        deleteSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
