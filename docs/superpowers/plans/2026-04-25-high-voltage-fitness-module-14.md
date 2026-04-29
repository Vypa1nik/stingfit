# High-Voltage Fitness Module 14 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Extend the Plans editor so a user can build a blank personal plan from the UI: add a training day, add a workout to that day, and add an exercise from the local exercise library with targets.

**Architecture:** No schema changes. UI calls repository APIs only:
- `listExercises()`
- `addPlanDay(weekId, input)`
- `addPlanWorkout(dayId, input)`
- `addPlanExercise(workoutId, input)`
- reloads with `getPlanStructure(planId)` through the existing page loader

**MVP editor scope:**
- Per-week `Add training day` form.
- Per-day `Add workout` form.
- Per-workout `Add exercise` form using local exercise library.
- Default target values remain editable before insert.

---

## Task 1: Add structure creation UI

- [x] **Step 1: Write failing UI integration test**

Add `tests/fitness-plan-add-structure-ui.test.tsx`:
- Seed starter exercises and create `Blank Strength Block` before rendering.
- Render `FitnessPlansPage`.
- Add day 1 named `Chest Day`.
- Add workout `Chest Builder`.
- Add `Bench Press` from local exercise library with `4×8–10 · RIR 1 · 90s rest`.
- Assert UI success states and verify repository structure.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-add-structure-ui.test.tsx`
Expected: FAIL because add day/workout/exercise UI is not implemented.

- [x] **Step 3: Implement UI in `FitnessPlansPage`**

- Load `exerciseOptions` through `fitnessRepository.listExercises()`.
- Add page state for day/workout/exercise creation drafts.
- Render per-week, per-day, and per-workout forms.
- Implement mutation helpers with existing loading/success/error states.
- Reload selected plan after each mutation.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-add-structure-ui.test.tsx`
Expected: PASS.

## Task 2: Regression and gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-plan-editor-ui.test.tsx tests/fitness-plan-builder-page.test.tsx tests/fitness-plan-builder-repository.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No schema changes.
- UI uses repository APIs only.
- Mutations include loading/success/error handling.
- Empty week can become a real workout plan through UI.
- No cloud/login/analytics/subscription/paywall logic.
