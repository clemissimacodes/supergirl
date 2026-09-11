import { EXERCISE_BY_ID } from "./exercises";
import { addDays, daysBetween } from "./dates";
import {
  REGIONS,
  type Anchor,
  type BodyState,
  type Calibration,
  type CheckIn,
  type MealLog,
  type Metrics,
  type Plan,
  type Profile,
  type Region,
  type Scenario,
  type SetEntry,
  type Sex,
  type WeekPoint,
  type WorkoutLog,
} from "./types";

/** Share of total skeletal muscle held by each region (sums to 1). */
export const REGION_SHARE: Record<Region, number> = {
  quads: 0.18,
  hamstrings: 0.1,
  glutes: 0.12,
  calves: 0.08,
  back: 0.16,
  chest: 0.08,
  shoulders: 0.07,
  arms: 0.11,
  core: 0.1,
};

const ACTIVITY_FACTOR = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 } as const;
const KCAL_PER_KG_FAT = 7700;
const KCAL_PER_KG_MUSCLE = 1800;
const KCAL_PER_SET = 8;
const KCAL_PER_CARDIO_MIN = 8;
const WEEKS_PER_MONTH = 4.33;

export const DEFAULT_CALIBRATION: Calibration = { fatRate: 1, leanRate: 1 };

export function emptyRegions(): Record<Region, number> {
  return Object.fromEntries(REGIONS.map((r) => [r, 0])) as Record<Region, number>;
}

/** Skeletal muscle of an untrained adult of this sex and height. */
export function baselineMuscleKg(sex: Sex, heightCm: number): number {
  return sex === "male" ? 30 * (heightCm / 175) ** 2 : 20 * (heightCm / 162) ** 2;
}

export function estimateBodyFatPct(p: Profile): number {
  const bmi = p.weightKg / (p.heightCm / 100) ** 2;
  const est = 1.2 * bmi + 0.23 * p.age - (p.sex === "male" ? 10.8 : 0) - 5.4;
  return clamp(est, p.sex === "male" ? 6 : 14, 50);
}

export function initialBody(p: Profile): BodyState {
  const bf = (p.bodyFatPct ?? estimateBodyFatPct(p)) / 100;
  const fatKg = p.weightKg * bf;
  const leanKg = p.weightKg - fatKg;
  const ageMult = { beginner: 1, intermediate: 1.08, advanced: 1.16 }[p.trainingAge];
  const totalMuscle = Math.min(baselineMuscleKg(p.sex, p.heightCm) * ageMult, leanKg * 0.6);
  const muscleKg = Object.fromEntries(
    REGIONS.map((r) => [r, totalMuscle * REGION_SHARE[r]]),
  ) as Record<Region, number>;
  return { fatKg, otherLeanKg: leanKg - totalMuscle, muscleKg };
}

export function totalMuscle(b: BodyState): number {
  return REGIONS.reduce((s, r) => s + b.muscleKg[r], 0);
}

export function bodyWeight(b: BodyState): number {
  return b.fatKg + b.otherLeanKg + totalMuscle(b);
}

export function bodyFatPct(b: BodyState): number {
  return (b.fatKg / bodyWeight(b)) * 100;
}

export function metricsFor(b: BodyState, p: Profile): Metrics {
  const weightKg = bodyWeight(b);
  const bf = bodyFatPct(b);
  const waistCm =
    p.sex === "male" ? p.heightCm * (0.3 + 0.0095 * bf) : p.heightCm * (0.28 + 0.0065 * bf);
  return {
    weightKg,
    bodyFatPct: bf,
    leanKg: weightKg - b.fatKg,
    muscleKg: totalMuscle(b),
    waistCm,
  };
}

/** Muscle size of each region relative to the untrained baseline for this person. */
export function muscleScale(b: BodyState, p: Profile): Record<Region, number> {
  const base = baselineMuscleKg(p.sex, p.heightCm);
  return Object.fromEntries(
    REGIONS.map((r) => [r, b.muscleKg[r] / (base * REGION_SHARE[r])]),
  ) as Record<Region, number>;
}

