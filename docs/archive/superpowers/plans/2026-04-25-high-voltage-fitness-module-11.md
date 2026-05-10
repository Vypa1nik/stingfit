> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 11 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every code change and superpowers:verification-before-completion before claiming completion.

**Goal:** Add workout quality context to completed sessions: finish check-in notes, session RPE, and energy level. Numbers stay local, export/import preserves review metadata, and history surfaces the context without automatic plan mutation.

**Architecture:** Store review fields on `fitness_sessions` because they belong to the completed workout snapshot. Keep UI → repository boundary: `LiveTrainingSession` collects a small finish review, `FitnessDashboard` passes it to `fitnessRepository.finishSession`, and history renders the completed snapshot.

**Data fields:**
- `notes`: existing free-text session notes, now editable at finish.
- `session_rpe`: integer 1–10 or null.
- `energy_level`: integer 1–5 or null.

---

## Task 1: Repository and schema review metadata

- [x] **Step 1: Write failing repository test**

Add `tests/fitness-session-review-repository.test.ts` covering:
- `finishSession(sessionId, { notes, sessionRpe, energyLevel })` persists review fields.
- `getSessionHistoryDetail(sessionId)` returns those fields.
- `exportFitnessData()` includes them.
- `importFitnessData(..., { mode: 'replace' })` restores them.

- [x] **Step 2: Verify failure**

Run: `npm run test:run -- tests/fitness-session-review-repository.test.ts`
Expected: FAIL until types/repository/schema are implemented.

- [x] **Step 3: Implement schema + types + repository**

- Add `session_rpe` and `energy_level` to `fitness_sessions` create schema.
- Add idempotent schema ensure for existing local DBs.
- Extend `FitnessLiveSession` and `FitnessSessionRow`.
- Add `FinishFitnessSessionInput`.
- Update `finishSession(sessionId, input?)` with validation:
  - RPE must be 1–10 when provided.
  - Energy must be 1–5 when provided.
  - Notes are trimmed.
- Update import insert for sessions.

- [x] **Step 4: Run repository test**

Run: `npm run test:run -- tests/fitness-session-review-repository.test.ts`
Expected: PASS.

## Task 2: Finish check-in UI and history rendering

- [x] **Step 1: Write failing UI test**

Add `tests/fitness-session-review-ui.test.tsx` covering:
- Start Push Day A.
- Click `Finish workout`.
- Fill `Session RPE`, `Energy level`, and `Workout notes`.
- Click `Save review + finish`.
- Assert repository completed session contains review values.

- [x] **Step 2: Verify failure**

Run: `npm run test:run -- tests/fitness-session-review-ui.test.tsx`
Expected: FAIL until UI exists.

- [x] **Step 3: Implement UI**

- Add finish check-in panel inside `LiveTrainingSession`.
- Keep direct destructive abandon unchanged.
- Render history detail review metadata in `WorkoutHistoryDetail`.

- [x] **Step 4: Run UI test**

Run: `npm run test:run -- tests/fitness-session-review-ui.test.tsx`
Expected: PASS.

## Task 3: Verification gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-session-review-repository.test.ts tests/fitness-session-review-ui.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-history.test.tsx tests/fitness-import-repository.test.ts`
- [x] Run full test suite: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Local-only, no cloud/login/analytics.
- Import/export preserves review fields.
- Existing sessions continue working through idempotent schema ensure.
- Finish flow remains mobile-friendly and reversible until submitted.
