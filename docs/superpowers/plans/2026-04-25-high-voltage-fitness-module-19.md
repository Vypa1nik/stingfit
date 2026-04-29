# High-Voltage Fitness Module 19 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Make the Training page readiness-aware: do not show empty workouts as startable, and show clear not-ready reasons with navigation back to Plan Builder.

**Architecture:** Keep validation derived and local. Repository should only return truly startable workouts from `listStartableWorkouts()`. The Training UI additionally loads personal plan structures and uses `buildPlanReadinessReport()` to surface blockers.

**Policy:**
- A workout with zero planned exercises is not startable.
- Training shows blockers from the selected/personal plans as `Not ready workouts`.
- Users get an `Open Plan Builder` action instead of trying to start an invalid workout.

---

## Task 1: Repository startable filtering

- [x] **Step 1: Write failing repository test**

Add `tests/fitness-training-readiness-repository.test.ts`:
- Create blank plan → day → workout with no exercises.
- Expect `listStartableWorkouts()` to omit that workout.
- Add an exercise.
- Expect `listStartableWorkouts()` to include it.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-training-readiness-repository.test.ts`
Expected: FAIL because `listStartableWorkouts()` currently returns workouts without exercises.

- [x] **Step 3: Implement repository filter**

Update `listStartableWorkouts()` SQL to require at least one `fitness_plan_exercises` row for the workout.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-training-readiness-repository.test.ts`
Expected: PASS.

## Task 2: Training page not-ready surface

- [x] **Step 1: Write failing UI test**

Add `tests/fitness-training-readiness-ui.test.tsx`:
- Create blank plan → day → workout with no exercises.
- Render `FitnessDashboard`.
- Expect no `Start Chest Builder`.
- Expect `Not ready workouts`, reason `Week 1 · Chest Day · Chest Builder has no exercises.`, and `Open Plan Builder`.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-training-readiness-ui.test.tsx`
Expected: FAIL because Training does not show plan readiness blockers yet.

- [x] **Step 3: Implement UI**

- Load personal plans and structures in `FitnessDashboard`.
- Build readiness reports with `buildPlanReadinessReport()`.
- Render not-ready card in both no-startable and mixed ready/not-ready states.
- `Open Plan Builder` sets `window.location.href = '/plans'`.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-training-readiness-ui.test.tsx`
Expected: PASS.

## Task 3: Regression and gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-training-readiness-repository.test.ts tests/fitness-training-readiness-ui.test.tsx tests/fitness-dashboard.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-plan-readiness.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Invalid workouts are not startable.
- Reasons are transparent and reuse the readiness validator.
- UI routes user back to Plan Builder instead of silently failing.
- No schema changes and no automatic plan mutation.
- No cloud/login/analytics/subscription/paywall logic.
