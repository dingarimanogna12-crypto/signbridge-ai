import { LandmarkPoint, HandDetectionOutput } from '../handLandmarkDetector';

export interface RecordedSampleFrame {
  timeOffsetMs: number;
  hands: {
    landmarks: LandmarkPoint[];
    handedness: 'Left' | 'Right';
  }[];
}

export interface LabeledSignSequence {
  id: string;
  signId: string;
  signLabel: string;
  signerId: string;
  recordedAt: string;
  frameCount: number;
  durationMs: number;
  frames: RecordedSampleFrame[];
}

export interface SignDatasetExport {
  version: string;
  datasetName: string;
  exportedAt: string;
  totalSamples: number;
  uniqueSigns: string[];
  notes: string;
  samples: LabeledSignSequence[];
}

export class DatasetManager {
  private isRecording = false;
  private currentSignLabel = '';
  private currentSignId = '';
  private recordingStartTime = 0;
  private currentFrames: RecordedSampleFrame[] = [];
  private recordedSamples: LabeledSignSequence[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getCurrentRecordingInfo(): { signLabel: string; frameCount: number; durationMs: number } | null {
    if (!this.isRecording) return null;
    return {
      signLabel: this.currentSignLabel,
      frameCount: this.currentFrames.length,
      durationMs: Date.now() - this.recordingStartTime
    };
  }

  public startRecording(signId: string, signLabel: string): void {
    this.isRecording = true;
    this.currentSignId = signId;
    this.currentSignLabel = signLabel;
    this.recordingStartTime = Date.now();
    this.currentFrames = [];
  }

  public captureFrame(hands: HandDetectionOutput[]): void {
    if (!this.isRecording) return;

    const timeOffsetMs = Date.now() - this.recordingStartTime;
    const frameHands = hands.map(h => ({
      landmarks: h.landmarks.map(p => ({ x: Number(p.x.toFixed(4)), y: Number(p.y.toFixed(4)), z: Number(p.z.toFixed(4)) })),
      handedness: (h.handedness || 'Right') as 'Left' | 'Right'
    }));

    this.currentFrames.push({
      timeOffsetMs,
      hands: frameHands
    });
  }

  public stopRecording(signerId = 'signer_local'): LabeledSignSequence | null {
    if (!this.isRecording) return null;
    this.isRecording = false;

    const durationMs = Date.now() - this.recordingStartTime;
    if (this.currentFrames.length < 5) {
      console.warn('Discarded recording: too few frames captured (< 5).');
      return null;
    }

    const sample: LabeledSignSequence = {
      id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      signId: this.currentSignId,
      signLabel: this.currentSignLabel,
      signerId,
      recordedAt: new Date().toISOString(),
      frameCount: this.currentFrames.length,
      durationMs,
      frames: [...this.currentFrames]
    };

    this.recordedSamples.push(sample);
    this.saveToStorage();
    return sample;
  }

  public getRecordedSamples(): LabeledSignSequence[] {
    return [...this.recordedSamples];
  }

  public deleteSample(id: string): void {
    this.recordedSamples = this.recordedSamples.filter(s => s.id !== id);
    this.saveToStorage();
  }

  public clearAllSamples(): void {
    this.recordedSamples = [];
    this.saveToStorage();
  }

  public exportDatasetAsJSON(): string {
    const uniqueSigns = Array.from(new Set(this.recordedSamples.map(s => s.signLabel)));
    const exportData: SignDatasetExport = {
      version: '1.0.0',
      datasetName: 'SignBridge AI ISL Landmark Sequence Dataset',
      exportedAt: new Date().toISOString(),
      totalSamples: this.recordedSamples.length,
      uniqueSigns,
      notes: 'Contains normalized 21-point 3D hand landmark coordinate trajectories. Train models using scripts/train_gesture_model.py.',
      samples: this.recordedSamples
    };

    return JSON.stringify(exportData, null, 2);
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Save metadata and count
        window.localStorage.setItem('signbridge_dataset_samples', JSON.stringify(this.recordedSamples));
      }
    } catch (e) {
      console.warn('Failed to save dataset samples to localStorage:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('signbridge_dataset_samples');
        if (raw) {
          this.recordedSamples = JSON.parse(raw);
        }
      }
    } catch {
      this.recordedSamples = [];
    }
  }
}

export const datasetManager = new DatasetManager();
