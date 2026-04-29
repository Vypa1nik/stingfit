# High-Voltage Fitness Module 28 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Make the live workout header clearer by showing active session snapshot boundaries and compact workout counters.

**Architecture:** Keep the data derived from the existing `FitnessLiveSession` snapshot in `LiveTrainingSession`. Pass the persisted `showGuidance` setting from `FitnessDashboard` so explanatory snapshot copy can be hidden while core counters remain visible.

**Tech Stack:** React 19, TypeScript strict mode, Vitest/jsdom, existing fitness repository and settings infrastructure.

---

## Task 1: Live session header counters and snapshot guidance

**Files:**
- Modify: `src/features/fitness/FitnessDashboard.tsx`
- Modify: `src/features/fitness/LiveTrainingSession.tsx`
- Test: `tests/fitness-live-session-snapshot-header-ui.test.tsx`

- [x] **Step 1: Write failing UI tests**

Create `tests/fitness-live-session-snapshot-header-ui.test.tsx` to verify:
- Starting `Push Day A` shows `Session snapshot active` and `Plan changes will not affect this workout.`
- Header counters show `4 exercises`, `12 planned sets`, `0 completed sets`.
- Logging one set updates the completed counter to `1 completed set`.
- With `showGuidance: false`, the snapshot guidance copy is hidden but counters remain visible.

- [x] **Step 2: Run RED test**

Run:

```bash
npm run test:run -- tests/fitness-live-session-snapshot-header-ui.test.tsx
```

Expected: FAIL because the live header does not render the new snapshot copy/counter labels yet.

- [x] **Step 3: Implement minimal UI**

Modify `LiveTrainingSession`:
- Add optional prop `showGuidance?: boolean` defaulting true.
- Derive:
  - `exerciseCount = session.exercises.length`
  - `plannedSetCount = session.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0)`
  - `completedSetCount = ...completed sets length`
- Render snapshot copy only when `showGuidance` is true:
  - `Session snapshot active`
  - `Plan changes will not affect this workout.`
- Render compact counters regardless of `showGuidance`:
  - exercises
  - planned sets
  - completed sets

Modify `FitnessDashboard`:
- Pass `showGuidance={settings.showGuidance}` into `LiveTrainingSession`.

- [x] **Step 4: Run GREEN test**

Run:

```bash
npm run test:run -- tests/fitness-live-session-snapshot-header-ui.test.tsx
```

Expected: PASS.

## Task 2: Regression gate

- [x] Run focused tests:

```bash
npm run test:run -- tests/fitness-live-session-snapshot-header-ui.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-guidance-visibility-ui.test.tsx
```

- [x] Run full tests:

```bash
npm run test:run
```

- [x] Run build:

```bash
npm run build
```

- [x] Run lint:

```bash
npm run lint
```

## Self-Review

- Live session header makes snapshot behavior explicit when guidance is on.
- Guidance-off users keep compact operational counters.
- No repository/schema changes.
- No modal or extra friction in gym flow.
