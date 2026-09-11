import type { Exercise } from "./types";

export const EXERCISES: Exercise[] = [
  // Lower body
  { id: "squat", name: "Back squat", kind: "compound", regions: { quads: 0.55, glutes: 0.3, core: 0.15 }, cue: "Quads and glutes do the heavy lifting; your core braces." },
  { id: "front-squat", name: "Front squat", kind: "compound", regions: { quads: 0.65, glutes: 0.2, core: 0.15 }, cue: "More upright than a back squat, so the quads take over." },
  { id: "hip-thrust", name: "Hip thrust", kind: "compound", regions: { glutes: 0.8, hamstrings: 0.2 }, cue: "The most direct glute builder there is." },
  { id: "rdl", name: "Romanian deadlift", kind: "compound", regions: { hamstrings: 0.55, glutes: 0.3, back: 0.15 }, cue: "Hamstrings stretch under load; glutes finish the hinge." },
  { id: "deadlift", name: "Deadlift", kind: "compound", regions: { hamstrings: 0.3, glutes: 0.3, back: 0.3, core: 0.1 }, cue: "Whole posterior chain, plus a thick upper back." },
  { id: "lunge", name: "Walking lunge", kind: "compound", regions: { quads: 0.45, glutes: 0.45, hamstrings: 0.1 }, cue: "Single-leg work rounds out glutes and quads together." },
  { id: "bulgarian", name: "Bulgarian split squat", kind: "compound", regions: { quads: 0.45, glutes: 0.45, hamstrings: 0.1 }, cue: "Deep stretch on the glute of the front leg." },
  { id: "leg-press", name: "Leg press", kind: "compound", regions: { quads: 0.7, glutes: 0.3 }, cue: "Lets you load the quads hard without balancing." },
  { id: "leg-ext", name: "Leg extension", kind: "isolation", regions: { quads: 1 }, cue: "Pure quad isolation. Great for the teardrop above the knee." },
  { id: "leg-curl", name: "Leg curl", kind: "isolation", regions: { hamstrings: 1 }, cue: "Isolates the hamstrings for that back-of-thigh shape." },
  { id: "abduction", name: "Hip abduction", kind: "isolation", regions: { glutes: 1 }, cue: "Targets the upper, outer glute (glute medius)." },
  { id: "calf-raise", name: "Calf raise", kind: "isolation", regions: { calves: 1 }, cue: "Calves need volume and a full stretch to grow." },
  // Upper body: push
  { id: "bench", name: "Bench press", kind: "compound", regions: { chest: 0.6, shoulders: 0.2, arms: 0.2 }, cue: "Chest first, front delts and triceps assist." },
  { id: "incline-db", name: "Incline dumbbell press", kind: "compound", regions: { chest: 0.55, shoulders: 0.3, arms: 0.15 }, cue: "Biases the upper chest and front shoulders." },
  { id: "push-up", name: "Push-up", kind: "compound", regions: { chest: 0.5, shoulders: 0.2, arms: 0.2, core: 0.1 }, cue: "Bodyweight chest work that also trains the core." },
  { id: "ohp", name: "Overhead press", kind: "compound", regions: { shoulders: 0.65, arms: 0.25, core: 0.1 }, cue: "Builds the shoulder cap that makes waists look smaller." },
  { id: "lateral-raise", name: "Lateral raise", kind: "isolation", regions: { shoulders: 1 }, cue: "Side delts. The number one move for wider-looking shoulders." },
  { id: "dip", name: "Dips", kind: "compound", regions: { chest: 0.4, arms: 0.4, shoulders: 0.2 }, cue: "Lower chest and triceps." },
  // Upper body: pull
  { id: "pull-up", name: "Pull-up", kind: "compound", regions: { back: 0.65, arms: 0.3, core: 0.05 }, cue: "Lats for width, biceps along the way." },
  { id: "lat-pulldown", name: "Lat pulldown", kind: "compound", regions: { back: 0.7, arms: 0.3 }, cue: "Adjustable pull-up. Widens the upper back." },
  { id: "row", name: "Barbell row", kind: "compound", regions: { back: 0.7, arms: 0.2, core: 0.1 }, cue: "Thickness across the mid-back." },
  { id: "cable-row", name: "Seated cable row", kind: "compound", regions: { back: 0.75, arms: 0.25 }, cue: "Mid-back and lats with a controlled stretch." },
  { id: "face-pull", name: "Face pull", kind: "isolation", regions: { shoulders: 0.6, back: 0.4 }, cue: "Rear delts and upper back for posture and a 3D shoulder." },
  // Arms
  { id: "curl", name: "Biceps curl", kind: "isolation", regions: { arms: 1 }, cue: "Biceps peak." },
  { id: "tricep-ext", name: "Triceps extension", kind: "isolation", regions: { arms: 1 }, cue: "Triceps are two-thirds of upper-arm size." },
  // Core
  { id: "plank", name: "Plank", kind: "isolation", regions: { core: 1 }, cue: "Deep core stability; tightens the midsection." },
  { id: "cable-crunch", name: "Cable crunch", kind: "isolation", regions: { core: 1 }, cue: "Loaded ab work for visible definition." },
  { id: "hanging-leg-raise", name: "Hanging leg raise", kind: "isolation", regions: { core: 0.9, arms: 0.1 }, cue: "Lower abs and hip flexors." },
  // Cardio
  { id: "run", name: "Running", kind: "cardio", regions: { calves: 0.5, quads: 0.3, hamstrings: 0.2 }, cue: "Burns energy; small stimulus for calves and legs." },
  { id: "cycle", name: "Cycling", kind: "cardio", regions: { quads: 0.7, calves: 0.3 }, cue: "Quad-dominant cardio." },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
);
