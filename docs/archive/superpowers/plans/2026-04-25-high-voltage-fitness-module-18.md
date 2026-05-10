> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 18 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Add plan start readiness validation so users can see whether a personal plan is actually trainable before going to the Training page.

**Architecture:** Keep validation pure and derived. No schema changes. Add a pure `fitnessPlanReadiness` module that accepts `FitnessPlanStructure` and returns blockers/warnings. `FitnessPlansPage` renders the report for the selected plan. Repository remains the persistence boundary.

**Readiness policy:**
- Blocker: plan has no week/day/workout/exercise path to train.
- Blocker: non-rest day has no workout.
- Blocker: workout has no exercises.
- Warning: duplicate day labels inside the same week.
- Ready: no blockers and at least one workout with exercises.

---

## Task 1: Pure readiness validator

- [x] **Step 1: Write failing pure test**

Add `tests/fitness-plan-readiness.test.ts` with direct `FitnessPlanStructure` fixtures covering:
- blank week → blocker `Week 1 has no training days.`
- non-rest day without workout → blocker `Week 1 · Chest Day has no workout.`
- workout without exercises → blocker `Week 1 · Chest Day · Chest Builder has no exercises.`
- duplicate day labels → warning `Week 1 has duplicate day label Chest Day.`
- valid workout → ready with `startableWorkoutCount: 1`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-readiness.test.ts`
Expected: FAIL because validator does not exist.

- [x] **Step 3: Implement validator**

Add `src/features/fitness/fitnessPlanReadiness.ts` and types in `fitnessTypes.ts`:
- `FitnessPlanReadinessSeverity`
- `FitnessPlanReadinessIssue`
- `FitnessPlanReadinessReport`
- `buildPlanReadinessReport(structure)`

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-readiness.test.ts`
Expected: PASS.

## Task 2: Render readiness in Plan Builder

- [x] **Step 1: Write failing UI test**

Add `tests/fitness-plan-readiness-ui.test.tsx`:
- blank plan renders `Plan readiness`, `Needs fixes before training`, `Week 1 has no training days.`
- after adding day/workout/exercise in repository and rerendering, it renders `Ready to train` and `Startable workouts: 1`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-readiness-ui.test.tsx`
Expected: FAIL because UI does not render readiness yet.

- [x] **Step 3: Implement UI**

Add a `PlanReadinessCard` inside `FitnessPlansPage` near the selected plan editor header.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-readiness-ui.test.tsx`
Expected: PASS.

## Task 3: Regression and gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-readiness.test.ts tests/fitness-plan-readiness-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-plan-editor-ui.test.tsx tests/fitness-plan-builder-repository.test.ts`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No schema changes.
- Validation is derived and transparent.
- UI uses existing selected plan structure.
- No automatic plan mutation.
- No cloud/login/analytics/subscription/paywall logic.
