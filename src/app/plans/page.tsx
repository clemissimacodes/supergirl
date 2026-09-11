"use client";

import { useMemo, useState } from "react";
import Body from "@/components/body/Body";
import { Button, Card, Chip, Field, NumberInput, PageTitle, inputClass } from "@/components/ui";
import { WEEKDAYS, formatMonth } from "@/lib/dates";
import { maintenanceKcal, planWeeklySets, totalSets } from "@/lib/engine";
import { EXERCISES, EXERCISE_BY_ID } from "@/lib/exercises";
import { useProjection } from "@/lib/hooks";
import { emptyPlan } from "@/lib/plans";
import { uid, useApp } from "@/lib/store";
import { REGIONS, REGION_LABEL, type Plan, type Region, type SetEntry } from "@/lib/types";

type View = { kind: "list" } | { kind: "edit"; id: string } | { kind: "compare" };

export default function PlansPage() {
  const plans = useApp((s) => s.plans);
  const profile = useApp((s) => s.profile);
  const activePlanId = useApp((s) => s.activePlanId);
  const setActivePlan = useApp((s) => s.setActivePlan);
  const upsertPlan = useApp((s) => s.upsertPlan);
  const [view, setView] = useState<View>({ kind: "list" });

  if (!profile) return null;

  if (view.kind === "edit") {
    const plan = plans.find((p) => p.id === view.id);
    if (!plan) return null;
    return <PlanEditor plan={plan} onDone={() => setView({ kind: "list" })} />;
  }
  if (view.kind === "compare") return <Compare onDone={() => setView({ kind: "list" })} />;

  return (
    <div className="space-y-4">
      <PageTitle
        kicker="Choose your direction"
        title="Plans"
        action={
          <Button variant="ghost" onClick={() => setView({ kind: "compare" })}>
            Compare
          </Button>
        }
      />
      <div className="space-y-2">
        {plans.map((p) => {
          const active = p.id === activePlanId;
          const sets = planWeeklySets(p);
          const top = REGIONS.map((r) => [r, sets[r]] as const)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .filter(([, v]) => v > 0);
          return (
            <Card key={p.id} className={active ? "border-violet/60 bg-violet/10" : ""}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.days.filter((d) => d.entries.length).length} sessions · {totalSets(p.days.flatMap((d) => d.entries))} sets/wk · {p.kcal} kcal · {p.proteinG} g protein
                  </p>
                  {top.length > 0 && (
                    <p className="text-[11px] text-muted mt-1">Focus: {top.map(([r, v]) => `${REGION_LABEL[r]} ${v.toFixed(0)}`).join(" · ")}</p>
                  )}
                </div>
                {active && <span className="text-[10px] uppercase tracking-wider text-violet font-semibold mt-1">Active</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {!active ? (
                  <Button onClick={() => setActivePlan(p.id)}>Make active</Button>
                ) : (
                  <Button variant="outline" href="/">
                    See Future You
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setView({ kind: "edit", id: p.id })}>
                  Edit
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const p = emptyPlan(profile, uid());
          upsertPlan(p);
          setView({ kind: "edit", id: p.id });
        }}
      >
        ＋ Build my own plan
      </Button>
    </div>
  );
}

function PlanEditor({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const profile = useApp((s) => s.profile)!;
  const upsertPlan = useApp((s) => s.upsertPlan);
  const deletePlan = useApp((s) => s.deletePlan);
  const plans = useApp((s) => s.plans);
  const [draft, setDraft] = useState<Plan>(plan);
  const [day, setDay] = useState(0);
  const [picker, setPicker] = useState(false);
  const maint = maintenanceKcal(profile);
  const sets = planWeeklySets(draft);

  const patchDay = (patch: Partial<Plan["days"][number]>) =>
    setDraft((d) => ({ ...d, days: d.days.map((x, i) => (i === day ? { ...x, ...patch } : x)) }));
  const entries = draft.days[day].entries;
  const setEntries = (es: SetEntry[]) => patchDay({ entries: es, label: draft.days[day].label === "Rest" && es.length ? "Session" : es.length ? draft.days[day].label : "Rest" });

  return (
    <div className="space-y-4">
      <PageTitle
        kicker="Plan builder"
        title={
          <input
            className="bg-transparent border-b border-white/15 focus:border-violet/70 focus:outline-none w-full"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        }
        action={
          <Button
            onClick={() => {
              upsertPlan(draft);
              onDone();
            }}
          >
            Save
          </Button>
        }
      />

      <Card className="space-y-3">
        <div className="flex gap-2">
          {["✨", "🍑", "🏋️", "⚡", "🔥", "🦵", "💪"].map((e) => (
            <button key={e} type="button" onClick={() => setDraft({ ...draft, emoji: e })} className={`text-xl rounded-xl p-1.5 ${draft.emoji === e ? "bg-white/15" : "hover:bg-white/5"}`}>
              {e}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Daily calories" hint={`Maintenance ≈ ${maint}`}>
            <NumberInput value={draft.kcal} onChange={(v) => setDraft({ ...draft, kcal: Number(v || 0) })} min={800} max={6000} step={50} suffix="kcal" />
          </Field>
          <Field label="Daily protein" hint={`${(draft.proteinG / profile.weightKg).toFixed(1)} g/kg`}>
            <NumberInput value={draft.proteinG} onChange={(v) => setDraft({ ...draft, proteinG: Number(v || 0) })} min={0} max={400} step={5} suffix="g" />
          </Field>
        </div>
        <div className="flex gap-1.5 text-[11px]">
          <Chip active={draft.kcal < maint - 150} onClick={() => setDraft({ ...draft, kcal: maint - 400 })}>
            Cut −400
          </Chip>
          <Chip active={Math.abs(draft.kcal - maint) <= 150} onClick={() => setDraft({ ...draft, kcal: maint })}>
            Maintain
          </Chip>
          <Chip active={draft.kcal > maint + 150} onClick={() => setDraft({ ...draft, kcal: maint + 300 })}>
            Build +300
          </Chip>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex gap-1">
          {WEEKDAYS.map((w, i) => (
            <button
              key={w}
              type="button"
              onClick={() => setDay(i)}
              className={`flex-1 rounded-xl py-2 text-xs ${i === day ? "bg-white text-bg font-semibold" : draft.days[i].entries.length ? "bg-violet/20 text-ink" : "bg-white/5 text-muted"}`}
            >
              {w}
            </button>
          ))}
        </div>
        <input className={inputClass} value={draft.days[day].label} onChange={(e) => patchDay({ label: e.target.value })} placeholder="Session name" />
        {entries.length === 0 && !picker && <p className="text-sm text-muted text-center py-2">Rest day. Add an exercise to make it a session.</p>}
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <p className="flex-1 text-sm font-medium truncate">{EXERCISE_BY_ID[e.exerciseId]?.name}</p>
            <Mini value={e.sets} onChange={(v) => setEntries(entries.map((x, j) => (j === i ? { ...x, sets: v } : x)))} label="sets" />
            <Mini value={e.reps} onChange={(v) => setEntries(entries.map((x, j) => (j === i ? { ...x, reps: v } : x)))} label="reps" />
            <button type="button" onClick={() => setEntries(entries.filter((_, j) => j !== i))} className="text-muted hover:text-coral px-1" aria-label="Remove">
              ×
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted flex-1">Cardio</span>
          <div className="w-28">
            <NumberInput value={draft.days[day].cardioMin ?? ""} onChange={(v) => patchDay({ cardioMin: v === "" ? undefined : v })} min={0} max={300} suffix="min" placeholder="0" />
          </div>
        </div>
        {picker ? (
          <ul className="max-h-64 overflow-y-auto divide-y divide-white/5 rounded-xl bg-white/5">
            {EXERCISES.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm"
                  onClick={() => {
                    setEntries([...entries, { exerciseId: ex.id, sets: 3, reps: 10 }]);
                    setPicker(false);
                  }}
                >
                  {ex.name}
                  <span className="text-[11px] text-muted ml-2">{Object.keys(ex.regions).map((r) => REGION_LABEL[r as Region]).join(", ")}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Button variant="ghost" className="w-full" onClick={() => setPicker(true)}>
            ＋ Add exercise
          </Button>
        )}
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wider text-muted mb-2">Weekly sets per muscle</p>
        <div className="space-y-1.5">
          {REGIONS.map((r) => (
            <div key={r} className="flex items-center gap-2 text-xs">
              <span className="w-24 text-muted">{REGION_LABEL[r]}</span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${sets[r] >= 10 ? "bg-mint" : sets[r] >= 4 ? "bg-gold" : "bg-white/30"}`} style={{ width: `${Math.min(100, (sets[r] / 20) * 100)}%` }} />
              </div>
              <span className="w-8 text-right tabular-nums">{sets[r].toFixed(0)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-2">10–20 hard sets a week per muscle is the growth zone. Under 4 mostly maintains.</p>
      </Card>

      {plans.length > 1 && (
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            deletePlan(plan.id);
            onDone();
          }}
        >
          Delete plan
        </Button>
      )}
    </div>
  );
}

function Mini({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center rounded-xl bg-white/5">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="px-2 py-1 text-muted hover:text-ink">
        −
      </button>
      <span className="w-11 text-center text-xs tabular-nums">
        {value}
        <span className="text-[9px] text-muted ml-0.5">{label}</span>
      </span>
      <button type="button" onClick={() => onChange(value + 1)} className="px-2 py-1 text-muted hover:text-ink">
        +
      </button>
    </div>
  );
}

function Compare({ onDone }: { onDone: () => void }) {
  const plans = useApp((s) => s.plans);
  const activePlanId = useApp((s) => s.activePlanId);
  const comparePlanId = useApp((s) => s.comparePlanId);
  const setComparePlan = useApp((s) => s.setComparePlan);
  const setActivePlan = useApp((s) => s.setActivePlan);
  const hideNumbers = useApp((s) => s.hideNumbers);
  const horizon = useApp((s) => s.horizonWeeks);
  const [leftId, setLeftId] = useState(activePlanId ?? plans[0]?.id);
  const rightDefault = comparePlanId && comparePlanId !== leftId ? comparePlanId : plans.find((p) => p.id !== leftId)?.id ?? leftId;
  const [rightId, setRightId] = useState(rightDefault);

  const left = useProjection({ planId: leftId, scenario: "commit", weeks: horizon });
  const right = useProjection({ planId: rightId, scenario: "commit", weeks: horizon });
  const lp = plans.find((p) => p.id === leftId);
  const rp = plans.find((p) => p.id === rightId);

  const rows = useMemo(() => {
    if (!left || !right) return [];
    const a = left.future.at(-1)!.metrics;
    const b = right.future.at(-1)!.metrics;
    return [
      { label: "Weight", a: a.weightKg, b: b.weightKg, unit: "kg" },
      { label: "Body fat", a: a.bodyFatPct, b: b.bodyFatPct, unit: "%" },
      { label: "Muscle", a: a.muscleKg, b: b.muscleKg, unit: "kg" },
      { label: "Waist", a: a.waistCm, b: b.waistCm, unit: "cm" },
    ];
  }, [left, right]);

  if (!left || !right || !lp || !rp) return null;
  const date = left.future.at(-1)!.date;

  return (
    <div className="space-y-4">
      <PageTitle
        kicker="Which you would you rather be?"
        title={`Compare · ${formatMonth(date)}`}
        action={
          <Button variant="ghost" onClick={onDone}>
            Done
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <PlanSelect value={leftId} onChange={setLeftId} plans={plans} />
        <PlanSelect
          value={rightId}
          onChange={(id) => {
            setRightId(id);
            setComparePlan(id);
          }}
          plans={plans}
        />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-2 h-[360px]">
          <div className="relative border-r border-white/5">
            <span className="absolute top-3 left-3 z-10 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
              {lp.emoji} {lp.name}
            </span>
            <Body body={left.future.at(-1)!.body} />
          </div>
          <div className="relative">
            <span className="absolute top-3 left-3 z-10 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
              {rp.emoji} {rp.name}
            </span>
            <Body body={right.future.at(-1)!.body} />
          </div>
        </div>
      </Card>
      <Card>
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-white/5 last:border-0">
                <td className={`py-2 tabular-nums font-semibold ${better(r, "a") ? "text-mint" : ""}`}>{hideNumbers ? "••" : `${r.a.toFixed(1)} ${r.unit}`}</td>
                <td className="py-2 text-center text-xs text-muted">{r.label}</td>
                <td className={`py-2 text-right tabular-nums font-semibold ${better(r, "b") ? "text-mint" : ""}`}>{hideNumbers ? "••" : `${r.b.toFixed(1)} ${r.unit}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <RegionDiff a={left.future.at(-1)!.body.muscleKg} b={right.future.at(-1)!.body.muscleKg} />
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Button variant={activePlanId === leftId ? "outline" : "primary"} onClick={() => setActivePlan(leftId)} disabled={activePlanId === leftId}>
          {activePlanId === leftId ? "Active" : "Choose left"}
        </Button>
        <Button variant={activePlanId === rightId ? "outline" : "primary"} onClick={() => setActivePlan(rightId)} disabled={activePlanId === rightId}>
          {activePlanId === rightId ? "Active" : "Choose right"}
        </Button>
      </div>
    </div>
  );
}

function better(r: { label: string; a: number; b: number }, side: "a" | "b"): boolean {
  if (Math.abs(r.a - r.b) < 0.05) return false;
  const lowerIsBetter = r.label === "Body fat" || r.label === "Waist";
  const aWins = lowerIsBetter ? r.a < r.b : r.label === "Muscle" ? r.a > r.b : false;
  if (r.label === "Weight") return false;
  return side === "a" ? aWins : !aWins;
}

function RegionDiff({ a, b }: { a: Record<Region, number>; b: Record<Region, number> }) {
  const diffs = REGIONS.map((r) => ({ r, pct: (b[r] / a[r] - 1) * 100 })).filter((d) => Math.abs(d.pct) >= 1.5);
  if (diffs.length === 0) return <p className="text-xs text-muted mt-3">Muscle shape ends up about the same either way.</p>;
  return (
    <div className="mt-3 space-y-1">
      <p className="text-[11px] uppercase tracking-wider text-muted">Right vs left</p>
      <div className="flex flex-wrap gap-1.5">
        {diffs
          .sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct))
          .map((d) => (
            <span key={d.r} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.pct > 0 ? "bg-mint/15 text-mint" : "bg-coral/15 text-coral"}`}>
              {REGION_LABEL[d.r]} {d.pct > 0 ? "+" : ""}
              {d.pct.toFixed(0)}%
            </span>
          ))}
      </div>
    </div>
  );
}

function PlanSelect({ value, onChange, plans }: { value: string; onChange: (id: string) => void; plans: Plan[] }) {
  return (
    <select className={`${inputClass} text-sm`} value={value} onChange={(e) => onChange(e.target.value)}>
      {plans.map((p) => (
        <option key={p.id} value={p.id}>
          {p.emoji} {p.name}
        </option>
      ))}
    </select>
  );
}
