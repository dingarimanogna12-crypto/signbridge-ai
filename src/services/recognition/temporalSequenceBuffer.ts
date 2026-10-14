import { LandmarkPoint, HandDetectionOutput } from '../handLandmarkDetector';

export interface SequenceFrame {
  timestamp: number;
  hands: HandDetectionOutput[];
}

export type TrajectoryStroke = 
  | 'static' 
  | 'outward_stroke' 
  | 'downward_stroke' 
  | 'wrist_tap' 
  | 'oscillation_twist' 
  | 'uncertain_motion';

export interface KinematicTrajectoryFeatures {
  durationMs: number;
  frameCount: number;
  averageSpeed: number; // units per second
  displacement: { dx: number; dy: number; dz: number };
  stroke: TrajectoryStroke;
  verticalRegion: 'upper_chin_level' | 'mid_chest_level' | 'lower_torso_level';
  isTwoHanded: boolean;
  handsDistance: number | null; // distance between hands when two hands present
  repetitionCount: number;
}

export class TemporalSequenceBuffer {
  private frames: SequenceFrame[] = [];
  private maxWindowSize: number; // typically 30-45 frames
  private maxDurationMs: number; // typically 1500ms

  constructor(maxWindowSize = 45, maxDurationMs = 1500) {
    this.maxWindowSize = maxWindowSize;
    this.maxDurationMs = maxDurationMs;
  }

  public push(hands: HandDetectionOutput[], timestamp = Date.now()): void {
    this.frames.push({ timestamp, hands });

    // Prune old frames by count and timestamp
    if (this.frames.length > this.maxWindowSize) {
      this.frames.shift();
    }

    const cutoff = timestamp - this.maxDurationMs;
    while (this.frames.length > 0 && this.frames[0].timestamp < cutoff) {
      this.frames.shift();
    }
  }

  public clear(): void {
    this.frames = [];
  }

  public getFrames(): SequenceFrame[] {
    return [...this.frames];
  }

  public getFrameCount(): number {
    return this.frames.length;
  }

  // Extract kinematic movement trajectory features across the current temporal sliding window
  public extractFeatures(): KinematicTrajectoryFeatures {
    if (this.frames.length < 5) {
      return {
        durationMs: 0,
        frameCount: this.frames.length,
        averageSpeed: 0,
        displacement: { dx: 0, dy: 0, dz: 0 },
        stroke: 'static',
        verticalRegion: 'mid_chest_level',
        isTwoHanded: false,
        handsDistance: null,
        repetitionCount: 0
      };
    }

    const firstFrame = this.frames[0];
    const lastFrame = this.frames[this.frames.length - 1];
    const durationMs = Math.max(1, lastFrame.timestamp - firstFrame.timestamp);

    // Primary hand tracking (first hand in detected hands array)
    const validPrimaryPoints: LandmarkPoint[] = [];
    let twoHandedFramesCount = 0;
    let totalHandsDist = 0;
    let handsDistCount = 0;

    for (const frame of this.frames) {
      if (frame.hands.length > 0 && frame.hands[0].landmarks.length > 0) {
        validPrimaryPoints.push(frame.hands[0].landmarks[0]); // Wrist
      }
      if (frame.hands.length >= 2) {
        twoHandedFramesCount++;
        const p1 = frame.hands[0].landmarks[0];
        const p2 = frame.hands[1].landmarks[0];
        if (p1 && p2) {
          const d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          totalHandsDist += d;
          handsDistCount++;
        }
      }
    }

    if (validPrimaryPoints.length < 5) {
      return {
        durationMs,
        frameCount: this.frames.length,
        averageSpeed: 0,
        displacement: { dx: 0, dy: 0, dz: 0 },
        stroke: 'static',
        verticalRegion: 'mid_chest_level',
        isTwoHanded: false,
        handsDistance: null,
        repetitionCount: 0
      };
    }

    // Displacement of wrist
    const startWrist = validPrimaryPoints[0];
    const endWrist = validPrimaryPoints[validPrimaryPoints.length - 1];
    const dx = endWrist.x - startWrist.x;
    const dy = endWrist.y - startWrist.y;
    const dz = endWrist.z - startWrist.z;

    // Total distance traveled along path
    let pathLength = 0;
    for (let i = 1; i < validPrimaryPoints.length; i++) {
      const pPrev = validPrimaryPoints[i - 1];
      const pCurr = validPrimaryPoints[i];
      pathLength += Math.sqrt(Math.pow(pCurr.x - pPrev.x, 2) + Math.pow(pCurr.y - pPrev.y, 2));
    }

    const averageSpeed = (pathLength / (durationMs / 1000)); // speed in norm-coords per sec

    // Vertical region in camera frame (y: 0 is top, 1 is bottom)
    const avgY = validPrimaryPoints.reduce((sum, p) => sum + p.y, 0) / validPrimaryPoints.length;
    let verticalRegion: 'upper_chin_level' | 'mid_chest_level' | 'lower_torso_level' = 'mid_chest_level';
    if (avgY < 0.58) {
      verticalRegion = 'upper_chin_level';
    } else if (avgY > 0.72) {
      verticalRegion = 'lower_torso_level';
    }

    // Detect oscillation / wrist reversals (for pulsating signs like Pain)
    let reversals = 0;
    for (let i = 2; i < validPrimaryPoints.length; i++) {
      const diff1 = validPrimaryPoints[i - 1].x - validPrimaryPoints[i - 2].x;
      const diff2 = validPrimaryPoints[i].x - validPrimaryPoints[i - 1].x;
      if (Math.sign(diff1) !== Math.sign(diff2) && Math.abs(diff1) > 0.004 && Math.abs(diff2) > 0.004) {
        reversals++;
      }
    }

    // Two-handed classification
    const isTwoHanded = (twoHandedFramesCount / this.frames.length) > 0.5;
    const avgHandsDist = handsDistCount > 0 ? (totalHandsDist / handsDistCount) : null;

    // Stroke trajectory pattern matching
    let stroke: TrajectoryStroke = 'static';
    if (pathLength < 0.025) {
      stroke = 'static';
    } else if (reversals >= 1 && dy < 0.02) {
      stroke = 'oscillation_twist';
    } else if (isTwoHanded && avgHandsDist !== null && avgHandsDist < 0.18) {
      stroke = 'wrist_tap';
    } else if ((dy > 0.02 || Math.abs(dx) > 0.02) && startWrist.y < 0.60) {
      stroke = 'outward_stroke';
    } else if (dy > 0.025 && Math.abs(dx) < 0.08) {
      stroke = 'downward_stroke';
    } else {
      stroke = 'uncertain_motion';
    }

    return {
      durationMs,
      frameCount: this.frames.length,
      averageSpeed,
      displacement: { dx, dy, dz },
      stroke,
      verticalRegion,
      isTwoHanded,
      handsDistance: avgHandsDist,
      repetitionCount: Math.floor(reversals / 2)
    };
  }

  public reset(): void {
    this.frames = [];
  }
}

export const temporalSequenceBuffer = new TemporalSequenceBuffer();
export const temporalBuffer = temporalSequenceBuffer;

