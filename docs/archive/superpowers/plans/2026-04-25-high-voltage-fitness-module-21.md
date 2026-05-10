> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 21 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Expose rest-day controls in Plan Builder so users can deliberately mark a day as rest/training and immediately see the readiness impact.

**Architecture:** Reuse the existing repository API `fitnessRepository.setPlanDayRest(dayId, isRestDay)`. Keep the validator as the source of readiness truth. Add one warning for rest days that still have saved workouts, because those workouts are intentionally hidden from Training while the day is marked rest.

**Policy:**
- Marking a day as rest must not delete workouts or planned exercises.
- Rest days are excluded from Training and readiness blockers.
- The UI must make the status reversible with clear labels.
- No cloud/login/analytics/subscription/paywall logic.

---

## Task 1: Readiness warning for rest days with saved workouts

- [x] **Step 1: Write failing pure test**

Update `tests/fitness-plan-readiness.test.ts` with a case where one training day is valid and one rest day still has a saved workout. Expect the plan to remain ready, count only the training workout, and show a warning:

```text
Week 1 · Recovery Day is marked rest; saved workouts are hidden from Training.
```

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-readiness.test.ts`
Expected: FAIL because the warning is not emitted yet.

- [x] **Step 3: Implement minimal validator warning**

Modify `src/features/fitness/fitnessPlanReadiness.ts` to add a warning for `day.isRestDay && day.workouts.length > 0`.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-readiness.test.ts`
Expected: PASS.

## Task 2: Plan Builder rest/training toggle

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-plan-rest-day-ui.test.tsx`:
- Build a personal plan with one valid `Push Day` and one empty `Recovery Day`.
- Render `FitnessPlansPage`.
- Expect blocker `Week 1 · Recovery Day has no workout.` and button `Mark Recovery Day as rest`.
- Click the button.
- Expect `Recovery Day marked as rest`, `Ready to train`, `Startable workouts: 1`, and `Mark Recovery Day as training`.
- Click the training button.
- Expect `Recovery Day marked as training` and the no-workout blocker again.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-plan-rest-day-ui.test.tsx`
Expected: FAIL because the toggle UI does not exist yet.

- [x] **Step 3: Implement Plan Builder controls**

Modify `src/features/fitness/FitnessPlansPage.tsx`:
- Add `toggleDayRest(day)` handler.
- Pass it into `PlanEditor`.
- Render a reversible button per day:
  - `Mark Recovery Day as rest`
  - `Mark Recovery Day as training`
- Show a short rest-day hint that saved workouts are hidden from Training while the day is rest.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-plan-rest-day-ui.test.tsx`
Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-plan-readiness.test.ts tests/fitness-plan-rest-day-ui.test.tsx tests/fitness-plan-readiness-ui.test.tsx tests/fitness-plan-add-structure-ui.test.tsx tests/fitness-training-readiness-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Rest toggles are reversible.
- Rest day status does not delete saved planned structure.
- Readiness remains derived, transparent, and local.
- Training readiness remains consistent with repository filtering.
