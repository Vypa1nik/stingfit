# High-Voltage Fitness Module 26 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Close the plan → training → history mental model by showing a start snapshot preview before a user starts a workout.

**Architecture:** Extend the existing `listStartableWorkouts()` repository result with lightweight workout summary fields. Training UI displays these fields on the recommended workout and each startable workout card. Starting still uses the existing `startSessionFromPlanWorkout()` snapshot flow; no new mutation path.

**Critical product guardrails:**
- No extra confirmation modal for every start; keep gym flow fast.
- Show enough context before start: exercise count, planned set count, first exercise.
- Explicitly state: `Starting creates a session snapshot`.
- Do not rewrite history or mutate plans on start.
- No cloud/login/analytics/subscription/paywall logic.

---

## Task 1: Repository start summary fields

- [x] **Step 1: Write failing repository test**

Create `tests/fitness-training-start-summary-repository.test.ts`:
- Create the PPL personal plan.
- Call `fitnessRepository.listStartableWorkouts()`.
- Expect `Push Day A` to include:
  - `exerciseCount: 4`
  - `plannedSetCount: 12`
  - `firstExerciseName: 'Bench Press'`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-training-start-summary-repository.test.ts`
Expected: FAIL because startable workout summaries do not exist yet.

- [x] **Step 3: Implement minimal repository summary fields**

Modify:
- `src/features/fitness/fitnessTypes.ts`
  - Extend `FitnessStartableWorkout` with `exerciseCount`, `plannedSetCount`, `firstExerciseName`.
- `src/features/fitness/fitnessRepository.ts`
  - Extend `FitnessStartableWorkoutRow`.
  - Add correlated SQL subqueries in `listStartableWorkouts()` for count, set sum, and first exercise.
  - Map the new fields in `startableWorkoutFromRow()`.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-training-start-summary-repository.test.ts`
Expected: PASS.

## Task 2: Training UI snapshot preview

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-training-start-summary-ui.test.tsx`:
- Create the PPL personal plan.
- Render `FitnessDashboard`.
- Expect:
  - `4 exercises · 12 planned sets`
  - `First: Bench Press`
  - `Starting creates a session snapshot`
  - `Start recommended Push Day A`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-training-start-summary-ui.test.tsx`
Expected: FAIL because Training UI does not show snapshot preview details yet.

- [x] **Step 3: Implement UI summary display**

Modify `src/features/fitness/FitnessDashboard.tsx`:
- Show summary fields in `UpNextWorkoutCard`.
- Show summary fields on each `Startable workouts` card.
- Keep existing start buttons and active session guard unchanged.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-training-start-summary-ui.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-training-start-summary-repository.test.ts tests/fitness-training-start-summary-ui.test.tsx tests/fitness-dashboard-recommendation.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-training-readiness-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Training remains fast: no mandatory confirmation modal.
- Snapshot boundary is visible before start.
- Repository boundary is preserved.
- Existing live session creation still snapshots plan data.
- No new arbitrary edit surface was added.
