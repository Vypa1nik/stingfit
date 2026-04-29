# High-Voltage Fitness Module 10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Polish the live gym logger for mobile, one-hand use: faster set adjustments, clearer current-set focus, and safer tap targets.

**Architecture:** Keep persistence unchanged. Improve `SetLogger` as the ergonomic control surface and keep conversion at the UI boundary: display-unit quick controls update display values, then `SetLogger` converts back to kg before calling repository APIs. Cover this through a focused jsdom integration test that clicks the controls and verifies stored kg data.

**Tech Stack:** React 19, TypeScript strict mode, existing `sql.js` repository, Tailwind CSS, Vitest/jsdom.

---

## File Structure

- Modify: `src/features/fitness/SetLogger.tsx` — quick +/- weight, reps, RIR controls and mobile sticky styling.
- Test: `tests/fitness-gym-ergonomics.test.tsx` — start workout, use quick controls, log set, verify repository storage.

## Task 1: Quick set adjustment controls

- [x] **Step 1: Write failing UI integration test**

Create `tests/fitness-gym-ergonomics.test.tsx`. Start Push Day A, click `+2.5 kg`, `+ reps`, `+ RIR`, log the set, and assert repository stores `2.5 kg`, `9 reps`, `RIR 2`.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-gym-ergonomics.test.tsx`
Expected: FAIL because quick controls are not in the UI.

- [x] **Step 3: Implement controls**

Add large accessible buttons around the current set inputs:
- weight step: `2.5 kg` or `5 lb`
- reps step: `1`
- RIR step: `1`
Clamp values at zero. Keep input fields editable.

- [x] **Step 4: Run ergonomics test**

Run: `npm run test:run -- tests/fitness-gym-ergonomics.test.tsx`
Expected: PASS.

## Task 2: Verification gate

- [x] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-gym-ergonomics.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-unit-integration.test.tsx`
Expected: PASS.

- [x] **Step 2: Run full tests**

Run: `npm run test:run`
Expected: PASS.

- [x] **Step 3: Run build**

Run: `npm run build`
Expected: PASS.

- [x] **Step 4: Run lint**

Run: `npm run lint`
Expected: PASS.

## Self-Review

- No schema changes.
- Stored weights remain kg.
- UI controls are accessible and large enough for gym use.
- No cloud, login, telemetry, analytics, subscriptions, or paywalls.
