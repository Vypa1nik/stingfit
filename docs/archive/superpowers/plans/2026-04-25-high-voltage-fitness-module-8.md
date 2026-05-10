> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add local fitness JSON import/restore with validation, preview, confirmation, and repository-backed restore.

**Architecture:** Reuse the existing `exportFitnessData()` payload as the import contract. Add runtime validation at the repository boundary, a preview summary that can be shown before mutating data, and a replace-mode restore that clears only fitness tables before inserting imported fitness records. Keep all behavior local-only; no upload, sync, account, telemetry, or analytics.

**Tech Stack:** React 19, TypeScript strict mode, existing `sql.js` repository, Tailwind CSS, Vitest/jsdom.

---

## File Structure

- Extend: `src/features/fitness/fitnessTypes.ts` — import preview/result types.
- Extend: `src/features/fitness/fitnessRepository.ts` — preview/import/restore functions.
- Modify: `src/features/fitness/FitnessSettingsPage.tsx` — paste JSON, preview, restore controls.
- Test: `tests/fitness-import-repository.test.ts` — preview, invalid payload rejection, replace restore.
- Test: `tests/fitness-import-settings.test.tsx` — Settings UI import preview + restore flow.

## Task 1: Repository import contract

- [x] **Step 1: Write failing repository tests**

Create an export payload, preview it, clear fitness data, import with replace mode, and assert settings/plans/sessions are restored. Also assert invalid payloads are rejected with a useful message.

- [x] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-import-repository.test.ts`
Expected: FAIL because import APIs do not exist.

- [x] **Step 3: Implement runtime validation and preview**

Add `previewFitnessImport(payload)` and validation helpers that require version `1`, settings object, arrays for exercises/plans/sessions, and supported display units.

- [x] **Step 4: Implement replace restore**

Add `importFitnessData(payload, { mode: 'replace' })`. Delete fitness rows in FK-safe order, then insert exercises, plan structures, sessions, sets, and settings from the payload.

- [x] **Step 5: Run repository test**

Run: `npm run test:run -- tests/fitness-import-repository.test.ts`
Expected: PASS.

## Task 2: Settings UI import flow

- [x] **Step 1: Write failing UI test**

Render Settings with a JSON payload pasted into a textarea, click preview, assert counts, confirm restore, then assert repository state is restored.

- [x] **Step 2: Run UI test and verify fail**

Run: `npm run test:run -- tests/fitness-import-settings.test.tsx`
Expected: FAIL while Settings lacks import UI.

- [x] **Step 3: Implement UI**

Add local JSON import card with textarea, Preview button, Restore button, loading/success/error states, and `window.confirm` before replace restore.

- [x] **Step 4: Run UI test**

Run: `npm run test:run -- tests/fitness-import-settings.test.tsx`
Expected: PASS.

## Task 3: Verification gate

- [x] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-import-repository.test.ts tests/fitness-import-settings.test.tsx tests/fitness-settings.test.tsx tests/fitness-settings-repository.test.ts`
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

- Restore clears only fitness tables, not notes/tasks/projects.
- Import is local-only and works from pasted JSON.
- Preview happens before mutation.
- Replace restore requires explicit confirmation in UI.
- Invalid JSON/payloads surface user-visible errors.
