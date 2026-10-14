import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Send, 
  AlertCircle,
  Edit3,
  Save,
  Trash2,
  Globe,
  Info,
  CheckCircle2,
  Plus,
  Terminal,
  Activity,
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  speechService, 
  SUPPORTED_SPEECH_LANGUAGES,
  getBrowserSupportInfo,
  SpeechStatus,
  SpeechDiagnostics
} from '../../services/speechRecognition';
import { ttsService } from '../../services/textToSpeech';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSession } from '../../context/SessionContext';
import { PrivacyNoticeBadge } from '../common/PrivacyNoticeBadge';

export interface TranscriptItem {
  id: string;
  text: string;
  isEditing: boolean;
  timestamp: string;
  confidence: number;
}

interface SpeechToTextPanelProps {
  onSendToSession?: (text: string) => void;
  compact?: boolean;
}

export const SpeechToTextPanel: React.FC<SpeechToTextPanelProps> = ({ 
  onSendToSession,
  compact = false 
}) => {
  const { fontSize } = useAccessibility();
  const { activeSession, addTurn } = useSession();

  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('Ready');
  const [interimCaption, setInterimCaption] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [confidence, setConfidence] = useState<number>(0.95);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [copied, setCopied] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [showCompatibilityDetails, setShowCompatibilityDetails] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(true);

  // Live Dev Diagnostics
  const [diagnostics, setDiagnostics] = useState<SpeechDiagnostics>(speechService.getDiagnostics());

  // Manual fallback text input
  const [manualInputText, setManualInputText] = useState('');

  // Consolidated draft message buffer (always editable before sending)
  const [draftBuffer, setDraftBuffer] = useState('');

  const browserSupport = getBrowserSupportInfo();

  useEffect(() => {
    return () => {
      speechService.stopListening();
      ttsService.stop();
    };
  }, []);

  const handleStartListening = async () => {
    setErrorMessage(null);
    speechService.setLanguage(selectedLanguage);

    const started = await speechService.startListening({
      onStart: () => {
        setIsListening(true);
        setSpeechStatus('Listening');
        setErrorMessage(null);
      },
      onStatusChange: (status, msg) => {
        setSpeechStatus(status);
        if (msg) setErrorMessage(msg);
      },
      onDiagnosticsUpdate: (diag) => {
        setDiagnostics(diag);
      },
      onResult: (transcript, isFinal, conf) => {
        setConfidence(conf);
        const trimmed = transcript.trim();
        if (!trimmed) return;

        if (isFinal) {
          console.log('[SpeechToTextPanel] Received confirmed final transcript:', trimmed);
          setTranscripts(prev => {
            // Deduplication check: prevent appending duplicate sentence if already received
            const last = prev[prev.length - 1];
            if (last && last.text.trim().toLowerCase() === trimmed.toLowerCase()) {
              return prev;
            }

            const newItem: TranscriptItem = {
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              text: trimmed,
              isEditing: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              confidence: conf
            };

            return [...prev, newItem];
          });

          // Update editable draft buffer without duplicating
          setDraftBuffer(prev => {
            const trimmedPrev = prev.trim();
            if (!trimmedPrev) return trimmed;
            if (trimmedPrev.toLowerCase().endsWith(trimmed.toLowerCase())) return prev;
            return `${trimmedPrev} ${trimmed}`;
          });

          // Clear interim once final is committed
          setInterimCaption('');
          setSpeechStatus('Listening');
        } else {
          console.log('[SpeechToTextPanel] Received live interim transcript:', trimmed);
          // Update live interim caption display while speaking
          setInterimCaption(trimmed);
          setSpeechStatus('Processing');
        }
      },
      onError: (err, isFatal) => {
        setErrorMessage(err);
        if (isFatal) {
          setIsListening(false);
          setSpeechStatus('Error');
        }
      },
      onEnd: () => {
        setIsListening(false);
        setSpeechStatus('Ready');
      }
    });

    if (started) {
      setIsListening(true);
      setSpeechStatus('Listening');
    } else {
      setIsListening(false);
      setSpeechStatus('Error');
      if (!speechService.isSupported()) {
        setErrorMessage(browserSupport.notes);
      }
    }
  };

  const handleStopListening = () => {
    // If user clicks Stop Listening while an interim caption is still active,
    // commit it into confirmed transcripts so the spoken words are never lost!
    if (interimCaption.trim()) {
      const pendingText = interimCaption.trim();
      console.log('[SpeechToTextPanel] Committing active interim on stop:', pendingText);
      const newItem: TranscriptItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: pendingText,
        isEditing: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        confidence: 0.90
      };

      setTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last && last.text.trim().toLowerCase() === pendingText.toLowerCase()) {
          return prev;
        }
        return [...prev, newItem];
      });

      setDraftBuffer(prev => {
        const trimmedPrev = prev.trim();
        if (!trimmedPrev) return pendingText;
        if (trimmedPrev.toLowerCase().endsWith(pendingText.toLowerCase())) return prev;
        return `${trimmedPrev} ${pendingText}`;
      });

      setInterimCaption('');
    }

    speechService.stopListening();
    setIsListening(false);
    setSpeechStatus('Ready');
  };

  // Explicit Clear Captions button: clears confirmed items, interim, and draft buffer
  const handleClearCaptions = () => {
    ttsService.stop();
    setIsSpeakingTts(false);
    setTranscripts([]);
    setInterimCaption('');
    setDraftBuffer('');
    setErrorMessage(null);
  };

  // Manual fallback submission
  const handleAddManualText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToAdd = manualInputText.trim();
    if (!textToAdd) return;

    const newItem: TranscriptItem = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: textToAdd,
      isEditing: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      confidence: 1.0
    };

    setTranscripts(prev => [...prev, newItem]);
    setDraftBuffer(prev => prev.trim() ? `${prev.trim()} ${textToAdd}` : textToAdd);
    setManualInputText('');
  };

  const handleCopy = () => {
    const full = draftBuffer || transcripts.map(t => t.text).join(' ');
    if (!full) return;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEditItem = (id: string) => {
    setTranscripts(prev => prev.map(item => 
      item.id === id ? { ...item, isEditing: !item.isEditing } : item
    ));
  };

  const updateItemText = (id: string, newText: string) => {
    setTranscripts(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, text: newText } : item
      );
      setDraftBuffer(updated.map(i => i.text).join(' '));
      return updated;
    });
  };

  const deleteItem = (id: string) => {
    setTranscripts(prev => {
      const updated = prev.filter(item => item.id !== id);
      setDraftBuffer(updated.map(i => i.text).join(' '));
      return updated;
    });
  };

  const handleToggleSpeakTts = () => {
    if (isSpeakingTts) {
      ttsService.stop();
      setIsSpeakingTts(false);
      return;
    }

    const textToSpeak = draftBuffer || transcripts.map(t => t.text).join(' ');
    if (!textToSpeak.trim()) return;

    setIsSpeakingTts(true);
    ttsService.speak(textToSpeak, {
      lang: selectedLanguage,
      onEnd: () => setIsSpeakingTts(false),
      onError: () => setIsSpeakingTts(false)
    });
  };

  const handlePushToSession = () => {
    const textToSend = draftBuffer.trim() || transcripts.map(t => t.text).join(' ').trim();
    if (!textToSend) return;

    if (onSendToSession) {
      onSendToSession(textToSend);
    } else if (activeSession) {
      addTurn({
        senderRole: 'hearing_user',
        senderName: activeSession.hearingParticipantName,
        mode: 'speech_to_text',
        content: textToSend,
        confidence
      });
    }

    setDraftBuffer('');
    setTranscripts([]);
    setInterimCaption('');
  };

  const hasContent = transcripts.length > 0 || interimCaption.trim().length > 0 || draftBuffer.trim().length > 0;

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Top Header & Language Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-navy-900">
              Speech-to-Text Live Captioning
            </h2>
          </div>
          <p className="text-xs text-navy-500 mt-0.5">
            Real-time voice transcription into editable live captions for hearing participants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PrivacyNoticeBadge />
          
          <div className="flex items-center gap-1 bg-navy-50 border border-navy-200 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-navy-500 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const newLang = e.target.value;
                setSelectedLanguage(newLang);
                speechService.setLanguage(newLang);
              }}
              aria-label="Speech recognition language"
              className="text-xs font-semibold bg-transparent text-navy-800 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_SPEECH_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Honest Browser Compatibility Notice */}
      {!browserSupport.isSupported ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-900">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Browser Compatibility Notice: {browserSupport.browserName}
            </span>
            <button 
              onClick={() => setShowCompatibilityDetails(!showCompatibilityDetails)}
              className="text-[11px] underline font-semibold text-amber-800"
            >
              {showCompatibilityDetails ? 'Hide Details' : 'Learn More'}
            </button>
          </div>
          <p className="text-amber-800">
            {browserSupport.notes}
          </p>
          {showCompatibilityDetails && (
            <div className="mt-2 pt-2 border-t border-amber-200 text-[11px] space-y-1 text-amber-900">
              <p><strong>Supported Browsers:</strong> Google Chrome, Microsoft Edge, Opera, Safari.</p>
              <p><strong>Why is this happening?</strong> Mozilla Firefox disables the Web Speech Recognition API by default.</p>
              <p><strong>Practical Alternative:</strong> Use the <strong>Manual Text Fallback</strong> input below to type captions directly into the stream, or open this application in Google Chrome or Microsoft Edge.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] flex items-center justify-between gap-2 text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Native Speech Recognition ready ({browserSupport.apiName}) on {browserSupport.browserName}. Language: <strong>{selectedLanguage}</strong>.</span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            {speechStatus}
          </span>
        </div>
      )}

      {/* Controls Row: Start Listening, Stop Listening, Clear Captions, and Explicit Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-50/70 p-3.5 rounded-2xl border border-navy-100">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Explicit Start / Stop Listening Buttons */}
          {!isListening ? (
            <button
              onClick={handleStartListening}
              className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 active:scale-95 cursor-pointer"
              aria-label="Start Listening"
            >
              <Mic className="w-4 h-4" />
              <span>Start Listening</span>
            </button>
          ) : (
            <button
              onClick={handleStopListening}
              className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95 cursor-pointer"
              aria-label="Stop Listening"
            >
              <MicOff className="w-4 h-4" />
              <span>Stop Listening</span>
            </button>
          )}

          {/* Explicit Clear Captions Button */}
          <button
            onClick={handleClearCaptions}
            disabled={!hasContent}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 border border-navy-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-navy-700 transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-navy-700 disabled:hover:border-navy-200 cursor-pointer"
            aria-label="Clear Captions"
            title="Clear all captions and transcript"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Captions</span>
          </button>

          {/* Explicit Status Indicator Badge */}
          <div className="flex items-center gap-2 pl-1 sm:pl-3 border-l border-navy-200">
            <span className="text-xs font-semibold text-navy-500">Status:</span>
            {speechStatus === 'Listening' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Listening
              </span>
            )}
            {speechStatus === 'Processing' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Processing
              </span>
            )}
            {speechStatus === 'Ready' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Ready
              </span>
            )}
            {speechStatus === 'Error' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Error
              </span>
            )}
          </div>
        </div>

        {/* Secondary Action buttons: Copy & Playback TTS */}
        <div className="flex items-center gap-2">
          {hasContent && (
            <>
              <button
                onClick={handleToggleSpeakTts}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isSpeakingTts
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-navy-200 bg-white hover:bg-navy-50 text-navy-700'
                }`}
                title={isSpeakingTts ? 'Stop audio playback' : 'Read captions out loud via TTS'}
              >
                {isSpeakingTts ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Speak Out Loud</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white hover:bg-navy-50 text-navy-600 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                title="Copy caption text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Subtitle Display Area */}
      <div 
        className={`relative w-full rounded-2xl border-2 transition-all p-5 min-h-[180px] flex flex-col justify-between ${
          isListening 
            ? 'border-teal-500 bg-teal-50/20 shadow-md shadow-teal-500/5' 
            : 'border-navy-100 bg-navy-50/40'
        }`}
      >
        <div 
          className="space-y-3 overflow-y-auto max-h-[320px] pr-2"
          role="region"
          aria-live="polite"
          aria-label="Real-time Speech Captions"
        >
          {/* STATE A: Idle state before listening starts */}
          {!isListening && transcripts.length === 0 && !interimCaption && (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-navy-400">
              <Mic className="w-10 h-10 mb-2 opacity-40 text-navy-500" />
              <p className="text-sm font-bold text-navy-700">Microphone Ready</p>
              <p className="text-xs max-w-sm mt-1 text-navy-500">
                Click <strong>"Start Listening"</strong> above to speak into your microphone and generate real-time captions.
              </p>
            </div>
          )}

          {/* STATE B: Active listening waiting for first spoken words */}
          {isListening && transcripts.length === 0 && !interimCaption && (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-teal-700 animate-fade-in">
              <div className="relative mb-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center animate-pulse">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-sm font-bold text-teal-900">Listening for your voice...</p>
              <p className="text-xs max-w-sm mt-1 text-teal-700">
                Speak clearly into your microphone in <strong>{selectedLanguage}</strong>. Captions will appear live below as you speak.
              </p>
            </div>
          )}

          {/* STATE C: Confirmed & Live Captions */}
          {(transcripts.length > 0 || interimCaption) && (
            <div className="space-y-2.5">
              {/* Confirmed / Final Captions (Preserved across pauses/restarts) */}
              {transcripts.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative bg-white/95 p-3.5 rounded-xl border border-navy-150 hover:border-teal-300 transition shadow-xs"
                >
                  {item.isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItemText(item.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-teal-500 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => toggleEditItem(item.id)}
                          className="px-2.5 py-1 bg-teal-600 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p 
                        className={`text-navy-900 font-semibold leading-relaxed flex-1 ${
                          fontSize === 'extra-large' ? 'text-2xl font-bold' : fontSize === 'large' ? 'text-xl font-semibold' : 'text-base'
                        }`}
                      >
                        {item.text}
                      </p>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => toggleEditItem(item.id)}
                          className="p-1 hover:bg-navy-100 rounded text-navy-500 hover:text-navy-800 cursor-pointer"
                          title="Edit this sentence"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 hover:bg-rose-100 rounded text-navy-400 hover:text-rose-600 cursor-pointer"
                          title="Delete sentence"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-navy-400 pt-1 mt-1 border-t border-navy-50 font-mono">
                    <span>{item.timestamp}</span>
                    <span className="text-emerald-700 font-semibold font-sans">{Math.round(item.confidence * 100)}% confidence</span>
                  </div>
                </div>
              ))}

              {/* Temporary / Interim Caption (Clearly distinguished while speaking) */}
              {interimCaption && (
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 shadow-xs animate-fade-in">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Live interim caption (speaking in progress)...</span>
                  </div>
                  <p 
                    className={`text-amber-950 italic font-medium leading-relaxed ${
                      fontSize === 'extra-large' ? 'text-2xl font-bold' : fontSize === 'large' ? 'text-xl font-semibold' : 'text-base'
                    }`}
                  >
                    "{interimCaption}"
                    <span className="inline-block w-1.5 h-4 bg-amber-500 ml-1.5 animate-pulse align-middle" />
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editable Consolidated Draft Box */}
      <div className="bg-navy-50/50 p-3.5 rounded-2xl border border-navy-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Editable Message Draft (Review and edit before sending):</span>
          </span>
          <span className="text-[11px] text-navy-500 font-mono">
            {draftBuffer.length} characters
          </span>
        </div>

        <textarea
          value={draftBuffer}
          onChange={(e) => setDraftBuffer(e.target.value)}
          placeholder="Recognized words appear here automatically. You can edit, correct words, or type additional notes before sending..."
          rows={2}
          className="w-full px-3 py-2 bg-white rounded-xl border border-navy-200 text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="text-[11px] text-navy-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-navy-400" />
            <span>Double-check terminology and numbers before confirming.</span>
          </div>

          {(onSendToSession || activeSession) && (
            <button
              onClick={handlePushToSession}
              disabled={!draftBuffer.trim()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Conversation Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Banner & Permission Recovery Guidance */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900">{errorMessage}</p>
              {errorMessage.toLowerCase().includes('not-allowed') || errorMessage.toLowerCase().includes('permission') ? (
                <div className="mt-2 text-[11px] text-rose-800 bg-white/80 p-2.5 rounded-lg border border-rose-200 space-y-1">
                  <p className="font-semibold text-rose-900">How to restore microphone permission:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-rose-700">
                    <li>Click the <strong>Lock / Settings icon</strong> in your browser's address bar.</li>
                    <li>Set <strong>Microphone</strong> access to <strong>Allow</strong>.</li>
                    <li>Click <strong>Start Listening</strong> again to resume voice captioning.</li>
                  </ol>
                </div>
              ) : errorMessage.toLowerCase().includes('audio-capture') ? (
                <p className="text-rose-700 mt-1">
                  Please plug in a microphone or headset and verify system sound settings.
                </p>
              ) : errorMessage.toLowerCase().includes('network') ? (
                <p className="text-rose-700 mt-1">
                  Google Speech API could not be reached. Ensure internet access is active and no firewall/proxy blocks speech services.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Temporary Development Diagnostics Panel (Requirement 8) */}
      <div className="border border-navy-200 rounded-xl bg-slate-900 text-slate-100 text-xs overflow-hidden">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-800 hover:bg-slate-750 font-mono font-bold text-slate-200 border-b border-slate-700 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>Development Diagnostics (Live Web Speech Events)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold ${
              diagnostics.onResultFired ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {diagnostics.onResultFired ? `${diagnostics.resultCount} onresult events` : 'Waiting for onresult'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px] font-sans">{showDiagnostics ? 'Hide' : 'Show'}</span>
            {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showDiagnostics && (
          <div className="p-3.5 font-mono space-y-2 text-[11px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Speech API Engine</span>
                <span className={diagnostics.isSupported ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {diagnostics.isSupported ? `Supported (${diagnostics.browserApi})` : 'Unsupported'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Permission: <strong className="text-slate-200">{diagnostics.micPermission}</strong></span>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Active Language</span>
                <span className="text-teal-300 font-bold">
                  {diagnostics.selectedLanguage}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Speech Status: <strong className="text-emerald-300">{speechStatus}</strong></span>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">onstart Event</span>
                <span className={diagnostics.onStartFired ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {diagnostics.onStartFired ? `Fired (Count: ${diagnostics.onStartCount}, ${diagnostics.lastStartTimestamp})` : 'Not fired yet'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Audio Start: <strong className={diagnostics.onAudioStartFired ? 'text-emerald-400' : 'text-slate-400'}>{diagnostics.onAudioStartFired ? 'Yes' : 'No'}</strong>
                </span>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">onspeechstart (Voice Detected)</span>
                <span className={diagnostics.onSpeechStartFired ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {diagnostics.onSpeechStartFired ? 'Voice acoustic energy detected' : 'Waiting for voice...'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Sound Start: <strong className={diagnostics.onSoundStartFired ? 'text-emerald-400' : 'text-slate-400'}>{diagnostics.onSoundStartFired ? 'Yes' : 'No'}</strong>
                </span>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">onresult Event</span>
                <span className={diagnostics.onResultFired ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {diagnostics.onResultFired ? `Fired (${diagnostics.resultCount} events, ${diagnostics.lastResultTimestamp})` : 'Not fired yet'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Results array length: <strong className="text-slate-200">{diagnostics.lastRawResultsLength}</strong>
                </span>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">onend & onnomatch</span>
                <span className="text-slate-300">
                  onend Count: <strong>{diagnostics.onEndCount}</strong> {diagnostics.lastEndTimestamp ? `(${diagnostics.lastEndTimestamp})` : ''}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  onnomatch: <strong className={diagnostics.onNoMatchFired ? 'text-amber-400' : 'text-slate-400'}>{diagnostics.onNoMatchFired ? 'Yes' : 'No'}</strong>
                </span>
              </div>
            </div>

            {/* Latest raw transcript info */}
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 space-y-1">
              <span className="text-slate-400 block text-[10px]">Latest Raw Transcript Extracted from onresult:</span>
              <div className="text-slate-200">
                {diagnostics.lastFinalTranscript ? (
                  <p><span className="text-emerald-400 font-semibold">[Final]:</span> "{diagnostics.lastFinalTranscript}"</p>
                ) : null}
                {diagnostics.lastInterimTranscript ? (
                  <p><span className="text-amber-400 font-semibold">[Interim]:</span> "{diagnostics.lastInterimTranscript}"</p>
                ) : null}
                {!diagnostics.lastFinalTranscript && !diagnostics.lastInterimTranscript ? (
                  <span className="text-slate-500 italic">No transcript received yet. Speak into your microphone after clicking Start Listening.</span>
                ) : null}
              </div>
            </div>

            {/* Error telemetry if any */}
            {diagnostics.lastError && (
              <div className="bg-rose-950/60 p-2 rounded border border-rose-800/60 text-rose-300">
                <span>Last Error: <strong>{diagnostics.lastError}</strong> at {diagnostics.lastErrorTimestamp}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Text Fallback */}
      <div className="pt-2 border-t border-navy-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-navy-700 font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            Manual Text Fallback (Accessible text input):
          </span>
          <span className="text-[11px] text-navy-400">
            For environments without a microphone or unsupported browsers
          </span>
        </div>

        <form onSubmit={handleAddManualText} className="flex gap-2">
          <input
            type="text"
            value={manualInputText}
            onChange={(e) => setManualInputText(e.target.value)}
            placeholder="Type spoken sentence manually (e.g. 'Hello, how can I help you today?')..."
            className="flex-1 px-3 py-2 bg-white rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
          <button
            type="submit"
            disabled={!manualInputText.trim()}
            className="px-3.5 py-2 bg-navy-100 hover:bg-teal-600 hover:text-white text-navy-800 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Captions</span>
          </button>
        </form>
      </div>
    </div>
  );
};
