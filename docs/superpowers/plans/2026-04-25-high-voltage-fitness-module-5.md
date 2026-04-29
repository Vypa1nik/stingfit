# High-Voltage Fitness Module 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Turn completed workout sessions into useful local history, PR summaries, and transparent progression hints.

**Architecture:** Keep persistence behind `fitnessRepository` and keep calculations in a pure `fitnessProgress.ts` module. History and Stats pages will load completed sessions from SQLite, render loading/empty/error/success states, and reuse shared pure summaries so UI stays simple and testable.

**Tech Stack:** React 19, TypeScript strict mode, existing `sql.js` repository, Tailwind CSS, Vitest/jsdom.

---

## File Structure

- Extend `src/features/fitness/fitnessTypes.ts` — history summary, PR event, stats snapshot, progression hint types.
- Extend `src/features/fitness/fitnessRepository.ts` — completed-session listing and history detail retrieval.
- Create `src/features/fitness/fitnessProgress.ts` — pure volume, PR, e1RM, consistency, and hint calculations.
- Create `src/features/fitness/WorkoutHistoryDetail.tsx` — reusable completed-session detail view.
- Modify `src/features/fitness/FitnessHistoryPage.tsx` — repository-backed history page.
- Modify `src/features/fitness/FitnessStatsPage.tsx` — repository-backed stats/PR page.
- Test `tests/fitness-progress.test.ts` — pure calculation behavior.
- Test `tests/fitness-history.test.tsx` — completed session appears in History and Stats UI.

## Task 1: Pure progress calculations

**Files:**
- Create: `src/features/fitness/fitnessProgress.ts`
- Modify: `src/features/fitness/fitnessTypes.ts`
- Test: `tests/fitness-progress.test.ts`

- [x] **Step 1: Write failing pure tests**

Test volume, best set/e1RM PR event, and progression hint reason from completed session fixtures.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-progress.test.ts`
Expected: FAIL because `fitnessProgress.ts` does not exist.

- [x] **Step 3: Add progress types and pure calculations**

Implement `summarizeSession`, `buildProgressSnapshot`, `formatVolume`, and `formatKg`. Use completed sets only for volume and PR calculations. Use Epley e1RM: `weightKg * (1 + reps / 30)`.

- [x] **Step 4: Run pure tests**

Run: `npm run test:run -- tests/fitness-progress.test.ts`
Expected: PASS.

## Task 2: Repository completed-session history API

**Files:**
- Extend: `src/features/fitness/fitnessRepository.ts`
- Extend: `tests/fitness-live-session-repository.test.ts`

- [x] **Step 1: Write failing repository assertion**

After finishing a live session, assert `listCompletedSessions()` returns it and `getSessionHistoryDetail(id)` returns exercise/set details.

- [x] **Step 2: Run repository test and verify fail**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts`
Expected: FAIL because completed-session methods do not exist.

- [x] **Step 3: Implement repository methods**

Add `listCompletedSessions()` ordered newest first and `getSessionHistoryDetail(sessionId)` guarded to completed/abandoned session detail.

- [x] **Step 4: Run repository test**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts`
Expected: PASS.

## Task 3: Repository-backed History and Stats UI

**Files:**
- Create: `src/features/fitness/WorkoutHistoryDetail.tsx`
- Modify: `src/features/fitness/FitnessHistoryPage.tsx`
- Modify: `src/features/fitness/FitnessStatsPage.tsx`
- Test: `tests/fitness-history.test.tsx`

- [x] **Step 1: Write failing UI test**

Create and finish a workout through the repository, render History and Stats, then assert workout name, volume, PR event, and progression hint are visible.

- [x] **Step 2: Run UI test and verify fail**

Run: `npm run test:run -- tests/fitness-history.test.tsx`
Expected: FAIL while pages still use static dummy data.

- [x] **Step 3: Implement History page**

Load completed sessions in `useEffect`, show loading/error/empty states, render recent summaries, and show `WorkoutHistoryDetail` for the newest session.

- [x] **Step 4: Implement Stats page**

Load completed sessions, call `buildProgressSnapshot`, show total workouts, total volume, PR events, e1RM, and transparent progression hints.

- [x] **Step 5: Run UI test**

Run: `npm run test:run -- tests/fitness-history.test.tsx`
Expected: PASS.

## Task 4: Verification gate

- [x] **Step 1: Run focused module tests**

Run: `npm run test:run -- tests/fitness-progress.test.ts tests/fitness-history.test.tsx tests/fitness-live-session-repository.test.ts`
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

- Module stays local-first: no account, sync, telemetry, analytics, subscription, or paywall work.
- Calculations are pure and covered independently from UI.
- UI states include loading, empty, error, and success.
- Progression hints are transparent reasons, not forced automatic plan mutation.
