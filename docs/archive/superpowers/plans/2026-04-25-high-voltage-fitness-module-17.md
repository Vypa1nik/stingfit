> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 17 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Add local Exercise Library management so users can maintain custom exercises without leaving StingFit: edit custom exercises, archive custom exercises, and keep starter exercises protected.

**Architecture:** No schema changes. `fitness_exercises` already has `is_custom`, `deleted_at`, and `updated_at`. Repository owns validation and starter protection. UI uses repository APIs only.

**Repository APIs:**
- `updateCustomExercise(exerciseId, input)`
- `archiveCustomExercise(exerciseId)`

**Safety:**
- Starter exercises cannot be edited or archived through custom-exercise APIs.
- Archive is soft delete (`deleted_at`) so existing plan/session snapshots remain stable.
- `listExercises()` continues to return non-archived exercises only.

---

## Task 1: Repository exercise library APIs

- [x] **Step 1: Write failing repository test**

Add `tests/fitness-exercise-library-repository.test.ts`:
- create a custom exercise
- update name/category/default rest
- archive it and verify `listExercises()` hides it
- verify starter exercises cannot be updated/archived

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-exercise-library-repository.test.ts`
Expected: FAIL because APIs do not exist.

- [x] **Step 3: Implement repository APIs**

- Add `UpdateFitnessExerciseInput` type.
- Add `getExerciseRow` helper.
- Add validation using existing name/non-negative helpers.
- Protect starter exercises with errors:
  - `Only custom exercises can be edited`
  - `Only custom exercises can be archived`

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-exercise-library-repository.test.ts`
Expected: PASS.

## Task 2: Exercise Library UI in Plans

- [x] **Step 1: Write failing UI test**

Add `tests/fitness-exercise-library-ui.test.tsx`:
- create custom exercise before render
- render `FitnessPlansPage`
- verify `Exercise library`, custom exercise, starter protected label
- edit custom exercise fields and save
- archive custom exercise after confirmation
- verify repository state and UI success messages

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-exercise-library-ui.test.tsx`
Expected: FAIL because UI does not exist.

- [x] **Step 3: Implement UI**

- Add exercise library drafts to `FitnessPlansPage`.
- Render an `Exercise library` card.
- Custom rows: editable name/category/default rest, `Save`, `Archive`.
- Starter rows: protected badge and read-only info.
- Use existing loading/success/error/mutating states.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-exercise-library-ui.test.tsx`
Expected: PASS.

## Task 3: Regression and gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-exercise-library-repository.test.ts tests/fitness-exercise-library-ui.test.tsx tests/fitness-plan-custom-exercise-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-repository.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No schema changes.
- Starter exercises protected.
- Archived custom exercises are hidden from future selection but existing plan/session snapshots remain stable.
- No cloud/login/analytics/subscription/paywall logic.
