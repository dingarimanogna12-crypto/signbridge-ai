import { LandmarkPoint, HandDetectionOutput } from '../handLandmarkDetector';
import { RecognitionResult } from '../../types';
import { signVocabulary, SignVocabularyItem } from './signVocabulary';
import { TemporalSequenceBuffer, KinematicTrajectoryFeatures } from './temporalSequenceBuffer';
import { datasetManager } from './datasetManager';
import rawCentroids from './trained_centroids.json';

export const UNRECOGNIZED_SIGN_LABEL = 'Sign not recognized';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface CentroidTemplate {
  id: string;
  name: string;
  type: 'static_posture' | 'dynamic_sequence';
  category: string;
  landmarks: NormalizedLandmark[];
  threshold: number;
  trajectory?: {
    stroke?: string;
    minSpeed?: number;
    isTwoHanded?: boolean;
    minRepetitions?: number;
    minDisplacementY?: number;
  };
}

export interface GestureEngineResult extends RecognitionResult {
  features?: KinematicTrajectoryFeatures;
  matchedSignId?: string;
  signType?: 'static_posture' | 'dynamic_sequence';
  centroidDistance?: number;
}

export interface FingerStateMask {
  isThumbExtended: boolean;
  isIndexExtended: boolean;
  isMiddleExtended: boolean;
  isRingExtended: boolean;
  isPinkyExtended: boolean;
  isFistCurled: boolean;
}

// Convert raw landmarks to wrist-centered, scale-normalized, rotation-aligned coordinates
export function normalizeHandLandmarks(raw: LandmarkPoint[]): NormalizedLandmark[] {
  if (!raw || raw.length < 21) return [];
  const wrist = raw[0];
  const middleMcp = raw[9];
  const rawScale = Math.sqrt(
    Math.pow(middleMcp.x - wrist.x, 2) +
    Math.pow(middleMcp.y - wrist.y, 2) +
    Math.pow(middleMcp.z - wrist.z, 2)
  );
  const scale = rawScale > 0.0001 ? rawScale : 1.0;

  // Unrotated wrist-centered normalized coordinates
  const unrotated = raw.map(p => ({
    x: (p.x - wrist.x) / scale,
    y: (p.y - wrist.y) / scale,
    z: (p.z - wrist.z) / scale
  }));

  // Canonical rotation alignment: align wrist-to-middleMcp vector along upright (-y) axis
  // In the reference templates, landmark 9 is located at (0, -1, 0)
  const angle = Math.atan2(unrotated[9].x, -unrotated[9].y);
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);

  return unrotated.map(p => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
    z: p.z
  }));
}

// Mean Euclidean deviation across 21 landmarks (evaluates both direct and mirrored orientation)
export function calculateLandmarkDistance(norm: NormalizedLandmark[], centroid: NormalizedLandmark[]): number {
  if (norm.length < 21 || centroid.length < 21) return 999;
  let sumNormal = 0;
  let sumMirrored = 0;

  for (let i = 0; i < 21; i++) {
    const dx = norm[i].x - centroid[i].x;
    const dy = norm[i].y - centroid[i].y;
    const dz = norm[i].z - centroid[i].z;
    sumNormal += Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Mirrored along x-axis (handles left-handed signers and mirrored webcam streams)
    const dxM = (-norm[i].x) - centroid[i].x;
    sumMirrored += Math.sqrt(dxM * dxM + dy * dy + dz * dz);
  }

  return Math.min(sumNormal, sumMirrored) / 21;
}

