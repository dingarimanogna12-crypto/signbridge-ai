import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { RecognitionResult } from '../types';
import { gestureEngine } from './recognition/gestureEngine';
import { signVocabulary, SignVocabularyItem } from './recognition/signVocabulary';
import { 
  LandmarkPoint, 
  HandDetectionOutput, 
  IISLRecognitionModel, 
  DisconnectedISLModelAdapter, 
  VerifiedBaselineISLClassifier 
} from './islModelInterface';

export type { LandmarkPoint, HandDetectionOutput } from './islModelInterface';

export interface HandTrackingStatus {
  isHandDetected: boolean;
  landmarkCount: number;
  handedness?: 'Left' | 'Right';
  isModelReady: boolean;
  fps?: number;
}

export interface DetectionDiagnostics {
  cameraStatus: 'idle' | 'starting' | 'active' | 'error' | 'stopped';
  mediaPipeStatus: 'not_loaded' | 'loading' | 'ready' | 'failed';
  videoDimensions: { width: number; height: number };
  framesProcessed: number;
  lastDetectionTime: number | null;
  handsCount: number;
  lastError: string | null;
  isSimulated?: boolean;
  activeModelName?: string;
  isModelConnected?: boolean;
}

export type DetectionCallback = (
  result: RecognitionResult | null,
  hands: HandDetectionOutput[],
  status: HandTrackingStatus,
  diagnostics?: DetectionDiagnostics
) => void;

// Extensible vocabulary of Indian Sign Language signs supported by the recognition engine
export const SUPPORTED_SIGNS_LIST: SignVocabularyItem[] = signVocabulary.getAll();

export class HandLandmarkDetector {
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private isRunning = false;
  private animFrameId: number | null = null;
  private isModelReady = false;
  private simulationTimer: any = null;
  private isSimulating = false;

  // Active Pluggable Model: Default is DisconnectedISLModelAdapter (honest non-hallucinating state)
  private activeModel: IISLRecognitionModel = new DisconnectedISLModelAdapter();

  // Diagnostics and performance state
  private isProcessingFrame = false;
  private framesProcessed = 0;
  private lastDetectionTime: number | null = null;
  private lastVideoTime = -1;
  private lastError: string | null = null;
  private mediaPipeStatus: 'not_loaded' | 'loading' | 'ready' | 'failed' = 'not_loaded';
  private cameraStatus: 'idle' | 'starting' | 'active' | 'error' | 'stopped' = 'idle';
  private videoDimensions = { width: 0, height: 0 };
  private fpsCounter = 0;
  private lastFpsTimestamp = performance.now();
  private currentFps = 0;

  constructor() {
    // Instantiate verified classifier with gestureEngine instance
    const verifiedClassifier = new VerifiedBaselineISLClassifier(gestureEngine);
    // Keep default as DisconnectedISLModelAdapter to satisfy explicit user requirement
    this.activeModel = new DisconnectedISLModelAdapter();
  }

  public getModel(): IISLRecognitionModel {
    return this.activeModel;
  }

  public setModel(model: IISLRecognitionModel): void {
    this.activeModel = model;
  }

  public getDiagnostics(): DetectionDiagnostics {
    return {
      cameraStatus: this.cameraStatus,
      mediaPipeStatus: this.mediaPipeStatus,
      videoDimensions: { ...this.videoDimensions },
      framesProcessed: this.framesProcessed,
      lastDetectionTime: this.lastDetectionTime,
      handsCount: 0,
      lastError: this.lastError,
      activeModelName: this.activeModel.metadata.name,
      isModelConnected: this.activeModel.isConnected
    };
  }

