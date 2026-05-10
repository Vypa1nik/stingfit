> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 20 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Make Training feel faster by recommending the next workout from local history instead of only showing a flat list of startable workouts.

**Architecture:** Add a pure recommendation helper that consumes already-loaded startable workouts and completed sessions. Keep persistence unchanged. `FitnessDashboard` uses the helper to render an `Up next` card above the full workout list.

**Policy:**
- No automatic plan mutation.
- Recommendation is transparent and derived from local completed sessions.
- If there is no history, recommend the first startable workout.
- If the last completed planned workout is still in the current plan sequence, recommend the next workout, wrapping at the end.
- If history points to a workout that no longer exists, restart from the first available workout in the same plan when possible.

---

## Task 1: Pure next-workout recommendation

- [x] **Step 1: Write failing pure tests**

Create `tests/fitness-workout-recommendation.test.ts`:
- No history recommends first workout.
- Last completed Push Day A recommends Pull Day A.
- Last completed final workout wraps to first workout.
- Removed historical workout restarts at first available workout.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-workout-recommendation.test.ts`
Expected: FAIL because `fitnessWorkoutRecommendation` does not exist.

- [x] **Step 3: Implement helper**

Create `src/features/fitness/fitnessWorkoutRecommendation.ts` with `pickRecommendedWorkout(startableWorkouts, completedSessions)`.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-workout-recommendation.test.ts`
Expected: PASS.

## Task 2: Training dashboard Up Next card

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-dashboard-recommendation.test.tsx`:
- Create PPL plan.
- Complete Push Day A through repository.
- Render `FitnessDashboard`.
- Expect `Up next`, `Recommended next: Pull Day A`, `Last completed: Push Day A`, and `Start recommended Pull Day A`.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-dashboard-recommendation.test.tsx`
Expected: FAIL because the dashboard has no recommendation UI yet.

- [x] **Step 3: Implement dashboard integration**

- Load completed sessions in `loadTrainingState()`.
- Store recommendation state.
- Render `Up next` card before `Startable workouts`.
- Start button calls the existing `startWorkout()` path.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-dashboard-recommendation.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-workout-recommendation.test.ts tests/fitness-dashboard-recommendation.test.tsx tests/fitness-dashboard.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-training-readiness-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- The recommendation is pure, deterministic, and tested independently.
- The dashboard remains repository-backed and does not query raw SQL.
- Start behavior still uses the existing live-session path and active-session guard.
- No cloud/login/analytics/subscription/paywall logic.