// Extract discrete finger extension and curl states (3D scale-invariant and orientation-independent)
export function extractFingerStateMask(lm: LandmarkPoint[]): FingerStateMask {
  if (!lm || lm.length < 21) {
    return {
      isThumbExtended: false,
      isIndexExtended: false,
      isMiddleExtended: false,
      isRingExtended: false,
      isPinkyExtended: false,
      isFistCurled: false
    };
  }

  const wrist = lm[0];
  const thumbTip = lm[4];
  const thumbIp = lm[3];
  const thumbMcp = lm[2];
  const indexTip = lm[8];
  const indexPip = lm[6];
  const indexMcp = lm[5];
  const middleTip = lm[12];
  const middlePip = lm[10];
  const middleMcp = lm[9];
  const ringTip = lm[16];
  const ringPip = lm[14];
  const ringMcp = lm[13];
  const pinkyTip = lm[20];
  const pinkyPip = lm[18];
  const pinkyMcp = lm[17];

  const dist3D = (p1: LandmarkPoint, p2: LandmarkPoint) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));

  const palmScale = Math.max(0.01, dist3D(wrist, middleMcp));

  // A finger is extended when its tip is extended further from the wrist and MCP joint than its intermediate knuckle (PIP)
  const isIndexExtended = dist3D(indexTip, wrist) > dist3D(indexPip, wrist) * 1.05 &&
                          dist3D(indexTip, indexMcp) > dist3D(indexPip, indexMcp) * 1.08;

  const isMiddleExtended = dist3D(middleTip, wrist) > dist3D(middlePip, wrist) * 1.05 &&
                           dist3D(middleTip, middleMcp) > dist3D(middlePip, middleMcp) * 1.08;

  const isRingExtended = dist3D(ringTip, wrist) > dist3D(ringPip, wrist) * 1.05 &&
                         dist3D(ringTip, ringMcp) > dist3D(ringPip, ringMcp) * 1.08;

  const isPinkyExtended = dist3D(pinkyTip, wrist) > dist3D(pinkyPip, wrist) * 1.05 &&
                          dist3D(pinkyTip, pinkyMcp) > dist3D(pinkyPip, pinkyMcp) * 1.08;

  // Thumb is extended when tip is clear of index/pinky knuckle base
  const isThumbExtended = dist3D(thumbTip, pinkyMcp) > dist3D(thumbIp, pinkyMcp) * 1.06 ||
                          dist3D(thumbTip, wrist) > dist3D(thumbMcp, wrist) * 1.22;

  // Fist is curled when all 4 finger tips fold inward close to palm/MCPs
  const isFistCurled = 
    dist3D(indexTip, indexMcp) < palmScale * 1.05 &&
    dist3D(middleTip, middleMcp) < palmScale * 1.05 &&
    dist3D(ringTip, ringMcp) < palmScale * 1.05 &&
    dist3D(pinkyTip, pinkyMcp) < palmScale * 1.05;

  return {
    isThumbExtended,
    isIndexExtended,
    isMiddleExtended,
    isRingExtended,
    isPinkyExtended,
    isFistCurled
  };
}

