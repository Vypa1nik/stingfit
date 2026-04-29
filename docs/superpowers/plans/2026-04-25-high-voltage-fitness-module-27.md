# High-Voltage Fitness Module 27 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before completion claims.

**Goal:** Let users hide optional coaching/guidance UI when they prefer a quieter, cleaner StingFit interface.

**Architecture:** Add a local `showGuidance` fitness setting persisted in the existing `fitness_settings` key/value table. UI reads this setting and conditionally hides explanatory guidance panels and start previews while keeping core safety labels and controls available.

**Critical product guardrails:**
- Default is `showGuidance: true` so new users still learn the model.
- Turning guidance off hides helper/explanation surfaces, not core actions.
- Starter protection and destructive confirmations remain visible/enforced.
- No cloud/login/analytics/subscription/paywall logic.

---

## Task 1: Repository guidance setting

- [x] **Step 1: Write failing repository test**

Create `tests/fitness-guidance-settings-repository.test.ts`:
- `getSettings()` defaults to `{ showGuidance: true }`.
- `updateSettings({ showGuidance: false })` persists false.
- Fitness export includes `settings.showGuidance: false`.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-guidance-settings-repository.test.ts`
Expected: FAIL because `showGuidance` is not in settings yet.

- [x] **Step 3: Implement setting**

Modify:
- `src/features/fitness/fitnessTypes.ts`
  - Add `showGuidance: boolean` to `FitnessSettingsRecord`.
  - Add `showGuidance?: boolean` to `UpdateFitnessSettingsInput`.
- `src/features/fitness/fitnessRepository.ts`
  - Read `show_guidance` key with default true.
  - Persist `show_guidance` as `'1'` / `'0'`.
  - Parse old imports missing `showGuidance` as true.
  - Import/export the setting.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-guidance-settings-repository.test.ts`
Expected: PASS.

## Task 2: Settings UI toggle

- [x] **Step 1: Write failing UI test**

Create `tests/fitness-guidance-settings-ui.test.tsx`:
- Render `FitnessSettingsPage`.
- Expect `Guidance visibility` and `Current guidance: on`.
- Click `Hide guidance`.
- Expect `Guidance hidden` and repository setting false.
- Click `Show guidance`.
- Expect `Guidance shown` and repository setting true.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-guidance-settings-ui.test.tsx`
Expected: FAIL because the settings UI does not expose this toggle yet.

- [x] **Step 3: Implement UI toggle**

Modify `src/features/fitness/FitnessSettingsPage.tsx`:
- Add a `Guidance visibility` card.
- Add `Hide guidance` and `Show guidance` buttons.
- Show current state as `Current guidance: on/off`.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-guidance-settings-ui.test.tsx`
Expected: PASS.

## Task 3: Hide optional guidance surfaces

- [x] **Step 1: Write failing visibility test**

Create `tests/fitness-guidance-visibility-ui.test.tsx`:
- Set `showGuidance: false`.
- Render Training with a PPL plan and expect start preview/snapshot guidance hidden.
- Render Plans with a personal plan and expect future-workouts guidance hidden.
- Render History with a completed session and expect session snapshot guidance hidden.

- [x] **Step 2: Verify RED**

Run: `npm run test:run -- tests/fitness-guidance-visibility-ui.test.tsx`
Expected: FAIL because the pages ignore the setting.

- [x] **Step 3: Implement conditional rendering**

Modify:
- `src/features/fitness/FitnessDashboard.tsx`
  - Hide start preview lines when `showGuidance` is false.
- `src/features/fitness/FitnessPlansPage.tsx`
  - Load settings and hide copy/future-workouts explanatory guidance when false.
- `src/features/fitness/FitnessHistoryPage.tsx`
  - Pass `showGuidance` to `WorkoutHistoryDetail`.
- `src/features/fitness/WorkoutHistoryDetail.tsx`
  - Hide session snapshot callout when false.

- [x] **Step 4: Verify GREEN**

Run: `npm run test:run -- tests/fitness-guidance-visibility-ui.test.tsx`
Expected: PASS.

## Task 4: Regression gate

- [x] Run focused tests:
  - `npm run test:run -- tests/fitness-guidance-settings-repository.test.ts tests/fitness-guidance-settings-ui.test.tsx tests/fitness-guidance-visibility-ui.test.tsx tests/fitness-training-start-summary-ui.test.tsx tests/fitness-edit-boundaries-plan-ui.test.tsx tests/fitness-edit-boundaries-history-ui.test.tsx`
- [x] Run full tests: `npm run test:run`
- [x] Run build: `npm run build`
- [x] Run lint: `npm run lint`

## Self-Review

- Users can hide optional guidance.
- Defaults remain beginner-friendly.
- Core safety labels, confirmations, and repository protections remain.
- No schema change required.
