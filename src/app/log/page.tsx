"use client";

import { useMemo, useState } from "react";
import { Button, Card, Chip, Field, NumberInput, PageTitle, Segmented, inputClass } from "@/components/ui";
import { formatShort, todayStr, weekdayIndex } from "@/lib/dates";
import { regionSets } from "@/lib/engine";
import { EXERCISES, EXERCISE_BY_ID } from "@/lib/exercises";
import { uid, useApp } from "@/lib/store";
import { REGIONS, REGION_LABEL, type Region, type SetEntry } from "@/lib/types";

type Tab = "workout" | "meal";

export default function LogPage() {
  const [tab, setTab] = useState<Tab>("workout");
  return (
    <div className="space-y-4">
      <PageTitle kicker="Feed Future You" title="Log today" />
      <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: "workout", label: "Workout" }, { value: "meal", label: "Meal" }]} />
      {tab === "workout" ? <WorkoutLogger /> : <MealLogger />}
      <History />
    </div>
  );
}

function WorkoutLogger() {
  const plans = useApp((s) => s.plans);
  const activePlanId = useApp((s) => s.activePlanId);
  const addWorkout = useApp((s) => s.addWorkout);
  const showPulse = useApp((s) => s.showPulse);
  const [entries, setEntries] = useState<SetEntry[]>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const [cardio, setCardio] = useState<number | "">("");

  const plan = plans.find((p) => p.id === activePlanId);
  const today = todayStr();
  const todaysSession = plan?.days[weekdayIndex(today)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => (region === "all" || (e.regions[region] ?? 0) >= 0.3) && (!q || e.name.toLowerCase().includes(q)));
  }, [query, region]);

  function add(exerciseId: string) {
    setEntries((es) => [...es, { exerciseId, sets: 3, reps: 10 }]);
  }

  function update(i: number, patch: Partial<SetEntry>) {
    setEntries((es) => es.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  }

  function save(list: SetEntry[], cardioMin?: number) {
    if (list.length === 0 && !cardioMin) return;
    addWorkout({ id: uid(), date: today, entries: list, cardioMin: cardioMin || undefined });
    const sets = regionSets(list);
    const max = Math.max(1, ...Object.values(sets));
    const regions = Object.fromEntries(REGIONS.filter((r) => sets[r] > 0).map((r) => [r, sets[r] / max]));
    showPulse({ regions, message: list.length ? "Logged. Future You just got a little closer." : "Cardio logged. Nice work." });
    setEntries([]);
    setCardio("");
  }

  return (
    <div className="space-y-3">
      {todaysSession && todaysSession.entries.length > 0 && entries.length === 0 && (
        <Card className="border-violet/40 bg-violet/10">
          <p className="text-xs uppercase tracking-wider text-muted">On the plan today</p>
          <p className="font-semibold mt-0.5">
            {plan?.emoji} {todaysSession.label}
          </p>
          <p className="text-xs text-muted mt-1">
            {todaysSession.entries.map((e) => `${EXERCISE_BY_ID[e.exerciseId]?.name} ${e.sets}×${e.reps}`).join(" · ")}
            {todaysSession.cardioMin ? ` · ${todaysSession.cardioMin} min cardio` : ""}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button onClick={() => save(todaysSession.entries, todaysSession.cardioMin)}>Did it as planned</Button>
            <Button variant="ghost" onClick={() => setEntries(todaysSession.entries)}>
              Tweak first
            </Button>
          </div>
        </Card>
      )}

      {entries.length > 0 && (
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted">This session</p>
          {entries.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{EXERCISE_BY_ID[e.exerciseId]?.name}</p>
              </div>
              <Counter value={e.sets} onChange={(v) => update(i, { sets: v })} label="sets" />
              <Counter value={e.reps} onChange={(v) => update(i, { reps: v })} label="reps" step={e.reps >= 12 ? 2 : 1} />
              <button type="button" onClick={() => setEntries((es) => es.filter((_, j) => j !== i))} className="text-muted hover:text-coral px-1" aria-label="Remove">
                ×
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-muted flex-1">Cardio (optional)</span>
            <div className="w-28">
              <NumberInput value={cardio} onChange={setCardio} min={0} max={300} suffix="min" placeholder="0" />
            </div>
          </div>
          <Button className="w-full mt-1" onClick={() => save(entries, cardio === "" ? undefined : cardio)}>
            Save workout
          </Button>
        </Card>
      )}

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted">Add exercises</p>
        <input className={inputClass} placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
          <Chip active={region === "all"} onClick={() => setRegion("all")}>
            All
          </Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
              {REGION_LABEL[r]}
            </Chip>
          ))}
        </div>
        <ul className="divide-y divide-white/5 -mx-1">
          {filtered.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => add(e.id)} className="w-full flex items-center gap-3 px-1 py-2.5 text-left hover:bg-white/5 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-[11px] text-muted truncate">
                    {Object.entries(e.regions)
                      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                      .map(([r]) => REGION_LABEL[r as Region])
                      .join(" · ")}
                  </p>
                </div>
                <span className="text-violet text-lg">＋</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Counter({ value, onChange, label, step = 1 }: { value: number; onChange: (v: number) => void; label: string; step?: number }) {
  return (
    <div className="flex items-center rounded-xl bg-white/5">
      <button type="button" onClick={() => onChange(Math.max(1, value - step))} className="px-2 py-1.5 text-muted hover:text-ink">
        −
      </button>
      <span className="w-12 text-center text-sm tabular-nums">
        {value}
        <span className="text-[10px] text-muted ml-0.5">{label}</span>
      </span>
      <button type="button" onClick={() => onChange(value + step)} className="px-2 py-1.5 text-muted hover:text-ink">
        +
      </button>
    </div>
  );
}

