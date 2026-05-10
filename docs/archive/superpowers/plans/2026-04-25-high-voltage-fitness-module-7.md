> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Apply the saved kg/lb display unit across Training, History, and Stats without changing kg-based storage.

**Architecture:** Keep all persisted workout weights in kg. Add display-only formatting/conversion helpers in `fitnessUnits.ts`, load settings through `fitnessRepository.getSettings()`, and pass the display unit into live logging/history/stats components. When a user logs in lb, convert back to kg at the UI boundary before calling repository methods.

**Tech Stack:** React 19, TypeScript strict mode, existing `sql.js` repository, Tailwind CSS, Vitest/jsdom.

---

## File Structure

- Extend: `src/features/fitness/fitnessUnits.ts` — volume/e1RM display formatting.
- Modify: `src/features/fitness/FitnessDashboard.tsx` — load settings and pass display unit to live session.
- Modify: `src/features/fitness/LiveTrainingSession.tsx` — display selected unit in live workout and pass it to set logger.
- Modify: `src/features/fitness/SetLogger.tsx` — convert display input to kg storage on submit.
- Modify: `src/features/fitness/FitnessHistoryPage.tsx` — load settings and format volume/detail labels in selected unit.
- Modify: `src/features/fitness/WorkoutHistoryDetail.tsx` — display completed set weights in selected unit.
- Modify: `src/features/fitness/FitnessStatsPage.tsx` — load settings and format volume/PR labels in selected unit.
- Test: `tests/fitness-units.test.ts` — pure formatting additions.
- Test: `tests/fitness-unit-integration.test.tsx` — UI/repository unit integration.

## Task 1: Pure unit formatting additions

- [x] **Step 1: Write failing unit tests**

Extend `tests/fitness-units.test.ts` to assert volume and e1RM display in lb.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-units.test.ts`
Expected: FAIL because volume formatting helper is missing.

- [x] **Step 3: Implement helper**

Add `formatVolumeWeight(totalWeightKg, unit)` to `fitnessUnits.ts`.

- [x] **Step 4: Run unit tests**

Run: `npm run test:run -- tests/fitness-units.test.ts`
Expected: PASS.

## Task 2: Training unit integration

- [x] **Step 1: Write failing integration test**

Create `tests/fitness-unit-integration.test.tsx`. Set display unit to lb, start a workout, enter `220.5` in the weight input, log a set, and assert repository storage remains `100 kg`.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-unit-integration.test.tsx`
Expected: FAIL while Training still hardcodes kg.

- [x] **Step 3: Implement Training integration**

Load settings in `FitnessDashboard`, pass display unit to `LiveTrainingSession`, convert inputs in `SetLogger`.

- [x] **Step 4: Run integration test**

Run: `npm run test:run -- tests/fitness-unit-integration.test.tsx`
Expected: PASS.

## Task 3: History and Stats unit integration

- [x] **Step 1: Extend failing integration test**

Set display unit to lb before rendering History and Stats. Assert volume is shown as lb and PR labels use lb.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-unit-integration.test.tsx`
Expected: FAIL while History/Stats still use kg labels.

- [x] **Step 3: Implement History/Stats integration**

Load settings in both pages and use `formatWeight` / `formatVolumeWeight` for user-facing values.

- [x] **Step 4: Run integration tests**

Run: `npm run test:run -- tests/fitness-unit-integration.test.tsx`
Expected: PASS.

## Task 4: Verification gate

- [x] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-units.test.ts tests/fitness-unit-integration.test.tsx tests/fitness-history.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-settings.test.tsx`
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

- Stored workout data remains kg-based.
- Display unit affects UI labels only.
- No cloud, login, telemetry, analytics, subscriptions, or paywall logic.
