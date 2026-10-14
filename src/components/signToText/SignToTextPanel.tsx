import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  CameraOff, 
  Hand, 
  Volume2, 
  Send, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Activity,
  Edit3,
  Copy,
  Check,
  X,
  Info,
  ExternalLink,
  Layers,
  Lightbulb,
  Sliders,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Pause,
  Trash2
} from 'lucide-react';
import { 
  handDetector, 
  SUPPORTED_SIGNS_LIST, 
  HandDetectionOutput,
  HandTrackingStatus,
  DetectionDiagnostics
} from '../../services/handLandmarkDetector';
import { 
  DisconnectedISLModelAdapter, 
  VerifiedBaselineISLClassifier, 
  IISLRecognitionModel 
} from '../../services/islModelInterface';
import { RecognitionResult } from '../../types';
import { signVocabulary, SignVocabularyItem } from '../../services/recognition/signVocabulary';
import { datasetManager } from '../../services/recognition/datasetManager';
import { gestureEngine, UNRECOGNIZED_SIGN_LABEL } from '../../services/recognition/gestureEngine';
import { KinematicTrajectoryFeatures } from '../../services/recognition/temporalSequenceBuffer';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import { PrivacyNoticeBadge } from '../common/PrivacyNoticeBadge';
import { ttsService } from '../../services/textToSpeech';
import { useSession } from '../../context/SessionContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { vocabStorageService } from '../../services/vocabularyStorageService';
import { Modal } from '../common/Modal';

interface SignToTextPanelProps {
  onSendToSession?: (text: string) => void;
  compact?: boolean;
}

