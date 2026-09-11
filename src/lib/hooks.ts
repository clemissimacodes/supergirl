"use client";

import { useEffect, useMemo, useState } from "react";
import { project, type Projection } from "./engine";
import { todayStr } from "./dates";
import { useApp } from "./store";
import type { Scenario } from "./types";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useApp.persist.onFinishHydration(() => setHydrated(true));
    if (useApp.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

export function useProjection(opts: { planId?: string | null; scenario?: Scenario; weeks?: number } = {}): Projection | null {
  const profile = useApp((s) => s.profile);
  const calibration = useApp((s) => s.calibration);
  const anchor = useApp((s) => s.anchor);
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

  return useMemo(() => {
    if (!profile || !anchor) return null;
    const plan = plans.find((p) => p.id === planId);
    return project({ profile, calibration, anchor, workouts, meals, plan, scenario, weeks, today });
  }, [profile, calibration, anchor, workouts, meals, plans, planId, scenario, weeks, today]);
}
