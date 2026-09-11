"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Field, NumberInput, PageTitle, Segmented } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Activity, TrainingAge } from "@/lib/types";

const SKIN_TONES = ["#f3d9c4", "#e8b89a", "#d9a684", "#c0805a", "#8d5a3b", "#5a3a26"];

export default function SettingsPage() {
  const router = useRouter();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const frame = useApp((s) => s.frame);
  const setFrame = useApp((s) => s.setFrame);
  const skin = useApp((s) => s.skinTone);
  const setSkin = useApp((s) => s.setSkinTone);
  const horizon = useApp((s) => s.horizonWeeks);
  const setHorizon = useApp((s) => s.setHorizonWeeks);
  const hideNumbers = useApp((s) => s.hideNumbers);
  const setHideNumbers = useApp((s) => s.setHideNumbers);
  const reset = useApp((s) => s.reset);
  const [confirm, setConfirm] = useState(false);

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <PageTitle
        kicker="Tune"
        title="Settings"
        action={
          <Button variant="ghost" onClick={() => router.back()}>
            Done
          </Button>
        }
      />

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted">Horizon</p>
        <Segmented<string>
          value={String(horizon)}
          onChange={(v) => setHorizon(Number(v))}
          size="sm"
          options={[
            { value: "13", label: "3 months" },
            { value: "26", label: "6 months" },
            { value: "52", label: "1 year" },
          ]}
        />
        <label className="flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-sm font-medium">Hide the numbers</p>
            <p className="text-[11px] text-muted">Show shape, not scale weight. Good if numbers get in your head.</p>
          </div>
          <input type="checkbox" checked={hideNumbers} onChange={(e) => setHideNumbers(e.target.checked)} className="h-5 w-5 accent-violet" />
        </label>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted">About you</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height">
            <NumberInput value={profile.heightCm} onChange={(v) => setProfile({ ...profile, heightCm: Number(v || profile.heightCm) })} suffix="cm" />
          </Field>
          <Field label="Age">
            <NumberInput value={profile.age} onChange={(v) => setProfile({ ...profile, age: Number(v || profile.age) })} suffix="yrs" />
          </Field>
        </div>
        <Field label="Daily activity">
          <Segmented<Activity>
            value={profile.activity}
            onChange={(activity) => setProfile({ ...profile, activity })}
            size="sm"
            options={[
              { value: "sedentary", label: "Desk" },
              { value: "light", label: "Light" },
              { value: "moderate", label: "Moderate" },
              { value: "active", label: "Active" },
            ]}
          />
        </Field>
        <Field label="Training experience">
          <Segmented<TrainingAge>
            value={profile.trainingAge}
            onChange={(trainingAge) => setProfile({ ...profile, trainingAge })}
            size="sm"
            options={[
              { value: "beginner", label: "New" },
              { value: "intermediate", label: "Some" },
              { value: "advanced", label: "Lots" },
            ]}
          />
        </Field>
        <p className="text-[11px] text-muted">Weight and body fat are updated through check-ins so the model can learn from them.</p>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted">Frame</p>
        <Slider label="Shoulder width" value={frame.shoulderWidth} onChange={(v) => setFrame({ ...frame, shoulderWidth: v })} />
        <Slider label="Hip width" value={frame.hipWidth} onChange={(v) => setFrame({ ...frame, hipWidth: v })} />
        <Slider label="Torso length" value={frame.torsoLength} min={0.85} max={1.15} onChange={(v) => setFrame({ ...frame, torsoLength: v })} />
        <div className="flex items-center gap-2 pt-1">
          {SKIN_TONES.map((t) => (
            <button key={t} type="button" aria-label={`Skin tone ${t}`} onClick={() => setSkin(t)} className={`h-8 w-8 rounded-full border-2 ${skin === t ? "border-white scale-110" : "border-transparent"}`} style={{ background: t }} />
          ))}
        </div>
      </Card>

      <Card className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted">Privacy</p>
        <p className="text-sm text-muted">Everything lives in this browser. No account, no server, no photos stored. Clearing site data erases it all.</p>
        {confirm ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                reset();
                router.replace("/onboarding");
              }}
            >
              Erase everything
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setConfirm(true)}>
            Start over
          </Button>
        )}
      </Card>
    </div>
  );
}

function Slider({ label, value, onChange, min = 0.8, max = 1.25 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>{label}</span>
        <span>{value < 0.97 ? "narrower" : value > 1.03 ? "wider" : "typical"}</span>
      </div>
      <input type="range" min={min} max={max} step={0.01} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </div>
  );
}
