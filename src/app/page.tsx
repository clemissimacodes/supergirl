"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Body from "@/components/body/Body";
import { Button, Card, Segmented, Stat } from "@/components/ui";
import { daysBetween, formatMonth, todayStr, weekdayIndex } from "@/lib/dates";
import { bodyWeight, muscleScale, totalSets } from "@/lib/engine";
import { useProjection } from "@/lib/hooks";
import { useApp } from "@/lib/store";
import { REGIONS, REGION_LABEL, type Region, type Scenario } from "@/lib/types";

export default function HomePage() {
  const profile = useApp((s) => s.profile);
  const start = useApp((s) => s.start);
  const scenario = useApp((s) => s.scenario);
  const setScenario = useApp((s) => s.setScenario);
  const hideNumbers = useApp((s) => s.hideNumbers);
  const horizon = useApp((s) => s.horizonWeeks);
  const plans = useApp((s) => s.plans);
  const activePlanId = useApp((s) => s.activePlanId);
  const workouts = useApp((s) => s.workouts);
  const pulse = useApp((s) => s.pulse);
  const projection = useProjection();
  const [week, setWeek] = useState(horizon);

  const plan = plans.find((p) => p.id === activePlanId);

  const weekStats = useMemo(() => {
    const today = todayStr();
    const dow = weekdayIndex(today);
    const thisWeek = workouts.filter((w) => {
      const diff = daysBetween(w.date, today);
      return diff >= 0 && diff <= dow;
    });
    const done = thisWeek.reduce((s, w) => s + totalSets(w.entries), 0);
    const planned = plan ? totalSets(plan.days.flatMap((d) => d.entries)) : 0;
    const sessions = thisWeek.length;
    const plannedSessions = plan ? plan.days.filter((d) => d.entries.length > 0).length : 0;
    return { done, planned, sessions, plannedSessions };
  }, [workouts, plan]);

  if (!profile || !projection) return null;

  const { present, future } = projection;
  const w = Math.min(week, future.length - 1);
  const target = future[w];
  const startBody = start?.body ?? present.body;

  const scalePresent = muscleScale(present.body, profile);
  const scaleTarget = muscleScale(target.body, profile);
  const regionDeltas = REGIONS.map((r) => ({ r, pct: (scaleTarget[r] / scalePresent[r] - 1) * 100 }))
    .filter((d) => Math.abs(d.pct) >= 1)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 4);

  const goal = future[future.length - 1];
  const progress = journeyProgress(bodyWeight(startBody), startBody.fatKg, present.body.fatKg, goal.body.fatKg, sumMuscle(startBody.muscleKg), sumMuscle(present.body.muscleKg), sumMuscle(goal.body.muscleKg));

  const glow = pulse ? pulse.regions : undefined;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Hi {profile.name || "there"}</p>
          <h1 className="text-2xl font-bold leading-tight">
            Meet <span className="gradient-text">Future You</span>
          </h1>
        </div>
        <Link href="/settings" aria-label="Settings" className="rounded-full bg-white/5 p-2.5 text-lg hover:bg-white/10">
          ⚙︎
        </Link>
      </header>

      <Segmented<Scenario>
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "commit", label: "If I stick to it", hint: "100% of the plan" },
          {
            value: "current",
            label: "At my current pace",
            hint: projection.measuredAdherence === null ? "no logs yet · assumes 85%" : `${Math.round(projection.adherence * 100)}% of the plan`,
          },
        ]}
        size="sm"
      />

      <Card className="p-0 overflow-hidden relative">
        <div className="grid grid-cols-2 h-[380px]">
          <div className="relative border-r border-white/5">
            <Label>Today</Label>
            <Body body={present.body} glow={glow} className="h-full" interactive={false} />
          </div>
          <div className="relative">
            <Label accent>{w === 0 ? "Today" : `+${weeksLabel(w)}`}</Label>
            <Body body={target.body} glow={glow} className="h-full" />
          </div>
        </div>
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-baseline justify-between text-sm mb-2">
            <span className="text-muted">Scrub time</span>
            <span className="font-semibold tabular-nums">{w === 0 ? "Right now" : formatMonth(target.date)}</span>
          </div>
          <input type="range" min={0} max={future.length - 1} value={w} onChange={(e) => setWeek(Number(e.target.value))} aria-label="Weeks into the future" />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>Today</span>
            <span>{weeksLabel(Math.round((future.length - 1) / 2))}</span>
            <span>{weeksLabel(future.length - 1)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Weight" value={target.metrics.weightKg} delta={target.metrics.weightKg - present.metrics.weightKg} unit="kg" hide={hideNumbers} />
        <Stat label="Body fat" value={target.metrics.bodyFatPct} delta={target.metrics.bodyFatPct - present.metrics.bodyFatPct} unit="%" hide={hideNumbers} />
        <Stat label="Muscle" value={target.metrics.muscleKg} delta={target.metrics.muscleKg - present.metrics.muscleKg} unit="kg" hide={hideNumbers} />
        <Stat label="Waist" value={target.metrics.waistCm} delta={target.metrics.waistCm - present.metrics.waistCm} unit="cm" hide={hideNumbers} />
      </div>

      {regionDeltas.length > 0 && (
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">What changes most by {w === 0 ? "now" : formatMonth(target.date)}</p>
          <div className="flex flex-wrap gap-2">
            {regionDeltas.map((d) => (
              <span key={d.r} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${d.pct > 0 ? "bg-mint/15 text-mint" : "bg-coral/15 text-coral"}`}>
                {REGION_LABEL[d.r as Region]} {d.pct > 0 ? "+" : ""}
                {d.pct.toFixed(0)}%
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex items-center gap-4">
        <Ring value={progress} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{progressCopy(progress)}</p>
          <p className="text-xs text-muted mt-0.5">
            {plan ? (
              <>
                This week: {weekStats.sessions}/{weekStats.plannedSessions} sessions · {weekStats.done}/{weekStats.planned} sets
              </>
            ) : (
              "Pick a plan to give Future You a direction."
            )}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button href="/log">Log today</Button>
        <Button href="/plans" variant="ghost">
          {plan ? `${plan.emoji} ${plan.name}` : "Choose a plan"}
        </Button>
      </div>
    </div>
  );
}

function sumMuscle(m: Record<Region, number>): number {
  return Object.values(m).reduce((a, b) => a + b, 0);
}

function journeyProgress(
  _startWeight: number,
  startFat: number,
  nowFat: number,
  goalFat: number,
  startMuscle: number,
  nowMuscle: number,
  goalMuscle: number,
): number {
  const parts: number[] = [];
  if (Math.abs(goalFat - startFat) > 0.3) parts.push((nowFat - startFat) / (goalFat - startFat));
  if (Math.abs(goalMuscle - startMuscle) > 0.2) parts.push((nowMuscle - startMuscle) / (goalMuscle - startMuscle));
  if (parts.length === 0) return 0;
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return Math.max(0, Math.min(1, avg));
}

function progressCopy(p: number): string {
  if (p === 0) return "Day one. Future You is waiting.";
  if (p < 0.1) return "First steps in. It all counts.";
  if (p < 0.35) return `${Math.round(p * 100)}% of the way. You're moving.`;
  if (p < 0.7) return `${Math.round(p * 100)}% there. This is the part that shows.`;
  if (p < 1) return `${Math.round(p * 100)}%. Future You is nearly here.`;
  return "You've become Future You. Set a new horizon.";
}

function weeksLabel(w: number): string {
  if (w < 8) return `${w} wk`;
  const months = Math.round(w / 4.33);
  return `${months} mo`;
}

function Label({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        accent ? "btn-primary" : "bg-white/10 text-ink"
      }`}
    >
      {children}
    </span>
  );
}

function Ring({ value }: { value: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={r}
        stroke="url(#ring)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        className="transition-[stroke-dashoffset] duration-700"
      />
      <defs>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ff6a8a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
