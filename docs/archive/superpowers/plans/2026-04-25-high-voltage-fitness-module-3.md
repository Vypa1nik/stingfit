> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Personal Plan Builder functional: users can create a personal plan from a starter template or blank plan, then structure it by weeks, days, workouts, and planned exercises.

**Architecture:** Extend `fitnessRepository` as the single persistence boundary. Keep the UI simple but real: `FitnessPlansPage` seeds starter data, lists starter and personal plans, and provides module-ready actions/status surfaces. Detailed editing is repository-backed first, then exposed progressively in UI.

**Tech Stack:** React 19, TypeScript strict mode, existing SQLite repository, Vitest/jsdom.

---

## File Structure

- Extend `src/features/fitness/fitnessTypes.ts` — nested plan builder types and inputs.
- Extend `src/features/fitness/fitnessSeed.ts` — starter plan structures.
- Extend `src/features/fitness/fitnessRepository.ts` — plan builder API.
- Modify `src/features/fitness/FitnessPlansPage.tsx` — load starter/personal plans from repository and expose first actions.
- Test `tests/fitness-plan-builder-repository.test.ts` — repository behavior.
- Test `tests/fitness-plan-builder-page.test.tsx` — async Plans page render behavior.

## Task 1: Repository plan-builder behavior

**Files:**
- Test: `tests/fitness-plan-builder-repository.test.ts`
- Modify: `src/features/fitness/fitnessTypes.ts`
- Modify: `src/features/fitness/fitnessSeed.ts`
- Modify: `src/features/fitness/fitnessRepository.ts`

- [ ] **Step 1: Write failing repository tests**

Cover creating a personal plan from the PPL starter, blank plan creation, duplicating/creating next week, adding a custom day/workout/exercise, setting rest day, and updating planned exercise targets.

- [ ] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-plan-builder-repository.test.ts`

Expected: FAIL because plan builder APIs do not exist.

- [ ] **Step 3: Add nested types and starter structure**

Add types for plan week/day/workout/exercise and seed starter structures for Push/Pull/Legs, Upper/Lower, Full Body.

- [ ] **Step 4: Implement repository APIs**

Add:

- `createPersonalPlanFromStarter(starterPlanId, input)`
- `createBlankPersonalPlan(input)`
- `getPlanStructure(planId)`
- `duplicateWeek(weekId)`
- `createNextWeekFromWeek(weekId)`
- `addPlanDay(weekId, input)`
- `setPlanDayRest(dayId, isRestDay)`
- `addPlanWorkout(dayId, input)`
- `addPlanExercise(workoutId, input)`
- `updatePlanExercise(planExerciseId, patch)`

- [ ] **Step 5: Run repository tests**

Run: `npm run test:run -- tests/fitness-plan-builder-repository.test.ts`

Expected: PASS.

## Task 2: Plans page repository integration

**Files:**
- Test: `tests/fitness-plan-builder-page.test.tsx`
- Modify: `src/features/fitness/FitnessPlansPage.tsx`

- [ ] **Step 1: Write failing page test**

Render `FitnessPlansPage`, wait for starter data, verify starter plans and repository-backed personal plan content appears.

- [ ] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-plan-builder-page.test.tsx`

Expected: FAIL until the page loads repository data.

- [ ] **Step 3: Implement page loading/success/error/empty states**

Use `useEffect` to seed/load starter and personal plans. Add CTA buttons for create from PPL and create blank personal plan. Show loading and error surfaces.

- [ ] **Step 4: Run page test**

Run: `npm run test:run -- tests/fitness-plan-builder-page.test.tsx`

Expected: PASS.

## Task 3: Verification gate

- [ ] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-plan-builder-repository.test.ts tests/fitness-plan-builder-page.test.tsx tests/fitness-repository.test.ts tests/fitness-pages.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: PASS.

## Self-Review

- Scope is focused on real personal plan structure and first UI integration, not full drag/drop editing.
- All storage behavior is repository-backed and test-first.
- Live training remains Module 4; this module only prepares plan data.