# High-Voltage Fitness Module 31 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before completion claims. This module is regression coverage for already-built V1 behavior.

**Goal:** Add a V1 smoke test that protects the complete StingFit core loop.

**Architecture:** Use Vitest/jsdom for the UI path and the existing repository for export/restore verification. Do not add new product behavior in this module.

**Tech Stack:** React 19, Vitest/jsdom, existing `fitnessRepository` and `FitnessDashboard`/`FitnessHistoryPage` components.

---

## Task 1: V1 core loop smoke coverage

**Files:**
- Test: `tests/fitness-v1-smoke.test.tsx`

- [x] **Step 1: Write smoke test**

Create a test that covers:
- first run Training empty state
- prepare PPL starter plan
- start `Push Day A`
- log a set
- finish with default review values
- view History detail
- export fitness data
- reset fitness data
- restore the export
- verify personal plan and completed session return

- [x] **Step 2: Run smoke test**

Run:

```bash
npm run test:run -- tests/fitness-v1-smoke.test.tsx
```

Expected: PASS if the V1 loop is intact.

## Task 2: Regression gate

- [x] Run focused tests:

```bash
npm run test:run -- tests/fitness-v1-smoke.test.tsx tests/fitness-full-reset-ui.test.tsx tests/fitness-import-settings.test.tsx tests/fitness-live-session-ui.test.tsx tests/fitness-history.test.tsx
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

- Smoke test follows real user flow where practical.
- Export/reset/restore are verified without network or cloud behavior.
- No new runtime behavior is introduced.
