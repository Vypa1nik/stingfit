# High-Voltage Fitness Module 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add practical local-first settings: kg/lb display units, safe starter-data reset, and local fitness JSON export/backup.

**Architecture:** Keep settings and export operations inside `fitnessRepository`, backed by the existing `fitness_settings` table and fitness domain tables. Keep unit conversion pure in `fitnessUnits.ts` so UI and later history/stats formatting can share one tested boundary. The Settings page becomes repository-backed with loading, success, error, and safety-confirmation states.

**Tech Stack:** React 19, TypeScript strict mode, existing `sql.js` repository, Tailwind CSS, Vitest/jsdom.

---

## File Structure

- Create: `src/features/fitness/fitnessUnits.ts` — pure kg/lb normalization, conversion, and formatting helpers.
- Extend: `src/features/fitness/fitnessTypes.ts` — settings and export payload types.
- Extend: `src/features/fitness/fitnessRepository.ts` — settings, starter reset, and fitness export APIs.
- Modify: `src/features/fitness/FitnessSettingsPage.tsx` — repository-backed settings UI.
- Test: `tests/fitness-units.test.ts` — pure conversion behavior.
- Test: `tests/fitness-settings-repository.test.ts` — settings persistence, reset, export payload.
- Test: `tests/fitness-settings.test.tsx` — settings page interactions.

## Task 1: Unit conversion helpers

**Files:**
- Create: `src/features/fitness/fitnessUnits.ts`
- Test: `tests/fitness-units.test.ts`

- [x] **Step 1: Write failing unit tests**

Cover `kg`/`lb` normalization, kg→lb display conversion, lb→kg storage conversion, and formatted labels.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-units.test.ts`
Expected: FAIL because `fitnessUnits.ts` does not exist.

- [x] **Step 3: Implement helpers**

Add `normalizeDisplayUnit`, `convertWeightFromKg`, `convertWeightToKg`, and `formatWeight`.

- [x] **Step 4: Run unit tests**

Run: `npm run test:run -- tests/fitness-units.test.ts`
Expected: PASS.

## Task 2: Repository settings, reset, and export

**Files:**
- Extend: `src/features/fitness/fitnessTypes.ts`
- Extend: `src/features/fitness/fitnessRepository.ts`
- Test: `tests/fitness-settings-repository.test.ts`

- [x] **Step 1: Write failing repository tests**

Assert default settings are kg, updating display unit persists lb, reset restores missing starter plans while preserving custom exercise data, and export returns exercises/plans/sessions/settings.

- [x] **Step 2: Run repository test and verify fail**

Run: `npm run test:run -- tests/fitness-settings-repository.test.ts`
Expected: FAIL because settings/export APIs do not exist.

- [x] **Step 3: Implement repository APIs**

Add:
- `getSettings()`
- `updateSettings(input)`
- `resetStarterData()`
- `exportFitnessData()`

- [x] **Step 4: Run repository test**

Run: `npm run test:run -- tests/fitness-settings-repository.test.ts`
Expected: PASS.

## Task 3: Repository-backed Settings UI

**Files:**
- Modify: `src/features/fitness/FitnessSettingsPage.tsx`
- Test: `tests/fitness-settings.test.tsx`

- [x] **Step 1: Write failing UI test**

Render Settings, switch unit to lb, export fitness JSON, confirm starter reset, and assert success states.

- [x] **Step 2: Run UI test and verify fail**

Run: `npm run test:run -- tests/fitness-settings.test.tsx`
Expected: FAIL while Settings is still static.

- [x] **Step 3: Implement Settings page**

Load settings on mount. Show loading/error/success states. Use large local-first controls for unit toggles, export JSON, and reset starter data with `window.confirm`.

- [x] **Step 4: Run UI test**

Run: `npm run test:run -- tests/fitness-settings.test.tsx`
Expected: PASS.

## Task 4: Verification gate

- [x] **Step 1: Run focused module tests**

Run: `npm run test:run -- tests/fitness-units.test.ts tests/fitness-settings-repository.test.ts tests/fitness-settings.test.tsx tests/fitness-pages.test.tsx`
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

- Module stays fully local-first: no account, cloud sync, telemetry, analytics, subscription, or paywall work.
- Display units do not mutate stored kg data.
- Starter reset is safe and does not wipe personal plans or custom exercises.
- Export is local JSON generated from the fitness domain only.
