> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 33 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for checked release-document changes and superpowers:verification-before-completion before completion claims.

**Goal:** Add final V1 release documentation and manual QA checklist for StingFit.

**Architecture:** Keep release documentation human-readable in `reports/` and summarize the shipped V1 in `CHANGELOG.md`. Add lightweight file-level tests so future edits do not accidentally remove V1 release notes/checklist coverage.

**Tech Stack:** Markdown docs, Vitest file assertions.

---

## Task 1: Release docs coverage

**Files:**
- Modify: `CHANGELOG.md`
- Create: `reports/stingfit-v1-release-checklist.md`
- Test: `tests/fitness-release-docs.test.ts`

- [x] **Step 1: Write failing docs test**

Create a test verifying:
- `CHANGELOG.md` contains `## 1.0.0 - 2026-04-25` and `StingFit V1`
- release checklist exists
- checklist contains `V1 status`, `Manual mobile smoke checklist`, `Known limitations`, and `No login, no cloud sync, no telemetry`
- checklist records the final verification commands

- [x] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/fitness-release-docs.test.ts
```

Expected: FAIL because the V1 release docs do not exist yet.

- [x] **Step 3: Write release docs**

Update:
- `CHANGELOG.md` with a top `1.0.0` StingFit V1 entry.
- `reports/stingfit-v1-release-checklist.md` with:
  - V1 status
  - included features
  - privacy/non-goals
  - manual mobile smoke checklist
  - data safety checklist
  - known limitations
  - commands run

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/fitness-release-docs.test.ts
```

Expected: PASS.

## Task 2: Final regression gate

- [x] Run focused tests:

```bash
npm run test:run -- tests/fitness-release-docs.test.ts tests/fitness-release-identity.test.ts tests/fitness-release-copy.test.ts tests/fitness-v1-smoke.test.tsx
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

- V1 release docs are explicit and honest.
- Manual QA checklist names what automation does not prove.
- Known limitations are visible.
- No product behavior changes.
