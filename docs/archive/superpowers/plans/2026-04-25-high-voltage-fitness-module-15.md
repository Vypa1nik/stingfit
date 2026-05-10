> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 15 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Let users create a missing custom exercise directly inside the Plan Builder exercise add flow, then immediately add it to the workout without leaving the editor.

**Architecture:** No schema changes. UI calls repository APIs only:
- `createExercise(input)`
- `listExercises()` through existing reload
- `addPlanExercise(workoutId, input)`

**MVP editor scope:**
- Per-workout custom exercise mini-form.
- Fields: exercise name, category, default rest seconds.
- After create, the new exercise is selected in that workout's add-exercise form.
- User can then set targets and add it to the workout.

---

## Task 1: Custom exercise creation inside Plan Builder

- [x] **Step 1: Write failing UI integration test**

Add `tests/fitness-plan-custom-exercise-ui.test.tsx`:
- Seed starter data and create a blank plan with one day/workout in repository.
- Render `FitnessPlansPage`.
- Fill custom exercise fields for the workout: `Cable Fly`, `chest`, `75`.
- Click `Create custom exercise for Chest Builder`.
- Assert success text and that `Cable Fly` is available/selected.
- Set targets and click `Add exercise to Chest Builder`.
- Verify repository has a custom exercise and planned exercise.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-custom-exercise-ui.test.tsx`
Expected: FAIL because custom exercise creation UI does not exist.

- [x] **Step 3: Implement UI in `FitnessPlansPage`**

- Add per-workout custom exercise draft state.
- Add create-custom-exercise mutation helper.
- Render custom exercise mini-form in `AddExerciseForm`.
- After creation, select the new exercise in the workout's add-exercise draft and keep default rest aligned.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-custom-exercise-ui.test.tsx`
Expected: PASS.

## Task 2: Regression and gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-custom-exercise-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-plan-editor-ui.test.tsx tests/fitness-plan-builder-page.test.tsx tests/fitness-repository.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No schema changes.
- UI uses repository APIs only.
- Custom exercises remain local and exportable through existing fitness export.
- Missing exercise no longer blocks plan building.
- No cloud/login/analytics/subscription/paywall logic.
