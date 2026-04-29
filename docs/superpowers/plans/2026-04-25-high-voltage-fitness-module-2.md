# High-Voltage Fitness Module 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real local SQLite persistence for the fitness domain through versioned migrations, typed domain models, idempotent starter data, and a repository API.

**Architecture:** Extend the existing `sql.js` + IndexedDB migration path with fitness tables. Add a focused `src/features/fitness/fitnessRepository.ts` boundary that uses existing `query`/`execute` helpers, so UI modules do not call SQL directly. Seed deterministic starter exercises and starter plans idempotently.

**Tech Stack:** TypeScript strict mode, existing `sql.js` database helpers, Vitest.

---

## File Structure

- Modify `src/lib/migrations.ts` — add `v003` fitness schema and indexes.
- Modify `src/lib/database.ts` — clear fitness tables in `clearAllData`/snapshot reset path.
- Create `src/features/fitness/fitnessTypes.ts` — domain types and repository input types.
- Create `src/features/fitness/fitnessSeed.ts` — deterministic starter exercises/plans.
- Create `src/features/fitness/fitnessRepository.ts` — persistence API.
- Create `tests/fitness-migrations.test.ts` — migration/table coverage.
- Create `tests/fitness-repository.test.ts` — repository/seed CRUD coverage.

## Task 1: Migration coverage

**Files:**
- Test: `tests/fitness-migrations.test.ts`
- Modify: `src/lib/migrations.ts`

- [ ] **Step 1: Write failing migration test**

Test that `initDatabase()` creates all fitness tables: exercises, plans, plan weeks, plan days, plan workouts, plan exercises, sessions, session exercises, sets, settings.

- [ ] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-migrations.test.ts`

Expected: FAIL because fitness tables do not exist.

- [ ] **Step 3: Add `v003` schema**

Add `fitnessSchema` statements to `src/lib/migrations.ts`, including indexes and foreign keys. Include `kind TEXT CHECK(kind IN ('starter','personal'))` on `fitness_plans` to distinguish starter plans from user personal plans.

- [ ] **Step 4: Run test and verify pass**

Run: `npm run test:run -- tests/fitness-migrations.test.ts`

Expected: PASS.

## Task 2: Types, seed data, repository

**Files:**
- Test: `tests/fitness-repository.test.ts`
- Create: `src/features/fitness/fitnessTypes.ts`
- Create: `src/features/fitness/fitnessSeed.ts`
- Create: `src/features/fitness/fitnessRepository.ts`
- Modify: `src/lib/database.ts`

- [ ] **Step 1: Write failing repository tests**

Cover idempotent starter seed, starter plan listing, custom exercise creation, and personal plan creation/listing.

- [ ] **Step 2: Run test and verify fail**

Run: `npm run test:run -- tests/fitness-repository.test.ts`

Expected: FAIL because repository files do not exist.

- [ ] **Step 3: Add types and seed data**

Create typed exercise/plan records and deterministic starter exercise/plan arrays.

- [ ] **Step 4: Add repository API**

Implement:

- `resetFitnessData()`
- `seedStarterData()`
- `listExercises()`
- `createExercise(input)`
- `listStarterPlans()`
- `listPersonalPlans()`
- `createPersonalPlan(input)`

Every create input must trim and validate required names. Throw an `Error` with useful message for invalid input.

- [ ] **Step 5: Update domain clearing**

Add fitness tables to `clearDomainTables()` in dependency order so tests and reset paths clear fitness data safely.

- [ ] **Step 6: Run repository test and verify pass**

Run: `npm run test:run -- tests/fitness-repository.test.ts`

Expected: PASS.

## Task 3: Focused and full verification

**Files:** all changed files.

- [ ] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/fitness-migrations.test.ts tests/fitness-repository.test.ts`

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

- Spec coverage: Module 2 covers schema, typed storage boundary, starter seed, repository CRUD, and clearing/reset behavior.
- Placeholder scan: no placeholder tasks are left.
- Type consistency: table names match the product spec and repository types.