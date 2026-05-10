> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 9 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add active workout recovery safeguards: prevent duplicate active workouts, let users resume recovered sessions after refresh, and safely abandon an in-progress workout.

**Architecture:** Keep session truth in SQLite. Repository enforces a single active session and exposes `abandonSession(sessionId)` for local recovery/cleanup. The Training dashboard distinguishes a newly-started workout from a recovered active session and shows a deliberate resume/abandon prompt before entering the live logger.

**Tech Stack:** React 19, TypeScript strict mode, existing `sql.js` repository, Tailwind CSS, Vitest/jsdom.

---

## File Structure

- Extend: `src/features/fitness/fitnessRepository.ts` — single-active guard and `abandonSession`.
- Modify: `src/features/fitness/FitnessDashboard.tsx` — recovered-session prompt and abandon flow.
- Modify: `src/features/fitness/LiveTrainingSession.tsx` — expose abandon action during live workouts.
- Extend: `tests/fitness-live-session-repository.test.ts` — duplicate active guard and abandon state.
- Create: `tests/fitness-recovery-ui.test.tsx` — recovery prompt, resume, abandon behavior.

## Task 1: Repository recovery safeguards

- [x] **Step 1: Write failing repository tests**

Assert starting a second session while one is active throws a clear error, and `abandonSession()` changes status to `abandoned` and clears `getActiveSession()`.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts`
Expected: FAIL because duplicate guard and `abandonSession` are missing.

- [x] **Step 3: Implement repository guard and abandon method**

Add a preflight active-session check to `startSessionFromPlanWorkout()`. Add `abandonSession(sessionId)` that marks session abandoned, timestamps completion, skips planned sets, and returns the session.

- [x] **Step 4: Run repository test**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts`
Expected: PASS.

## Task 2: Training recovery UI

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-recovery-ui.test.tsx`. Seed a personal plan, start a session through repository, render Training, assert recovery prompt appears, click resume, assert live logger appears. Then test abandon with confirmation.

- [x] **Step 2: Run UI test and verify fail**

Run: `npm run test:run -- tests/fitness-recovery-ui.test.tsx`
Expected: FAIL while Training immediately opens active sessions.

- [x] **Step 3: Implement UI prompt**

On initial load, if `getActiveSession()` returns a session, show "Workout recovered" with Resume and Abandon actions. New sessions started from the dashboard skip the prompt.

- [x] **Step 4: Run UI test**

Run: `npm run test:run -- tests/fitness-recovery-ui.test.tsx`
Expected: PASS.

## Task 3: Verification gate

- [x] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-live-session-repository.test.ts tests/fitness-recovery-ui.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-dashboard.test.tsx`
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

- User cannot accidentally create multiple active sessions.
- Refresh/reopen shows an intentional recovery prompt.
- Abandon is explicit and local-only.
- Completed history remains separate from abandoned workouts.
