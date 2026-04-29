# High-Voltage Fitness Module 23 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Improve Plan Builder density and mobile ergonomics without hiding important safety information by adding compact readiness summaries plus reversible collapse/expand controls for weeks and days.

**Architecture:** Keep persistence unchanged. Add a small pure presentation helper for day status and week summary, then use it inside `FitnessPlansPage`. Collapse state is local UI state only; no database writes and no plan mutation.

**Critical UX stance:** The default state stays expanded so existing workflows remain discoverable. Collapse is an opt-in density tool for users with larger plans. Readiness/status labels remain visible even when details are collapsed.

---

## Task 1: Pure plan-density presentation helpers

- [x] **Step 1: Write failing pure tests**

Create `tests/fitness-plan-density.test.ts`:
- Rest day returns `Rest`.
- Training day with no workouts returns `Missing workout`.
- Workout with no exercises returns `Missing exercises`.
- Valid training day returns `Ready`.
- Week summary counts days, rest days, workouts, ready workouts, and issues.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-density.test.ts`
Expected: FAIL because `fitnessPlanPresentation` does not exist.

- [x] **Step 3: Implement helper**

Create `src/features/fitness/fitnessPlanPresentation.ts`:
- `getPlanDayStatus(day)`
- `summarizePlanWeek(week)`
- small pluralization helper for stable labels.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-density.test.ts`
Expected: PASS.

## Task 2: Plan Builder collapse/expand ergonomics

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-plan-density-ui.test.tsx`:
- Build a plan with a valid `Push Day` and empty `Recovery Day`.
- Render `FitnessPlansPage`.
- Expect `Week 1 overview`, `1 ready workout`, `1 issue`, `Ready`, and `Missing workout`.
- Click `Collapse Push Day`; expect `Expand Push Day` and the `Bench Press` editor to be hidden.
- Click `Expand Push Day`; expect `Bench Press` visible again.
- Click `Collapse week 1`; expect `Expand week 1` and `Recovery Day` hidden while the week overview remains visible.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-density-ui.test.tsx`
Expected: FAIL because summaries/collapse controls do not exist.

- [x] **Step 3: Implement UI**

Modify `src/features/fitness/FitnessPlansPage.tsx`:
- Import helper functions.
- Add local collapsed week/day state inside `PlanEditor`.
- Render a compact `Week X overview` strip for each week.
- Render day status badges using `getPlanDayStatus(day)`.
- Add buttons:
  - `Collapse week 1` / `Expand week 1`
  - `Collapse Push Day` / `Expand Push Day`
- Hide detailed week/day content only when collapsed; keep summaries visible.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-density-ui.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-density.test.ts tests/fitness-plan-density-ui.test.tsx tests/fitness-plan-structure-edit-ui.test.tsx tests/fitness-plan-rest-day-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Existing flows remain expanded by default.
- Collapsed state is local and reversible.
- Status labels stay visible when details are hidden.
- No persistence/schema changes.
- No cloud/login/analytics/subscription/paywall logic.