  /**
   * Initializes MediaPipe Tasks Vision HandLandmarker using the official NPM package.
   * Downloads WebAssembly fileset and initializes the HandLandmarker task graph.
   * Automatically attempts GPU acceleration with a safe fallback to CPU.
   */
  public async ensureMediaPipeReady(): Promise<boolean> {
    if (this.handLandmarker && this.isModelReady) {
      this.mediaPipeStatus = 'ready';
      return true;
    }

    this.mediaPipeStatus = 'loading';
    try {
      // 1. Resolve WASM assets for MediaPipe Vision Tasks
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // 2. Initialize HandLandmarker with GPU delegate (with fallback to CPU)
      const modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

      try {
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      } catch (gpuErr) {
        console.warn('MediaPipe Tasks Vision GPU delegate unavailable, falling back to CPU delegate:', gpuErr);
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      }

      this.isModelReady = true;
      this.mediaPipeStatus = 'ready';
      this.lastError = null;
      return true;
    } catch (e: any) {
      this.mediaPipeStatus = 'failed';
      this.lastError = e?.message || 'Failed to initialize MediaPipe Tasks Vision Hand Landmarker';
      console.error('MediaPipe Tasks Vision initialization error:', e);
      throw e;
    }
  }

  public async initialize(): Promise<boolean> {
    try {
      return await this.ensureMediaPipeReady();
    } catch {
      return false;
    }
  }

  /**
   * Starts the live webcam feed and attaches the detection processing loop.
   */
  public async startCamera(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    callback: DetectionCallback
  ): Promise<boolean> {
    this.stop();
    this.videoElement = video;
    this.canvasElement = canvas;
    this.isRunning = true;
    this.isSimulating = false;
    this.isProcessingFrame = false;
    this.framesProcessed = 0;
    this.lastDetectionTime = null;
    this.lastVideoTime = -1;
    this.cameraStatus = 'starting';
    this.lastError = null;

    try {
      // 1. Ensure MediaPipe Tasks Vision is initialized
      await this.ensureMediaPipeReady();

      // 2. Request live user camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      video.srcObject = stream;

      // 3. Confirm video element is receiving live frames
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Webcam video metadata timeout: frame dimensions not received from camera.'));
        }, 10000);

