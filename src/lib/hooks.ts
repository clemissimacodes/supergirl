"use client";

import { useMemo, useSyncExternalStore } from "react";
import { project, type Projection } from "./engine";
import { todayStr } from "./dates";
import { useApp } from "./store";
import type { Plan, Scenario } from "./types";

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useApp.persist.onFinishHydration(cb),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
}

export function useProjection(
  opts: { planId?: string | null; plan?: Plan; scenario?: Scenario; weeks?: number } = {},
): Projection | null {
  const profile = useApp((s) => s.profile);
  const calibration = useApp((s) => s.calibration);
  const anchor = useApp((s) => s.anchor);
  const start = useApp((s) => s.start);
  const workouts = useApp((s) => s.workouts);
  const meals = useApp((s) => s.meals);
  const plans = useApp((s) => s.plans);
  const activePlanId = useApp((s) => s.activePlanId);
  const storeScenario = useApp((s) => s.scenario);
  const horizonWeeks = useApp((s) => s.horizonWeeks);

  const planId = opts.planId === undefined ? activePlanId : opts.planId;
  const scenario = opts.scenario ?? storeScenario;
  const weeks = opts.weeks ?? horizonWeeks;
  const today = todayStr();

  const planOverride = opts.plan;
  return useMemo(() => {
    if (!profile || !anchor) return null;
    const plan = planOverride ?? plans.find((p) => p.id === planId);
    return project({ profile, calibration, anchor, workouts, meals, plan, scenario, weeks, today, startDate: start?.date });
  }, [profile, calibration, anchor, start, workouts, meals, plans, planId, planOverride, scenario, weeks, today]);
}
