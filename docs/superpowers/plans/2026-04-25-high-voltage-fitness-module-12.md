# High-Voltage Fitness Module 12 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Make progression suggestions more coach-like by factoring finish check-in quality metadata into recommendations and surfacing the decision inside workout history.

**Architecture:** Keep suggestions derived and transparent. No automatic plan mutation. `fitnessProgress` remains the pure calculation layer; `FitnessStatsPage` and `WorkoutHistoryDetail` render derived hints only.

**Progression policy:**
- If target sets hit the top of the rep range and target RIR is satisfied:
  - normal strain → `Add 2.5 kg next time`
  - high strain (`sessionRpe >= 9` or `energyLevel <= 2`) → `Hold load next time`
- If target sets are incomplete but high strain is reported:
  - `Repeat load next time`
- Reasons must explicitly name the trigger: RPE and/or energy.

---

## Task 1: Quality-aware progression engine

- [x] **Step 1: Write failing pure logic test**

Extend `tests/fitness-progress.test.ts` with a high-strain completed session. Expect:
- `Hold load next time`
- reason includes `RPE 9/10`
- reason includes `energy 2/5`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-progress.test.ts`
Expected: FAIL because current progression only says `Add 2.5 kg next time`.

- [x] **Step 3: Implement minimal pure logic**

Update `fitnessProgress.ts`:
- pass session into hint builder
- detect high session strain
- return hold/repeat recommendations with transparent reasons

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-progress.test.ts`
Expected: PASS.

## Task 2: Surface plan signal in workout history

- [x] **Step 1: Write failing UI test**

Add `tests/fitness-progression-quality-ui.test.tsx`. Finish a workout with top target sets, `sessionRpe: 9`, `energyLevel: 2`, then render `FitnessHistoryPage`. Expect:
- `Plan signal`
- `Bench Press: Hold load next time`
- reason with `RPE 9/10` and `energy 2/5`

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-progression-quality-ui.test.tsx`
Expected: FAIL because history detail does not render progression hints yet.

- [x] **Step 3: Implement history rendering**

Update `WorkoutHistoryDetail` to derive and render latest session progression hints as a `Plan signal` section.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-progression-quality-ui.test.tsx`
Expected: PASS.

## Task 3: Verification gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-progress.test.ts tests/fitness-progression-quality-ui.test.tsx tests/fitness-history.test.tsx tests/fitness-session-review-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- No automatic plan mutation.
- Local-only derived suggestions.
- Reasons remain transparent.
- Finish check-in data now changes recommendations in a predictable way.