export function bmr(p: Profile, weightKg: number): number {
  const base = 10 * weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : base - 161;
}

export function maintenanceKcal(p: Profile, weightKg = p.weightKg): number {
  return Math.round(bmr(p, weightKg) * ACTIVITY_FACTOR[p.activity]);
}

/** Hard sets per region contributed by a list of set entries. */
export function regionSets(entries: SetEntry[]): Record<Region, number> {
  const out = emptyRegions();
  for (const e of entries) {
    const ex = EXERCISE_BY_ID[e.exerciseId];
    if (!ex) continue;
    const stimulus = ex.kind === "cardio" ? 0.25 : 1;
    for (const [r, w] of Object.entries(ex.regions)) {
      out[r as Region] += e.sets * (w ?? 0) * stimulus;
    }
  }
  return out;
}

export function planWeeklySets(plan: Plan | undefined): Record<Region, number> {
  if (!plan) return emptyRegions();
  return regionSets(plan.days.flatMap((d) => d.entries));
}

export function totalSets(entries: SetEntry[]): number {
  return entries.reduce((s, e) => s + e.sets, 0);
}

function sumRegions(r: Record<Region, number>): number {
  return REGIONS.reduce((s, k) => s + r[k], 0);
}

/**
 * Growth response to weekly hard sets. Normalised so ~15 sets/week = 1.0,
 * saturating around 1.25 at very high volume.
 */
export function volumeResponse(sets: number): number {
  return Math.min(1.25, (1.6 * sets) / (sets + 9));
}

function proteinGate(gPerKg: number): number {
  if (gPerKg >= 1.6) return 1;
  if (gPerKg >= 1.2) return 0.8;
  if (gPerKg >= 0.8) return 0.55;
  return 0.4;
}

function energyModifier(dailyBalance: number): number {
  if (dailyBalance < -500) return 0.5;
  if (dailyBalance < -100) return 0.8;
  if (dailyBalance <= 150) return 1;
  return 1.15;
}

/** Monthly muscle-gain potential in kg for a well-run programme. */
export function monthlyPotentialKg(p: Profile): number {
  const table = {
    beginner: { male: 1.0, female: 0.5 },
    intermediate: { male: 0.5, female: 0.25 },
    advanced: { male: 0.25, female: 0.12 },
  } as const;
  const base = table[p.trainingAge][p.sex];
  const age = p.age > 55 ? 0.7 : p.age > 40 ? 0.85 : 1;
  return base * age;
}

export interface WeekInput {
  sets: Record<Region, number>;
  kcal: number;
  proteinG: number;
  cardioMin: number;
}

/** Advance the body by one week (or a fraction of one) under the given inputs. */
export function simulateWeek(
  body: BodyState,
  p: Profile,
  cal: Calibration,
  input: WeekInput,
  fraction = 1,
): BodyState {
  const weight = bodyWeight(body);
  const trainingKcal = sumRegions(input.sets) * KCAL_PER_SET + input.cardioMin * KCAL_PER_CARDIO_MIN;
  const tdee = bmr(p, weight) * ACTIVITY_FACTOR[p.activity] + trainingKcal / 7;
  const dailyBalance = input.kcal - tdee;
  const pGate = proteinGate(input.proteinG / weight);
  const eMod = energyModifier(dailyBalance);
  const potentialWeek = (monthlyPotentialKg(p) / WEEKS_PER_MONTH) * cal.leanRate;
  const base = baselineMuscleKg(p.sex, p.heightCm);

  const muscleKg = { ...body.muscleKg };
  let leanGain = 0;
  for (const r of REGIONS) {
    const baselineKg = base * REGION_SHARE[r];
    const current = muscleKg[r];
    const relative = current / baselineKg;
    // Gains slow down the further a muscle is above its untrained size.
    const ceiling = 1 / (1 + Math.max(0, relative - 1) * 2);
    let delta = potentialWeek * REGION_SHARE[r] * volumeResponse(input.sets[r]) * pGate * eMod * ceiling;
    // Detraining: neglected muscles drift back toward baseline.
    if (input.sets[r] < 3 && current > baselineKg) delta -= (current - baselineKg) * 0.015;
    // Aggressive deficit with low protein costs some muscle everywhere.
    if (dailyBalance < -300 && pGate < 0.8) delta -= current * 0.002;
    delta *= fraction;
    muscleKg[r] = Math.max(baselineKg * 0.85, current + delta);
    leanGain += muscleKg[r] - current;
  }

  const weeklyBalance = dailyBalance * 7 * fraction;
  const fatDelta = ((weeklyBalance - leanGain * KCAL_PER_KG_MUSCLE) / KCAL_PER_KG_FAT) * cal.fatRate;
  const lean = body.otherLeanKg + sumRegions(muscleKg);
  const floorPct = p.sex === "male" ? 0.05 : 0.12;
  const fatFloor = (lean * floorPct) / (1 - floorPct);
  const fatKg = Math.max(fatFloor, body.fatKg + fatDelta);

  return { fatKg, otherLeanKg: body.otherLeanKg, muscleKg };
}

