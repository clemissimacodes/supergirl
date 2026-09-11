# Supergirl — meet Future You

Log what you actually do (training and food) and watch the body you're building take shape.
Not just a weight number: a 3D figure that broadens at the shoulders, tightens at the waist and
fills out at the glutes as you scrub months into the future. Compare two plans side by side,
see exactly which muscles an exercise hits, and check in weekly so the model learns *your* body.

Installable PWA. Everything runs in the browser; nothing is uploaded, no account needed.

## Features

- **Future You**: Present vs. projected body with a time scrubber (3 / 6 / 12 month horizon).
- **Two scenarios**: "If I stick to it" (100 % of the plan) vs. "At my current pace" (measured adherence).
- **Logging**: one-tap "did it as planned", custom sessions, quick-add meals. Every log pulses the muscles it fed.
- **Plans**: three templates, a builder with per-muscle weekly set volume, and side-by-side plan comparison.
- **Anatomy explorer**: heat map of where this week's (or the plan's) work lands; pick any exercise to
  see which regions it hits and what adding 3 sets/week would change by the horizon.
- **Weekly check-in**: real weight (and optionally body fat / waist) vs. the prediction, with automatic
  recalibration of your personal fat-rate coefficient.
- **Optional photo onboarding**: a single front photo is analysed on-device with MediaPipe Pose to
  estimate shoulder / hip / torso proportions. The image is discarded; only four ratios are kept.
  Manual sliders are always available as a fallback.
- **Hide the numbers** mode for people who'd rather watch shape than scale weight.

## How the projection works

`src/lib/engine.ts` is a small, tested physiology model:

- Energy balance (Mifflin–St Jeor BMR × activity + training kcal) drives fat mass, with metabolic
  adaptation in a deficit, a ~1 % body-weight/week loss cap and a sex-specific body-fat floor.
- Weekly hard sets per muscle (from an exercise → region table) drive regional muscle growth via a
  saturating volume response, gated by protein intake and energy status, with diminishing returns
  the further a muscle is above its untrained baseline and slow detraining when neglected.
- Monthly gain potential depends on sex, training age and age.
- Real logs roll the body forward to today; the active plan (scaled by adherence) rolls it into the future.
- Check-ins re-anchor the body and nudge a personal calibration multiplier.

`src/lib/mesh-params.ts` turns a body state into concrete dimensions, and `src/components/body/rig.ts`
builds a procedural, morphable figure from elliptical tubes and spheres — no external assets.

The projection is an illustrative estimate for comparing regimes and staying motivated, not a medical prediction.

## Development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # engine unit tests (vitest)
pnpm lint
pnpm build && pnpm start
```

Stack: Next.js (App Router) · React · TypeScript · Tailwind v4 · three.js / react-three-fiber · zustand · vitest.
