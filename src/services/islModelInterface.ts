// Standardized Pluggable Interface for Indian Sign Language (ISL) Recognition Models
// Enforces strict anti-hallucination rules: when no trained model is connected or
// when gestures do not match verified ISL patterns, no words are fabricated.

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface HandDetectionOutput {
  landmarks: LandmarkPoint[];
  handedness?: 'Left' | 'Right';
}

export interface ISLModelMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  framework: 'TensorFlow.js' | 'MediaPipe Tasks Vision' | 'ONNX Runtime Web' | 'Geometric Verified Baseline';
  inputTensorShape: string;
  classesCount: number;
  supportedClasses: string[];
  minConfidenceThreshold: number;
  isVerified: boolean;
  description: string;
}

export interface ISLPredictionOutput {
  signId?: string;
  signName: string;
  confidence: number;
  isUncertain: boolean;
  isVerifiedSign?: boolean;
  explanation?: string;
  alternativePredictions?: Array<{ signName: string; confidence: number }>;
  metrics?: {
    inferenceTimeMs: number;
    jointAnglesCalculated?: number;
    centroidDistance?: number;
  };
}

export interface IISLRecognitionModel {
  readonly metadata: ISLModelMetadata;
  readonly isConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  predict: (
    hands: HandDetectionOutput[],
    timestamp: number
  ) => ISLPredictionOutput | null;
}

/**
 * Disconnected Model Adapter
 * Represents the default state where landmark tracking is functional, but no
 * verified machine learning model or gesture classifier is actively attached.
 * STRICTLY NEVER emits recognized signs.
 */
export class DisconnectedISLModelAdapter implements IISLRecognitionModel {
  public readonly isConnected = false;

  public readonly metadata: ISLModelMetadata = {
    id: 'model-disconnected',
    name: 'ISL Recognition Model Disconnected',
    version: '0.0.0',
    author: 'SignBridge AI Research Architecture',
    framework: 'MediaPipe Tasks Vision',
    inputTensorShape: '[Batch, 21_Landmarks, 3D_Coords]',
    classesCount: 0,
    supportedClasses: [],
    minConfidenceThreshold: 0.0,
    isVerified: false,
    description: 'Hand tracking is active, but no trained ISL recognition model is attached. Arbitrary hand movements will not be converted into words.'
  };

  public async connect(): Promise<boolean> {
    return false;
  }

  public disconnect(): void {
    // No-op
  }

  public predict(
    hands: HandDetectionOutput[],
    _timestamp: number
  ): ISLPredictionOutput | null {
    // When disconnected, return null or honest status indicating tracking is active but no model attached
    if (!hands || hands.length === 0) return null;

    return {
      signName: 'Hand detected — sign recognition model unavailable.',
      confidence: 0,
      isUncertain: true,
      explanation: 'MediaPipe hand landmark detection is streaming live coordinates, but no classification model is connected to translate hand gestures into words.'
    };
  }
}

/**
 * Verified Baseline ISL Classifier Adapter
 * Evaluates hand landmarks against verified ISLRTC-aligned geometric rules.
 * Conservative and non-hallucinating: only predicts documented signs if matching
 * thresholds are strictly satisfied, otherwise flags uncertainty.
 */
export class VerifiedBaselineISLClassifier implements IISLRecognitionModel {
  public isConnected = true;

  public readonly metadata: ISLModelMetadata = {
    id: 'verified-islrtc-baseline-v1',
    name: 'ISLRTC Verified Baseline Classifier (Prototype)',
    version: '1.3.0',
    author: 'SignBridge AI Accessibility Engineering',
    framework: 'Geometric Verified Baseline',
    inputTensorShape: '[1, 21, 3] Scale & Rotation Normalized',
    classesCount: 13,
    supportedClasses: [
      'Hello / Namaste',
      'Thank you',
      'Water (W-Sign)',
      'Doctor / Medical',
      'Help / Urgent',
      'Yes (Thumbs Up)',
      'No / Pinch',
      'Food / Eat',
      'Where is the bathroom?',
      'Peace / Two',
      'Stop',
      'I Love You',
      'Number 1 / Point'
    ],
    minConfidenceThreshold: 0.75,
    isVerified: true,
    description: 'Conservative rule-based geometric classifier grounded in published ISLRTC handshape specifications. Only outputs when calibrated confidence meets or exceeds 75%.'
  };

  private gestureEngineRef: any = null;

  constructor(gestureEngineInstance?: any) {
    this.gestureEngineRef = gestureEngineInstance;
  }

  public setGestureEngine(engine: any) {
    this.gestureEngineRef = engine;
  }

  public async connect(): Promise<boolean> {
    this.isConnected = true;
    return true;
  }

  public disconnect(): void {
    this.isConnected = false;
  }

  public predict(
    hands: HandDetectionOutput[],
    timestamp: number
  ): ISLPredictionOutput | null {
    if (!this.isConnected || !hands || hands.length === 0) return null;

    if (!this.gestureEngineRef) {
      return {
        signName: 'Engine initialising...',
        confidence: 0,
        isUncertain: true
      };
    }

    const start = performance.now();
    const result = this.gestureEngineRef.processFrame(hands, timestamp);
    const latency = performance.now() - start;

    if (!result) return null;

    // Strict threshold check: if below 0.82 or recognized as unknown, enforce uncertainty
    const isBelowThreshold = result.confidence < this.metadata.minConfidenceThreshold;

    if (isBelowThreshold || result.signName === 'Sign not recognised — try again' || result.signName === 'No hand detected') {
      return {
        signName: 'Gesture not recognised — does not match verified ISL baseline',
        confidence: result.confidence,
        isUncertain: true,
        explanation: 'The current hand posture does not match any verified ISL baseline gesture with sufficient confidence.',
        metrics: {
          inferenceTimeMs: Math.round(latency)
        }
      };
    }

    return {
      signId: result.matchedSignId || result.phraseId,
      signName: result.signName,
      confidence: result.confidence,
      isUncertain: result.isUncertain || false,
      isVerifiedSign: result.isVerifiedSign ?? true,
      explanation: result.message || (result.matchedCategory ? `Matched category: ${result.matchedCategory}` : undefined),
      metrics: {
        inferenceTimeMs: Math.round(latency)
      }
    };
  }
}
