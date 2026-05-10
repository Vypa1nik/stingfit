> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 24 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Add careful ordering controls for workouts and planned exercises without making the whole plan arbitrarily mutable.

**Architecture:** Add constrained repository APIs that only move an item one slot up/down inside its current parent. UI exposes explicit buttons only; no drag/drop, no cross-day/cross-workout moves, no day/week reordering in this module.

**Critical product guardrails:**
- Editable: workout order within the same day.
- Editable: exercise order within the same workout.
- Not editable here: moving workouts to another day, moving exercises to another workout, moving whole weeks, arbitrary drag/drop, changing completed history.
- Boundary moves are safe no-ops and UI buttons are disabled at boundaries.
- Completed sessions remain immutable snapshots.

---

## Task 1: Repository constrained ordering APIs

- [x] **Step 1: Write failing repository tests**

Create `tests/fitness-plan-ordering-repository.test.ts`:
- Create one day with workouts `Push Builder`, `Accessory Builder`, `Pump Finisher`.
- Move `Accessory Builder` up and assert order is `Accessory Builder`, `Push Builder`, `Pump Finisher`.
- Moving first workout up keeps order unchanged.
- Create one workout with `Bench Press`, `Barbell Row`, `Squat`.
- Move `Squat` up and assert order is `Bench Press`, `Squat`, `Barbell Row`.
- Moving first exercise up keeps order unchanged.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-ordering-repository.test.ts`
Expected: FAIL because move APIs do not exist.

- [x] **Step 3: Implement minimal repository APIs**

Modify:
- `src/features/fitness/fitnessTypes.ts`
  - Add `FitnessPlanMoveDirection = 'up' | 'down'`.
- `src/features/fitness/fitnessRepository.ts`
  - Add `movePlanWorkout(workoutId, direction)`.
  - Add `movePlanExercise(planExerciseId, direction)`.
  - Renumber siblings inside the same parent after a one-slot swap.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-ordering-repository.test.ts`
Expected: PASS.

## Task 2: Plan Builder explicit ordering controls

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-plan-ordering-ui.test.tsx`:
- Build a plan with two workouts on `Push Day` and two exercises in `Push Builder`.
- Render `FitnessPlansPage`.
- Click `Move Accessory Builder up`; expect success message and repository order changed.
- Click `Move Barbell Row up`; expect success message and repository exercise order changed.
- Assert the top boundary buttons are disabled where applicable.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-ordering-ui.test.tsx`
Expected: FAIL because ordering controls do not exist.

- [x] **Step 3: Implement UI controls**

Modify `src/features/fitness/FitnessPlansPage.tsx`:
- Add handlers `movePlanWorkout(workout, direction)` and `movePlanExercise(exercise, direction)`.
- Pass handlers into `PlanEditor` and `PlanExerciseEditor`.
- Render buttons:
  - `Move Push Builder up/down`
  - `Move Bench Press up/down`
- Disable boundary buttons.
- Keep buttons explicit and small; do not introduce drag/drop.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-ordering-ui.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-ordering-repository.test.ts tests/fitness-plan-ordering-ui.test.tsx tests/fitness-plan-density-ui.test.tsx tests/fitness-plan-structure-edit-ui.test.tsx tests/fitness-plan-cleanup-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Ordering is constrained, intentional, and reversible.
- No arbitrary cross-parent mutation exists.
- No history/session snapshots are rewritten.
- UI makes boundary constraints clear through disabled buttons.
- No cloud/login/analytics/subscription/paywall logic.
