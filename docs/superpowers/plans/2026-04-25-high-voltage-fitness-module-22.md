# High-Voltage Fitness Module 22 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Complete the next slice of full plan editing by allowing users to rename/re-slot training days and edit workout names/notes from Plan Builder.

**Architecture:** Add small repository patch APIs for day and workout metadata. UI continues to call only `fitnessRepository`; sessions remain snapshots, so edits affect future Training only and never rewrite history.

**Policy:**
- Editing day/workout metadata must not delete workouts, exercises, sessions, or history.
- Day number in UI is 1-7; repository stores `dayIndex` as 0-6.
- Validation reuses existing messages:
  - `Plan day label is required`
  - `Day index must be between 0 and 6`
  - `Workout name is required`
- No cloud/login/analytics/subscription/paywall logic.

---

## Task 1: Repository day/workout metadata updates

- [x] **Step 1: Write failing repository test**

Create `tests/fitness-plan-structure-edit-repository.test.ts`:
- Create blank personal plan.
- Add day/workout/exercise.
- Call `updatePlanDay(day.id, { label: 'Upper Day', dayIndex: 2 })`.
- Call `updatePlanWorkout(workout.id, { name: 'Upper Builder', notes: 'Controlled tempo' })`.
- Assert `getPlanStructure()` reflects the changed label, day index, workout name, and notes.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-structure-edit-repository.test.ts`
Expected: FAIL because update APIs do not exist.

- [x] **Step 3: Implement minimal repository APIs**

Modify:
- `src/features/fitness/fitnessTypes.ts`
  - Add `UpdatePlanDayInput`
  - Add `UpdatePlanWorkoutInput`
- `src/features/fitness/fitnessRepository.ts`
  - Add helper `getPlanDayRow(dayId)`
  - Add helper `getPlanWorkoutRow(workoutId)`
  - Add `updatePlanDay(dayId, patch)`
  - Add `updatePlanWorkout(workoutId, patch)`

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-structure-edit-repository.test.ts`
Expected: PASS.

## Task 2: Plan Builder inline edit controls

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-plan-structure-edit-ui.test.tsx`:
- Build a plan with `Push Day` → `Push Builder` → `Bench Press`.
- Render `FitnessPlansPage`.
- Edit `Day label for Push Day` to `Upper Day` and `Day number for Push Day` to `3`.
- Click `Save Push Day`.
- Expect `Upper Day updated`.
- Edit `Workout name for Push Builder` to `Upper Builder` and `Workout notes for Push Builder` to `Controlled tempo`.
- Click `Save Push Builder`.
- Expect `Upper Builder updated` and `Controlled tempo`.
- Assert repository structure reflects edits.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-structure-edit-ui.test.tsx`
Expected: FAIL because inline edit controls do not exist.

- [x] **Step 3: Implement UI controls**

Modify `src/features/fitness/FitnessPlansPage.tsx`:
- Add day edit draft state.
- Add workout edit draft state.
- Build drafts from selected plan structure in `loadPlans()`.
- Add `saveDayDetails(day)` handler.
- Add `saveWorkoutDetails(workout)` handler.
- Render inputs/buttons near existing day/workout headers:
  - `Day number for Push Day`
  - `Day label for Push Day`
  - `Save Push Day`
  - `Workout name for Push Builder`
  - `Workout notes for Push Builder`
  - `Save Push Builder`

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-structure-edit-ui.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-structure-edit-repository.test.ts tests/fitness-plan-structure-edit-ui.test.tsx tests/fitness-plan-editor-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-plan-rest-day-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Plan metadata editing is small and reversible.
- Existing plan structure and history are preserved.
- Training page labels update via repository data.
- All UI changes remain accessible through explicit labels and buttons.
