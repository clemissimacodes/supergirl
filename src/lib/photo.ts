import { clamp } from "./engine";
import { DEFAULT_FRAME, type Frame, type Sex } from "./types";

export interface Point {
  x: number;
  y: number;
  visibility?: number;
}

/** MediaPipe Pose landmark indices we rely on. */
const LM = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

/** Sex-typical proportions as a fraction of standing height. */
const TYPICAL = {
  male: { shoulder: 0.234, hipJoint: 0.11, torso: 0.285, leg: 0.49 },
  female: { shoulder: 0.216, hipJoint: 0.12, torso: 0.285, leg: 0.49 },
} as const;

export interface FrameEstimate {
  frame: Frame;
  confidence: number;
  notes: string[];
}

/**
 * Estimate skeletal frame from a single front-facing pose in pixel coordinates.
 * Only ratios are used, so the camera distance does not matter.
 */
export function frameFromLandmarks(pts: Point[], sex: Sex): FrameEstimate | null {
  const needed = Object.values(LM).map((i) => pts[i]);
  if (needed.some((p) => !p)) return null;
  const vis = needed.map((p) => p.visibility ?? 1);
  const confidence = Math.min(...vis);
  if (confidence < 0.3) return null;

  const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const shoulderMid = mid(pts[LM.leftShoulder], pts[LM.rightShoulder]);
  const hipMid = mid(pts[LM.leftHip], pts[LM.rightHip]);
  const ankleMid = mid(pts[LM.leftAnkle], pts[LM.rightAnkle]);

  const shoulderW = Math.abs(pts[LM.leftShoulder].x - pts[LM.rightShoulder].x);
  const hipW = Math.abs(pts[LM.leftHip].x - pts[LM.rightHip].x);
  const torso = hipMid.y - shoulderMid.y;
  const leg = ankleMid.y - hipMid.y;
  // Head top sits roughly one nose-to-shoulder distance above the nose.
  const headTop = pts[LM.nose].y - (shoulderMid.y - pts[LM.nose].y) * 0.9;
  const height = ankleMid.y - headTop + Math.abs(torso) * 0.15;
  if (height <= 0 || torso <= 0 || leg <= 0) return null;

  const t = TYPICAL[sex];
  const notes: string[] = [];
  const shoulderWidth = clamp(shoulderW / height / t.shoulder, 0.8, 1.25);
  const hipWidth = clamp(hipW / height / t.hipJoint, 0.8, 1.25);
  const torsoLength = clamp(torso / height / t.torso, 0.85, 1.15);
  const limbLength = clamp(leg / height / t.leg, 0.85, 1.15);

  if (shoulderWidth > 1.08) notes.push("Broader-than-average shoulders");
  if (shoulderWidth < 0.92) notes.push("Narrower shoulders");
  if (hipWidth > 1.08) notes.push("Wider hip frame");
  if (hipWidth < 0.92) notes.push("Narrow hip frame");
  if (torsoLength > 1.06) notes.push("Long torso");
  if (torsoLength < 0.94) notes.push("Short torso, long legs");
  if (notes.length === 0) notes.push("Proportions close to typical");

  return {
    frame: { shoulderWidth, hipWidth, torsoLength, limbLength },
    confidence,
    notes,
  };
}

export { DEFAULT_FRAME };
