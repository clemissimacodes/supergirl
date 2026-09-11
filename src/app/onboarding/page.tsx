"use client";

import { useMemo, useState } from "react";
import Body from "@/components/body/Body";
import PhotoCapture from "@/components/PhotoCapture";
import { Button, Field, NumberInput, Segmented, inputClass } from "@/components/ui";
import { todayStr } from "@/lib/dates";
import { DEFAULT_CALIBRATION, estimateBodyFatPct, initialBody, project } from "@/lib/engine";
import { planTemplates } from "@/lib/plans";
import { useApp } from "@/lib/store";
import { DEFAULT_FRAME, type Activity, type Frame, type Profile, type Sex, type TrainingAge } from "@/lib/types";

const SKIN_TONES = ["#f3d9c4", "#e8b89a", "#d9a684", "#c0805a", "#8d5a3b", "#5a3a26"];

type Step = "you" | "body" | "shape" | "plan" | "reveal";
const STEPS: Step[] = ["you", "body", "shape", "plan", "reveal"];

export default function OnboardingPage() {
  const complete = useApp((s) => s.completeOnboarding);
  const setSkinTone = useApp((s) => s.setSkinTone);
  const [step, setStep] = useState<Step>("you");
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState<number | "">(28);
  const [heightCm, setHeight] = useState<number | "">(168);
  const [weightKg, setWeight] = useState<number | "">(64);
  const [bodyFat, setBodyFat] = useState<number | "">("");
  const [activity, setActivity] = useState<Activity>("light");
  const [trainingAge, setTrainingAge] = useState<TrainingAge>("beginner");
  const [frame, setFrame] = useState<Frame>(DEFAULT_FRAME);
  const [shapeMode, setShapeMode] = useState<"choose" | "photo" | "sliders">("choose");
  const [skin, setSkin] = useState(SKIN_TONES[2]);
  const [planId, setPlanId] = useState("tpl-sculpt");

  const profile: Profile | null = useMemo(() => {
    if (age === "" || heightCm === "" || weightKg === "") return null;
    return {
      name: name.trim(),
      sex,
      age,
      heightCm,
      weightKg,
      bodyFatPct: bodyFat === "" ? undefined : bodyFat,
      activity,
      trainingAge,
    };
  }, [name, sex, age, heightCm, weightKg, bodyFat, activity, trainingAge]);

  const templates = useMemo(() => (profile ? planTemplates(profile) : []), [profile]);
  const body = useMemo(() => (profile ? initialBody(profile) : null), [profile]);

  const reveal = useMemo(() => {
    if (!profile || !body) return null;
    const plan = templates.find((p) => p.id === planId);
    const today = todayStr();
    return project({
      profile,
      calibration: DEFAULT_CALIBRATION,
      anchor: { date: today, body },
      workouts: [],
      meals: [],
      plan,
      scenario: "commit",
      weeks: 26,
      today,
    });
  }, [profile, body, templates, planId]);

  const idx = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, idx + 1)]);
  const back = () => setStep(STEPS[Math.max(0, idx - 1)]);

  return (
    <div className="min-h-dvh flex flex-col py-2">
      <div className="flex items-center gap-2 mb-6">
        {idx > 0 && (
          <button onClick={back} className="text-muted hover:text-ink text-sm mr-1" type="button">
            ←
          </button>
        )}
        <div className="flex-1 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= idx ? "btn-primary" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      {step === "you" && (
        <StepShell title={<>Let&apos;s meet <span className="gradient-text">Future You</span></>} sub="Two minutes of setup, then you'll see the body you're building.">
          <Field label="What should we call you?">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
          </Field>
          <Field label="Body type for the model">
            <Segmented<Sex> value={sex} onChange={setSex} options={[{ value: "female", label: "Female" }, { value: "male", label: "Male" }]} />
          </Field>
          <Field label="Age">
            <NumberInput value={age} onChange={setAge} min={13} max={90} suffix="yrs" />
          </Field>
          <Button className="w-full mt-2" onClick={next} disabled={age === "" || Number(age) < 13}>
            Continue
          </Button>
          {age !== "" && Number(age) < 18 && <p className="text-xs text-muted text-center">This app is designed for adults.</p>}
        </StepShell>
      )}

      {step === "body" && (
        <StepShell title="Your starting point" sub="Rough numbers are fine. You'll refine them at check-ins.">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height">
              <NumberInput value={heightCm} onChange={setHeight} min={120} max={230} suffix="cm" />
            </Field>
            <Field label="Weight">
              <NumberInput value={weightKg} onChange={setWeight} min={30} max={250} step={0.1} suffix="kg" />
            </Field>
          </div>
          <Field label="Body fat (optional)" hint={profile ? `Leave blank and we'll estimate ~${estimateBodyFatPct(profile).toFixed(0)}%` : undefined}>
            <NumberInput value={bodyFat} onChange={setBodyFat} min={4} max={60} suffix="%" placeholder="Skip if unsure" />
          </Field>
          <Field label="Daily activity (outside training)">
            <Segmented<Activity>
              value={activity}
              onChange={setActivity}
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
              value={trainingAge}
              onChange={setTrainingAge}
              size="sm"
              options={[
                { value: "beginner", label: "New", hint: "< 1 yr" },
                { value: "intermediate", label: "Some", hint: "1–3 yrs" },
                { value: "advanced", label: "Lots", hint: "3+ yrs" },
              ]}
            />
          </Field>
          <Button className="w-full mt-2" onClick={next} disabled={!profile}>
            Continue
          </Button>
        </StepShell>
      )}

      {step === "shape" && profile && body && (
        <StepShell title="Make it look like you" sub="Optional. A photo tunes your frame; sliders work too.">
          {shapeMode === "choose" && (
            <>
              <div className="h-64 -mx-2">
                <Body body={body} profile={profile} frame={frame} skin={skin} spin interactive={false} />
              </div>
              <SkinPicker value={skin} onChange={setSkin} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button onClick={() => setShapeMode("photo")}>📸 Use a photo</Button>
                <Button variant="ghost" onClick={() => setShapeMode("sliders")}>
                  Adjust by hand
                </Button>
              </div>
              <button type="button" onClick={next} className="w-full text-sm text-muted hover:text-ink py-2">
                Looks fine, skip
              </button>
            </>
          )}
          {shapeMode === "photo" && (
            <PhotoCapture
              sex={sex}
              onResult={(est) => {
                setFrame(est.frame);
                setShapeMode("sliders");
              }}
              onSkip={() => setShapeMode("sliders")}
            />
          )}
          {shapeMode === "sliders" && (
            <>
              <div className="h-60 -mx-2">
                <Body body={body} profile={profile} frame={frame} skin={skin} interactive={false} />
              </div>
              <FrameSlider label="Shoulder width" value={frame.shoulderWidth} onChange={(v) => setFrame({ ...frame, shoulderWidth: v })} />
              <FrameSlider label="Hip width" value={frame.hipWidth} onChange={(v) => setFrame({ ...frame, hipWidth: v })} />
              <FrameSlider label="Torso length" value={frame.torsoLength} min={0.85} max={1.15} onChange={(v) => setFrame({ ...frame, torsoLength: v })} />
              <SkinPicker value={skin} onChange={setSkin} />
              <Button className="w-full mt-2" onClick={next}>
                Continue
              </Button>
            </>
          )}
        </StepShell>
      )}

      {step === "plan" && profile && (
        <StepShell title="Pick a direction" sub="You can build your own plan later. This gives Future You somewhere to go.">
          <div className="space-y-2">
            {templates.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                className={`w-full text-left card p-4 transition ${planId === p.id ? "border-violet/70 bg-violet/10" : "hover:bg-white/8"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.days.filter((d) => d.entries.length).length} sessions/wk · {p.kcal} kcal · {p.proteinG} g protein
                    </p>
                  </div>
                  {planId === p.id && <span className="text-violet">✓</span>}
                </div>
              </button>
            ))}
          </div>
          <Button className="w-full mt-2" onClick={next}>
            Show me Future You
          </Button>
        </StepShell>
      )}

      {step === "reveal" && profile && reveal && (
        <div className="flex-1 flex flex-col animate-pop">
          <h1 className="text-3xl font-bold text-center leading-tight">
            {profile.name ? `${profile.name}, ` : ""}meet <span className="gradient-text">Future You</span>
          </h1>
          <p className="text-center text-muted text-sm mt-1">Six months from now, if you stick to the plan.</p>
          <div className="card mt-4 grid grid-cols-2 h-[360px] overflow-hidden">
            <div className="relative border-r border-white/5">
              <span className="absolute top-3 left-3 z-10 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">Today</span>
              <Body body={reveal.present.body} profile={profile} frame={frame} skin={skin} interactive={false} />
            </div>
            <div className="relative">
              <span className="absolute top-3 left-3 z-10 rounded-full btn-primary px-2.5 py-1 text-[11px] font-semibold">+6 months</span>
              <Body body={reveal.future[26].body} profile={profile} frame={frame} skin={skin} spin />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <Mini label="Weight" now={reveal.present.metrics.weightKg} then={reveal.future[26].metrics.weightKg} unit="kg" />
            <Mini label="Body fat" now={reveal.present.metrics.bodyFatPct} then={reveal.future[26].metrics.bodyFatPct} unit="%" />
            <Mini label="Muscle" now={reveal.present.metrics.muscleKg} then={reveal.future[26].metrics.muscleKg} unit="kg" />
          </div>
          <p className="text-[11px] text-muted text-center mt-3">
            An estimate, not a promise. It gets more accurate every time you check in.
          </p>
          <div className="mt-auto pt-4">
            <Button
              className="w-full"
              onClick={() => {
                setSkinTone(skin);
                complete(profile, frame, planId);
              }}
            >
              Let&apos;s go
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepShell({ title, sub, children }: { title: React.ReactNode; sub: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 animate-pop">
      <div>
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        <p className="text-muted text-sm mt-1">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function FrameSlider({ label, value, onChange, min = 0.8, max = 1.25 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{value < 0.97 ? "narrower" : value > 1.03 ? "wider" : "typical"}</span>
      </div>
      <input type="range" min={min} max={max} step={0.01} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </div>
  );
}

function SkinPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {SKIN_TONES.map((t) => (
        <button
          key={t}
          type="button"
          aria-label={`Skin tone ${t}`}
          onClick={() => onChange(t)}
          className={`h-8 w-8 rounded-full border-2 transition ${value === t ? "border-white scale-110" : "border-transparent"}`}
          style={{ background: t }}
        />
      ))}
    </div>
  );
}

function Mini({ label, now, then, unit }: { label: string; now: number; then: number; unit: string }) {
  const d = then - now;
  return (
    <div className="rounded-2xl bg-white/5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="font-semibold tabular-nums">
        {then.toFixed(1)}
        <span className="text-xs text-muted">{unit}</span>
      </div>
      <div className={`text-[11px] tabular-nums ${d >= 0 ? "text-mint" : "text-coral"}`}>
        {d >= 0 ? "+" : ""}
        {d.toFixed(1)}
      </div>
    </div>
  );
}
