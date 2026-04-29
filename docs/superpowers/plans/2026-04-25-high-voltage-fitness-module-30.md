# High-Voltage Fitness Module 30 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Add a safe local-only wipe for all StingFit fitness data before V1.

**Architecture:** Reuse the existing `fitnessRepository.resetFitnessData()` table cleanup. Expose it in Settings as a danger-zone action gated by an exact typed browser prompt. The wipe affects only fitness tables; notes/tasks/projects remain untouched.

**Tech Stack:** React 19, TypeScript strict mode, Vitest/jsdom, existing `sql.js` persistence helpers.

---

## Task 1: Repository safety coverage

**Files:**
- Test: `tests/fitness-full-reset-repository.test.ts`

- [x] **Step 1: Write failing/safety test**

Create a repository test that:
- creates a non-fitness note
- creates starter/personal fitness data
- completes one session
- changes fitness settings
- calls `fitnessRepository.resetFitnessData()`
- verifies notes remain
- verifies fitness exercises, plans, sessions are cleared
- verifies settings fall back to defaults

- [x] **Step 2: Run test**

Run:

```bash
npm run test:run -- tests/fitness-full-reset-repository.test.ts
```

Expected: PASS if the existing repository helper is already safe; otherwise fix minimally.

## Task 2: Settings danger-zone UI

**Files:**
- Modify: `src/features/fitness/FitnessSettingsPage.tsx`
- Test: `tests/fitness-full-reset-ui.test.tsx`

- [x] **Step 1: Write failing UI test**

Create a UI test that:
- renders Settings with personal fitness data
- expects `Danger zone` and `Delete fitness data`
- enters the wrong prompt response and verifies data remains
- enters exact `DELETE FITNESS` and verifies personal plans/exercises are cleared
- expects success message `Fitness data deleted`

- [x] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/fitness-full-reset-ui.test.tsx
```

Expected: FAIL because the danger-zone UI does not exist yet.

- [x] **Step 3: Implement danger-zone UI**

Modify `FitnessSettingsPage.tsx`:
- import `Trash2`
- add `deleteAllFitnessData()` handler
- gate the wipe with:

```ts
window.prompt('Type DELETE FITNESS to permanently delete all StingFit fitness data from this device. Notes/tasks/projects are not touched.')
```

- require exact `DELETE FITNESS`
- call `fitnessRepository.resetFitnessData()`
- clear import text/preview
- reload default settings
- set success message `Fitness data deleted. Starter templates can be restored or imported again.`
- render a `Danger zone` card with `Delete fitness data` button

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/fitness-full-reset-ui.test.tsx
```

Expected: PASS.

## Task 3: Regression gate

- [x] Run focused tests:

```bash
npm run test:run -- tests/fitness-full-reset-repository.test.ts tests/fitness-full-reset-ui.test.tsx tests/fitness-settings.test.tsx tests/fitness-import-settings.test.tsx
```

- [x] Run full tests:

```bash
npm run test:run
```

- [x] Run build:

```bash
npm run build
```

- [x] Run lint:

```bash
npm run lint
```

## Self-Review

- Wipe is local-only and fitness-only.
- Wrong prompt input does not delete data.
- Success/error/loading paths are explicit.
- No notes/tasks/projects data is touched.