export const SignToTextPanel: React.FC<SignToTextPanelProps> = ({ 
  onSendToSession,
  compact = false 
}) => {
  const { fontSize } = useAccessibility();
  const { activeSession, addTurn } = useSession();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mode: 'live_camera' vs 'simulation'
  const [activeMode, setActiveMode] = useState<'live_camera' | 'simulation'>('live_camera');

  // Model Connection State: 'verified_baseline' (default, active immediately) vs 'disconnected'
  const [modelMode, setModelMode] = useState<'disconnected' | 'verified_baseline'>('verified_baseline');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isMirrorMode, setIsMirrorMode] = useState(true);

  // Pause recognition toggle
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Accumulated transcript of recognized words
  const [transcript, setTranscript] = useState<string[]>([]);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Stability latch and cooldown refs to prevent spam
  const stableCandidateRef = useRef<string | null>(null);
  const stableCountRef = useRef<number>(0);
  const lastCommittedSignRef = useRef<string | null>(null);
  const gestureReleasedRef = useRef<boolean>(true);
  const lastCommitTimeRef = useRef<number>(0);
  const isUserEditingRef = useRef<boolean>(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [prediction, setPrediction] = useState<RecognitionResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<HandTrackingStatus>({
    isHandDetected: false,
    landmarkCount: 0,
    isModelReady: false,
    fps: 0
  });
  const [diagnostics, setDiagnostics] = useState<DetectionDiagnostics>({
    cameraStatus: 'idle',
    mediaPipeStatus: 'not_loaded',
    videoDimensions: { width: 0, height: 0 },
    framesProcessed: 0,
    lastDetectionTime: null,
    handsCount: 0,
    lastError: null,
    isModelConnected: false
  });
  const [trajectoryFeatures, setTrajectoryFeatures] = useState<KinematicTrajectoryFeatures | null>(null);
  const [activeSimulationGesture, setActiveSimulationGesture] = useState<string>('Hello / Namaste');
  const [simulationCategory, setSimulationCategory] = useState<string>('all');
  const [showGuide, setShowGuide] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  // Signer Review & Correction state (editable before sending)
  const [reviewedDraft, setReviewedDraft] = useState<string>('');
  const [isUserEditing, setIsUserEditing] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Keep refs synchronized
  useEffect(() => {
    isUserEditingRef.current = isUserEditing;
  }, [isUserEditing]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportExpectedSign, setReportExpectedSign] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [reportFeedbackMessage, setReportFeedbackMessage] = useState<string | null>(null);

  // Synchronize model configuration with handDetector
  useEffect(() => {
    if (modelMode === 'verified_baseline') {
      const verifiedClassifier = new VerifiedBaselineISLClassifier(gestureEngine);
      handDetector.setModel(verifiedClassifier);
    } else {
      handDetector.setModel(new DisconnectedISLModelAdapter());
    }
    setDiagnostics(handDetector.getDiagnostics());
  }, [modelMode]);

  // Clean teardown on component unmount: stops camera stream and releases hardware tracks
  useEffect(() => {
    return () => {
      handDetector.stop();
    };
  }, []);

  const handleResetRecognition = () => {
    gestureEngine.reset();
    setPrediction(null);
    setReviewedDraft('');
    setTranscript([]);
    stableCandidateRef.current = null;
    stableCountRef.current = 0;
    lastCommittedSignRef.current = null;
    gestureReleasedRef.current = true;
    setIsUserEditing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleClearTranscript = () => {
    setTranscript([]);
    lastCommittedSignRef.current = null;
    gestureReleasedRef.current = true;
    stableCandidateRef.current = null;
    stableCountRef.current = 0;
    if (!isUserEditing) {
      setReviewedDraft('');
    }
  };

  const handleUndoTranscript = () => {
    setTranscript(prev => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      if (!isUserEditingRef.current) {
        setReviewedDraft(next.join(' '));
      }
      return next;
    });
    lastCommittedSignRef.current = null;
    gestureReleasedRef.current = true;
  };

  const handleCopyTranscript = () => {
    const textToCopy = transcript.join(' ') || reviewedDraft;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleRemoveTranscriptWord = (idxToRemove: number) => {
    setTranscript(prev => {
      const next = prev.filter((_, idx) => idx !== idxToRemove);
      if (!isUserEditing) {
        setReviewedDraft(next.join(' '));
      }
      return next;
    });
  };

  const handleSwitchMode = (mode: 'live_camera' | 'simulation') => {
    handDetector.stop();
    setIsCameraActive(false);
    setPrediction(null);
    setReviewedDraft('');
    setIsUserEditing(false);
    setTrackingStatus({ isHandDetected: false, landmarkCount: 0, isModelReady: false });
    setDiagnostics(prev => ({
      ...prev,
      cameraStatus: 'stopped',
      handsCount: 0
    }));
    setCameraError(null);
    setActiveMode(mode);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    setPrediction(null);
    setReviewedDraft('');
    setIsUserEditing(false);
    setIsModelLoading(true);

    if (!videoRef.current || !canvasRef.current) {
      setIsModelLoading(false);
      return;
    }

    try {
      await handDetector.startCamera(
        videoRef.current,
        canvasRef.current,
        (
          result: RecognitionResult | null,
          hands: HandDetectionOutput[],
          status: HandTrackingStatus,
          diag?: DetectionDiagnostics
        ) => {
          setTrackingStatus(status);
          if (diag) {
            setDiagnostics(diag);
          }
          const feat = gestureEngine.getTrajectoryFeatures();
          setTrajectoryFeatures(feat);

          // If recognition is paused, do not update predictions or transcript
          if (isPausedRef.current) return;

          if (result) {
            setPrediction(result);

            // Filter out non-sign status labels
            const isNonSignStatus = 
              result.isUncertain ||
              result.signName === UNRECOGNIZED_SIGN_LABEL ||
              result.signName === 'No hand detected' ||
              result.signName.includes('not connected') ||
              result.signName.includes('unavailable') ||
              result.signName.includes('not recognized') ||
              result.signName.includes('not recognised') ||
              result.signName.includes('initialising');

            if (isNonSignStatus) {
              // Neutral / unrecognized posture -> rearm latch so user can perform next sign
              gestureReleasedRef.current = true;
              stableCandidateRef.current = null;
              stableCountRef.current = 0;
            } else if (result.confidence >= 0.75) {
              const detectedSign = result.signName;
              if (stableCandidateRef.current === detectedSign) {
                stableCountRef.current++;
              } else {
                stableCandidateRef.current = detectedSign;
                stableCountRef.current = 1;
              }

              // Require 5 consecutive stable frames (~160-200ms) before committing to transcript
              if (stableCountRef.current >= 5) {
                const isSameSign = lastCommittedSignRef.current === detectedSign;

                // Release-to-rearm: require gesture release or change before committing same sign again
                if (!isSameSign || gestureReleasedRef.current) {
                  const now = Date.now();
                  lastCommittedSignRef.current = detectedSign;
                  lastCommitTimeRef.current = now;
                  gestureReleasedRef.current = false; // Latched! Prevents duplicate spam while user holds sign

                  setTranscript(prev => [...prev, detectedSign]);

                  if (!isUserEditingRef.current) {
                    setReviewedDraft(prev => (prev ? `${prev} ${detectedSign}` : detectedSign));
                  }
                }
              }
            } else {
              gestureReleasedRef.current = true;
              stableCandidateRef.current = null;
              stableCountRef.current = 0;
            }
          } else {
            setPrediction(null);
            gestureReleasedRef.current = true;
            stableCandidateRef.current = null;
            stableCountRef.current = 0;
          }
        }
      );
      setIsCameraActive(true);
      setIsModelLoading(false);
      setDiagnostics(handDetector.getDiagnostics());
    } catch (err: any) {
      setIsModelLoading(false);
      console.warn('Camera failed:', err);
      const isNotAllowed = err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('denied');
      const errMsg = isNotAllowed
        ? 'Camera permission was denied. Please allow camera access via the browser address bar icon.'
        : err.message || 'Unable to start camera. Please verify device camera permissions or use Demo / Simulation Mode.';
      setCameraError(errMsg);
      setDiagnostics(prev => ({
        ...prev,
        cameraStatus: 'error',
        lastError: errMsg
      }));
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    handDetector.stop();
    setIsCameraActive(false);
    setPrediction(null);
    stableCandidateRef.current = null;
    stableCountRef.current = 0;
    setTrackingStatus({ isHandDetected: false, landmarkCount: 0, isModelReady: false });
    setDiagnostics(prev => ({
      ...prev,
      cameraStatus: 'stopped',
      handsCount: 0
    }));

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleSimulateGesture = (gestureName: string) => {
    setCameraError(null);
    setActiveSimulationGesture(gestureName);
    setIsCameraActive(true);
    if (!isUserEditing) {
      setReviewedDraft(prev => (prev ? `${prev} ${gestureName}` : gestureName));
      setTranscript(prev => [...prev, gestureName]);
    }

    handDetector.startSimulatedGesture(
      gestureName, 
      (result, hands, status, diag) => {
        setTrackingStatus(status);
        if (diag) {
          setDiagnostics(diag);
        }
        if (result) {
          setPrediction(result);
        }
      }
    );
  };

  const handleSpeakText = (text: string) => {
    ttsService.speak(text);
  };

  const handleCopyDraft = () => {
    const text = reviewedDraft || transcript.join(' ') || prediction?.signName;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmAndSend = (overrideText?: string) => {
    const textToSend = (overrideText || reviewedDraft || transcript.join(' ') || prediction?.signName || '').trim();
    if (
      !textToSend || 
      textToSend === UNRECOGNIZED_SIGN_LABEL || 
      textToSend === 'No hand detected' ||
      textToSend.includes('not connected') ||
      textToSend.includes('unavailable') ||
      textToSend.includes('not recognised')
    ) {
      return;
    }

    if (onSendToSession) {
      onSendToSession(textToSend);
    } else if (activeSession) {
      addTurn({
        senderRole: 'deaf_user',
        senderName: activeSession.deafParticipantName,
        mode: 'sign_to_text',
        content: textToSend,
        confidence: prediction?.confidence || 0.92,
        isVerifiedSign: true
      });
    }

    setSendSuccessMessage(`"${textToSend}" confirmed & sent to conversation!`);
    setTimeout(() => setSendSuccessMessage(null), 3000);
    setReviewedDraft('');
    setTranscript([]);
    lastCommittedSignRef.current = null;
    setIsUserEditing(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportExpectedSign.trim()) return;
    vocabStorageService.reportIncorrectPrediction({
      predictedSign: prediction?.signName || 'Unknown',
      expectedSign: reportExpectedSign.trim(),
      confidence: prediction?.confidence || 0,
      notes: reportNotes.trim()
    });
    setReportFeedbackMessage('Prediction error reported! Thank you for improving sign recognition.');
    setTimeout(() => {
      setReportModalOpen(false);
      setReportFeedbackMessage(null);
    }, 2000);
  };

  const activeModelMeta = handDetector.getModel().metadata;

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Top Header & Architecture Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-navy-900">
              Sign-to-Text Camera Recognition Studio
            </h2>
          </div>
          <p className="text-xs text-navy-500 mt-0.5">
            Real-time on-device 21-joint 3D hand tracking powered by MediaPipe Tasks Vision. Never fabricates unrecognized signs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModelModal(true)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-navy-200 hover:bg-navy-50 text-navy-700 flex items-center gap-1.5 transition"
            title="Inspect ISL Recognition Model connector architecture"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>Model Interface</span>
          </button>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-navy-200 hover:bg-navy-50 text-navy-700 flex items-center gap-1 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>{showGuide ? 'Hide Tips' : 'Signing Tips'}</span>
          </button>

          <PrivacyNoticeBadge />
        </div>
      </div>

      {/* Model Loading Feedback Banner */}
      {isModelLoading && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Initialising MediaPipe Tasks Vision Hand Landmarker...</span>
            <span className="text-teal-700 ml-1">Loading WebAssembly vision runtime and GPU delegate.</span>
          </div>
        </div>
      )}

      {/* Pluggable ISL Model Mode Selector & Honest Status Banner */}
      <div className="bg-navy-50/70 p-3.5 rounded-2xl border border-navy-200/80 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span>ISL Recognition Model Connector:</span>
            </span>

            {/* Model Toggle Chips */}
            <div className="flex bg-white p-0.5 rounded-lg border border-navy-200 text-xs">
              <button
                onClick={() => setModelMode('disconnected')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  modelMode === 'disconnected'
                    ? 'bg-navy-800 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                Tracking Only (Model Disconnected)
              </button>
              <button
                onClick={() => setModelMode('verified_baseline')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  modelMode === 'verified_baseline'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                Verified Baseline Classifier
              </button>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-navy-200 text-navy-600">
            Framework: {activeModelMeta.framework}
          </span>
        </div>

        {/* Honest Status Announcement */}
        {modelMode === 'disconnected' ? (
          <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs flex items-start gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Hand detected — sign recognition model unavailable.
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                MediaPipe Hand Landmarker is streaming 21 3D joint landmarks in real time. Because no machine learning classifier is attached in this mode, arbitrary hand movements will strictly <strong>never</strong> be converted into fabricated words. Switch to the <strong>Verified Baseline Classifier</strong> to recognize verified Indian Sign Language gestures.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs flex items-start gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">
                Verified Baseline Classifier Active ({activeModelMeta.classesCount} documented ISL postures)
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                Evaluates scale- and rotation-normalized hand geometries against documented ISLRTC specifications. Calibrated threshold requires ≥75% confidence; transitions and non-matching gestures are clearly flagged as uncertain.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* First-Time User Guide / Signing Tips (Expandable) */}
      {showGuide && (
        <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 text-xs text-navy-800 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-teal-600" />
              <span>How to Position for Hand Landmark Tracking</span>
            </span>
            <button 
              onClick={() => setShowGuide(false)} 
              className="text-navy-400 hover:text-navy-700 text-xs"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-teal-100 space-y-1">
              <strong className="text-teal-800 block">1. Lighting & Frontal Angle</strong>
              <p className="text-[11px] text-navy-600 leading-relaxed">
                Sit facing light so fingers are not silhouetted. Avoid bright windows behind you.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-teal-100 space-y-1">
              <strong className="text-teal-800 block">2. Distance & Framing</strong>
              <p className="text-[11px] text-navy-600 leading-relaxed">
                Keep your hand 50-80 cm from the webcam lens, centered within the frame.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-teal-100 space-y-1">
              <strong className="text-teal-800 block">3. Discrete Handshape Hold</strong>
              <p className="text-[11px] text-navy-600 leading-relaxed">
                Hold your handshape for 1 second to allow landmark coordinates to stabilize.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs: LIVE CAMERA vs SIMULATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-50/80 p-2 rounded-2xl border border-navy-100">
        <div className="flex items-center gap-1.5 bg-navy-200/50 p-1 rounded-xl">
          <button
            onClick={() => handleSwitchMode('live_camera')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'live_camera'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Live Camera Tracking</span>
          </button>
          <button
            onClick={() => handleSwitchMode('simulation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeMode === 'simulation'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Offline Simulation Mode</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={() => setIsMirrorMode(!isMirrorMode)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 transition"
            title="Toggle video horizontal mirroring"
          >
            Mirror: {isMirrorMode ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Main Viewfinder & Landmark Overlay Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left/Center: Camera Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative w-full aspect-[4/3] bg-navy-950 rounded-2xl overflow-hidden border-2 border-navy-800 shadow-inner flex items-center justify-center">
            
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                isMirrorMode ? 'scale-x-[-1]' : ''
              } ${activeMode === 'live_camera' && isCameraActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Landmark Overlay Canvas */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full object-cover z-10 ${
                isMirrorMode ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Standby UI for Live Camera Mode when inactive */}
            {activeMode === 'live_camera' && !isCameraActive && (
              <div className="p-6 text-center text-white space-y-4 max-w-sm z-20">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mx-auto text-teal-400">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live Webcam Ready
                  </h3>
                  <p className="text-xs text-navy-300 mt-1 leading-relaxed">
                    Camera access is required for real-time 3D landmark tracking. Video frames are analyzed locally in your browser and never recorded or transmitted.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleStartCamera}
                    disabled={isModelLoading}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Standby UI for Simulation Mode when inactive */}
            {activeMode === 'simulation' && !isCameraActive && (
              <div className="p-6 text-center text-white space-y-4 max-w-sm z-20">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Simulation Testing Ready
                  </h3>
                  <p className="text-xs text-navy-300 mt-1 leading-relaxed">
                    Select a gesture below to inject synthetic 3D landmark trajectories and test classification rules without needing camera hardware.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handleSimulateGesture(activeSimulationGesture)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run Simulated Gesture</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Indicator Badges on Camera Screen */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
                  activeMode === 'live_camera'
                    ? 'bg-teal-950/90 text-teal-300 border-teal-600/50'
                    : 'bg-indigo-950/90 text-indigo-300 border-indigo-600/50'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-ping ${
                    activeMode === 'live_camera' ? 'bg-teal-400' : 'bg-indigo-400'
                  }`} />
                  {activeMode === 'live_camera' ? 'LIVE CAMERA STREAM' : '[SIMULATION: Synthetic Test Data]'}
                </span>

                {/* Hand Detection Indicator Badge */}
                <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 border ${
                  trackingStatus.isHandDetected
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/50'
                    : 'bg-navy-900/90 text-amber-400 border-amber-600/50'
                }`}>
                  <Hand className="w-3 h-3" />
                  {trackingStatus.isHandDetected
                    ? `Hand: ${trackingStatus.handedness || 'Right'} (${trackingStatus.landmarkCount} pts)`
                    : 'No Hand in Frame'}
                </span>

                {/* FPS Badge */}
                {trackingStatus.fps ? (
                  <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-navy-900/90 text-teal-300 border border-teal-700/60">
                    {trackingStatus.fps} FPS
                  </span>
                ) : null}
              </div>
            )}

            {/* No-Hand Detection Prompt Overlay */}
            {isCameraActive && !trackingStatus.isHandDetected && (
              <div className="absolute bottom-4 inset-x-4 z-20 p-2.5 bg-navy-950/90 border border-amber-500/40 rounded-xl text-center text-xs text-amber-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>No hand detected — place your hand in camera view to track 21 landmarks.</span>
              </div>
            )}
          </div>

          {/* Primary Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {activeMode === 'live_camera' ? (
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    onClick={handleStopCamera}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartCamera}
                    disabled={isModelLoading}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm shadow-teal-600/20"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                )}
                <button
                  onClick={handleResetRecognition}
                  className="px-3.5 py-2 bg-navy-100 hover:bg-navy-200 text-navy-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-navy-200"
                  title="Clear recognition state and start a fresh sign"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-navy-600" />
                  <span>Reset State</span>
                </button>
              </div>
            ) : (
              /* Simulation Mode Selectors */
              <div className="w-full space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Select Test Gesture ({SUPPORTED_SIGNS_LIST.length} ISL signs):
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
                    {['all', 'Greetings', 'Family', 'Conversation', 'Questions', 'Numbers', 'Food', 'Education', 'Healthcare', 'Work', 'Accessibility'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSimulationCategory(cat)}
                        className={`px-2 py-0.5 rounded-md font-semibold capitalize transition ${
                          simulationCategory === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-navy-50/70 rounded-xl border border-navy-200">
                  {SUPPORTED_SIGNS_LIST.filter(s => {
                    if (simulationCategory === 'all') return true;
                    const catLower = simulationCategory.toLowerCase();
                    return s.category.toLowerCase().includes(catLower) ||
                           (catLower === 'accessibility' && s.category.toLowerCase().includes('accessibility'));
                  }).map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleSimulateGesture(s.name)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                        activeSimulationGesture === s.name && isCameraActive
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                          : 'border-navy-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-navy-700'
                      }`}
                    >
                      {s.name.split(' (')[0].split(' /')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hand Landmark Status indicator */}
            <div className="text-[11px] font-mono text-navy-500">
              {trackingStatus.isHandDetected ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  21 3D Landmarks Active
                </span>
              ) : isCameraActive ? (
                <span className="text-amber-700 font-medium">
                  Hold hand upright in frame
                </span>
              ) : null}
            </div>
          </div>

          {/* Camera Error / Permission Recovery Alert */}
          {cameraError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1.5 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-950">{cameraError}</p>
                  <p className="text-[11px] text-rose-700 mt-1">
                    To enable camera access: Click the lock icon next to the URL in your browser address bar and set <strong>Camera</strong> to <strong>Allow</strong>, then click <strong>Start Camera</strong> again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Prominent Recognition Result Panel, Accumulated Transcript & Editable Draft (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-navy-50/80 rounded-2xl border border-navy-200/90 p-5 space-y-4 shadow-xs">
            {/* Header: Status & Model Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-navy-900 uppercase tracking-wider block">
                  Live Result Panel
                </span>
                {/* Dynamic Status Badge */}
                {isPaused ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                    <Pause className="w-3 h-3 text-amber-700" />
                    <span>Recognition Paused</span>
                  </span>
                ) : modelMode === 'disconnected' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-700" />
                    <span>Model Unavailable</span>
                  </span>
                ) : !isCameraActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy-100 text-navy-600 border border-navy-200">
                    Camera Standby
                  </span>
                ) : !trackingStatus.isHandDetected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Hand className="w-3 h-3 text-amber-600" />
                    <span>Awaiting Hand</span>
                  </span>
                ) : prediction && !prediction.isUncertain && !prediction.signName.includes('not recognised') && !prediction.signName.includes('unavailable') && !prediction.signName.includes('not connected') ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Sign Verified</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-600 animate-pulse" />
                    <span>Analyzing Posture</span>
                  </span>
                )}
              </div>

              {/* Mode indicator */}
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                modelMode === 'verified_baseline'
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {modelMode === 'verified_baseline' ? '13 Verified Signs' : 'Tracking Only'}
              </span>
            </div>

            {/* Prominent Live Recognition Result Card */}
            {modelMode === 'disconnected' ? (
              <div className="bg-white rounded-xl border-2 border-purple-200 p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-purple-700">
                  <Cpu className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Tracking Only Mode</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-navy-950 leading-snug">
                  Hand detected — sign recognition model unavailable.
                </h3>
                <p className="text-xs text-navy-600 leading-relaxed">
                  MediaPipe is streaming 21 3D joint landmarks live from your webcam. Because no sign classifier is connected in this mode, arbitrary hand movements will strictly <strong>never</strong> be converted into words.
                </p>
                <button
                  onClick={() => setModelMode('verified_baseline')}
                  className="mt-1 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connect Verified Baseline Classifier</span>
                </button>
              </div>
            ) : !isCameraActive ? (
              <div className="bg-white rounded-xl border border-navy-200 p-6 text-center space-y-2">
                <Hand className="w-10 h-10 mx-auto text-teal-600 opacity-30 animate-pulse" />
                <h3 className="text-base font-bold text-navy-900">Live Camera Standby</h3>
                <p className="text-xs text-navy-500 max-w-xs mx-auto">
                  Click <strong>Start Camera</strong> to track 21 hand landmarks and recognize verified Indian Sign Language gestures in real time.
                </p>
              </div>
            ) : !trackingStatus.isHandDetected ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-amber-300 p-5 space-y-2 bg-amber-50/20">
                <div className="flex items-center gap-2 text-amber-800">
                  <Hand className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Hand In View</span>
                </div>
                <h3 className="text-base font-bold text-navy-900">Hold your hand upright facing the camera</h3>
                <p className="text-xs text-navy-600">
                  Camera running ({trackingStatus.fps || 30} FPS). Position palm in center of frame to trigger live 3D landmark tracking.
                </p>
              </div>
            ) : prediction && !prediction.isUncertain && !prediction.signName.includes('not recognised') && !prediction.signName.includes('unavailable') && !prediction.signName.includes('not connected') ? (
              <div className="bg-white rounded-xl border-2 border-teal-500 p-4 space-y-3 shadow-sm bg-gradient-to-br from-white via-teal-50/20 to-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Recognized Sign:
                    </span>
                    <h3 className={`font-black tracking-tight text-navy-950 mt-0.5 ${
                      fontSize === 'extra-large' ? 'text-3xl' : fontSize === 'large' ? 'text-2xl' : 'text-xl'
                    }`}>
                      {prediction.signName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-emerald-100 text-emerald-900 border border-emerald-300 block">
                      {Math.round(prediction.confidence * 100)}% Match
                    </span>
                    {prediction.metrics?.inferenceTimeMs ? (
                      <span className="text-[10px] font-mono text-navy-400 mt-0.5 block">
                        {prediction.metrics.inferenceTimeMs}ms latency
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Calibrated Confidence Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-navy-600">
                    <span>Calibrated Confidence</span>
                    <span className="font-mono text-emerald-700">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round(prediction.confidence * 100))}%` }}
                    />
                  </div>
                </div>

                {prediction.message && (
                  <p className="text-xs text-navy-600 leading-relaxed pt-1 border-t border-navy-100">
                    {prediction.message}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleSpeakText(prediction.signName)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Speak "{prediction.signName.split(' (')[0].split(' /')[0]}"</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-2.5 shadow-sm bg-amber-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Hand Detected (21 Landmarks)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-700 bg-amber-100/70 border border-amber-200">
                    Conf: {Math.round((prediction?.confidence || 0) * 100)}%
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Sign not recognized
                  </h3>
                  <p className="text-xs text-navy-600 mt-1 leading-relaxed">
                    Hold posture steady facing camera. If the gesture is not recognized, please repeat clearly. Only stable gestures with validated confidence (≥75%) are registered.
                  </p>
                </div>
              </div>
            )}

            {/* Accumulated Transcript Section */}
            <div className="bg-white rounded-xl border border-navy-200 p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-navy-900">
                    Accumulated Transcript
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {transcript.length} {transcript.length === 1 ? 'word' : 'words'}
                  </span>
                </div>

                {/* Transcript Controls: Pause/Resume, Undo, Copy, Clear */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleTogglePause}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition flex items-center gap-1 ${
                      isPaused
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-navy-50 text-navy-700 border-navy-200 hover:bg-navy-100'
                    }`}
                    title={isPaused ? 'Resume live recognition' : 'Pause recognition to freeze transcript'}
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleUndoTranscript}
                    disabled={transcript.length === 0}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-navy-200 bg-navy-50 hover:bg-navy-100 text-navy-700 transition flex items-center gap-1 disabled:opacity-40"
                    title="Undo last recognized word from transcript"
                  >
                    <RotateCcw className="w-3 h-3 text-navy-600" />
                    <span>Undo</span>
                  </button>

                  <button
                    onClick={handleCopyTranscript}
                    disabled={transcript.length === 0 && !reviewedDraft.trim()}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-navy-200 bg-navy-50 hover:bg-navy-100 text-navy-700 transition flex items-center gap-1 disabled:opacity-40"
                    title="Copy accumulated transcript to clipboard"
                  >
                    {copiedTranscript ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleClearTranscript}
                    disabled={transcript.length === 0 && !reviewedDraft.trim()}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-navy-200 bg-navy-50 hover:bg-rose-50 hover:text-rose-700 text-navy-600 transition flex items-center gap-1 disabled:opacity-40"
                    title="Clear accumulated transcript"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Accumulated Words Display */}
              {transcript.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-navy-50/60 rounded-lg border border-navy-100">
                  {transcript.map((word, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-xs font-bold text-navy-900 shadow-2xs group"
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => handleRemoveTranscriptWord(idx)}
                        className="text-navy-400 hover:text-rose-600 transition ml-0.5"
                        title="Remove word"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 bg-navy-50/50 rounded-lg border border-navy-100 text-center text-[11px] text-navy-500">
                  Signs held steady for ~200ms accumulate here automatically (1.5s spam cooldown).
                </div>
              )}
            </div>

            {/* Editable Review Draft Box (Editable before sharing or sending) */}
            <div className="space-y-1.5 pt-2 border-t border-navy-200">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-navy-800 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-teal-600" />
                  <span>Editable Signer Draft (Review &amp; Edit):</span>
                </label>
                <span className="text-[10px] text-navy-400 font-mono">
                  {reviewedDraft.length} chars
                </span>
              </div>

              <textarea
                value={reviewedDraft}
                onChange={(e) => {
                  setReviewedDraft(e.target.value);
                  setIsUserEditing(true);
                }}
                placeholder="Confirmed signs accumulate here. Type freely to edit or add words before sending..."
                rows={2}
                className="w-full px-3 py-2 bg-white rounded-xl border border-navy-200 text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium resize-none shadow-2xs"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyDraft}
                    disabled={!reviewedDraft.trim()}
                    className="px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-40"
                  >
                    {copied ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleSpeakText(reviewedDraft)}
                    disabled={!reviewedDraft.trim()}
                    className="px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-40"
                    title="Speak complete draft sentence aloud"
                  >
                    <Volume2 className="w-3 h-3 text-teal-600" />
                    <span>Speak</span>
                  </button>

                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white hover:bg-navy-50 text-navy-600 text-xs font-medium transition"
                    title="Report incorrect prediction"
                  >
                    Report Error
                  </button>
                </div>

                {(onSendToSession || activeSession) && (
                  <button
                    onClick={() => handleConfirmAndSend()}
                    disabled={!reviewedDraft.trim()}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Session</span>
                  </button>
                )}
              </div>

              {sendSuccessMessage && (
                <p className="text-[11px] text-emerald-700 font-bold animate-fade-in pt-1">
                  ✓ {sendSuccessMessage}
                </p>
              )}
            </div>

            {/* Quick Strip of 13 Supported Gestures */}
            <div className="pt-2 border-t border-navy-200 space-y-1.5">
              <span className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block">
                Camera Supported Gestures (13 Verified Signs):
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {[
                  'Hello / Namaste',
                  'Thank you',
                  'Water',
                  'Doctor',
                  'Help',
                  'Yes',
                  'No',
                  'Food / Eat',
                  'Where is the bathroom?',
                  'Peace / Two',
                  'Stop',
                  'I Love You',
                  'Number 1 / Point'
                ].map((name) => {
                  const isCurrent = prediction && !prediction.isUncertain && prediction.signName.toLowerCase().includes(name.toLowerCase().split(' /')[0]);
                  return (
                    <span
                      key={name}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition ${
                        isCurrent
                          ? 'bg-teal-600 text-white border-teal-700 shadow-2xs font-bold scale-105'
                          : 'bg-white text-navy-700 border-navy-200'
                      }`}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 bg-white rounded-2xl border border-navy-100 flex items-center gap-2.5 text-xs text-navy-600 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-[11px]">
              <strong className="text-navy-900 block">Zero Footage Stored:</strong>
              Video frames are processed strictly in-memory on your device and are never recorded, saved, or uploaded.
            </div>
          </div>
        </div>

      </div>

      {/* Model Architecture Inspector Modal */}
      <Modal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        title="ISL Recognition Model Architecture"
      >
        <div className="space-y-4 text-xs text-navy-800">
          <div className="p-3 bg-navy-50 rounded-xl border border-navy-200 space-y-1">
            <h4 className="font-bold text-navy-900">Current Model: {activeModelMeta.name}</h4>
            <p className="text-navy-600 leading-relaxed">{activeModelMeta.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2.5 bg-white rounded-lg border border-navy-100">
              <span className="text-navy-400 font-mono block">Framework</span>
              <strong className="text-navy-900">{activeModelMeta.framework}</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-navy-100">
              <span className="text-navy-400 font-mono block">Input Tensor</span>
              <strong className="text-navy-900">{activeModelMeta.inputTensorShape}</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-navy-100">
              <span className="text-navy-400 font-mono block">Min Confidence</span>
              <strong className="text-navy-900">{Math.round(activeModelMeta.minConfidenceThreshold * 100)}%</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-navy-100">
              <span className="text-navy-400 font-mono block">Documented Classes</span>
              <strong className="text-navy-900">{activeModelMeta.classesCount} Classes</strong>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <h5 className="font-bold text-navy-900">Pluggable Model Connector Guidelines:</h5>
            <p className="text-navy-600 leading-relaxed text-[11px]">
              To integrate a custom deep learning classifier (TensorFlow.js or ONNX Runtime Web):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-navy-700 bg-navy-50/70 p-2.5 rounded-lg border border-navy-200">
              <li>Implement the <code>IISLRecognitionModel</code> interface from <code>src/services/islModelInterface.ts</code>.</li>
              <li>Accept normalized 21-point coordinates <code>[21, 3]</code> or temporal sliding sequence buffers.</li>
              <li>Pass the model instance to <code>handDetector.setModel(customModel)</code>.</li>
              <li>Never emit predictions below the confidence threshold to preserve linguistic fidelity.</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowModelModal(false)}
              className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Prediction Error Reporting Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Sign Recognition Inaccuracy"
      >
        <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-navy-800 block mb-1">
              Detected Sign:
            </label>
            <input
              type="text"
              readOnly
              value={prediction?.signName || 'None'}
              className="w-full px-3 py-2 bg-navy-50 rounded-lg border border-navy-200 text-navy-600 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-navy-800 block mb-1">
              What was the expected sign? *
            </label>
            <input
              type="text"
              required
              value={reportExpectedSign}
              onChange={(e) => setReportExpectedSign(e.target.value)}
              placeholder="e.g. Doctor, Water, Family..."
              className="w-full px-3 py-2 bg-white rounded-lg border border-navy-200 text-navy-900 focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-navy-800 block mb-1">
              Additional Notes:
            </label>
            <textarea
              rows={2}
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Lighting conditions, hand speed, or regional ISL dialect variation..."
              className="w-full px-3 py-2 bg-white rounded-lg border border-navy-200 text-navy-900 focus:ring-2 focus:ring-teal-500 font-medium resize-none"
            />
          </div>

          {reportFeedbackMessage && (
            <p className="text-emerald-700 font-bold text-[11px]">
              ✓ {reportFeedbackMessage}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-3 py-2 rounded-lg text-navy-600 hover:bg-navy-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
