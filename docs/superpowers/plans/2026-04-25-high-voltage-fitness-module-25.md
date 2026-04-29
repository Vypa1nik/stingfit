# High-Voltage Fitness Module 25 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Make edit boundaries explicit so StingFit feels deliberate: plans can be adjusted for future workouts, starter templates are protected, and completed sessions are immutable snapshots.

**Architecture:** UI-only clarification module. No schema changes and no new mutation paths. Existing repository protections remain the enforcement layer; the UI now communicates those rules before users make edits.

**Critical product guardrails:**
- Starter templates are not edited directly. Users create a personal copy.
- Plan Builder edits affect future workouts only.
- Completed history is a session snapshot and is not changed by later plan edits.
- Do not add hard locks, permissions, auth, cloud sync, telemetry, analytics, subscriptions, or paywalls.

---

## Task 1: Plan Builder edit boundary messaging

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-edit-boundaries-plan-ui.test.tsx`:
- Render `FitnessPlansPage` with no personal plan.
- Expect starter templates to show `Template protected` and `Create a personal copy to edit.`
- Create a personal plan with the existing `Create from Push / Pull / Legs` button.
- Expect the Plan editor to show `Future workouts only` and `Plan edits affect future workouts only.`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-edit-boundaries-plan-ui.test.tsx`
Expected: FAIL because these boundary labels do not exist yet.

- [x] **Step 3: Implement minimal Plan Builder messaging**

Modify `src/features/fitness/FitnessPlansPage.tsx`:
- Starter template cards show `Template protected` instead of raw `starter`.
- Starter template cards include `Create a personal copy to edit.`
- Plan editor selected-plan area includes a clear future-only edit boundary callout.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-edit-boundaries-plan-ui.test.tsx`
Expected: PASS.

## Task 2: History snapshot boundary messaging

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-edit-boundaries-history-ui.test.tsx`:
- Create and finish one planned workout.
- Render `FitnessHistoryPage`.
- Expect `Session snapshot` and `Plan edits do not change this workout.`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-edit-boundaries-history-ui.test.tsx`
Expected: FAIL because history detail does not surface the snapshot boundary prominently yet.

- [x] **Step 3: Implement minimal history messaging**

Modify `src/features/fitness/WorkoutHistoryDetail.tsx`:
- Add visible `Session snapshot` label.
- Add sentence `Plan edits do not change this workout.`

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-edit-boundaries-history-ui.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-edit-boundaries-plan-ui.test.tsx tests/fitness-edit-boundaries-history-ui.test.tsx tests/fitness-history.test.tsx tests/fitness-plan-builder-page.test.tsx tests/fitness-plan-ordering-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No new arbitrary edit capability was added.
- Boundaries are communicated where decisions happen.
- History immutability is clear.
- Starter-template protection is clear.
- Existing tests still pass.
