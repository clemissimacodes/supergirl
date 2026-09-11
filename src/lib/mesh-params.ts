import { bodyFatPct, muscleScale } from "./engine";
import type { BodyState, Frame, Profile, Region } from "./types";

/**
 * Concrete dimensions (metres) for the procedural body. Everything the 3D
 * rig needs is here so it never has to know about kilograms or sets.
 */
export interface MeshParams {
  height: number;
  y: {
    head: number;
    chin: number;
    neck: number;
    shoulder: number;
    chest: number;
    midriff: number;
    waist: number;
    upperHip: number;
    hip: number;
    crotch: number;
    elbow: number;
    wrist: number;
    knee: number;
    ankle: number;
  };
  headR: number;
  neckR: number;
  shoulderHalfWidth: number;
  deltoidR: number;
  chestRx: number;
  chestRz: number;
  backBulge: number;
  pecR: number;
  waistRx: number;
  waistRz: number;
  hipRx: number;
  hipRz: number;
  gluteR: number;
  upperArmR: number;
  forearmR: number;
  wristR: number;
  thighRx: number;
  thighRz: number;
  kneeR: number;
  calfR: number;
  ankleR: number;
  heat: Record<Region, number> | null;
}

const BASE = {
  male: {
    refHeight: 1.75,
    refBf: 15,
    shoulderHalfWidth: 0.205,
    chestRx: 0.165,
    chestRz: 0.105,
    waistRx: 0.135,
    waistRz: 0.1,
    hipRx: 0.16,
    hipRz: 0.11,
    neckR: 0.055,
    headR: 0.095,
    deltoidR: 0.064,
    pecR: 0.055,
    gluteR: 0.085,
    upperArmR: 0.046,
    forearmR: 0.038,
    wristR: 0.028,
    thighR: 0.085,
    kneeR: 0.055,
    calfR: 0.058,
    ankleR: 0.035,
    fatWaist: 2.0,
    fatHip: 0.9,
    fatThigh: 0.8,
    fatArm: 0.7,
    fatChest: 0.8,
  },
  female: {
    refHeight: 1.62,
    refBf: 24,
    shoulderHalfWidth: 0.175,
    chestRx: 0.145,
    chestRz: 0.1,
    waistRx: 0.115,
    waistRz: 0.088,
    hipRx: 0.17,
    hipRz: 0.115,
    neckR: 0.047,
    headR: 0.09,
    deltoidR: 0.05,
    pecR: 0.06,
    gluteR: 0.092,
    upperArmR: 0.04,
    forearmR: 0.033,
    wristR: 0.025,
    thighR: 0.086,
    kneeR: 0.052,
    calfR: 0.054,
    ankleR: 0.032,
    fatWaist: 1.5,
    fatHip: 1.3,
    fatThigh: 1.2,
    fatArm: 0.8,
    fatChest: 1.0,
  },
} as const;

export function meshParams(
  body: BodyState,
  profile: Profile,
  frame: Frame,
  heat: Record<Region, number> | null = null,
): MeshParams {
  const b = BASE[profile.sex];
  const H = profile.heightCm / 100;
  const s = H / b.refHeight;
  const bf = bodyFatPct(body);
  const fat = (k: number) => 1 + (k * (bf - b.refBf)) / 100;
  const ms = muscleScale(body, profile);
  // Cross-section radius grows with the square root of muscle mass.
  const m = (r: Region, k = 1) => 1 + (Math.sqrt(ms[r]) - 1) * k;

  const torsoStretch = frame.torsoLength;
  const legStretch = frame.limbLength;
  const shoulderY = H * 0.815;
  const hipY = shoulderY - H * 0.285 * torsoStretch;
  const crotchY = hipY - H * 0.04;
  const kneeY = crotchY - (crotchY - H * 0.045) * 0.55 * (2 - legStretch);

  return {
    height: H,
    y: {
      head: H * 0.935,
      chin: H * 0.87,
      neck: H * 0.85,
      shoulder: shoulderY,
      chest: shoulderY - H * 0.085 * torsoStretch,
      midriff: shoulderY - H * 0.14 * torsoStretch,
      waist: shoulderY - H * 0.19 * torsoStretch,
      upperHip: shoulderY - H * 0.24 * torsoStretch,
      hip: hipY,
      crotch: crotchY,
      elbow: shoulderY - H * 0.19,
      wrist: shoulderY - H * 0.37 * legStretch,
      knee: kneeY,
      ankle: H * 0.045,
    },
    headR: b.headR * s,
    neckR: b.neckR * s * fat(0.4),
    shoulderHalfWidth: b.shoulderHalfWidth * s * frame.shoulderWidth * m("shoulders", 0.25),
    deltoidR: b.deltoidR * s * m("shoulders", 1.1) * fat(0.3),
    chestRx: b.chestRx * s * frame.shoulderWidth * m("back", 0.5) * m("chest", 0.15) * fat(0.5),
    chestRz: b.chestRz * s * m("chest", 0.3) * m("back", 0.3) * fat(b.fatChest),
    backBulge: 0.012 * s * (m("back", 1) - 1) * 4,
    pecR: b.pecR * s * m("chest", 0.9) * fat(b.fatChest * 0.6),
    waistRx: b.waistRx * s * fat(b.fatWaist * 0.8) * m("core", -0.1),
    waistRz: b.waistRz * s * fat(b.fatWaist) * m("core", -0.15),
    hipRx: b.hipRx * s * frame.hipWidth * fat(b.fatHip),
    hipRz: b.hipRz * s * fat(b.fatHip) * m("glutes", 0.3),
    gluteR: b.gluteR * s * frame.hipWidth * m("glutes", 1.0) * fat(b.fatHip * 0.5),
    upperArmR: b.upperArmR * s * m("arms", 1.0) * m("shoulders", 0.2) * fat(b.fatArm),
    forearmR: b.forearmR * s * m("arms", 0.5) * fat(b.fatArm * 0.6),
    wristR: b.wristR * s,
    thighRx: b.thighR * s * m("quads", 0.9) * m("hamstrings", 0.2) * fat(b.fatThigh),
    thighRz: b.thighR * s * m("quads", 0.5) * m("hamstrings", 0.7) * fat(b.fatThigh),
    kneeR: b.kneeR * s * fat(0.3),
    calfR: b.calfR * s * m("calves", 1.0) * fat(0.4),
    ankleR: b.ankleR * s,
    heat,
  };
}

export function lerpParams(a: MeshParams, b: MeshParams, t: number): MeshParams {
  const l = (x: number, y: number) => x + (y - x) * t;
  const out = { ...a, y: { ...a.y } } as MeshParams;
  for (const k of Object.keys(a) as (keyof MeshParams)[]) {
    if (k === "y" || k === "heat") continue;
    (out as unknown as Record<string, number>)[k] = l(a[k] as number, b[k] as number);
  }
  for (const k of Object.keys(a.y) as (keyof MeshParams["y"])[]) out.y[k] = l(a.y[k], b.y[k]);
  out.heat = b.heat;
  return out;
}
