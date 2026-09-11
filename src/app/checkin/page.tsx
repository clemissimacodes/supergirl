"use client";

import { useState } from "react";
import { Button, Card, Field, NumberInput, PageTitle, inputClass } from "@/components/ui";
import { daysBetween, formatShort, todayStr } from "@/lib/dates";
import { useProjection } from "@/lib/hooks";
import { useApp } from "@/lib/store";

export default function CheckInPage() {
  const profile = useApp((s) => s.profile);
  const checkIns = useApp((s) => s.checkIns);
  const calibration = useApp((s) => s.calibration);
  const anchor = useApp((s) => s.anchor);
  const hideNumbers = useApp((s) => s.hideNumbers);
  const record = useApp((s) => s.recordCheckIn);
  const projection = useProjection({ weeks: 1 });
  const [weight, setWeight] = useState<number | "">("");
  const [bodyFat, setBodyFat] = useState<number | "">("");
  const [waist, setWaist] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ predicted: number; actual: number } | null>(null);

  if (!profile || !projection || !anchor) return null;

  const today = todayStr();
  const predicted = projection.present.metrics.weightKg;
  const last = checkIns[0];
  const sinceLast = last ? daysBetween(last.date, today) : daysBetween(anchor.date, today);
  const alreadyToday = last?.date === today;

  function submit() {
    if (weight === "" || !projection) return;
    record({ date: today, weightKg: weight, bodyFatPct: bodyFat === "" ? undefined : bodyFat, waistCm: waist === "" ? undefined : waist, note: note.trim() || undefined }, projection.present.body);
    setResult({ predicted, actual: weight });
    setWeight("");
    setBodyFat("");
    setWaist("");
    setNote("");
  }

  return (
    <div className="space-y-4">
      <PageTitle kicker="Reality check" title="Weekly check-in" />

      {result ? (
        <Card className="animate-pop space-y-2 border-violet/40 bg-violet/10">
          <p className="text-3xl">{verdictEmoji(result.actual - result.predicted)}</p>
          <p className="font-semibold">{verdictCopy(result.actual - result.predicted)}</p>
          <p className="text-sm text-muted">
            Predicted {result.predicted.toFixed(1)} kg · You {result.actual.toFixed(1)} kg. Your model has been re-tuned and Future You updated.
          </p>
          <Button href="/" className="w-full mt-2">
            See updated Future You
          </Button>
        </Card>
      ) : (
        <Card className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted">The model thinks you weigh about</p>
            <p className="text-xl font-semibold tabular-nums">{hideNumbers ? "••" : `${predicted.toFixed(1)} kg`}</p>
          </div>
          <p className="text-[11px] text-muted -mt-2">
            {sinceLast === 0 ? "Fresh start today." : `${sinceLast} day${sinceLast === 1 ? "" : "s"} since your last real measurement.`} Weigh in the same way each time, ideally mornings.
          </p>
          <Field label="Actual weight">
            <NumberInput value={weight} onChange={setWeight} min={30} max={250} step={0.1} suffix="kg" placeholder={predicted.toFixed(1)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Body fat (optional)">
              <NumberInput value={bodyFat} onChange={setBodyFat} min={4} max={60} step={0.5} suffix="%" placeholder="—" />
            </Field>
            <Field label="Waist (optional)">
              <NumberInput value={waist} onChange={setWaist} min={40} max={200} step={0.5} suffix="cm" placeholder={projection.present.metrics.waistCm.toFixed(0)} />
            </Field>
          </div>
          <Field label="How did the week feel?">
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Slept badly, but hit every session…" />
          </Field>
          <Button className="w-full" onClick={submit} disabled={weight === ""}>
            {alreadyToday ? "Update today's check-in" : "Save check-in"}
          </Button>
        </Card>
      )}

      <Card>
        <p className="text-xs uppercase tracking-wider text-muted">Your personal model</p>
        <p className="text-sm mt-1">{calibrationCopy(calibration.fatRate)}</p>
        <p className="text-[11px] text-muted mt-1">Every check-in nudges this. Two or three and the projection is about you, not the textbook.</p>
      </Card>

      {checkIns.length > 0 && (
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Predicted vs real</p>
          <ul className="space-y-2">
            {checkIns.slice(0, 8).map((c) => {
              const d = c.weightKg - c.predictedWeightKg;
              return (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="w-14 text-muted text-xs">{formatShort(c.date)}</span>
                  <span className="flex-1 tabular-nums">
                    {hideNumbers ? "••" : `${c.weightKg.toFixed(1)} kg`}
                    {c.bodyFatPct !== undefined && !hideNumbers && <span className="text-muted text-xs"> · {c.bodyFatPct}%</span>}
                  </span>
                  <span className={`text-xs tabular-nums ${Math.abs(d) < 0.5 ? "text-mint" : "text-muted"}`}>
                    {Math.abs(d) < 0.05 ? "spot on" : `${d > 0 ? "+" : ""}${d.toFixed(1)} vs predicted`}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

function verdictEmoji(d: number): string {
  if (Math.abs(d) < 0.5) return "🎯";
  return "🧭";
}

function verdictCopy(d: number): string {
  if (Math.abs(d) < 0.5) return "Right where the model expected. You're on track.";
  if (d > 0) return "A bit heavier than predicted. Water, food timing and muscle all count — no drama.";
  return "Lighter than predicted. Nice, and the model now knows you respond faster.";
}

function calibrationCopy(fatRate: number): string {
  const pct = Math.round((fatRate - 1) * 100);
  if (Math.abs(pct) < 5) return "Your body is tracking the textbook so far.";
  if (pct > 0) return `Your weight moves about ${pct}% faster than the textbook predicts.`;
  return `Your weight moves about ${Math.abs(pct)}% slower than the textbook predicts. Patience, it's working.`;
}