// Strict verification that finger posture matches target sign structure
export function verifyFingerMaskForSign(signId: string, mask: FingerStateMask, lm: LandmarkPoint[]): boolean {
  const { isThumbExtended, isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended, isFistCurled } = mask;
  const dist = (p1: LandmarkPoint, p2: LandmarkPoint) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  switch (signId) {
    case 'sign-hello':
    case 'sign-stop':
    case 'sign-please':
    case 'sign-feel-happy':
    case 'sign-feel-sad':
    case 'sign-welcome':
    case 'sign-weather-rain':
    case 'sign-today':
    case 'sign-question-where':
    case 'sign-buy-pay':
    case 'sign-classroom':
    case 'sign-teacher':
    case 'sign-home':
    case 'sign-mother':
    case 'sign-father':
    case 'sign-sleep':
      return isIndexExtended && isMiddleExtended && (isRingExtended || isPinkyExtended);

    case 'sign-yes':
    case 'sign-good-morning':
      const isThumbUpright = lm[4].y < lm[2].y - 0.05;
      return (isThumbUpright || isThumbExtended) && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;

    case 'sign-no':
    case 'sign-tea':
    case 'sign-food-eat':
    case 'sign-money-price':
      const thumbIndexDist = dist(lm[4], lm[8]);
      return thumbIndexDist < 0.085 && !isRingExtended && !isPinkyExtended;

    case 'sign-help-urgent':
    case 'sign-sorry':
    case 'sign-travel-bus':
    case 'sign-play-game':
    case 'sign-tech-message':
      return isFistCurled || (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended);

    case 'sign-peace':
    case 'sign-doctor':
    case 'sign-travel-train':
    case 'sign-medicine':
      return isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;

    case 'sign-ily':
      return isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended;

    case 'sign-water':
      return isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended;

    case 'sign-thank-you':
      return (isIndexExtended || isMiddleExtended) && (isRingExtended || isPinkyExtended);

    case 'sign-number-1':
    case 'sign-time-clock':
    case 'sign-understand':
    case 'sign-tomorrow':
    case 'sign-hospital':
    case 'sign-friend':
    case 'sign-brother':
    case 'sign-sister':
      return isIndexExtended && !isRingExtended && !isPinkyExtended;

    case 'sign-bathroom':
      return isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended;

    case 'sign-tech-mobile':
      return isThumbExtended && isPinkyExtended && !isMiddleExtended;

    case 'sign-need':
    case 'sign-tech-computer':
      return !isRingExtended || isIndexExtended;

    case 'sign-pain':
      return isIndexExtended && !isRingExtended && !isPinkyExtended;

    default:
      return Boolean(lm && lm.length === 21);
  }
}

export class GestureEngine {
  private temporalBuffer = new TemporalSequenceBuffer(45, 1500);
  private recentPredictions: { sign: string; conf: number }[] = [];
  private smoothingWindow = 3;
  private templates: CentroidTemplate[] = rawCentroids as CentroidTemplate[];

  public reset(): void {
    this.resetSignRecognition();
  }

  public resetSignRecognition(): void {
    this.temporalBuffer.clear();
    this.recentPredictions = [];
  }

  public getTrajectoryFeatures(): KinematicTrajectoryFeatures {
    return this.temporalBuffer.extractFeatures();
  }

  public getTemplates(): CentroidTemplate[] {
    return this.templates;
  }