/** Actual sets/week completed vs. planned over the last 28 days, or null if no logs. */
export function measureAdherence(
  workouts: WorkoutLog[],
  plan: Plan | undefined,
  today: string,
): number | null {
  if (!plan) return null;
  const planned = totalSets(plan.days.flatMap((d) => d.entries)) * 4;
  if (planned === 0) return null;
  const recent = workouts.filter((w) => daysBetween(w.date, today) < 28 && daysBetween(w.date, today) >= 0);
  if (recent.length === 0) return null;
  const done = recent.reduce((s, w) => s + totalSets(w.entries), 0);
  return clamp(done / planned, 0, 1.2);
}

function mealsAverage(meals: MealLog[], from: string, to: string): { kcal: number; proteinG: number; days: number } | null {
  const inRange = meals.filter((m) => m.date >= from && m.date <= to);
  const days = new Set(inRange.map((m) => m.date)).size;
  if (days === 0) return null;
  return {
    kcal: inRange.reduce((s, m) => s + m.kcal, 0) / days,
    proteinG: inRange.reduce((s, m) => s + m.proteinG, 0) / days,
    days,
  };
}

function weekInputFromLogs(
  workouts: WorkoutLog[],
  meals: MealLog[],
  from: string,
  to: string,
  p: Profile,
  weightKg: number,
): WeekInput {
  const ws = workouts.filter((w) => w.date >= from && w.date <= to);
  const sets = regionSets(ws.flatMap((w) => w.entries));
  const cardioMin = ws.reduce((s, w) => s + (w.cardioMin ?? 0), 0);
  const avg = mealsAverage(meals, from, to);
  // Days without a food log are assumed to be roughly at maintenance.
  const maint = maintenanceKcal(p, weightKg);
  const kcal = avg ? (avg.kcal * avg.days + maint * (7 - avg.days)) / 7 : maint;
  const proteinG = avg ? (avg.proteinG * avg.days + weightKg * 1.2 * (7 - avg.days)) / 7 : weightKg * 1.2;
  return { sets, kcal, proteinG, cardioMin };
}

export interface ProjectionArgs {
  profile: Profile;
  calibration: Calibration;
  anchor: Anchor;
  workouts: WorkoutLog[];
  meals: MealLog[];
  plan?: Plan;
  scenario: Scenario;
  weeks: number;
  today: string;
}

export interface Projection {
  present: WeekPoint;
  /** future[0] is the present; future[weeks] is the horizon. */
  future: WeekPoint[];
  adherence: number;
  measuredAdherence: number | null;
}

