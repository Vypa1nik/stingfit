# High-Voltage Fitness Module 29 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Remove remaining development-era product copy and make optional guidance hiding consistent across Training, Live Training, and History.

**Architecture:** Keep all core controls and safety labels visible. Treat explanatory descriptions, coach hints, and snapshot/tutorial copy as guidance controlled by the existing persisted `showGuidance` setting.

**Tech Stack:** React 19, TypeScript strict mode, Vitest/jsdom, existing `fitnessRepository.getSettings()` path.

---

## Task 1: Product copy cleanup

**Files:**
- Modify: `src/features/fitness/LiveTrainingSession.tsx`
- Modify: `src/features/fitness/FitnessHistoryPage.tsx`
- Test: `tests/fitness-product-copy-cleanup-ui.test.tsx`

- [x] **Step 1: Write failing UI test**

Create a test that renders a live workout and workout history, then verifies:
- no user-facing copy contains `Module 5`
- no user-facing copy contains `next module`
- no user-facing copy contains `Next history layer`
- the live hint is product wording: `Coach cue`
- the history info card is product wording: `Progression signals`

- [x] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/fitness-product-copy-cleanup-ui.test.tsx
```

Expected: FAIL because stale development copy still exists.

- [x] **Step 3: Implement product copy**

Modify:
- `LiveTrainingSession.tsx`
  - Rename `Sting hint` to `Coach cue`.
  - Replace `Progression hints become history-aware in Module 5.` with product copy.
  - Replace `The next module turns this into PR...` with product copy.
- `FitnessHistoryPage.tsx`
  - Rename `Next history layer` to `Progression signals`.
  - Replace module-specific description with product copy.

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/fitness-product-copy-cleanup-ui.test.tsx
```

Expected: PASS.

## Task 2: Guidance consistency cleanup

**Files:**
- Modify: `src/features/fitness/FitnessDashboard.tsx`
- Modify: `src/features/fitness/LiveTrainingSession.tsx`
- Modify: `src/features/fitness/FitnessHistoryPage.tsx`
- Test: `tests/fitness-guidance-consistency-ui.test.tsx`

- [x] **Step 1: Write failing UI test**

Create a test that sets `showGuidance: false` and verifies:
- Training hides `Session sa uloží ako snapshot plánu.`
- Training hides `First practical path` and `Derived from your local completed workouts`
- Live training hides `Coach cue` and `Snapshot from your personal plan`
- History hides `Progression signals`
- functional labels remain: `Start Push Day A`, `Add set`, `Recent workouts`

- [x] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/fitness-guidance-consistency-ui.test.tsx
```

Expected: FAIL because several guidance descriptions remain visible when guidance is hidden.

- [x] **Step 3: Implement conditional guidance**

Modify:
- `FitnessDashboard.tsx`
  - Hide hero snapshot paragraph when `showGuidance` is false.
  - Hide `Up next` and `Startable workouts` descriptions when false.
  - Hide `Gym drift controls` helper card when false.
- `LiveTrainingSession.tsx`
  - Hide `Exercise queue` description when false.
  - Hide `Add unplanned exercise` descriptive copy when false.
  - Hide `Coach cue` card when false.
- `FitnessHistoryPage.tsx`
  - Hide `Progression signals` guidance card when false.

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/fitness-guidance-consistency-ui.test.tsx
```

Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:

```bash
npm run test:run -- tests/fitness-product-copy-cleanup-ui.test.tsx tests/fitness-guidance-consistency-ui.test.tsx tests/fitness-guidance-visibility-ui.test.tsx tests/fitness-live-session-snapshot-header-ui.test.tsx tests/fitness-history.test.tsx
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

- No development module labels remain in fitness UI copy.
- Quiet mode hides guidance, not controls.
- History/progression functionality remains visible through actual history details.
- No schema or repository changes.
