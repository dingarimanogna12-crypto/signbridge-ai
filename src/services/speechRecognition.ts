// Web Speech Recognition Service with comprehensive console telemetry,
// full W3C lifecycle diagnostics, robust result extraction, and pause tolerance.

export type SpeechStatus = 'Ready' | 'Listening' | 'Processing' | 'Error';

export interface SpeechDiagnostics {
  isSupported: boolean;
  browserApi: 'SpeechRecognition' | 'webkitSpeechRecognition' | 'None';
  selectedLanguage: string;
  micPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  onStartFired: boolean;
  onStartCount: number;
  lastStartTimestamp: string | null;
  onAudioStartFired: boolean;
  onSoundStartFired: boolean;
  onSpeechStartFired: boolean;
  onSpeechEndFired: boolean;
  onAudioEndFired: boolean;
  onResultFired: boolean;
  resultCount: number;
  lastResultTimestamp: string | null;
  lastRawResultsLength: number;
  lastResultIndex: number;
  lastFinalTranscript: string;
  lastInterimTranscript: string;
  lastConfidence: number;
  onNoMatchFired: boolean;
  lastError: string | null;
  lastErrorTimestamp: string | null;
  noSpeechCount: number;
  onEndCount: number;
  lastEndTimestamp: string | null;
}

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean, confidence: number) => void;
  onError: (error: string, isFatal?: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
  onStatusChange?: (status: SpeechStatus, message?: string) => void;
  onDiagnosticsUpdate?: (diagnostics: SpeechDiagnostics) => void;
}

export interface SpeechLanguageOption {
  code: string;
  label: string;
  region: string;
}

export const SUPPORTED_SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  { code: 'en-IN', label: 'English (India)', region: 'India' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)', region: 'India' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)', region: 'India' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)', region: 'India' },
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)', region: 'India' },
  { code: 'ml-IN', label: 'Malayalam (മലയാളം)', region: 'India' },
  { code: 'mr-IN', label: 'Marathi (मराठी)', region: 'India' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)', region: 'India' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)', region: 'India' },
  { code: 'en-US', label: 'English (US)', region: 'United States' },
  { code: 'en-GB', label: 'English (UK)', region: 'United Kingdom' },
];

export interface BrowserSupportInfo {
  isSupported: boolean;
  browserName: string;
  apiName: string;
  notes: string;
}

