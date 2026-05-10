> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert LocalFlow into a clear local-first fitness product with a fast gym logger, personal training plans, local history, PR tracking, and progression hints.

**Architecture:** Implement the product as six vertical modules. Each module keeps the app buildable, tested, and locally usable before the next module starts. UI talks to a fitness repository boundary; persistence uses existing `sql.js` + IndexedDB migrations.

**Tech Stack:** React 19, TypeScript strict mode, Vite, Tailwind CSS, Zustand where useful for transient UI state, existing `sql.js` persistence, Vitest/jsdom.

---

## Module Sequence

### Module 1: Fitness shell and High-Voltage Wasp theme

**Goal:** Make the app feel like a focused fitness product before adding deeper persistence.

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/components/layout/NavigationSidebar.tsx`
- Modify: `src/components/layout/TopBar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/hooks/useKeyboardShortcuts.ts`
- Modify: `src/lib/shortcuts.ts`
- Modify: `src/router.tsx`
- Modify: `src/styles/themes.css`
- Modify: `src/styles/globals.css`
- Modify: `src/features/fitness/FitnessDashboard.tsx`
- Create: `src/features/fitness/FitnessPlansPage.tsx`
- Create: `src/features/fitness/FitnessHistoryPage.tsx`
- Create: `src/features/fitness/FitnessStatsPage.tsx`
- Create: `src/features/fitness/FitnessSettingsPage.tsx`
- Test: `tests/fitness-shell.test.ts`
- Test: `tests/fitness-pages.test.tsx`

**Acceptance:** Primary nav is Training, Plans, History, Stats, Settings. Old Notes/Tasks/Projects are not primary nav. Fitness pages use black/yellow/orange High-Voltage Wasp styling. Tests, build, lint pass.

### Module 2: SQLite schema and fitness repository

**Goal:** Add real local storage behind a repository API.

**Files:**
- Modify: `src/lib/migrations.ts`
- Modify: `src/lib/database.ts`
- Create: `src/features/fitness/fitnessTypes.ts`
- Create: `src/features/fitness/fitnessRepository.ts`
- Create: `src/features/fitness/fitnessSeed.ts`
- Test: `tests/fitness-repository.test.ts`
- Test: `tests/fitness-migrations.test.ts`

**Acceptance:** Migrations create fitness tables. Starter data seed is idempotent. Repository can create/list exercises and personal plans. Tests, build, lint pass.

### Module 3: Personal Plan Builder

**Goal:** Let the user create a personal plan from starter plans or from blank, then edit weeks/days/workouts/exercises.

**Files:**
- Modify: `src/features/fitness/FitnessPlansPage.tsx`
- Create: `src/features/fitness/PersonalPlanBuilder.tsx`
- Create: `src/features/fitness/PlanWorkoutEditor.tsx`
- Create: `src/features/fitness/PlanWeekEditor.tsx`
- Test: `tests/fitness-plan-builder.test.tsx`
- Extend: `tests/fitness-repository.test.ts`

**Acceptance:** User can create a personal plan, duplicate a week, create next week from current week, add a training day, set rest day, and edit planned exercise targets. Tests, build, lint pass.

### Module 4: Live Training Flow

**Goal:** Implement Start → Log → Finish.

**Files:**
- Modify: `src/features/fitness/FitnessDashboard.tsx`
- Create: `src/features/fitness/LiveTrainingSession.tsx`
- Create: `src/features/fitness/SetLogger.tsx`
- Create: `src/features/fitness/RestTimer.tsx`
- Extend: `src/features/fitness/fitnessRepository.ts`
- Test: `tests/fitness-live-session.test.tsx`
- Extend: `tests/fitness-repository.test.ts`

**Acceptance:** User can start a session from a planned workout, log sets, auto-start rest timer, add/remove set, skip exercise, add unplanned exercise, and finish the workout. Tests, build, lint pass.

### Module 5: History, PRs, progression hints

**Goal:** Make the app helpful after training by deriving progress from history.

**Files:**
- Modify: `src/features/fitness/FitnessHistoryPage.tsx`
- Modify: `src/features/fitness/FitnessStatsPage.tsx`
- Create: `src/features/fitness/fitnessProgress.ts`
- Create: `src/features/fitness/WorkoutHistoryDetail.tsx`
- Test: `tests/fitness-progress.test.ts`
- Test: `tests/fitness-history.test.tsx`

**Acceptance:** Completed sessions show history and details. Stats show weekly consistency, volume trend, PR events, estimated 1RM, and progression hints with reasons. Tests, build, lint pass.

### Module 6: Settings and local data safety

**Goal:** Add useful local controls for long-term use.

**Files:**
- Modify: `src/features/fitness/FitnessSettingsPage.tsx`
- Extend: `src/features/fitness/fitnessRepository.ts`
- Create: `src/features/fitness/fitnessUnits.ts`
- Test: `tests/fitness-settings.test.tsx`
- Test: `tests/fitness-units.test.ts`

**Acceptance:** User can toggle kg/lb display units, reset starter data with confirmation, and export/backup fitness data. Tests, build, lint pass.

## Verification Gate Per Module

Run after every module:

```bash
npm run test:run
npm run build
npm run lint
```

If a command fails, stop and fix before continuing to the next module.
