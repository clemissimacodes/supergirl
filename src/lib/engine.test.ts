import { describe, expect, it } from "vitest";
import {
  DEFAULT_CALIBRATION,
  applyCheckIn,
  bodyFatPct,
  bodyWeight,
  emptyRegions,
  estimateBodyFatPct,
  initialBody,
  maintenanceKcal,
  measureAdherence,
  muscleScale,
  planWeeklySets,
  project,
  regionSets,
  simulateWeek,
  volumeResponse,
} from "./engine";
import { planTemplates } from "./plans";
import { frameFromLandmarks } from "./photo";
import { addDays } from "./dates";
import type { Profile } from "./types";

const her: Profile = {
  name: "Kara",
  sex: "female",
  age: 28,
  heightCm: 168,
  weightKg: 64,
  activity: "light",
  trainingAge: "beginner",
};

const him: Profile = { ...her, name: "Clark", sex: "male", heightCm: 180, weightKg: 82, trainingAge: "intermediate" };

describe("initial body", () => {
  it("reproduces the entered weight and a plausible body fat", () => {
    const b = initialBody(her);
    expect(bodyWeight(b)).toBeCloseTo(64, 5);
    expect(bodyFatPct(b)).toBeGreaterThan(18);
    expect(bodyFatPct(b)).toBeLessThan(35);
    expect(estimateBodyFatPct(him)).toBeLessThan(estimateBodyFatPct(her));
  });

  it("starts beginners at baseline muscle and lets advanced lifters start bigger", () => {
    const scale = muscleScale(initialBody(her), her);
    for (const v of Object.values(scale)) expect(v).toBeCloseTo(1, 5);
    const adv = muscleScale(initialBody({ ...her, trainingAge: "advanced" }), her);
    expect(adv.glutes).toBeGreaterThan(1.1);
  });
});

describe("volume", () => {
  it("maps exercises to regions", () => {
    const s = regionSets([{ exerciseId: "hip-thrust", sets: 4, reps: 10 }]);
    expect(s.glutes).toBeCloseTo(3.2);
    expect(s.hamstrings).toBeCloseTo(0.8);
    expect(s.quads).toBe(0);
  });

  it("saturates", () => {
    expect(volumeResponse(0)).toBe(0);
    expect(volumeResponse(15)).toBeCloseTo(1, 1);
    expect(volumeResponse(60)).toBe(1.25);
  });
});

describe("simulateWeek", () => {
  it("loses fat in a deficit and gains fat in a surplus", () => {
    const b = initialBody(her);
    const maint = maintenanceKcal(her);
    const input = { sets: emptyRegions(), kcal: maint - 500, proteinG: 120, cardioMin: 0 };
    const cut = simulateWeek(b, her, DEFAULT_CALIBRATION, input);
    expect(cut.fatKg).toBeLessThan(b.fatKg);
    expect(b.fatKg - cut.fatKg).toBeGreaterThan(0.3);
    expect(b.fatKg - cut.fatKg).toBeLessThan(0.6);

    const bulk = simulateWeek(b, her, DEFAULT_CALIBRATION, { ...input, kcal: maint + 500 });
    expect(bulk.fatKg).toBeGreaterThan(b.fatKg);
  });

  it("grows only the muscles that were trained", () => {
    const b = initialBody(her);
    const sets = { ...emptyRegions(), glutes: 15 };
    const after = simulateWeek(b, her, DEFAULT_CALIBRATION, { sets, kcal: maintenanceKcal(her), proteinG: 120, cardioMin: 0 });
    expect(after.muscleKg.glutes).toBeGreaterThan(b.muscleKg.glutes);
    expect(after.muscleKg.chest).toBeCloseTo(b.muscleKg.chest, 6);
  });

  it("gates muscle gain on protein", () => {
    const b = initialBody(her);
    const sets = { ...emptyRegions(), quads: 15 };
    const kcal = maintenanceKcal(her);
    const fed = simulateWeek(b, her, DEFAULT_CALIBRATION, { sets, kcal, proteinG: 130, cardioMin: 0 });
    const starved = simulateWeek(b, her, DEFAULT_CALIBRATION, { sets, kcal, proteinG: 40, cardioMin: 0 });
    expect(fed.muscleKg.quads - b.muscleKg.quads).toBeGreaterThan(starved.muscleKg.quads - b.muscleKg.quads);
  });

  it("never drops below the body-fat floor", () => {
    let b = initialBody(her);
    for (let i = 0; i < 200; i++) {
      b = simulateWeek(b, her, DEFAULT_CALIBRATION, { sets: emptyRegions(), kcal: 800, proteinG: 120, cardioMin: 0 });
    }
    expect(bodyFatPct(b)).toBeGreaterThanOrEqual(11.9);
  });

  it("keeps a year of realistic training within believable bounds", () => {
    const plan = planTemplates(him)[1];
    const sets = planWeeklySets(plan);
    let b = initialBody(him);
    for (let i = 0; i < 52; i++) {
      b = simulateWeek(b, him, DEFAULT_CALIBRATION, { sets, kcal: plan.kcal, proteinG: plan.proteinG, cardioMin: 0 });
    }
    const gained = Object.values(b.muscleKg).reduce((a, c) => a + c, 0) - Object.values(initialBody(him).muscleKg).reduce((a, c) => a + c, 0);
    expect(gained).toBeGreaterThan(2);
    expect(gained).toBeLessThan(7);
  });
});

