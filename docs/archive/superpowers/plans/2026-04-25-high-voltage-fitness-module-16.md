> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 16 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Add safe cleanup controls to the Plan Builder so users can correct mistakes: remove planned exercises, workouts, and training days from a personal plan.

**Architecture:** Keep plan cleanup local and explicit. Repository owns persistence. UI owns confirmation prompts and reloads the selected plan structure after mutation.

**Repository APIs:**
- `removePlanExercise(planExerciseId)`
- `removePlanWorkout(planWorkoutId)`
- `removePlanDay(planDayId)`

**Safety:**
- UI asks for `window.confirm(...)` before each removal.
- Removing a workout cascades planned exercises through SQLite FK.
- Removing a day cascades workouts and planned exercises through SQLite FK.
- Completed/live session history remains stable because sessions are snapshots.

---

## Task 1: Repository cleanup APIs

- [x] **Step 1: Write failing repository test**

Add `tests/fitness-plan-cleanup-repository.test.ts`:
- Create blank plan → day → workout → exercise.
- Remove exercise and verify workout has no exercises.
- Add exercise again, remove workout and verify day has no workouts.
- Add workout/exercise again, remove day and verify week has no days.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-cleanup-repository.test.ts`
Expected: FAIL because repository cleanup APIs do not exist.

- [x] **Step 3: Implement repository APIs**

Add focused delete helpers in `fitnessRepository.ts`, with not-found errors:
- `Fitness plan exercise not found`
- `Fitness plan workout not found`
- `Fitness plan day not found`

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-cleanup-repository.test.ts`
Expected: PASS.

## Task 2: Safe cleanup UI in Plan Builder

- [x] **Step 1: Write failing UI test**

Add `tests/fitness-plan-cleanup-ui.test.tsx`:
- Create blank plan with one day/workout/exercise in repository.
- Render `FitnessPlansPage`.
- First cancel `Remove Cable Fly`, verify it remains.
- Confirm `Remove Cable Fly`, verify success and removal.
- Confirm `Remove workout Chest Builder`, verify success and removal.
- Confirm `Remove day Chest Day`, verify success and removal.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-cleanup-ui.test.tsx`
Expected: FAIL because cleanup buttons are not implemented.

- [x] **Step 3: Implement UI controls**

- Add remove buttons to planned exercise cards, workout cards, and day cards.
- Add confirmation prompts in page mutation handlers.
- Reuse loading/success/error states.
- Reload selected plan after every confirmed removal.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-cleanup-ui.test.tsx`
Expected: PASS.

## Task 3: Regression and gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-cleanup-repository.test.ts tests/fitness-plan-cleanup-ui.test.tsx tests/fitness-plan-custom-exercise-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-plan-editor-ui.test.tsx tests/fitness-plan-builder-repository.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No schema changes.
- UI uses repository APIs only.
- Destructive actions require confirmation.
- History remains stable because session snapshots are independent from plan edits.
- No cloud/login/analytics/subscription/paywall logic.
