import React, { useState } from 'react';
import { 
  Radio, 
  Square, 
  Send, 
  Mic, 
  Hand, 
  Sparkles, 
  Volume2, 
  FileText, 
  ChevronRight, 
  AlertTriangle,
  User,
  HeartPulse,
  Activity,
  Layers,
  ArrowDown
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { SpeechToTextPanel } from '../speechToText/SpeechToTextPanel';
import { SignToTextPanel } from '../signToText/SignToTextPanel';
import { SignDemonstrationPlayer } from '../textToSign/SignDemonstrationPlayer';
import { TranscriptViewer } from './TranscriptViewer';
import { phraseService } from '../../services/phraseLibraryService';
import { ttsService } from '../../services/textToSpeech';

export const TwoWaySessionView: React.FC = () => {
  const { activeSession, endSession, addTurn } = useSession();
  const { fontSize } = useAccessibility();

  const [deafTypedMessage, setDeafTypedMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'workspace' | 'transcript'>('workspace');
  const [isMirrorMode, setIsMirrorMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  if (!activeSession) return null;

  // Track latest hearing speech turn to project ISL demonstration on Deaf view
  const lastHearingTurn = [...activeSession.turns].reverse().find(t => t.senderRole === 'hearing_user');
  const matchedHearingSign = lastHearingTurn ? phraseService.findPhrase(lastHearingTurn.content) : null;

  const handleDeafSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deafTypedMessage.trim()) return;

    const content = deafTypedMessage.trim();
    addTurn({
      senderRole: 'deaf_user',
      senderName: activeSession.deafParticipantName,
      mode: 'text_typed',
      content,
      confidence: 1.0
    });
    ttsService.speak(content);
    setDeafTypedMessage('');
  };

  const handleQuickPhrase = (phrase: string) => {
    const item = phraseService.findPhrase(phrase);
    addTurn({
      senderRole: 'deaf_user',
      senderName: activeSession.deafParticipantName,
      mode: 'quick_phrase',
      content: phrase,
      confidence: 1.0,
      isVerifiedSign: item ? item.isVerified : false
    });
    ttsService.speak(phrase);
  };

  // Quick triage responses for Deaf participant
  const QUICK_REPLIES = [
    'I have severe pain',
    'Where is the doctor?',
    'I need water',
    'Please help me',
    'Yes',
    'No',
    'Thank you'
  ];

  return (
    <div className="space-y-4">
      {/* Session Top Bar */}
      <div className="bg-navy-900 text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg border border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                {activeSession.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono uppercase font-bold">
                {activeSession.context}
              </span>
            </div>
            <p className="text-xs text-navy-400 mt-0.5">
              Participants: <strong className="text-white">{activeSession.hearingParticipantName}</strong> (Hearing) &amp; <strong className="text-teal-300">{activeSession.deafParticipantName}</strong> (Deaf/HoH)
            </p>
          </div>
        </div>

        {/* Tab & End Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-navy-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'workspace' ? 'bg-teal-600 text-white font-bold' : 'text-navy-400 hover:text-white'
              }`}
            >
              Dual Workspace
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'transcript' ? 'bg-teal-600 text-white font-bold' : 'text-navy-400 hover:text-white'
              }`}
            >
              Transcript ({activeSession.turns.length})
            </button>
          </div>

          <button
            onClick={endSession}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Square className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {activeTab === 'transcript' ? (
        <TranscriptViewer session={activeSession} />
      ) : (
        /* Dual / Split-Screen Turn-Taking Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT: Hearing Participant Pane */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    {activeSession.hearingParticipantName}
                  </h3>
                  <span className="text-[11px] text-blue-700">Hearing Partner — Speak into Microphone</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-300">
                Audio Input
              </span>
            </div>

            {/* Hearing STT Component */}
            <SpeechToTextPanel 
              onSendToSession={(text) => {
                addTurn({
                  senderRole: 'hearing_user',
                  senderName: activeSession.hearingParticipantName,
                  mode: 'speech_to_text',
                  content: text,
                  confidence: 0.96
                });
              }}
              compact
            />
          </div>

          {/* RIGHT: Deaf / HoH Participant Pane */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                  <Hand className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-teal-950">
                    {activeSession.deafParticipantName}
                  </h3>
                  <span className="text-[11px] text-teal-700">Deaf / HoH User — Visual Demonstration &amp; Sign Input</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-300">
                Visual &amp; Sign
              </span>
            </div>

            {/* Active Incoming Sign Demonstration for Hearing Partner's Turn */}
            {lastHearingTurn && (
              <div className="bg-white rounded-2xl border-2 border-teal-500/40 p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-navy-100 pb-2">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Incoming Speech Translated to ISL Demonstration</span>
                  </span>
                  <span className="text-[10px] font-mono text-navy-400">
                    {lastHearingTurn.timestamp}
                  </span>
                </div>

                <div className="text-xs text-navy-700 bg-navy-50/70 p-2.5 rounded-xl border border-navy-100">
                  <span className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block">
                    Spoken Caption:
                  </span>
                  <p className="font-semibold text-sm text-navy-900 mt-0.5">
                    "{lastHearingTurn.content}"
                  </p>
                </div>

                {matchedHearingSign ? (
                  <SignDemonstrationPlayer
                    phrase={matchedHearingSign}
                    isMirrorMode={isMirrorMode}
                    onToggleMirror={() => setIsMirrorMode(!isMirrorMode)}
                    playbackSpeed={playbackSpeed}
                    onChangeSpeed={setPlaybackSpeed}
                  />
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1 text-amber-950">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>ISL Demonstration Not Yet Available for this Phrase</span>
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      "{lastHearingTurn.content}" does not yet have a verified ISL dictionary entry. Please read the text caption above or respond using camera recognition below.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Phrase Buttons */}
            <div className="bg-white rounded-2xl border border-navy-100 p-4 space-y-2.5 shadow-sm">
              <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider block">
                Quick One-Tap Verified Responses:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuickPhrase(qr)}
                    className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-teal-900 text-xs font-semibold transition"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign to Text Camera Panel with Signer Confirmation */}
            <SignToTextPanel 
              onSendToSession={(sign) => {
                addTurn({
                  senderRole: 'deaf_user',
                  senderName: activeSession.deafParticipantName,
                  mode: 'sign_to_text',
                  content: sign,
                  confidence: 0.92,
                  isVerifiedSign: true
                });
                ttsService.speak(sign);
              }}
              compact
            />

            {/* Text Typing Fallback for Deaf Participant */}
            <form onSubmit={handleDeafSendMessage} className="flex gap-2">
              <input
                type="text"
                value={deafTypedMessage}
                onChange={(e) => setDeafTypedMessage(e.target.value)}
                placeholder="Type response (will speak out loud to hearing partner)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-navy-200 focus:ring-2 focus:ring-teal-500 text-xs text-navy-900 font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  if (deafTypedMessage.trim()) {
                    ttsService.speak(deafTypedMessage.trim());
                  }
                }}
                disabled={!deafTypedMessage.trim()}
                className="px-3 py-2.5 bg-white border border-navy-200 hover:bg-navy-50 disabled:opacity-40 text-navy-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                title="Preview voice output"
              >
                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                type="submit"
                disabled={!deafTypedMessage.trim()}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
