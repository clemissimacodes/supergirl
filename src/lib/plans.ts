import type { Plan, PlanDay, Profile } from "./types";
import { maintenanceKcal } from "./engine";

const rest = (): PlanDay => ({ label: "Rest", entries: [] });

export function planTemplates(profile: Profile): Plan[] {
  const maint = maintenanceKcal(profile);
  const protein = Math.round(profile.weightKg * 1.8);
  return [
    {
      id: "tpl-sculpt",
      name: "Sculpt: glutes + shoulders",
      emoji: "🍑",
      kcal: maint + 100,
      proteinG: protein,
      days: [
        {
          label: "Lower A",
          entries: [
            { exerciseId: "hip-thrust", sets: 4, reps: 10 },
            { exerciseId: "squat", sets: 3, reps: 8 },
            { exerciseId: "rdl", sets: 3, reps: 10 },
            { exerciseId: "abduction", sets: 3, reps: 15 },
          ],
        },
        {
          label: "Upper A",
          entries: [
            { exerciseId: "ohp", sets: 3, reps: 8 },
            { exerciseId: "lateral-raise", sets: 4, reps: 15 },
            { exerciseId: "lat-pulldown", sets: 3, reps: 10 },
            { exerciseId: "face-pull", sets: 3, reps: 15 },
          ],
        },
        rest(),
        {
          label: "Lower B",
          entries: [
            { exerciseId: "bulgarian", sets: 3, reps: 10 },
            { exerciseId: "hip-thrust", sets: 3, reps: 12 },
            { exerciseId: "leg-curl", sets: 3, reps: 12 },
            { exerciseId: "calf-raise", sets: 3, reps: 15 },
          ],
        },
        {
          label: "Upper B",
          entries: [
            { exerciseId: "incline-db", sets: 3, reps: 10 },
            { exerciseId: "cable-row", sets: 3, reps: 10 },
            { exerciseId: "lateral-raise", sets: 3, reps: 15 },
            { exerciseId: "plank", sets: 3, reps: 1 },
          ],
        },
        rest(),
        rest(),
      ],
    },
    {
      id: "tpl-strength",
      name: "Strength foundations",
      emoji: "🏋️",
      kcal: maint + 250,
      proteinG: protein,
      days: [
        {
          label: "Squat day",
          entries: [
            { exerciseId: "squat", sets: 4, reps: 5 },
            { exerciseId: "bench", sets: 4, reps: 5 },
            { exerciseId: "row", sets: 3, reps: 8 },
            { exerciseId: "plank", sets: 3, reps: 1 },
          ],
        },
        rest(),
        {
          label: "Deadlift day",
          entries: [
            { exerciseId: "deadlift", sets: 3, reps: 5 },
            { exerciseId: "ohp", sets: 4, reps: 6 },
            { exerciseId: "pull-up", sets: 3, reps: 6 },
            { exerciseId: "curl", sets: 3, reps: 10 },
          ],
        },
        rest(),
        {
          label: "Volume day",
          entries: [
            { exerciseId: "front-squat", sets: 3, reps: 8 },
            { exerciseId: "incline-db", sets: 3, reps: 10 },
            { exerciseId: "cable-row", sets: 3, reps: 10 },
            { exerciseId: "tricep-ext", sets: 3, reps: 12 },
            { exerciseId: "calf-raise", sets: 3, reps: 12 },
          ],
        },
        rest(),
        rest(),
      ],
    },
    {
      id: "tpl-lean",
      name: "Lean + athletic",
      emoji: "⚡",
      kcal: maint - 350,
      proteinG: Math.round(profile.weightKg * 2.0),
      days: [
        {
          label: "Full body",
          entries: [
            { exerciseId: "squat", sets: 3, reps: 8 },
            { exerciseId: "bench", sets: 3, reps: 8 },
            { exerciseId: "row", sets: 3, reps: 10 },
            { exerciseId: "hanging-leg-raise", sets: 3, reps: 12 },
          ],
        },
        { label: "Run", entries: [{ exerciseId: "run", sets: 1, reps: 1 }], cardioMin: 30 },
        {
          label: "Full body",
          entries: [
            { exerciseId: "rdl", sets: 3, reps: 8 },
            { exerciseId: "ohp", sets: 3, reps: 8 },
            { exerciseId: "lat-pulldown", sets: 3, reps: 10 },
            { exerciseId: "lunge", sets: 3, reps: 12 },
          ],
        },
        rest(),
        {
          label: "Full body",
          entries: [
            { exerciseId: "hip-thrust", sets: 3, reps: 10 },
            { exerciseId: "push-up", sets: 3, reps: 15 },
            { exerciseId: "cable-row", sets: 3, reps: 12 },
            { exerciseId: "lateral-raise", sets: 3, reps: 15 },
            { exerciseId: "plank", sets: 3, reps: 1 },
          ],
        },
        { label: "Run", entries: [{ exerciseId: "run", sets: 1, reps: 1 }], cardioMin: 40 },
        rest(),
      ],
    },
  ];
}

export function emptyPlan(profile: Profile, id: string): Plan {
  return {
    id,
    name: "My plan",
    emoji: "✨",
    kcal: maintenanceKcal(profile),
    proteinG: Math.round(profile.weightKg * 1.6),
    days: Array.from({ length: 7 }, rest),
  };
}
