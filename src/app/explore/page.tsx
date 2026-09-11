"use client";

import { useMemo, useState } from "react";
import Body from "@/components/body/Body";
import { Card, Chip, PageTitle, Segmented } from "@/components/ui";
import { formatMonth } from "@/lib/dates";
import { emptyRegions, muscleScale, planWeeklySets } from "@/lib/engine";
import { EXERCISES, EXERCISE_BY_ID } from "@/lib/exercises";
import { useProjection } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import { REGIONS, REGION_LABEL, type Plan, type Region } from "@/lib/types";

type Mode = "week" | "plan" | "exercise";

export default function ExplorePage() {
  const profile = useApp((s) => s.profile);
  const plans = useApp((s) => s.plans);
  const activePlanId = useApp((s) => s.activePlanId);
  const horizon = useApp((s) => s.horizonWeeks);
  const [mode, setMode] = useState<Mode>("plan");
  const [exerciseId, setExerciseId] = useState("hip-thrust");
  const [filter, setFilter] = useState<Region | "all">("all");

  const plan = plans.find((p) => p.id === activePlanId);
  const base = useProjection({ scenario: "commit", weeks: horizon });

  // What-if: add three weekly sets of the chosen exercise to the active plan.
  const whatIfPlan: Plan | undefined = useMemo(() => {
    if (!plan) return undefined;
    const days = plan.days.map((d) => ({ ...d, entries: [...d.entries] }));
    const target = days.findIndex((d) => d.entries.length > 0);
    const i = target === -1 ? 0 : target;
    days[i] = { ...days[i], label: days[i].entries.length ? days[i].label : "Session", entries: [...days[i].entries, { exerciseId, sets: 3, reps: 10 }] };
    return { ...plan, id: `${plan.id}-whatif`, days };
  }, [plan, exerciseId]);
  const whatIf = useProjection({ plan: whatIfPlan, scenario: "commit", weeks: horizon });

  if (!profile || !base) return null;

  const exercise = EXERCISE_BY_ID[exerciseId];
  const weekHeat = normalise(base.present.weeklySets);
  const planHeat = normalise(planWeeklySets(plan));
  const exerciseHeat = (() => {
    const h = emptyRegions();
    for (const [r, w] of Object.entries(exercise.regions)) h[r as Region] = Math.min(1, (w ?? 0) * 1.4);
    return h;
  })();
  const heat = mode === "week" ? weekHeat : mode === "plan" ? planHeat : exerciseHeat;
  const sets = mode === "week" ? base.present.weeklySets : planWeeklySets(plan);

  const gains = (() => {
    if (!whatIf) return [];
    const a = muscleScale(base.future.at(-1)!.body, profile);
    const b = muscleScale(whatIf.future.at(-1)!.body, profile);
    return REGIONS.map((r) => ({ r, pct: (b[r] / a[r] - 1) * 100 }))
      .filter((d) => d.pct >= 0.5)
      .sort((x, y) => y.pct - x.pct);
  })();

  const filteredExercises = EXERCISES.filter((e) => filter === "all" || (e.regions[filter] ?? 0) >= 0.3);

  return (
    <div className="space-y-4">
      <PageTitle kicker="Anatomy" title="Where the work lands" />
      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        size="sm"
        options={[
          { value: "week", label: "This week" },
          { value: "plan", label: "My plan" },
          { value: "exercise", label: "By exercise" },
        ]}
      />

      <Card className="p-0 overflow-hidden">
        <div className="h-[340px] relative">
          <Body body={mode === "exercise" && whatIf ? whatIf.future.at(-1)!.body : base.present.body} heat={heat} spin={mode === "exercise"} />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#5c6270" }} /> untouched
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#ffb347" }} /> some
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#ff4d6d" }} /> lots
            </span>
          </div>
        </div>
      </Card>

      {mode !== "exercise" && (
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">{mode === "week" ? "Hard sets at this week's pace" : `Weekly sets in ${plan?.name ?? "your plan"}`}</p>
          <div className="space-y-1.5">
            {REGIONS.map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-24 text-muted">{REGION_LABEL[r]}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full ${sets[r] >= 10 ? "bg-coral" : sets[r] >= 4 ? "bg-gold" : "bg-white/30"}`} style={{ width: `${Math.min(100, (sets[r] / 20) * 100)}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums">{sets[r].toFixed(0)}</span>
              </div>
            ))}
          </div>
          {neglected(sets).length > 0 && (
            <p className="text-xs text-muted mt-3">
              Quiet this week: <span className="text-ink">{neglected(sets).map((r) => REGION_LABEL[r]).join(", ")}</span>. Tap &ldquo;By exercise&rdquo; to see what would wake them up.
            </p>
          )}
        </Card>
      )}

      {mode === "exercise" && (
        <>
          <Card className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold">{exercise.name}</p>
                <p className="text-sm text-muted mt-0.5">{exercise.cue}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(exercise.regions)
                .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                .map(([r, w]) => (
                  <span key={r} className="rounded-full bg-white/8 px-2.5 py-1 text-[11px]">
                    {REGION_LABEL[r as Region]} {Math.round((w ?? 0) * 100)}%
                  </span>
                ))}
            </div>
            {plan && whatIf && (
              <div className="mt-2 rounded-2xl bg-violet/10 border border-violet/30 p-3">
                <p className="text-xs uppercase tracking-wider text-violet">What if</p>
                <p className="text-sm mt-0.5">
                  Add <b>3 sets/week</b> of {exercise.name.toLowerCase()} to {plan.name} and by {formatMonth(whatIf.future.at(-1)!.date)}:
                </p>
                {gains.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {gains.slice(0, 4).map((g) => (
                      <span key={g.r} className="rounded-full bg-mint/15 text-mint px-2.5 py-1 text-[11px] font-semibold">
                        {REGION_LABEL[g.r]} +{g.pct.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted mt-1">Barely moves the needle. Those muscles are already getting plenty.</p>
                )}
              </div>
            )}
          </Card>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </Chip>
            {REGIONS.map((r) => (
              <Chip key={r} active={filter === r} onClick={() => setFilter(r)}>
                {REGION_LABEL[r]}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filteredExercises.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setExerciseId(e.id)}
                className={`text-left rounded-2xl px-3 py-2.5 transition ${e.id === exerciseId ? "bg-white text-bg" : "bg-white/5 hover:bg-white/10"}`}
              >
                <p className="text-sm font-medium">{e.name}</p>
                <p className={`text-[11px] ${e.id === exerciseId ? "text-bg/70" : "text-muted"}`}>
                  {Object.entries(e.regions)
                    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                    .slice(0, 2)
                    .map(([r]) => REGION_LABEL[r as Region])
                    .join(" · ")}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function normalise(sets: Record<Region, number>): Record<Region, number> {
  const out = emptyRegions();
  for (const r of REGIONS) out[r] = Math.min(1, sets[r] / 15);
  return out;
}

function neglected(sets: Record<Region, number>): Region[] {
  return REGIONS.filter((r) => sets[r] < 3);
}