export function getBrowserSupportInfo(): BrowserSupportInfo {
  const hasNative = typeof window !== 'undefined' && !!(window as any).SpeechRecognition;
  const hasWebkit = typeof window !== 'undefined' && !!(window as any).webkitSpeechRecognition;
  const isSupported = hasNative || hasWebkit;
  const apiName = hasNative ? 'SpeechRecognition' : (hasWebkit ? 'webkitSpeechRecognition' : 'None');

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let browserName = 'Browser';
  if (ua.includes('Edg/')) browserName = 'Microsoft Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browserName = 'Google Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browserName = 'Apple Safari';
  else if (ua.includes('Firefox/')) browserName = 'Mozilla Firefox';

  let notes = '';
  if (isSupported) {
    notes = `Native Web Speech API (${apiName}) is supported on ${browserName}.`;
  } else {
    if (browserName.includes('Firefox')) {
      notes = 'Mozilla Firefox does not support the native Web Speech Recognition API by default. For live microphone speech recognition, please open SignBridge AI in Google Chrome or Microsoft Edge, or use the manual text fallback below.';
    } else {
      notes = `Web Speech Recognition API is not supported in ${browserName}. Please open SignBridge AI in Google Chrome or Microsoft Edge, or use the manual text fallback below.`;
    }
  }

  return { isSupported, browserName, apiName, notes };
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListeningIntent = false;
  private currentLanguage = 'en-IN';
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private status: SpeechStatus = 'Ready';
  private restartTimer: any = null;
  private lastEmittedFinalIndex = -1;

  // Diagnostics tracking
  private diagnostics: SpeechDiagnostics = {
    isSupported: false,
    browserApi: 'None',
    selectedLanguage: 'en-IN',
    micPermission: 'unknown',
    onStartFired: false,
    onStartCount: 0,
    lastStartTimestamp: null,
    onAudioStartFired: false,
    onSoundStartFired: false,
    onSpeechStartFired: false,
    onSpeechEndFired: false,
    onAudioEndFired: false,
    onResultFired: false,
    resultCount: 0,
    lastResultTimestamp: null,
    lastRawResultsLength: 0,
    lastResultIndex: 0,
    lastFinalTranscript: '',
    lastInterimTranscript: '',
    lastConfidence: 0.95,
    onNoMatchFired: false,
    lastError: null,
    lastErrorTimestamp: null,
    noSpeechCount: 0,
    onEndCount: 0,
    lastEndTimestamp: null,
  };

  constructor() {
    this.updateInitialSupportDiagnostics();
    this.checkPermissionStatus();
  }

  private updateInitialSupportDiagnostics() {
    const info = getBrowserSupportInfo();
    this.diagnostics.isSupported = info.isSupported;
    this.diagnostics.browserApi = info.apiName as any;
    this.diagnostics.selectedLanguage = this.currentLanguage;
  }

  private async checkPermissionStatus() {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as any });
        this.diagnostics.micPermission = status.state as any;
        this.emitDiagnostics();
        status.onchange = () => {
          this.diagnostics.micPermission = status.state as any;
          this.emitDiagnostics();
        };
      } catch {
        // Permissions query for microphone not supported on all browsers
      }
    }
  }

  private emitDiagnostics() {
    if (this.callbacks?.onDiagnosticsUpdate) {
      this.callbacks.onDiagnosticsUpdate({ ...this.diagnostics });
    }
  }

  public getDiagnostics(): SpeechDiagnostics {
    return { ...this.diagnostics };
  }

  private setStatus(newStatus: SpeechStatus, message?: string) {
    this.status = newStatus;
    if (this.callbacks?.onStatusChange) {
      this.callbacks.onStatusChange(newStatus, message);
    }
  }

  public getStatus(): SpeechStatus {
    return this.status;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }

  public setLanguage(langCode: string) {
    console.log('[SpeechRecognition] setLanguage called with:', langCode);
    this.currentLanguage = langCode;
    this.diagnostics.selectedLanguage = langCode;
    this.emitDiagnostics();

    if (this.recognition) {
      this.recognition.lang = langCode;
      if (this.isListeningIntent) {
        this.restartRecognition();
      }
    }
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  // Create a brand new SpeechRecognition instance for each listening cycle.
  private createRecognitionInstance(): any {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    // On mobile devices (Android Chrome, iOS Safari) and WebKit, continuous mode MUST be false.
    // In Android Chrome, setting continuous = true causes the underlying Android SpeechRecognizer
    // to hang, mute, or fail to fire onresult events.
    // Setting continuous = false with automatic restart on onend ensures real-time speech-to-text
    // with instantaneous onresult caption updates.
    const isMobileOrSafari = typeof navigator !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) ||
      ((navigator as any).userAgentData?.mobile === true) ||
      (typeof window !== 'undefined' && ('ontouchstart' in window && navigator.maxTouchPoints > 0 && !/Windows NT/i.test(navigator.userAgent)))
    );

    try {
      const rec = new SpeechRecognition();
      rec.continuous = !isMobileOrSafari;
      rec.interimResults = true;
      rec.lang = this.currentLanguage;
      rec.maxAlternatives = 1;

      if (typeof window !== 'undefined') {
        (window as any).__lastCreatedSpeechRecognition = rec;
      }

      this.lastEmittedFinalIndex = -1;

      // 1. onstart
      rec.onstart = () => {
        console.log('[SpeechRecognition:onstart] Service connected and active. Lang:', rec.lang, 'continuous:', rec.continuous);
        this.diagnostics.onStartFired = true;
        this.diagnostics.onStartCount++;
        this.diagnostics.lastStartTimestamp = new Date().toLocaleTimeString();
        this.emitDiagnostics();

        this.setStatus('Listening');
        this.callbacks?.onStart();
      };

      // 2. onaudiostart (where supported)
      rec.onaudiostart = () => {
        console.log('[SpeechRecognition:onaudiostart] Audio capture hardware has started.');
        this.diagnostics.onAudioStartFired = true;
        this.emitDiagnostics();
      };

      // 3. onsoundstart (where supported)
      rec.onsoundstart = () => {
        console.log('[SpeechRecognition:onsoundstart] Sound detected in audio stream.');
        this.diagnostics.onSoundStartFired = true;
        this.emitDiagnostics();
      };

      // 4. onspeechstart
      rec.onspeechstart = () => {
        console.log('[SpeechRecognition:onspeechstart] Vocal speech recognized in audio stream.');
        this.diagnostics.onSpeechStartFired = true;
        this.diagnostics.noSpeechCount = 0;
        this.emitDiagnostics();
        if (this.isListeningIntent) {
          this.setStatus('Processing');
        }
      };

      // 5. onspeechend
      rec.onspeechend = () => {
        console.log('[SpeechRecognition:onspeechend] Vocal speech segment ended.');
        this.diagnostics.onSpeechEndFired = true;
        this.emitDiagnostics();
        if (this.isListeningIntent) {
          this.setStatus('Listening');
        }
      };

      // 6. onsoundend
      rec.onsoundend = () => {
        console.log('[SpeechRecognition:onsoundend] Sound segment ended.');
        this.emitDiagnostics();
      };

      // 7. onaudioend
      rec.onaudioend = () => {
        console.log('[SpeechRecognition:onaudioend] Audio capture hardware stopped.');
        this.diagnostics.onAudioEndFired = true;
        this.emitDiagnostics();
      };

      // 8. onnomatch
      rec.onnomatch = () => {
        console.warn('[SpeechRecognition:onnomatch] Audio captured but no matching words were recognized.');
        this.diagnostics.onNoMatchFired = true;
        this.emitDiagnostics();
      };

      // 9. onresult - Full event inspection and extraction
      rec.onresult = (event: any) => {
        if (!this.callbacks) return;

        const resultsCount = event.results ? event.results.length : 0;
        const resIndex = event.resultIndex || 0;
        console.log(`[SpeechRecognition:onresult] Fired! Total results: ${resultsCount}, resultIndex: ${resIndex}`);

        this.diagnostics.onResultFired = true;
        this.diagnostics.resultCount++;
        this.diagnostics.lastResultTimestamp = new Date().toLocaleTimeString();
        this.diagnostics.lastRawResultsLength = resultsCount;
        this.diagnostics.lastResultIndex = resIndex;

        let interimAccumulator = '';

        // Process all results in the event
        for (let i = 0; i < resultsCount; ++i) {
          const res = event.results[i];
          if (!res || !res[0]) continue;
          const transcriptText = (res[0].transcript || '').trim();
          const isFinal = Boolean(res.isFinal);
          const conf = res[0].confidence || 0.95;

          console.log(`[SpeechRecognition:onresult] [Result ${i}]: isFinal=${isFinal}, conf=${conf}, transcript="${transcriptText}"`);

          if (isFinal) {
            // Only emit this final result if we haven't emitted it yet
            if (i > this.lastEmittedFinalIndex) {
              this.lastEmittedFinalIndex = i;
              if (transcriptText) {
                console.log(`[SpeechRecognition:onresult] >> Emitting NEW FINAL transcript: "${transcriptText}"`);
                this.diagnostics.lastFinalTranscript = transcriptText;
                this.diagnostics.lastConfidence = conf;
                this.diagnostics.lastInterimTranscript = '';
                this.callbacks.onResult(transcriptText, true, conf);
              }
            }
          } else {
            // Accumulate interim results for all active non-final phrases
            if (transcriptText) {
              interimAccumulator += (interimAccumulator ? ' ' : '') + transcriptText;
            }
          }
        }

        // Emit interim if non-empty
        if (interimAccumulator) {
          console.log(`[SpeechRecognition:onresult] >> Emitting LIVE INTERIM transcript: "${interimAccumulator}"`);
          this.diagnostics.lastInterimTranscript = interimAccumulator;
          this.setStatus('Processing');
          this.callbacks.onResult(interimAccumulator, false, 0.75);
        } else {
          this.diagnostics.lastInterimTranscript = '';
        }

        this.emitDiagnostics();
      };

      // 10. onerror
      rec.onerror = (event: any) => {
        const err = event.error || 'unknown';
        console.warn('[SpeechRecognition:onerror] Error event:', err, event.message || '');

        this.diagnostics.lastError = err;
        this.diagnostics.lastErrorTimestamp = new Date().toLocaleTimeString();
        this.emitDiagnostics();

        // Non-fatal pauses in continuous mode:
        if (err === 'no-speech') {
          console.log('[SpeechRecognition:onerror] No speech detected during pause — keeping listening active.');
          this.diagnostics.noSpeechCount++;
          this.emitDiagnostics();
          if (this.isListeningIntent) {
            this.setStatus('Listening');
          }
          return;
        }

        if (err === 'aborted') {
          console.log('[SpeechRecognition:onerror] Aborted event received.');
          return;
        }

        let friendlyMessage = 'Microphone error occurred.';
        let isFatal = false;

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          friendlyMessage = 'Microphone permission was denied. Please allow microphone access in your browser address bar settings to enable speech recognition.';
          isFatal = true;
        } else if (err === 'audio-capture') {
          friendlyMessage = 'No microphone device was detected on your computer. Please connect a microphone or headset and verify system sound settings.';
          isFatal = true;
        } else if (err === 'network') {
          friendlyMessage = 'Network connection error with Google speech recognition service. Please check your internet connection or proxy/VPN settings.';
          isFatal = false;
        }

        if (isFatal) {
          this.isListeningIntent = false;
          this.setStatus('Error', friendlyMessage);
          this.callbacks?.onError(friendlyMessage, true);
        } else {
          this.callbacks?.onError(friendlyMessage, false);
        }
      };

      // 11. onend
      rec.onend = () => {
        console.log('[SpeechRecognition:onend] Service disconnected. isListeningIntent =', this.isListeningIntent);
        this.diagnostics.onEndCount++;
        this.diagnostics.lastEndTimestamp = new Date().toLocaleTimeString();

        // If there was an active interim transcript when speech disconnected/paused,
        // commit it as a confirmed final result so words spoken before the pause are never lost!
        if (this.diagnostics.lastInterimTranscript && this.diagnostics.lastInterimTranscript.trim()) {
          const pending = this.diagnostics.lastInterimTranscript.trim();
          console.log('[SpeechRecognition:onend] Flushing active interim to final on pause:', pending);
          this.diagnostics.lastFinalTranscript = pending;
          this.diagnostics.lastInterimTranscript = '';
          this.callbacks?.onResult(pending, true, 0.90);
        }

        this.emitDiagnostics();

        // Null out this instance so next cycle creates a fresh one
        this.recognition = null;

        if (this.isListeningIntent) {
          console.log('[SpeechRecognition:onend] Scheduling automatic reconnect...');
          this.scheduleRestart();
        } else {
          this.setStatus('Ready');
          this.callbacks?.onEnd();
        }
      };

      return rec;
    } catch (e) {
      console.error('[SpeechRecognition] Exception constructing instance:', e);
      return null;
    }
  }

  private scheduleRestart() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
    }
    this.restartTimer = setTimeout(() => {
      if (!this.isListeningIntent) return;
      try {
        console.log('[SpeechRecognition] Recreating recognition instance for continuous session...');
        this.recognition = this.createRecognitionInstance();
        if (this.recognition) {
          this.recognition.start();
          this.setStatus('Listening');
        }
      } catch (err: any) {
        if (err.name !== 'InvalidStateError') {
          console.warn('[SpeechRecognition] Auto-restart encountered error:', err);
          if (err.name === 'NotAllowedError') {
            this.isListeningIntent = false;
            this.setStatus('Error', 'Microphone permission was denied.');
            this.callbacks?.onError('Microphone permission was denied.', true);
          } else {
            // Retry once after 200ms to allow mobile audio bus to settle
            setTimeout(() => {
              if (!this.isListeningIntent) return;
              try {
                this.recognition = this.createRecognitionInstance();
                this.recognition?.start();
                this.setStatus('Listening');
              } catch {
                this.isListeningIntent = false;
                this.setStatus('Ready');
                this.callbacks?.onEnd();
              }
            }, 200);
          }
        }
      }
    }, 40);
  }

  private restartRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public async startListening(callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
    console.log('[SpeechRecognition] startListening requested. Language:', this.currentLanguage);
    this.callbacks = callbacks;
    this.updateInitialSupportDiagnostics();
    this.emitDiagnostics();

    if (!this.isSupported()) {
      const info = getBrowserSupportInfo();
      this.setStatus('Error', info.notes);
      callbacks.onError(info.notes, true);
      return false;
    }

    this.isListeningIntent = true;

    // Halt any previous lingering instance
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    // Create a FRESH instance
    this.recognition = this.createRecognitionInstance();
    if (!this.recognition) {
      const msg = 'Failed to initialize browser speech recognition engine.';
      this.setStatus('Error', msg);
      callbacks.onError(msg, true);
      return false;
    }

    try {
      this.recognition.start();
      console.log('[SpeechRecognition] recognition.start() executed successfully.');
      this.setStatus('Listening');
      return true;
    } catch (err: any) {
      console.error('[SpeechRecognition] recognition.start() threw error:', err);
      if (err.name === 'InvalidStateError') {
        this.setStatus('Listening');
        return true;
      }
      this.isListeningIntent = false;
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
        : (err.message || 'Unable to access microphone.');
      this.setStatus('Error', msg);
      callbacks.onError(msg, true);
      return false;
    }
  }

  public stopListening() {
    console.log('[SpeechRecognition] stopListening requested by user.');
    this.isListeningIntent = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      // Note: we do not null out recognition immediately here,
      // letting any pending onresult and onend fire naturally.
    } else {
      this.setStatus('Ready');
      this.callbacks?.onEnd();
    }

    this.emitDiagnostics();
  }

  public getIsListening(): boolean {
    return this.isListeningIntent;
  }

  public clearLastInterimTranscript() {
    this.diagnostics.lastInterimTranscript = '';
  }
}

export const speechService = new SpeechRecognitionService();
if (typeof window !== 'undefined') {
  (window as any).__speechService = speechService;
}
