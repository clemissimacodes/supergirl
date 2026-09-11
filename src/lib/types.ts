export type Sex = "female" | "male";

export type Region =
  | "shoulders"
  | "chest"
  | "back"
  | "arms"
  | "core"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";

export const REGIONS: Region[] = [
  "shoulders",
  "chest",
  "back",
  "arms",
  "core",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
];

export const REGION_LABEL: Record<Region, string> = {
  shoulders: "Shoulders",
  chest: "Chest",
  back: "Back",
  arms: "Arms",
  core: "Core",
  glutes: "Glutes",
  quads: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

export type Activity = "sedentary" | "light" | "moderate" | "active";
export type TrainingAge = "beginner" | "intermediate" | "advanced";

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  activity: Activity;
  trainingAge: TrainingAge;
}

/** Skeletal proportions relative to a sex-typical frame (1.0 = typical). */
export interface Frame {
  shoulderWidth: number;
  hipWidth: number;
  torsoLength: number;
  limbLength: number;
}

export const DEFAULT_FRAME: Frame = {
  shoulderWidth: 1,
  hipWidth: 1,
  torsoLength: 1,
  limbLength: 1,
};

/** Physical composition that drives both the metrics and the 3D body. */
export interface BodyState {
  fatKg: number;
  /** Non-muscle lean mass (organs, bone, water). Constant over the sim. */
  otherLeanKg: number;
  muscleKg: Record<Region, number>;
}

export interface Exercise {
  id: string;
  name: string;
  /** Fraction of each hard set that counts toward the region. Sums to ~1. */
  regions: Partial<Record<Region, number>>;
  kind: "compound" | "isolation" | "cardio";
  cue: string;
}

export interface SetEntry {
  exerciseId: string;
  sets: number;
  reps: number;
  weightKg?: number;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  entries: SetEntry[];
  cardioMin?: number;
}

export interface MealLog {
  id: string;
  date: string;
  name: string;
  kcal: number;
  proteinG: number;
}

export interface PlanDay {
  label: string;
  entries: SetEntry[];
  cardioMin?: number;
}

export interface Plan {
  id: string;
  name: string;
  /** Seven entries, Monday first. Empty entries are rest days. */
  days: PlanDay[];
  kcal: number;
  proteinG: number;
  emoji: string;
}

export interface CheckIn {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  bodyFatPct?: number;
  predictedWeightKg: number;
  note?: string;
}

export interface Calibration {
  /** Personal multiplier on fat-mass change rate, learned from check-ins. */
  fatRate: number;
  /** Personal multiplier on muscle gain rate, learned from check-ins. */
  leanRate: number;
}

export interface Anchor {
  date: string;
  body: BodyState;
}

export type Scenario = "commit" | "current";

export interface Metrics {
  weightKg: number;
  bodyFatPct: number;
  leanKg: number;
  muscleKg: number;
  waistCm: number;
}

export interface WeekPoint {
  week: number;
  date: string;
  body: BodyState;
  metrics: Metrics;
  weeklySets: Record<Region, number>;
}
