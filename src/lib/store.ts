"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CALIBRATION, applyCheckIn, initialBody } from "./engine";
import { todayStr } from "./dates";
import { planTemplates } from "./plans";
import {
  DEFAULT_FRAME,
  type Anchor,
  type BodyState,
  type Calibration,
  type CheckIn,
  type Frame,
  type MealLog,
  type Plan,
  type Profile,
  type Region,
  type Scenario,
  type WorkoutLog,
} from "./types";

export interface Pulse {
  regions: Partial<Record<Region, number>>;
  message: string;
  at: number;
}

interface AppState {
  onboarded: boolean;
  profile: Profile | null;
  frame: Frame;
  anchor: Anchor | null;
  /** Where the journey began; never re-anchored. */
  start: Anchor | null;
  skinTone: string;
  calibration: Calibration;
  plans: Plan[];
  activePlanId: string | null;
  comparePlanId: string | null;
  workouts: WorkoutLog[];
  meals: MealLog[];
  checkIns: CheckIn[];
  scenario: Scenario;
  horizonWeeks: number;
  hideNumbers: boolean;
  pulse: Pulse | null;

  completeOnboarding: (profile: Profile, frame: Frame, planId: string) => void;
  setProfile: (profile: Profile) => void;
  setFrame: (frame: Frame) => void;
  setSkinTone: (hex: string) => void;
  setScenario: (s: Scenario) => void;
  setHorizonWeeks: (w: number) => void;
  setHideNumbers: (v: boolean) => void;
  setActivePlan: (id: string) => void;
  setComparePlan: (id: string | null) => void;
  upsertPlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  addWorkout: (w: WorkoutLog) => void;
  removeWorkout: (id: string) => void;
  addMeal: (m: MealLog) => void;
  removeMeal: (id: string) => void;
  recordCheckIn: (c: Omit<CheckIn, "id" | "predictedWeightKg">, predicted: BodyState) => void;
  showPulse: (p: Omit<Pulse, "at">) => void;
  clearPulse: () => void;
  reset: () => void;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const initial = {
  onboarded: false,
  profile: null,
  frame: DEFAULT_FRAME,
  anchor: null,
  start: null,
  skinTone: "#d9a684",
  calibration: DEFAULT_CALIBRATION,
  plans: [] as Plan[],
  activePlanId: null,
  comparePlanId: null,
  workouts: [] as WorkoutLog[],
  meals: [] as MealLog[],
  checkIns: [] as CheckIn[],
  scenario: "commit" as Scenario,
  horizonWeeks: 26,
  hideNumbers: false,
  pulse: null,
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: (profile, frame, planId) => {
        const plans = planTemplates(profile);
        const anchor = { date: todayStr(), body: initialBody(profile) };
        set({
          onboarded: true,
          profile,
          frame,
          anchor,
          start: anchor,
          plans,
          activePlanId: plans.some((p) => p.id === planId) ? planId : plans[0].id,
        });
      },
      setProfile: (profile) => set({ profile }),
      setFrame: (frame) => set({ frame }),
      setSkinTone: (skinTone) => set({ skinTone }),
      setScenario: (scenario) => set({ scenario }),
      setHorizonWeeks: (horizonWeeks) => set({ horizonWeeks }),
      setHideNumbers: (hideNumbers) => set({ hideNumbers }),
      setActivePlan: (activePlanId) => set({ activePlanId }),
      setComparePlan: (comparePlanId) => set({ comparePlanId }),
      upsertPlan: (plan) =>
        set((s) => ({
          plans: s.plans.some((p) => p.id === plan.id)
            ? s.plans.map((p) => (p.id === plan.id ? plan : p))
            : [...s.plans, plan],
        })),
      deletePlan: (id) =>
        set((s) => {
          const plans = s.plans.filter((p) => p.id !== id);
          return {
            plans,
            activePlanId: s.activePlanId === id ? plans[0]?.id ?? null : s.activePlanId,
            comparePlanId: s.comparePlanId === id ? null : s.comparePlanId,
          };
        }),
      addWorkout: (w) => set((s) => ({ workouts: [w, ...s.workouts] })),
      removeWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
      addMeal: (m) => set((s) => ({ meals: [m, ...s.meals] })),
      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      recordCheckIn: (c, predicted) => {
        const { anchor, calibration } = get();
        if (!anchor) return;
        const next = applyCheckIn(c, predicted, anchor, calibration);
        const entry: CheckIn = {
          ...c,
          id: uid(),
          predictedWeightKg: predicted.fatKg + predicted.otherLeanKg + Object.values(predicted.muscleKg).reduce((a, b) => a + b, 0),
        };
        set((s) => ({
          checkIns: [entry, ...s.checkIns],
          anchor: next.anchor,
          calibration: next.calibration,
        }));
      },
      showPulse: (p) => set({ pulse: { ...p, at: Date.now() } }),
      clearPulse: () => set({ pulse: null }),
      reset: () => set({ ...initial }),
    }),
    { name: "supergirl-v1" },
  ),
);
