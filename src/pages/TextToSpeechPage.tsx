import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Sliders, 
  Globe, 
  History, 
  Clock, 
  ShieldCheck, 
  Info, 
  HeartPulse, 
  AlertTriangle,
  MessagesSquare,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { ttsService, SpeakOptions } from '../services/textToSpeech';
import { useSession } from '../context/SessionContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { PrivacyNoticeBadge } from '../components/common/PrivacyNoticeBadge';

interface SpokenHistoryItem {
  id: string;
  text: string;
  timestamp: string;
  voiceName: string;
}

const TTS_PRESETS = [
  {
    category: 'Medical & Healthcare',
    icon: HeartPulse,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    phrases: [
      'I am experiencing severe abdominal discomfort since yesterday.',
      'I am Deaf and communicating via SignBridge AI text-to-speech.',
      'Are there any side effects with this prescribed medication?',
      'Please provide written instructions for the dosage timing.',
      'I am allergic to penicillin and sulfa antibiotics.'
    ]
  },
  {
    category: 'Emergency & Urgent',
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    phrases: [
      'Please call an emergency ambulance right now!',
      'I need urgent assistance finding the emergency care unit.',
      'Please contact my emergency contact immediately.',
      'I feel dizzy and need a wheelchair right away.'
    ]
  },
  {
    category: 'Daily Courtesy & Transit',
    icon: Sparkles,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    phrases: [
      'Hello, nice to meet you. Thank you for your assistance.',
      'Could you please speak into the microphone for live captions?',
      'Where is platform number 3 for the outgoing express train?',
      'Could you please write down the counter number for me?'
    ]
  }
];