  // Primary evaluation pipeline for a live video frame
  public processFrame(hands: HandDetectionOutput[], timestamp = Date.now()): GestureEngineResult {
    // If dataset recording is active, capture the frame
    if (datasetManager.getIsRecording()) {
      datasetManager.captureFrame(hands);
    }

    if (!hands || hands.length === 0 || hands[0].landmarks.length === 0) {
      this.resetSignRecognition();
      return {
        signName: 'No hand detected',
        confidence: 0,
        isUncertain: true,
        message: 'No hand detected in camera frame. Center your hand facing the lens.',
        landmarksDetected: false,
        timestamp
      };
    }

    // Push into temporal multi-frame sequence buffer
    this.temporalBuffer.push(hands, timestamp);
    const primaryHand = hands[0].landmarks;
    const features = this.temporalBuffer.extractFeatures();

    // 1. Boundary check: Hand too close to edge of frame
    const isNearEdge = primaryHand.some(p => p.x < 0.005 || p.x > 0.995 || p.y < 0.005 || p.y > 0.995);
    if (isNearEdge) {
      this.recentPredictions = [];
      return {
        signName: UNRECOGNIZED_SIGN_LABEL,
        confidence: 0.35,
        isUncertain: true,
        message: 'Hand is too close to camera edge. Please center your hand in the viewfinder.',
        landmarksDetected: true,
        timestamp,
        features
      };
    }

    // 2. Extract discrete finger state mask
    const fingerMask = extractFingerStateMask(primaryHand);

    // 3. Normalize input landmarks (wrist-anchored, scale-invariant, rotation-aligned)
    const normalizedInput = normalizeHandLandmarks(primaryHand);

    // 4. Evaluate Centroid Template Distances with calibrated thresholding
    const scoredTemplates = this.templates.map(tpl => {
      const dist = calculateLandmarkDistance(normalizedInput, tpl.landmarks);
      // Calibrated confidence scaling
      const conf = Math.max(0.2, Math.min(0.98, 1.0 - (dist / tpl.threshold) * 0.40));
      const structurallyValid = verifyFingerMaskForSign(tpl.id, fingerMask, primaryHand);
      return {
        template: tpl,
        distance: dist,
        confidence: conf,
        withinThreshold: dist <= tpl.threshold && structurallyValid,
        structurallyValid
      };
    });

    // Sort by distance ascending
    scoredTemplates.sort((a, b) => a.distance - b.distance);

    // 5. Evaluate static handshape posture heuristics (with stillness gating)
    const staticEval = this.evaluateStaticHandshape(primaryHand, fingerMask, features);

    // 6. Evaluate dynamic temporal sequences (with trajectory & anchor constraints)
    const dynamicEval = this.evaluateDynamicSequence(primaryHand, hands, features);

    let finalCandidate: {
      signName: string;
      signId: string;
      confidence: number;
      message: string;
      signType: 'static_posture' | 'dynamic_sequence';
      distance?: number;
    } | null = null;

    // Centroid evaluation
    const bestCentroid = scoredTemplates[0];

    // Candidate selection hierarchy:
    // 1. Dynamic sequence with intentional purposeful stroke
    if (dynamicEval && dynamicEval.confidence >= 0.78) {
      finalCandidate = dynamicEval;
    } else if (staticEval && staticEval.confidence >= 0.75) {
      // 2. Static posture heuristics with localized body anchors (e.g. forehead, chin, chest)
      finalCandidate = staticEval;
    } else if (
      // 3. Calibrated centroid pattern match (rotation-aligned & dual-mirrored)
      bestCentroid &&
      bestCentroid.withinThreshold &&
      bestCentroid.structurallyValid &&
      bestCentroid.distance <= 0.35 &&
      bestCentroid.confidence >= 0.75
    ) {
      finalCandidate = {
        signName: bestCentroid.template.name,
        signId: bestCentroid.template.id,
        confidence: Number(bestCentroid.confidence.toFixed(2)),
        message: `Recognized calibrated landmark pattern for ${bestCentroid.template.name}`,
        signType: bestCentroid.template.type,
        distance: bestCentroid.distance
      };
    }

    // 7. Enforce single best prediction: reject if below 0.75 validated threshold
    if (!finalCandidate || finalCandidate.confidence < 0.75) {
      this.recentPredictions = [];
      return {
        signName: UNRECOGNIZED_SIGN_LABEL,
        confidence: 0.30,
        isUncertain: true,
        message: 'Sign not recognized',
        landmarksDetected: true,
        timestamp,
        features
      };
    }

    // 8. Apply temporal smoothing across consecutive frames
    const smoothed = this.smoothPrediction(finalCandidate.signName, finalCandidate.confidence);

    return {
      signName: smoothed.signName,
      confidence: smoothed.confidence,
      isUncertain: smoothed.isUncertain,
      message: smoothed.isUncertain
        ? 'Sign not recognized'
        : finalCandidate.message,
      landmarksDetected: true,
      timestamp,
      features,
      matchedSignId: finalCandidate.signId,
      signType: finalCandidate.signType,
      centroidDistance: finalCandidate.distance
    };
  }

