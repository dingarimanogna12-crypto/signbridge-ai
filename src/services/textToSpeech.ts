// Text-to-Speech (TTS) Service using Web Speech API for Hearing Partners

export interface SpeakOptions {
  rate?: number;     // 0.5 to 2.0 (default: 0.95)
  pitch?: number;    // 0.5 to 2.0 (default: 1.0)
  volume?: number;   // 0.0 to 1.0 (default: 1.0)
  voice?: SpeechSynthesisVoice | null;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class TextToSpeechService {
  private isSpeaking = false;
  private isPaused = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceListeners: ((voices: SpeechSynthesisVoice[]) => void)[] = [];

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (!this.isSupported()) return;

    this.voices = window.speechSynthesis.getVoices();
    if (this.voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
        this.voiceListeners.forEach(fn => fn(this.voices));
      };
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    if (this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public onVoicesChanged(listener: (voices: SpeechSynthesisVoice[]) => void): () => void {
    this.voiceListeners.push(listener);
    if (this.voices.length > 0) {
      listener(this.voices);
    }
    return () => {
      this.voiceListeners = this.voiceListeners.filter(l => l !== listener);
    };
  }

  public speak(text: string, options?: SpeakOptions | (() => void)): boolean {
    if (!this.isSupported()) {
      console.warn('Speech synthesis not supported in this browser.');
      if (typeof options === 'function') options();
      else if (options?.onEnd) options.onEnd();
      return false;
    }

    if (!text || !text.trim()) return false;

    // Normalize backward-compatible single callback signature
    const opts: SpeakOptions = typeof options === 'function' 
      ? { onEnd: options } 
      : (options || {});

    // Cancel any previous utterance to avoid queuing lag
    window.speechSynthesis.cancel();
    this.isPaused = false;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = opts.rate ?? 0.95;
    utterance.pitch = opts.pitch ?? 1.0;
    utterance.volume = opts.volume ?? 1.0;
    utterance.lang = opts.lang || 'en-IN';

    // If explicit voice provided, use it
    if (opts.voice) {
      utterance.voice = opts.voice;
    } else {
      // Find preferred Indian English or natural English voice
      const allVoices = this.getVoices();
      const preferred = allVoices.find(v => 
        v.lang === 'en-IN' || 
        v.name.includes('India') || 
        v.lang === 'en-GB' || 
        v.lang === 'en-US'
      );
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      if (opts.onStart) opts.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      if (opts.onEnd) opts.onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      console.warn('TTS utterance error:', e);
      if (opts.onError) opts.onError(e);
      if (opts.onEnd) opts.onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  public pause(): void {
    if (this.isSupported() && this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  public resume(): void {
    if (this.isSupported() && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking && !this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const ttsService = new TextToSpeechService();