describe("project", () => {
  const today = "2026-09-11";
  const anchor = { date: "2026-08-14", body: initialBody(her) };
  const plan = planTemplates(her)[0];

  it("shows more muscle when you commit than at a partial current pace", () => {
    const base = { profile: her, calibration: DEFAULT_CALIBRATION, anchor, meals: [], plan, weeks: 26, today };
    const workouts = [{ id: "w1", date: addDays(today, -3), entries: plan.days[0].entries }];
    const commit = project({ ...base, workouts, scenario: "commit" });
    const current = project({ ...base, workouts, scenario: "current" });
    expect(commit.adherence).toBe(1);
    expect(current.adherence).toBeLessThan(1);
    expect(commit.future.at(-1)!.metrics.muscleKg).toBeGreaterThan(current.future.at(-1)!.metrics.muscleKg);
    expect(commit.future).toHaveLength(27);
  });

  it("nudges the present body when a workout is logged today", () => {
    const base = { profile: her, calibration: DEFAULT_CALIBRATION, anchor, meals: [], plan, weeks: 4, today, scenario: "commit" as const };
    const before = project({ ...base, workouts: [] });
    const after = project({ ...base, workouts: [{ id: "w", date: today, entries: [{ exerciseId: "hip-thrust", sets: 4, reps: 10 }] }] });
    expect(after.present.body.muscleKg.glutes).toBeGreaterThan(before.present.body.muscleKg.glutes);
  });

  it("measures adherence against the plan", () => {
    expect(measureAdherence([], plan, today)).toBeNull();
    const full = Array.from({ length: 4 }, (_, w) =>
      plan.days.filter((d) => d.entries.length).map((d, i) => ({ id: `${w}-${i}`, date: addDays(today, -(w * 7 + i)), entries: d.entries })),
    ).flat();
    expect(measureAdherence(full, plan, today)).toBeCloseTo(1, 1);
  });
});

describe("applyCheckIn", () => {
  it("learns a slower fat rate when less weight was lost than predicted", () => {
    const anchor = { date: "2026-08-01", body: initialBody(her) };
    const predicted = { ...anchor.body, fatKg: anchor.body.fatKg - 2 };
    const actualWeight = bodyWeight(anchor.body) - 1;
    const res = applyCheckIn({ date: "2026-09-01", weightKg: actualWeight }, predicted, anchor, DEFAULT_CALIBRATION);
    expect(res.calibration.fatRate).toBeLessThan(1);
    expect(bodyWeight(res.anchor.body)).toBeCloseTo(actualWeight, 5);
    expect(res.anchor.date).toBe("2026-09-01");
  });

  it("uses a supplied body-fat reading directly", () => {
    const anchor = { date: "2026-08-01", body: initialBody(her) };
    const res = applyCheckIn({ date: "2026-09-01", weightKg: 63, bodyFatPct: 24 }, anchor.body, anchor, DEFAULT_CALIBRATION);
    expect(bodyFatPct(res.anchor.body)).toBeCloseTo(24, 5);
    expect(bodyWeight(res.anchor.body)).toBeCloseTo(63, 5);
  });
});

describe("frameFromLandmarks", () => {
  it("returns broader shoulders for a wide-shouldered pose", () => {
    const pts: { x: number; y: number }[] = Array.from({ length: 33 }, () => ({ x: 500, y: 500 }));
    pts[0] = { x: 500, y: 100 };
    pts[11] = { x: 380, y: 190 };
    pts[12] = { x: 620, y: 190 };
    pts[23] = { x: 455, y: 450 };
    pts[24] = { x: 545, y: 450 };
    pts[27] = { x: 470, y: 900 };
    pts[28] = { x: 530, y: 900 };
    const est = frameFromLandmarks(pts, "female");
    expect(est).not.toBeNull();
    expect(est!.frame.shoulderWidth).toBeGreaterThan(1.05);
    expect(est!.notes.join(" ")).toMatch(/shoulders/i);
  });
});