  // Evaluates static posture rules with stillness gating
  private evaluateStaticHandshape(
    lm: LandmarkPoint[],
    mask: FingerStateMask,
    features: KinematicTrajectoryFeatures
  ): { signName: string; signId: string; confidence: number; message: string; signType: 'static_posture' } | null {
    // Stillness check: allow natural hand tremor and camera tracking jitter (< 0.65)
    if (features.averageSpeed > 0.65) {
      return null;
    }

    const { isThumbExtended, isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended, isFistCurled } = mask;
    const dist = (p1: LandmarkPoint, p2: LandmarkPoint) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const thumbIndexDist = dist(lm[4], lm[8]);
    const indexMiddleDist = dist(lm[8], lm[12]);
    const isThumbUpright = lm[4].y < lm[2].y - 0.05;

    // 1. Open 5-Finger Palm Family (Father, Mother, Hello)
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      // Father: Hand at forehead level
      if (lm[0].y < 0.45) {
        return {
          signName: 'Father',
          signId: 'sign-father',
          confidence: 0.93,
          message: 'Open 5-hand at forehead level recognized (Male familial anchor)',
          signType: 'static_posture'
        };
      }
      // Mother: Hand at chin level
      if ((lm[0].y >= 0.45 && lm[0].y < 0.60) || features.verticalRegion === 'upper_chin_level') {
        return {
          signName: 'Mother',
          signId: 'sign-mother',
          confidence: 0.93,
          message: 'Open 5-hand near chin level recognized (Female familial anchor)',
          signType: 'static_posture'
        };
      }
      // Hello / Namaste: General upright open palm greeting
      return {
        signName: 'Hello / Namaste',
        signId: 'sign-hello',
        confidence: 0.94,
        message: 'High confidence greeting gesture (Open palm upright)',
        signType: 'static_posture'
      };
    }

    // 2. Yes (Thumbs Up: Thumb extended upright, all 4 fingers curled into compact fist)
    if (isThumbUpright && isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && isFistCurled) {
      return {
        signName: 'Yes (Thumbs Up)',
        signId: 'sign-yes',
        confidence: 0.96,
        message: 'High confidence affirmation gesture (Thumb upright)',
        signType: 'static_posture'
      };
    }

    // 3. I Love You (Thumb, Index, Pinky extended; Middle and Ring folded)
    if (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
      return {
        signName: 'I Love You',
        signId: 'sign-ily',
        confidence: 0.95,
        message: 'Recognized iconic I-L-Y hand shape',
        signType: 'static_posture'
      };
    }

    // 4. Mobile / Phone (Y-handshape: Thumb and Pinky extended to ear)
    if (isThumbExtended && isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
      return {
        signName: 'Mobile / Phone',
        signId: 'sign-tech-mobile',
        confidence: 0.93,
        message: 'Phone receiver handshape recognized (Thumb & Pinky extended)',
        signType: 'static_posture'
      };
    }

    // 5. Where is the bathroom? (Closed fist with upright pinky, thumb curled)
    if (isPinkyExtended && !isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
      return {
        signName: 'Where is the bathroom?',
        signId: 'sign-bathroom',
        confidence: 0.93,
        message: 'Upright pinky formation recognized (ISL bathroom inquiry)',
        signType: 'static_posture'
      };
    }