        const checkDimensions = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            clearTimeout(timeout);
            resolve();
          } else {
            requestAnimationFrame(checkDimensions);
          }
        };

        if (video.videoWidth > 0 && video.videoHeight > 0) {
          clearTimeout(timeout);
          resolve();
        } else {
          video.onloadedmetadata = () => checkDimensions();
          checkDimensions();
        }
      });

      await video.play();

      this.videoDimensions = {
        width: video.videoWidth || 640,
        height: video.videoHeight || 480
      };

      if (canvas) {
        canvas.width = this.videoDimensions.width;
        canvas.height = this.videoDimensions.height;
      }

      this.cameraStatus = 'active';

      // 4. Continuous MediaPipe Tasks Vision Detection Loop
      const processFrame = () => {
        if (!this.isRunning || this.isSimulating) return;

        if (
          this.handLandmarker &&
          video.readyState >= 2 &&
          !video.paused &&
          !video.ended &&
          video.videoWidth > 0 &&
          !this.isProcessingFrame
        ) {
          // Detect only when a new video frame has arrived
          if (video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = video.currentTime;
            this.isProcessingFrame = true;

            try {
              const startTimeMs = performance.now();
              const detections = this.handLandmarker.detectForVideo(video, startTimeMs);

              // Calculate real-time FPS
              this.fpsCounter++;
              if (startTimeMs - this.lastFpsTimestamp >= 1000) {
                this.currentFps = this.fpsCounter;
                this.fpsCounter = 0;
                this.lastFpsTimestamp = startTimeMs;
              }

              this.processTasksVisionResults(detections, callback);
            } catch (frameErr: any) {
              console.warn('Frame detection error:', frameErr);
              this.lastError = frameErr?.message || 'Error processing video frame';
            } finally {
              this.isProcessingFrame = false;
            }
          }
        }

        this.animFrameId = requestAnimationFrame(processFrame);
      };

      this.animFrameId = requestAnimationFrame(processFrame);
      return true;
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      this.cameraStatus = 'error';
      this.lastError = err?.message || 'Camera access error';
      this.stop();
      throw err;
    }
  }

  /**
   * Processes landmark results from MediaPipe Tasks Vision HandLandmarker.
   */
  private processTasksVisionResults(results: any, callback: DetectionCallback) {
    if (!this.canvasElement || !this.videoElement) return;

    this.framesProcessed++;

    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return;

    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    ctx.clearRect(0, 0, width, height);

    // 1. NO HAND DETECTED: Immediately reset and report empty
    if (!results.landmarks || results.landmarks.length === 0) {
      callback(
        null,
        [],
        {
          isHandDetected: false,
          landmarkCount: 0,
          isModelReady: this.isModelReady,
          fps: this.currentFps
        },
        {
          cameraStatus: this.cameraStatus,
          mediaPipeStatus: this.mediaPipeStatus,
          videoDimensions: { ...this.videoDimensions },
          framesProcessed: this.framesProcessed,
          lastDetectionTime: this.lastDetectionTime,
          handsCount: 0,
          lastError: this.lastError,
          activeModelName: this.activeModel.metadata.name,
          isModelConnected: this.activeModel.isConnected
        }
      );
      return;
    }

    // 2. HANDS DETECTED: Extract 21 3D landmarks and draw on canvas
    this.lastDetectionTime = Date.now();
    const detectedHands: HandDetectionOutput[] = [];

    for (let h = 0; h < results.landmarks.length; h++) {
      const rawPoints = results.landmarks[h];
      const landmarks: LandmarkPoint[] = rawPoints.map((p: any) => ({
        x: p.x,
        y: p.y,
        z: p.z
      }));

      // In MediaPipe Tasks Vision, handedness categoryName is provided in handednesses array
      let handedness: 'Left' | 'Right' = 'Right';
      if (results.handednesses && results.handednesses[h] && results.handednesses[h][0]) {
        handedness = results.handednesses[h][0].categoryName === 'Left' ? 'Left' : 'Right';
      }

      detectedHands.push({ landmarks, handedness });

      // Draw high-contrast skeletal connections and landmarks
      this.drawHandLandmarks(ctx, landmarks, width, height);
    }

    // 3. Delegate to Pluggable ISL Recognition Model
    // When DisconnectedISLModelAdapter is active, it strictly outputs:
    // "Hand tracking active — ISL recognition model not connected"
    const modelPrediction = this.activeModel.predict(detectedHands, Date.now());

    let finalResult: RecognitionResult | null = null;
    if (modelPrediction) {
      finalResult = {
        signName: modelPrediction.signName,
        confidence: modelPrediction.confidence,
        isUncertain: modelPrediction.isUncertain,
        landmarksDetected: true,
        timestamp: Date.now(),
        message: modelPrediction.explanation,
        matchedSignId: modelPrediction.signId,
        isVerifiedSign: modelPrediction.isVerifiedSign,
        metrics: modelPrediction.metrics
      };
    }

    const primaryHand = detectedHands[0]?.landmarks || [];
    const primaryHandedness = detectedHands[0]?.handedness || 'Right';

    callback(
      finalResult,
      detectedHands,
      {
        isHandDetected: true,
        landmarkCount: primaryHand.length,
        handedness: primaryHandedness,
        isModelReady: this.isModelReady,
        fps: this.currentFps
      },
      {
        cameraStatus: this.cameraStatus,
        mediaPipeStatus: this.mediaPipeStatus,
        videoDimensions: { ...this.videoDimensions },
        framesProcessed: this.framesProcessed,
        lastDetectionTime: this.lastDetectionTime,
        handsCount: detectedHands.length,
        lastError: this.lastError,
        activeModelName: this.activeModel.metadata.name,
        isModelConnected: this.activeModel.isConnected
      }
    );
  }

  /**
   * Draws 21 hand landmarks and 21 skeletal bone connections on canvas.
   */
  public drawHandLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: LandmarkPoint[],
    width: number,
    height: number
  ) {
    const CONNECTIONS = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm base
      [5, 9], [9, 13], [13, 17]
    ];

    // 1. Draw connecting bone lines in vibrant accessible teal
    ctx.strokeStyle = '#0d9488'; // Teal
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [startIdx, endIdx] of CONNECTIONS) {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    // 2. Draw landmark joints
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      const isTip = [4, 8, 12, 16, 20].includes(i);
      const isWrist = i === 0;

      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, isTip ? 6 : isWrist ? 7 : 4, 0, 2 * Math.PI);
      
      // Fingertips: cyan/teal, Wrist: amber, Joints: crisp white
      ctx.fillStyle = isTip ? '#14b8a6' : isWrist ? '#f59e0b' : '#ffffff';
      ctx.fill();
      
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /**
   * Synthetic Test Dataset Mode (Simulates known ISL gestures for automated demo).
   */
  public startSimulatedGesture(
    gestureName: string, 
    callback: DetectionCallback
  ) {
    this.stop();
    this.isRunning = true;
    this.isSimulating = true;
    gestureEngine.reset();

    // Prime initial sequence frames
    for (let f = 1; f <= 6; f++) {
      const initHands = this.generateSyntheticHandFrames(gestureName, f);
      gestureEngine.processFrame(initHands, Date.now() - (7 - f) * 80);
    }

    let frames = 7;
    this.simulationTimer = setInterval(() => {
      if (!this.isRunning || !this.isSimulating) {
        clearInterval(this.simulationTimer);
        return;
      }

      const hands = this.generateSyntheticHandFrames(gestureName, frames);

      if (this.canvasElement) {
        const ctx = this.canvasElement.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
          for (const h of hands) {
            this.drawHandLandmarks(ctx, h.landmarks, this.canvasElement.width, this.canvasElement.height);
          }
        }
      }

      // In simulation mode, evaluate gestureEngine directly for demonstration testing
      const engineResult = gestureEngine.processFrame(hands, Date.now());

      callback(
        engineResult,
        hands,
        {
          isHandDetected: true,
          landmarkCount: 21,
          handedness: hands[0]?.handedness || 'Right',
          isModelReady: true,
          fps: 24
        },
        {
          cameraStatus: 'active',
          mediaPipeStatus: 'ready',
          videoDimensions: { width: 640, height: 480 },
          framesProcessed: frames,
          lastDetectionTime: Date.now(),
          handsCount: hands.length,
          lastError: null,
          isSimulated: true,
          activeModelName: this.activeModel.metadata.name,
          isModelConnected: this.activeModel.isConnected
        }
      );
      frames++;

      if (frames > 45) {
        clearInterval(this.simulationTimer);
      }
    }, 80);
  }

  private generateSyntheticHandFrames(gesture: string, frameIndex: number): HandDetectionOutput[] {
    if (!gesture) return [];
    const templates = gestureEngine.getTemplates();
    const q = gesture.toLowerCase().trim();
    const qBase = q.split(' (')[0].split(' /')[0].trim();
    const qWords = q.split(/[\s/()]+/).filter(w => w.length > 2);

    let matchedTpl = templates.find(t => 
      t.id.toLowerCase() === q || 
      t.name.toLowerCase() === q
    );
    if (!matchedTpl) {
      matchedTpl = templates.find(t => {
        const tBase = t.name.toLowerCase().split(' (')[0].split(' /')[0].trim();
        return tBase === qBase;
      });
    }
    if (!matchedTpl) {
      if (q.includes('love') || q.includes('ily')) {
        matchedTpl = templates.find(t => t.id === 'sign-ily');
      } else if (q.includes('stop')) {
        matchedTpl = templates.find(t => t.id === 'sign-stop');
      } else if (q.includes('thank')) {
        matchedTpl = templates.find(t => t.id === 'sign-thank-you');
      } else if (q.includes('hello') || q.includes('namaste')) {
        matchedTpl = templates.find(t => t.id === 'sign-hello');
      } else if (q.includes('doctor')) {
        matchedTpl = templates.find(t => t.id === 'sign-doctor');
      } else if (q.includes('food') || q.includes('eat')) {
        matchedTpl = templates.find(t => t.id === 'sign-food-eat');
      } else if (q.includes('tea') || q.includes('chai')) {
        matchedTpl = templates.find(t => t.id === 'sign-tea');
      } else if (q.includes('understand')) {
        matchedTpl = templates.find(t => t.id === 'sign-understand');
      } else if (q.includes('today') || q.includes('now')) {
        matchedTpl = templates.find(t => t.id === 'sign-today');
      } else if (q.includes('rain') || q.includes('weather')) {
        matchedTpl = templates.find(t => t.id === 'sign-weather-rain');
      } else if (q.includes('computer') || q.includes('laptop')) {
        matchedTpl = templates.find(t => t.id === 'sign-tech-computer');
      } else {
        matchedTpl = templates.find(t => {
          const tWords = t.name.toLowerCase().split(/[\s/()]+/).filter(w => w.length > 2);
          return qWords.some(qw => tWords.includes(qw));
        });
      }
    }
    matchedTpl = matchedTpl || templates[0];

    const isThankYou = gesture.includes('Thank you');
    const isDoctor = gesture.includes('Doctor');
    const isPain = gesture.includes('Pain');
    const isFood = gesture.includes('Food') || gesture.includes('Eat');
    const isTea = gesture.includes('Tea') || gesture.includes('Chai');
    const isHome = gesture.includes('Home') || gesture.includes('House');
    const isClassroom = gesture.includes('College') || gesture.includes('Classroom');

    let baseOriginX = 0.5;
    let baseOriginY = 0.6;
    let shiftZ = 0;

    if (isThankYou) {
      baseOriginY = 0.45 + (frameIndex / 40) * 0.18;
      baseOriginX = 0.5 + Math.sin(frameIndex * 0.2) * 0.04;
    } else if (isFood || isTea) {
      baseOriginY = 0.40 + Math.sin(frameIndex * 0.4) * 0.03;
      baseOriginX = 0.52;
    } else if (isPain) {
      baseOriginX = 0.5 + Math.sin(frameIndex * 0.8) * 0.05;
      baseOriginY = 0.5 + Math.cos(frameIndex * 0.8) * 0.05;
    }

    const scale = 0.18;

    const primaryLandmarks: LandmarkPoint[] = matchedTpl.landmarks.map(p => ({
      x: Math.max(0.05, Math.min(0.95, baseOriginX + p.x * scale + (Math.random() - 0.5) * 0.004)),
      y: Math.max(0.05, Math.min(0.95, baseOriginY + p.y * scale + (Math.random() - 0.5) * 0.004)),
      z: p.z * scale + shiftZ + (Math.random() - 0.5) * 0.002
    }));

    if (isDoctor || isHome || isClassroom) {
      const nonDominantWrist: LandmarkPoint = isHome
        ? { x: 0.44, y: 0.58, z: 0 }
        : { x: 0.44, y: 0.68, z: 0 };

      const nonDominantHand: LandmarkPoint[] = matchedTpl.landmarks.map(p => ({
        x: Math.max(0.05, Math.min(0.95, nonDominantWrist.x - p.x * 0.18)),
        y: Math.max(0.05, Math.min(0.95, nonDominantWrist.y + p.y * 0.18)),
        z: p.z * 0.18
      }));

      return [
        { landmarks: primaryLandmarks, handedness: 'Right' },
        { landmarks: nonDominantHand, handedness: 'Left' }
      ];
    }

    return [{ landmarks: primaryLandmarks, handedness: 'Right' }];
  }

  /**
   * Stops the camera stream, terminates all media tracks, cancels animation frames,
   * and clears the canvas to ensure complete hardware resource cleanup.
   */
  public stop(): void {
    gestureEngine.reset();
    this.isRunning = false;
    this.isSimulating = false;
    this.isProcessingFrame = false;
    this.cameraStatus = 'stopped';
    this.currentFps = 0;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    // Stop all live video tracks
    if (this.videoElement && this.videoElement.srcObject) {
      try {
        const stream = this.videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping video tracks:', e);
      }
      this.videoElement.srcObject = null;
    }

    // Clear canvas overlay
    if (this.canvasElement) {
      const ctx = this.canvasElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      }
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const handDetector = new HandLandmarkDetector();
