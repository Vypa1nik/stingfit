# High-Voltage Fitness Module 13 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Expose the existing repository-backed personal plan structure in the UI and add the first practical editing controls: duplicate a week and edit planned exercise targets.

**Architecture:** No schema changes. `FitnessPlansPage` remains the page-level orchestrator. UI calls `fitnessRepository` APIs only:
- `getPlanStructure(planId)`
- `duplicateWeek(weekId)`
- `updatePlanExercise(planExerciseId, patch)`

**MVP editor scope:**
- Auto-load first personal plan into an editor.
- Show weeks, days, workouts, exercises, and target labels.
- Duplicate a week.
- Edit target sets, min/max reps, target RIR, and rest seconds for one exercise.

---

## Task 1: Plan editor UI

- [x] **Step 1: Write failing UI integration test**

Add `tests/fitness-plan-editor-ui.test.tsx`:
- Seed starter data and create `My PPL Block` from PPL before rendering.
- Render `FitnessPlansPage`.
- Expect `Plan editor`, `Week 1`, `Bench Press`, and `3×6–8 · RIR 1 · 150s rest`.
- Click `Duplicate week 1` and expect `Week duplicated` plus `Week 2`.
- Edit Bench Press targets through accessible inputs and click `Save Bench Press targets`.
- Expect updated label `4×8–10 · RIR 1 · 90s rest` and verify repository structure.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-editor-ui.test.tsx`
Expected: FAIL because the editor UI is not implemented.

- [x] **Step 3: Implement editor in `FitnessPlansPage`**

- Track selected plan structure and exercises.
- Auto-select first personal plan after load.
- Render plan structure with accessible controls.
- Implement mutation helpers with loading/success/error states.
- Keep UI mobile-first and High-Voltage styling.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-editor-ui.test.tsx`
Expected: PASS.

## Task 2: Verification gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-editor-ui.test.tsx tests/fitness-plan-builder-page.test.tsx tests/fitness-plan-builder-repository.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No schema changes.
- UI uses repository APIs, not raw SQL.
- Every mutation has loading/success/error handling.
- Empty state remains useful when no personal plan exists.
- No cloud/login/analytics/subscription/paywall logic.
