# High-Voltage Fitness Module 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement the first functional live workout loop: choose a planned workout, start a session snapshot, log sets, manage the current exercise, and finish the workout.

**Architecture:** Extend `fitnessRepository` with session APIs that snapshot plan workouts into session rows. Add focused UI components (`LiveTrainingSession`, `SetLogger`, `RestTimer`) and make `FitnessDashboard` load/start active sessions through the repository. Keep advanced editing for later; this module proves the gym loop works end-to-end.

**Tech Stack:** React 19, TypeScript strict mode, existing SQLite repository, Vitest/jsdom.

---

## File Structure

- Extend `src/features/fitness/fitnessTypes.ts` — live session/session set types and inputs.
- Extend `src/features/fitness/fitnessRepository.ts` — session APIs.
- Modify `src/features/fitness/FitnessDashboard.tsx` — repository-backed dashboard.
- Create `src/features/fitness/LiveTrainingSession.tsx` — live workout screen.
- Create `src/features/fitness/SetLogger.tsx` — editable current set logger.
- Create `src/features/fitness/RestTimer.tsx` — simple rest timer display.
- Test `tests/fitness-live-session-repository.test.ts` — repository session transitions.
- Test `tests/fitness-live-session-ui.test.tsx` — dashboard/session UI behavior.

## Task 1: Repository live session state transitions

**Files:**
- Test: `tests/fitness-live-session-repository.test.ts`
- Modify: `src/features/fitness/fitnessTypes.ts`
- Modify: `src/features/fitness/fitnessRepository.ts`

- [x] **Step 1: Write failing repository tests**

Cover start session from a plan workout, log a set, add/remove set, skip exercise, add unplanned exercise, and finish session.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts`

Expected: FAIL because live session APIs do not exist.

- [x] **Step 3: Add session types**

Add records for live session, session exercise, session set, startable workout summary, and log set input.

- [x] **Step 4: Implement repository APIs**

Add:

- `listStartableWorkouts()`
- `startSessionFromPlanWorkout(planWorkoutId)`
- `getActiveSession()`
- `getLiveSession(sessionId)`
- `logSet(setId, input)`
- `addSessionSet(sessionExerciseId)`
- `removeSessionSet(setId)`
- `skipSessionExercise(sessionExerciseId)`
- `addUnplannedExerciseToSession(sessionId, input)`
- `finishSession(sessionId)`

- [x] **Step 5: Run repository tests**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts`

Expected: PASS.

## Task 2: Live training UI

**Files:**
- Test: `tests/fitness-live-session-ui.test.tsx`
- Modify: `src/features/fitness/FitnessDashboard.tsx`
- Create: `src/features/fitness/LiveTrainingSession.tsx`
- Create: `src/features/fitness/SetLogger.tsx`
- Create: `src/features/fitness/RestTimer.tsx`

- [x] **Step 1: Write failing UI test**

Render `FitnessDashboard`, let it seed/create a startable workout, start it, log a set, and verify live session content updates.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-live-session-ui.test.tsx`

Expected: FAIL until UI is repository-backed.

- [x] **Step 3: Implement UI components**

Use loading, empty, active, success and error states. Keep controls large and mobile-friendly.

- [x] **Step 4: Run UI test**

Run: `npm run test:run -- tests/fitness-live-session-ui.test.tsx`

Expected: PASS.

## Task 3: Verification gate

- [x] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts tests/fitness-live-session-ui.test.tsx tests/fitness-plan-builder-repository.test.ts tests/fitness-dashboard.test.tsx`

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

- Scope is focused on the first real gym loop.
- Plan editing remains Module 3/5 follow-up; this module snapshots and logs.
- Repository state transitions are tested before UI wiring.