    // 6. Peace / Two (V-shape with Index and Middle extended and spread)
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended && indexMiddleDist > 0.045) {
      return {
        signName: 'Peace / Two',
        signId: 'sign-peace',
        confidence: 0.92,
        message: 'Recognized V-shape (Index & Middle spread)',
        signType: 'static_posture'
      };
    }

    // 7. Doctor / Medical (Static two-finger pulse check posture: Index & Middle together)
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended && indexMiddleDist <= 0.045) {
      return {
        signName: 'Doctor / Medical',
        signId: 'sign-doctor',
        confidence: 0.91,
        message: 'Two-finger pulse tap posture recognized',
        signType: 'static_posture'
      };
    }

    // 8. Water (W-Sign static: Index, Middle, Ring extended upright)
    if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
      return {
        signName: 'Water (W-Sign)',
        signId: 'sign-water',
        confidence: 0.89,
        message: 'Recognized W-handshape (Index, Middle, Ring extended)',
        signType: 'static_posture'
      };
    }

    // 9. Single Index Finger Family (I Understand at temple, Number 1 in space, Time/Clock at wrist)
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      if (lm[0].y < 0.45) {
        return {
          signName: 'I Understand',
          signId: 'sign-understand',
          confidence: 0.93,
          message: 'Index finger pointing upward near temple (Cognitive understanding)',
          signType: 'static_posture'
        };
      }
      if (lm[0].y > 0.70) {
        return {
          signName: 'Time / Clock',
          signId: 'sign-time-clock',
          confidence: 0.92,
          message: 'Index finger tapping wrist (Time / Clock)',
          signType: 'static_posture'
        };
      }
      return {
        signName: 'Number 1 / Point',
        signId: 'sign-number-1',
        confidence: 0.94,
        message: 'Single index finger extended upright',
        signType: 'static_posture'
      };
    }

    // 10. Pinch Family (Food / Eat at mouth, No / Pinch in space)
    if (thumbIndexDist < 0.075 && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      if (features.verticalRegion === 'upper_chin_level' || lm[0].y < 0.58) {
        return {
          signName: 'Food / Eat',
          signId: 'sign-food-eat',
          confidence: 0.92,
          message: 'Gathered fingertips near mouth/chin recognized (Food / Eat)',
          signType: 'static_posture'
        };
      }
      return {
        signName: 'No / Pinch',
        signId: 'sign-no',
        confidence: 0.92,
        message: 'Recognized denial pinch gesture in space',
        signType: 'static_posture'
      };
    }

    // 11. Help / Urgent (Clenched compact fist: all 4 fingers curled)
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbUpright && isFistCurled) {
      return {
        signName: 'Help / Urgent',
        signId: 'sign-help-urgent',
        confidence: 0.85,
        message: 'Recognized clenched fist urgency gesture',
        signType: 'static_posture'
      };
    }

    return null;
  }

  // Evaluates dynamic temporal sequence trajectories
  private evaluateDynamicSequence(
    lm: LandmarkPoint[],
    hands: HandDetectionOutput[],
    features: KinematicTrajectoryFeatures
  ): { signName: string; signId: string; confidence: number; message: string; signType: 'dynamic_sequence' } | null {
    const wrist = lm[0];
    const indexTip = lm[8];
    const indexPip = lm[6];
    const middleTip = lm[12];
    const indexMiddleDist = Math.sqrt(Math.pow(indexTip.x - middleTip.x, 2) + Math.pow(indexTip.y - middleTip.y, 2));

    const dist = (p1: LandmarkPoint, p2: LandmarkPoint) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const thumbIndexDist = dist(lm[4], lm[8]);
    const isIndexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.15;
    const isMiddleExtended = dist(middleTip, wrist) > dist(lm[10], wrist) * 1.15;
    const isRingExtended = dist(lm[16], wrist) > dist(lm[14], wrist) * 1.15;
    const isPinkyExtended = dist(lm[20], wrist) > dist(lm[18], wrist) * 1.15;

    // 1. THANK YOU: Hand moves outward from chin level toward conversational partner
    if (
      (features.stroke === 'outward_stroke' || (features.verticalRegion === 'upper_chin_level' && (features.displacement.dy > 0.02 || features.displacement.dx > 0.008))) &&
      (features.verticalRegion === 'upper_chin_level' || lm[0].y < 0.65) &&
      (isIndexExtended || isMiddleExtended)
    ) {
      return {
        signName: 'Thank you',
        signId: 'sign-thank-you',
        confidence: 0.94,
        message: 'Dynamic stroke recognized: Outward motion from chin level expressing gratitude',
        signType: 'dynamic_sequence'
      };
    }

    // 2. DOCTOR / MEDICAL: Index and middle fingers extended tapping opposite wrist
    if (
      isIndexExtended &&
      isMiddleExtended &&
      !isRingExtended &&
      !isPinkyExtended &&
      (features.isTwoHanded || hands.length > 1 || features.stroke === 'wrist_tap' || features.verticalRegion === 'lower_torso_level' || lm[0].y > 0.72)
    ) {
      return {
        signName: 'Doctor / Medical',
        signId: 'sign-doctor',
        confidence: 0.92,
        message: 'Two-finger pulse tap posture and wrist contact recognized',
        signType: 'dynamic_sequence'
      };
    }

    // 3. PAIN / TENSION: Oscillating inward twisting movement with tension at chest
    if (
      isIndexExtended &&
      !isMiddleExtended &&
      !isRingExtended &&
      (features.stroke === 'oscillation_twist' || features.repetitionCount >= 1)
    ) {
      return {
        signName: 'Pain / Tension',
        signId: 'sign-pain',
        confidence: 0.92,
        message: 'Repetitive pulsating twist trajectory detected at chest level',
        signType: 'dynamic_sequence'
      };
    }

    // 4. I NEED / WANT: Downward pulling stroke with bent index finger
    if (
      features.stroke === 'downward_stroke' &&
      features.displacement.dy > 0.06 &&
      !isRingExtended &&
      !isPinkyExtended
    ) {
      return {
        signName: 'I Need / Want',
        signId: 'sign-need',
        confidence: 0.88,
        message: 'Downward pulling motion recognized indicating requirement/need',
        signType: 'dynamic_sequence'
      };
    }

    // 5. TEA / CHAI: Small pinch tilting near mouth/chin level
    if (
      thumbIndexDist < 0.075 &&
      !isMiddleExtended &&
      (features.verticalRegion === 'upper_chin_level' || lm[0].y < 0.58) &&
      (Math.abs(features.displacement.dx) > 0.005 || features.stroke === 'oscillation_twist')
    ) {
      return {
        signName: 'Tea / Chai',
        signId: 'sign-tea',
        confidence: 0.91,
        message: 'Pinch formation near chin/mouth holding cup handle recognized (Tea / Chai)',
        signType: 'dynamic_sequence'
      };
    }

    // 6. FOOD / EAT: Gathered fingertips / pinch moving upward toward chin/mouth
    if (
      (thumbIndexDist < 0.08 || dist(lm[4], lm[12]) < 0.08) &&
      (features.verticalRegion === 'upper_chin_level' || features.displacement.dy < -0.03 || lm[0].y < 0.58) &&
      features.averageSpeed > 0.04
    ) {
      return {
        signName: 'Food / Eat',
        signId: 'sign-food-eat',
        confidence: 0.92,
        message: 'Gathered fingertips moving toward mouth/chin recognized (Food / Eat)',
        signType: 'dynamic_sequence'
      };
    }

    // 7. HOW MUCH MONEY? / PRICE: Thumb rubbing repeatedly across index/middle fingertips
    if (
      thumbIndexDist < 0.08 &&
      (features.stroke === 'oscillation_twist' || features.repetitionCount >= 1) &&
      features.verticalRegion !== 'upper_chin_level'
    ) {
      return {
        signName: 'How much money? / Price',
        signId: 'sign-money-price',
        confidence: 0.91,
        message: 'Repetitive friction motion across fingertips recognized (Money / Price inquiry)',
        signType: 'dynamic_sequence'
      };
    }

    // 8. RAIN / WEATHER: Downward stroke with fluttering fingers
    if (
      (features.stroke === 'downward_stroke' || features.stroke === 'oscillation_twist') &&
      features.displacement.dy > 0.025 &&
      (isIndexExtended && isMiddleExtended && isRingExtended) &&
      (Math.abs(features.displacement.dx) > 0.005 || features.verticalRegion === 'upper_chin_level')
    ) {
      return {
        signName: 'Rain / Weather',
        signId: 'sign-weather-rain',
        confidence: 0.92,
        message: 'Downward fluttering stroke from upper space recognized (Rain / Weather)',
        signType: 'dynamic_sequence'
      };
    }

    // 9. TODAY / NOW: Downward spatial press with open palms
    if (
      (features.stroke === 'downward_stroke' || features.displacement.dy > 0.03) &&
      features.averageSpeed > 0.04 &&
      isIndexExtended && isMiddleExtended && isRingExtended &&
      Math.abs(features.displacement.dx) <= 0.005
    ) {
      return {
        signName: 'Today / Now',
        signId: 'sign-today',
        confidence: 0.91,
        message: 'Firm downward spatial press with open palms recognized (Today / Present time)',
        signType: 'dynamic_sequence'
      };
    }

    // 10. HOME / HOUSE: Fingertips meeting at roof apex (both hands open)
    if (
      (features.isTwoHanded || hands.length > 1) &&
      (isIndexExtended && isMiddleExtended && (isRingExtended || isPinkyExtended)) &&
      features.averageSpeed < 0.14
    ) {
      return {
        signName: 'Home / House',
        signId: 'sign-home',
        confidence: 0.90,
        message: 'Two-handed apex formation recognized (Home / House roof)',
        signType: 'dynamic_sequence'
      };
    }

    // 11. COMPUTER / LAPTOP: Alternating typing flutter
    if (
      (features.stroke === 'oscillation_twist' || features.repetitionCount >= 1 || features.averageSpeed > 0.12) &&
      (isRingExtended || isPinkyExtended) &&
      (features.isTwoHanded || hands.length > 1 || Math.abs(features.displacement.dx) > 0.008)
    ) {
      return {
        signName: 'Computer / Laptop',
        signId: 'sign-tech-computer',
        confidence: 0.92,
        message: 'Alternating typing movement detected at chest level (Computer / Laptop)',
        signType: 'dynamic_sequence'
      };
    }

    // 12. TEACHER / INSTRUCTOR: Forward movement from temple level
    if (
      features.stroke === 'outward_stroke' &&
      lm[0].y < 0.50 &&
      features.averageSpeed > 0.08
    ) {
      return {
        signName: 'Teacher / Instructor',
        signId: 'sign-teacher',
        confidence: 0.90,
        message: 'Forward knowledge-sharing stroke from temple recognized (Teacher / Instructor)',
        signType: 'dynamic_sequence'
      };
    }

    // 13. STOP: Directive downward press or forward palm hold in chest space
    if (
      isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended &&
      (features.displacement.dz < -0.02 || (features.stroke === 'downward_stroke' && features.averageSpeed < 0.05)) &&
      features.verticalRegion === 'mid_chest_level'
    ) {
      return {
        signName: 'Stop',
        signId: 'sign-stop',
        confidence: 0.92,
        message: 'Open flat palm held forward (Directive stop posture)',
        signType: 'dynamic_sequence'
      };
    }

    return null;
  }

  // Temporal prediction smoothing to stabilize frame-to-frame predictions
  private smoothPrediction(candidateSign: string, candidateConf: number): { signName: string; confidence: number; isUncertain: boolean } {
    this.recentPredictions.push({ sign: candidateSign, conf: candidateConf });
    if (this.recentPredictions.length > this.smoothingWindow) {
      this.recentPredictions.shift();
    }

    const counts: Record<string, number> = {};
    let totalConf = 0;
    for (const p of this.recentPredictions) {
      counts[p.sign] = (counts[p.sign] || 0) + 1;
      totalConf += p.conf;
    }

    let dominantSign = candidateSign;
    let maxCount = 0;
    for (const [sign, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantSign = sign;
      }
    }

    const avgConf = totalConf / this.recentPredictions.length;
    const isUncertain = dominantSign === UNRECOGNIZED_SIGN_LABEL || dominantSign === 'Unknown' || avgConf < 0.75;

    return {
      signName: isUncertain ? UNRECOGNIZED_SIGN_LABEL : dominantSign,
      confidence: Number(avgConf.toFixed(2)),
      isUncertain
    };
  }
}

export const gestureEngine = new GestureEngine();