const STARTER_MEALS = [
  { name: "Greek yogurt + berries", kcal: 220, proteinG: 20 },
  { name: "Chicken, rice, veg", kcal: 550, proteinG: 45 },
  { name: "Protein shake", kcal: 180, proteinG: 30 },
  { name: "Eggs on toast", kcal: 400, proteinG: 22 },
  { name: "Salmon + potatoes", kcal: 600, proteinG: 40 },
  { name: "Snack (bar / fruit)", kcal: 200, proteinG: 8 },
];

function MealLogger() {
  const meals = useApp((s) => s.meals);
  const addMeal = useApp((s) => s.addMeal);
  const showPulse = useApp((s) => s.showPulse);
  const plans = useApp((s) => s.plans);
  const activePlanId = useApp((s) => s.activePlanId);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");

  const today = todayStr();
  const todays = meals.filter((m) => m.date === today);
  const plan = plans.find((p) => p.id === activePlanId);
  const kcalToday = todays.reduce((s, m) => s + m.kcal, 0);
  const proteinToday = todays.reduce((s, m) => s + m.proteinG, 0);

  const favourites = useMemo(() => {
    const seen = new Map<string, { name: string; kcal: number; proteinG: number; n: number }>();
    for (const m of meals) {
      const k = m.name.toLowerCase();
      const cur = seen.get(k);
      if (cur) cur.n += 1;
      else seen.set(k, { name: m.name, kcal: m.kcal, proteinG: m.proteinG, n: 1 });
    }
    const mine = [...seen.values()].sort((a, b) => b.n - a.n).slice(0, 6);
    const names = new Set(mine.map((m) => m.name.toLowerCase()));
    return [...mine, ...STARTER_MEALS.filter((m) => !names.has(m.name.toLowerCase()))].slice(0, 8);
  }, [meals]);

  function save(m: { name: string; kcal: number; proteinG: number }) {
    addMeal({ id: uid(), date: today, ...m });
    const hi = m.proteinG >= 25;
    showPulse({ regions: hi ? { core: 0.5, back: 0.3, glutes: 0.3 } : {}, message: hi ? "Protein in. Muscles have what they need." : "Fuel logged." });
    setName("");
    setKcal("");
    setProtein("");
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Today so far</span>
          <span className="tabular-nums font-semibold">
            {kcalToday} kcal · {proteinToday} g protein
          </span>
        </div>
        {plan && (
          <>
            <Bar value={kcalToday} max={plan.kcal} />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>Target {plan.kcal} kcal</span>
              <span>
                Protein {proteinToday}/{plan.proteinG} g
              </span>
            </div>
          </>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted">Quick add</p>
        <div className="grid grid-cols-2 gap-2">
          {favourites.map((m) => (
            <button key={m.name} type="button" onClick={() => save(m)} className="text-left rounded-2xl bg-white/5 hover:bg-white/10 px-3 py-2.5">
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-[11px] text-muted">
                {m.kcal} kcal · {m.proteinG} g
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted">Custom</p>
        <Field label="What did you eat?">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Burrito bowl" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Calories">
            <NumberInput value={kcal} onChange={setKcal} min={0} max={5000} suffix="kcal" placeholder="~" />
          </Field>
          <Field label="Protein">
            <NumberInput value={protein} onChange={setProtein} min={0} max={300} suffix="g" placeholder="~" />
          </Field>
        </div>
        <Button className="w-full" disabled={!name.trim() || kcal === ""} onClick={() => save({ name: name.trim(), kcal: Number(kcal), proteinG: Number(protein || 0) })}>
          Add meal
        </Button>
        <p className="text-[11px] text-muted">Rough numbers are fine. Consistency beats precision.</p>
      </Card>
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  return (
    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full btn-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function History() {
  const workouts = useApp((s) => s.workouts);
  const meals = useApp((s) => s.meals);
  const removeWorkout = useApp((s) => s.removeWorkout);
  const removeMeal = useApp((s) => s.removeMeal);
  const items = useMemo(() => {
    const ws = workouts.map((w) => ({ kind: "workout" as const, id: w.id, date: w.date, title: w.entries.length ? `${w.entries.length} exercise${w.entries.length === 1 ? "" : "s"} · ${w.entries.reduce((s, e) => s + e.sets, 0)} sets` : "Cardio", sub: [w.entries.map((e) => EXERCISE_BY_ID[e.exerciseId]?.name).join(", "), w.cardioMin ? `${w.cardioMin} min cardio` : ""].filter(Boolean).join(" · ") }));
    const ms = meals.map((m) => ({ kind: "meal" as const, id: m.id, date: m.date, title: m.name, sub: `${m.kcal} kcal · ${m.proteinG} g protein` }));
    return [...ws, ...ms].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 12);
  }, [workouts, meals]);

  if (items.length === 0) return null;
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider text-muted mb-2">Recent</p>
      <ul className="divide-y divide-white/5">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 py-2">
            <span className="text-lg">{it.kind === "workout" ? "🏋️" : "🥗"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{it.title}</p>
              <p className="text-[11px] text-muted truncate">
                {formatShort(it.date)} · {it.sub}
              </p>
            </div>
            <button type="button" onClick={() => (it.kind === "workout" ? removeWorkout(it.id) : removeMeal(it.id))} className="text-muted hover:text-coral px-1" aria-label="Delete">
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