/** Roll the anchor forward through real logs to today, then through the plan. */
export function project(a: ProjectionArgs): Projection {
  const { profile, calibration, anchor, workouts, meals, plan, scenario, weeks, today } = a;

  // Present: anchor -> today, driven by what actually happened.
  let body = anchor.body;
  let cursor = anchor.date;
  let lastSets = emptyRegions();
  // Today counts as a (partial) day so that logging something now shows up immediately.
  const totalDays = Math.max(0, daysBetween(anchor.date, today)) + 1;
  let remaining = totalDays;
  while (remaining > 0) {
    const span = Math.min(7, remaining);
    const to = addDays(cursor, span - 1);
    const input = weekInputFromLogs(workouts, meals, cursor, to, profile, bodyWeight(body));
    // A partial week counts its logged sets as if they were the whole week's pace.
    const paced = { ...input, sets: scaleRegions(input.sets, 7 / span), cardioMin: (input.cardioMin * 7) / span };
    body = simulateWeek(body, profile, calibration, paced, span / 7);
    lastSets = paced.sets;
    cursor = addDays(cursor, span);
    remaining -= span;
  }
  const present: WeekPoint = {
    week: 0,
    date: today,
    body,
    metrics: metricsFor(body, profile),
    weeklySets: lastSets,
  };

  // Future: today -> horizon, driven by the plan under the chosen scenario.
  const measured = measureAdherence(workouts, plan, today);
  const adherence = scenario === "commit" ? 1 : measured ?? 0.85;
  const planSets = scaleRegions(planWeeklySets(plan), adherence);
  const planCardio = (plan?.days.reduce((s, d) => s + (d.cardioMin ?? 0), 0) ?? 0) * adherence;
  const recentFood = scenario === "current" ? mealsAverage(meals, addDays(today, -13), today) : null;
  const useLoggedFood = recentFood !== null && recentFood.days >= 5;

  const future: WeekPoint[] = [present];
  let fb = body;
  for (let w = 1; w <= weeks; w++) {
    const weight = bodyWeight(fb);
    const kcal = useLoggedFood ? recentFood.kcal : plan?.kcal ?? maintenanceKcal(profile, weight);
    const proteinG = useLoggedFood ? recentFood.proteinG : plan?.proteinG ?? weight * 1.2;
    fb = simulateWeek(fb, profile, calibration, { sets: planSets, kcal, proteinG, cardioMin: planCardio });
    future.push({
      week: w,
      date: addDays(today, w * 7),
      body: fb,
      metrics: metricsFor(fb, profile),
      weeklySets: planSets,
    });
  }

  return { present, future, adherence, measuredAdherence: measured };
}

export function scaleRegions(r: Record<Region, number>, k: number): Record<Region, number> {
  return Object.fromEntries(REGIONS.map((x) => [x, r[x] * k])) as Record<Region, number>;
}

/**
 * Learn from a real measurement: nudge the personal fat-rate multiplier toward
 * whatever would have predicted the observed change, and re-anchor the body.
 */
export function applyCheckIn(
  checkIn: Pick<CheckIn, "weightKg" | "bodyFatPct" | "date">,
  predicted: BodyState,
  anchor: Anchor,
  calibration: Calibration,
): { calibration: Calibration; anchor: Anchor } {
  const anchorWeight = bodyWeight(anchor.body);
  const predictedChange = bodyWeight(predicted) - anchorWeight;
  const actualChange = checkIn.weightKg - anchorWeight;
  let fatRate = calibration.fatRate;
  if (Math.abs(predictedChange) > 0.3 && Math.sign(predictedChange) === Math.sign(actualChange)) {
    const ratio = clamp(actualChange / predictedChange, 0.4, 2);
    fatRate = clamp(fatRate * (1 + (ratio - 1) * 0.5), 0.5, 1.6);
  }

  let body: BodyState;
  if (checkIn.bodyFatPct !== undefined) {
    const fatKg = (checkIn.weightKg * checkIn.bodyFatPct) / 100;
    const lean = checkIn.weightKg - fatKg;
    const muscle = totalMuscle(predicted);
    body = { fatKg, muscleKg: predicted.muscleKg, otherLeanKg: Math.max(lean * 0.3, lean - muscle) };
  } else {
    // Without a body-fat reading, attribute the surprise to fat mass.
    const error = checkIn.weightKg - bodyWeight(predicted);
    body = { ...predicted, fatKg: Math.max(1, predicted.fatKg + error) };
  }

  return {
    calibration: { ...calibration, fatRate },
    anchor: { date: checkIn.date, body },
  };
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