export const TextToSpeechPage: React.FC = () => {
  const { fontSize } = useAccessibility();
  const { activeSession, addTurn } = useSession();

  const [inputText, setInputText] = useState('Hello, I am communicating using SignBridge AI voice synthesis. Thank you for your patience.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionSent, setSessionSent] = useState(false);

  // Audio Customization
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [rate, setRate] = useState<number>(0.95);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);

  // History
  const [history, setHistory] = useState<SpokenHistoryItem[]>([]);

  const isTtsSupported = ttsService.isSupported();

  useEffect(() => {
    if (!isTtsSupported) return;

    // Load voices
    const updateVoices = (loadedVoices: SpeechSynthesisVoice[]) => {
      setVoices(loadedVoices);
      if (loadedVoices.length > 0 && !selectedVoiceUri) {
        // Prefer Indian English or high quality English voice
        const preferred = loadedVoices.find(v => 
          v.lang === 'en-IN' || 
          v.name.includes('India') || 
          v.lang === 'en-GB' || 
          v.lang === 'en-US'
        );
        setSelectedVoiceUri(preferred ? preferred.voiceURI : loadedVoices[0].voiceURI);
      }
    };

    updateVoices(ttsService.getVoices());
    const cleanup = ttsService.onVoicesChanged(updateVoices);

    return () => {
      cleanup();
      ttsService.stop();
    };
  }, [isTtsSupported]);

  const getSelectedVoice = (): SpeechSynthesisVoice | null => {
    return voices.find(v => v.voiceURI === selectedVoiceUri) || null;
  };

  const handleSpeak = (textToSpeak?: string) => {
    const text = (textToSpeak || inputText).trim();
    if (!text) return;

    const chosenVoice = getSelectedVoice();

    setIsSpeaking(true);
    setIsPaused(false);

    const speakOptions: SpeakOptions = {
      rate,
      pitch,
      volume,
      voice: chosenVoice,
      lang: chosenVoice?.lang || 'en-IN',
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: (err) => {
        console.warn('Speech synthesis error:', err);
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };

    ttsService.speak(text, speakOptions);

    // Record into history if not already top item
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => {
      if (prev.length > 0 && prev[0].text === text) return prev;
      return [
        {
          id: `tts-${Date.now()}`,
          text,
          timestamp: timestampStr,
          voiceName: chosenVoice?.name || 'Default System Voice'
        },
        ...prev.slice(0, 19) // keep recent 20
      ];
    });
  };

  const handleStop = () => {
    ttsService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handlePause = () => {
    ttsService.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    ttsService.resume();
    setIsPaused(false);
  };

  const handleCopy = (text?: string) => {
    const target = text || inputText;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToSession = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    if (activeSession) {
      addTurn({
        senderRole: 'deaf_user',
        senderName: activeSession.deafParticipantName,
        mode: 'text_typed',
        content,
        confidence: 1.0
      });
      setSessionSent(true);
      setTimeout(() => setSessionSent(false), 2500);
    } else {
      // Speak and copy if no session
      handleSpeak(content);
    }
  };

  const handleSelectPreset = (phrase: string) => {
    setInputText(phrase);
    handleSpeak(phrase);
  };

  const handleResetSliders = () => {
    setRate(0.95);
    setPitch(1.0);
    setVolume(1.0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-7 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>Inclusive Speech Synthesis</span>
          </div>
          <div className="flex items-center gap-2">
            <PrivacyNoticeBadge />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {voices.length > 0 ? `${voices.length} System Voices` : 'Web Speech Engine'}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-navy-900 tracking-tight">
          Text to Speech Voice Synthesizer
        </h2>
        <p className="text-xs sm:text-sm text-navy-600 max-w-3xl leading-relaxed">
          Type or select any phrase to speak out loud in natural speech. Designed for Deaf and non-verbal communicators to express thoughts, medical symptoms, and instructions directly to hearing partners.
        </p>
      </div>

      {/* Browser Support Check Banner */}
      {!isTtsSupported && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-rose-950">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Web Speech Synthesis Not Supported</span>
          </p>
          <p className="text-rose-800">
            Your current browser does not support the Web Speech API (<code>window.speechSynthesis</code>). Please try Google Chrome, Microsoft Edge, or Apple Safari for full audio speech synthesis.
          </p>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input & Playback Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Primary Textarea Card */}
          <div className="bg-white rounded-3xl border border-navy-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="tts-input" 
                className="text-xs font-bold text-navy-800 flex items-center gap-1.5"
              >
                <span>Message to Speak:</span>
              </label>

              <div className="flex items-center gap-2 text-[11px] text-navy-500 font-mono">
                <span>{inputText.length} chars</span>
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="text-navy-400 hover:text-rose-600 transition underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="tts-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type any phrase, symptoms, questions, or message to read aloud to your hearing partner..."
              rows={4}
              className={`w-full p-4 rounded-2xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-navy-900 resize-none transition ${
                fontSize === 'extra-large' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-sm'
              }`}
            />

            {/* Speaking State Visualizer */}
            {isSpeaking && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2 text-teal-800 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                  <span>{isPaused ? 'Speech Paused' : 'Speaking Aloud...'}</span>
                  {/* Wave bars */}
                  {!isPaused && (
                    <div className="flex items-end gap-0.5 h-4 ml-2">
                      {[0.3, 0.7, 1.0, 0.5, 0.9, 0.4, 0.8].map((mult, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-teal-600 rounded-full animate-pulse"
                          style={{ height: `${Math.round(16 * mult)}px`, animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-teal-700 font-mono">
                  {getSelectedVoice()?.name || 'Standard Voice'}
                </span>
              </div>
            )}

            {/* Playback Button Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {!isSpeaking ? (
                  <button
                    onClick={() => handleSpeak()}
                    disabled={!inputText.trim()}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md shadow-teal-600/20 transform hover:-translate-y-0.5"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Speak Out Loud</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleStop}
                      className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md shadow-rose-600/20"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Speech</span>
                    </button>

                    {isPaused ? (
                      <button
                        onClick={handleResume}
                        className="px-4 py-3 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition"
                      >
                        <Play className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        onClick={handlePause}
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Auxiliary actions: Copy and Session Push */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy()}
                  disabled={!inputText.trim()}
                  className="px-3 py-2.5 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Copy text to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {activeSession && (
                  <button
                    onClick={() => handleSendToSession()}
                    disabled={!inputText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Send this message to the active 2-Way conversation session"
                  >
                    {sessionSent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{sessionSent ? 'Sent to Session!' : 'Send to Session'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Voice Tuning & Sliders Card */}
          <div className="bg-white rounded-3xl border border-navy-100 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-navy-900">Voice Modulation Settings</h3>
              </div>
              <button
                onClick={handleResetSliders}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Voice Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-700 flex items-center justify-between">
                <span>System Voice:</span>
                <span className="text-[11px] text-navy-500 font-normal">
                  {voices.length} voices found
                </span>
              </label>
              <select
                value={selectedVoiceUri}
                onChange={(e) => setSelectedVoiceUri(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-xs sm:text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {voices.length === 0 ? (
                  <option value="">Standard Browser Synthesizer</option>
                ) : (
                  voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.default ? '— Default' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Rate / Speed */}
              <div className="space-y-1.5 bg-navy-50/50 p-3 rounded-2xl border border-navy-100">
                <div className="flex justify-between text-xs font-bold text-navy-800">
                  <span>Speed</span>
                  <span className="text-teal-700 font-mono">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.75"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-navy-400">
                  <span>Slow (0.5x)</span>
                  <span>Fast (1.75x)</span>
                </div>
              </div>

              {/* Pitch */}
              <div className="space-y-1.5 bg-navy-50/50 p-3 rounded-2xl border border-navy-100">
                <div className="flex justify-between text-xs font-bold text-navy-800">
                  <span>Pitch</span>
                  <span className="text-teal-700 font-mono">{pitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-navy-400">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-1.5 bg-navy-50/50 p-3 rounded-2xl border border-navy-100">
                <div className="flex justify-between text-xs font-bold text-navy-800">
                  <span>Volume</span>
                  <span className="text-teal-700 font-mono">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-navy-400">
                  <span>Quiet</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spoken History Card */}
          <div className="bg-white rounded-3xl border border-navy-100 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-navy-900">Recent Spoken History</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] text-navy-400 hover:text-rose-600 transition"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-navy-400 text-xs">
                <p>No messages spoken yet in this session.</p>
                <p className="text-[11px] mt-0.5">Click <strong>Speak Out Loud</strong> or select a phrase below.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-navy-50/60 rounded-2xl border border-navy-100 flex items-center justify-between gap-3 text-xs hover:border-teal-200 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 truncate">
                        "{item.text}"
                      </p>
                      <span className="text-[10px] text-navy-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.timestamp} • {item.voiceName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSpeak(item.text)}
                        className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition"
                        title="Speak again"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(item.text)}
                        className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-500 transition"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {activeSession && (
                        <button
                          onClick={() => handleSendToSession(item.text)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                          title="Send to 2-Way session"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Triage & Category Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-navy-900 tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Quick Triage &amp; Emergency Presets</span>
            </h3>
            <span className="text-[11px] text-navy-500 font-medium">Click to Speak</span>
          </div>

          <div className="space-y-4">
            {TTS_PRESETS.map((cat) => {
              const Icon = cat.icon;

              return (
                <div 
                  key={cat.category} 
                  className="bg-white rounded-3xl border border-navy-100 p-4 sm:p-5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center gap-2 border-b border-navy-100 pb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-navy-900">
                      {cat.category}
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    {cat.phrases.map((phrase, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreset(phrase)}
                        className="w-full text-left p-2.5 rounded-xl border border-navy-100 hover:border-teal-300 hover:bg-teal-50/40 text-navy-800 text-xs font-medium transition flex items-center justify-between group"
                      >
                        <span className="line-clamp-2 pr-2 leading-relaxed">
                          "{phrase}"
                        </span>
                        <Volume2 className="w-3.5 h-3.5 text-navy-300 group-hover:text-teal-600 shrink-0 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guidance Cards */}
          <div className="p-4 bg-navy-900 text-white rounded-3xl space-y-2 shadow-sm">
            <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Client-Side Privacy Guarantee</span>
            </h4>
            <p className="text-[11px] text-navy-200 leading-relaxed">
              Synthesized audio runs directly via your operating system's native text-to-speech driver. Speech is not recorded or sent to any remote server.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
