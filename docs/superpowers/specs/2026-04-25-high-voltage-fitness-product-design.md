# High-Voltage Fitness Product Design

## Status

Approved design direction from brainstorming:

- Product type: **PWA-style local-first fitness training logbook**.
- Primary product loop: **Start → Log → Finish → Learn**.
- Core product mode: **Fast Gym Logger** with personal plan support.
- Visual identity: **High-Voltage Wasp** — black base, saturated sharp yellow, orange heat accents, lightning for PR/progress, subtle wasp/honeycomb details.
- Legacy LocalFlow notes/tasks/projects are hidden from primary navigation for the first clear fitness version.

## Goal

Turn LocalFlow from a general productivity workspace into a fast, attractive, useful, local-first fitness product where a user can build a personal training plan, run workouts in the gym, log sets quickly, and get history/progress feedback.

## Non-Goals

This product must not add cloud sync, login, telemetry, analytics, subscriptions, paywalls, or account logic.

MVP does not include nutrition tracking, body measurements, social features, wearable integrations, AI chat coaching, automatic block generation, or full deload automation.

## Product Principles

1. **Fast in the gym:** the live training screen optimizes for one-thumb set logging.
2. **Personal plan first:** starter templates help onboarding, but the user can build their own plan and scale it.
3. **Local and private:** data stays in existing local SQLite/IndexedDB infrastructure.
4. **Transparent help:** progression hints and PRs are rule-based and explain why they appear.
5. **Mobile-first, desktop-useful:** mobile is primary for training; desktop remains useful for planning/history.
6. **Useful before broad:** complete a vertical slice before adding wide diary features.

## Navigation

Primary navigation becomes:

- Training
- Plans
- History
- Stats
- Settings

Existing LocalFlow sections can remain in code during migration, but they are not primary navigation in the fitness product.

## Visual Identity: High-Voltage Wasp

### Palette

- Void Black: `#000000`
- Voltage Yellow: `#FFFF00`
- Sting Gold: `#FFD000`
- Heat Orange: `#FF7A00`
- Wasp Surface: `#171700`
- Warm Text: `#FFFBEA`

### Usage Rules

- Black/graphite is the product foundation.
- Saturated yellow is the main action, active state, and signature energy.
- Orange is used for heat, warnings, hard-effort accents, and PR flare.
- Lightning marks PRs, progression, and high-impact actions.
- Honeycomb/wasp stripe patterns are decorative and subtle, not cartoonish.
- Use black text on yellow for accessibility. Avoid white text on saturated yellow.

## Core MVP Flow

1. User opens app.
2. User sees Training as the primary screen.
3. User chooses or creates a personal plan.
4. User schedules/expands the plan by weeks and days.
5. User starts today's workout from the plan.
6. App snapshots the planned workout into a session.
7. User logs sets quickly: weight, reps, RIR.
8. App starts rest timer after a logged set.
9. User can add/remove a set, skip an exercise, or add an unplanned exercise.
10. User finishes workout.
11. App stores the session locally.
12. History, PR events, and progression hints are derived from stored sessions.

## Screens

### Training

Purpose: fastest possible live gym logger.

Required content:

- current session name
- current exercise
- current set number
- editable weight/reps/RIR values
- large `Log set + rest` action
- rest timer
- next exercise preview
- progression hint with reason
- quick actions: add set, remove set, skip exercise, add unplanned exercise, finish workout

States:

- loading active session
- no active session / choose workout empty state
- active workout
- save/logging in progress
- success feedback after set log
- error state if persistence fails
- completed workout summary

### Plans

Purpose: starter templates plus personal plan builder.

Required content:

- starter plans: Push/Pull/Legs, Upper/Lower, Full Body 3×
- create personal plan from starter template
- create blank personal plan
- personal plan list
- plan week/day structure
- duplicate week
- create next week from current week
- add training day
- set rest day
- move workout between days
- edit workout exercises

States:

- loading plans
- empty state with starter template CTA
- save success
- validation errors
- persistence errors

### History

Purpose: durable training log.

Required content:

- completed workouts by date
- workout name
- duration
- total sets
- total volume
- PR badges when present
- workout detail with exercises and sets

States:

- loading history
- empty history
- completed sessions list
- persistence error

### Stats

Purpose: motivating progress without overbuilding analytics.

Required content:

- weekly consistency
- volume trend
- recent PR events
- top exercise progress
- estimated 1RM for key lifts

States:

- loading stats
- not enough data empty state
- computed stats
- computation/persistence error

### Settings

Purpose: local-first data controls.

Required content:

- kg/lb display unit toggle
- reset starter data
- export/backup fitness data
- local/privacy explanation

States:

- loading settings
- save success
- save error
- reset confirmation

## Personal Plan Builder

Personal plan is a first-class object, not just a saved workout template.

A personal plan includes:

- name
- goal
- optional source starter template
- week structure
- day structure
- workouts assigned to days
- exercises in workouts
- target sets
- rep range
- target RIR
- default rest time
- exercise/workout notes

MVP capabilities:

- create personal plan from starter template
- create blank plan
- edit plan name and goal
- duplicate week
- create next week from a previous week
- add/remove training day
- set rest day
- move workout to another day
- add/remove/reorder exercises in a workout
- edit sets, min reps, max reps, target RIR, rest seconds

Important behavior:

- Starting a workout creates a snapshot session.
- Future edits to the plan do not rewrite historical sessions.
- Scaling is suggested through progression hints in MVP; it is not forced automatic plan mutation.

## Data Model

Use existing `sql.js` + IndexedDB persistence and versioned migrations.

Proposed tables:

### `fitness_exercises`

- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `category TEXT NOT NULL`
- `default_rest_seconds INTEGER NOT NULL`
- `is_custom INTEGER NOT NULL DEFAULT 0`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`
- `deleted_at TEXT DEFAULT NULL`

### `fitness_plans`

- `id TEXT PRIMARY KEY`
- `name TEXT NOT NULL`
- `goal TEXT NOT NULL DEFAULT ''`
- `source_template_id TEXT DEFAULT NULL`
- `status TEXT NOT NULL CHECK(status IN ('draft','active','archived'))`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`
- `deleted_at TEXT DEFAULT NULL`

### `fitness_plan_weeks`

- `id TEXT PRIMARY KEY`
- `plan_id TEXT NOT NULL`
- `week_number INTEGER NOT NULL`
- `notes TEXT NOT NULL DEFAULT ''`

### `fitness_plan_days`

- `id TEXT PRIMARY KEY`
- `week_id TEXT NOT NULL`
- `day_index INTEGER NOT NULL`
- `label TEXT NOT NULL`
- `is_rest_day INTEGER NOT NULL DEFAULT 0`

### `fitness_plan_workouts`

- `id TEXT PRIMARY KEY`
- `plan_day_id TEXT NOT NULL`
- `name TEXT NOT NULL`
- `notes TEXT NOT NULL DEFAULT ''`
- `sort_order INTEGER NOT NULL DEFAULT 0`

### `fitness_plan_exercises`

- `id TEXT PRIMARY KEY`
- `plan_workout_id TEXT NOT NULL`
- `exercise_id TEXT NOT NULL`
- `sort_order INTEGER NOT NULL`
- `target_sets INTEGER NOT NULL`
- `min_reps INTEGER NOT NULL`
- `max_reps INTEGER NOT NULL`
- `target_rir INTEGER DEFAULT NULL`
- `rest_seconds INTEGER NOT NULL`
- `notes TEXT NOT NULL DEFAULT ''`

### `fitness_sessions`

- `id TEXT PRIMARY KEY`
- `plan_id TEXT DEFAULT NULL`
- `plan_workout_id TEXT DEFAULT NULL`
- `name TEXT NOT NULL`
- `status TEXT NOT NULL CHECK(status IN ('planned','active','completed','abandoned'))`
- `started_at TEXT DEFAULT NULL`
- `completed_at TEXT DEFAULT NULL`
- `notes TEXT NOT NULL DEFAULT ''`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

### `fitness_session_exercises`

- `id TEXT PRIMARY KEY`
- `session_id TEXT NOT NULL`
- `exercise_id TEXT NOT NULL`
- `name_snapshot TEXT NOT NULL`
- `sort_order INTEGER NOT NULL`
- `status TEXT NOT NULL CHECK(status IN ('pending','active','done','skipped'))`
- `target_sets INTEGER NOT NULL`
- `min_reps INTEGER NOT NULL`
- `max_reps INTEGER NOT NULL`
- `target_rir INTEGER DEFAULT NULL`
- `rest_seconds INTEGER NOT NULL`
- `notes TEXT NOT NULL DEFAULT ''`

### `fitness_sets`

- `id TEXT PRIMARY KEY`
- `session_exercise_id TEXT NOT NULL`
- `set_number INTEGER NOT NULL`
- `weight_kg REAL NOT NULL`
- `reps INTEGER NOT NULL`
- `rir INTEGER DEFAULT NULL`
- `status TEXT NOT NULL CHECK(status IN ('planned','completed','skipped'))`
- `completed_at TEXT DEFAULT NULL`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

### `fitness_settings`

- `key TEXT PRIMARY KEY`
- `value TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

## Repository API

Add a storage boundary so UI does not call SQL directly.

Suggested module: `src/features/fitness/fitnessRepository.ts`.

Required API areas:

- starter data seed/reset
- exercise library CRUD
- personal plan CRUD
- week/day/workout/exercise editing
- start session from plan workout
- active session retrieval
- log set
- add/remove set
- skip exercise
- add unplanned exercise
- finish session
- history list/detail
- settings get/set

Every mutation returns useful success data and throws structured errors on persistence failure. UI must show loading, success, error, and empty states for CRUD flows.

## Progression Hints

Rules are transparent and derived from history.

MVP rules:

- If previous completed work sets hit the top rep range and RIR is at least 1, suggest increasing weight.
- If reps are stable but below top range, suggest holding weight.
- If performance drops sharply, suggest holding or reducing.
- If notes include pain/injury signals like `pain`, `elbow`, `knee`, `shoulder`, do not suggest aggressive increase.

Every hint must include a reason.

## PR Tracking

PR events are derived from completed sets/sessions.

MVP PR types:

- `weight_pr`
- `rep_pr_at_weight`
- `volume_pr`
- `estimated_1rm_pr`

Estimated 1RM can use Epley formula: `weightKg * (1 + reps / 30)`.

PRs are not the source of truth; history is.

## Implementation Phases

### Module 1 — Fitness shell and High-Voltage Wasp theme

- Primary navigation becomes Training, Plans, History, Stats, Settings.
- Old productivity sections are hidden from primary nav.
- Apply the high-contrast black/yellow/orange theme to the fitness shell.
- Keep the app building and usable.

### Module 2 — SQLite schema and repository

- Add migrations for fitness tables.
- Add TypeScript domain types.
- Add repository tests.
- Seed starter exercises and starter plans.

### Module 3 — Personal Plan Builder

- Show starter templates.
- Create personal plan from starter or blank plan.
- Edit week/day/workout/exercise structure.
- Duplicate week and create next week.

### Module 4 — Live Training Flow

- Start session from plan workout.
- Snapshot planned workout into session.
- Log sets quickly.
- Auto-start rest timer in UI.
- Add/remove set, skip exercise, add unplanned exercise.
- Finish workout.

### Module 5 — History, PRs, progression

- List completed sessions.
- Show workout detail.
- Compute volume, PR events, estimated 1RM, and progression hints.

### Module 6 — Settings and local data safety

- kg/lb display unit toggle.
- reset starter data.
- export/backup fitness data.
- clear error handling and confirmation states.

## Testing Requirements

Use TDD for behavior changes.

Required coverage:

- migration creates all fitness tables
- starter data seed is idempotent
- plan creation from starter template
- week duplication
- workout snapshot into session
- log set updates session state
- add/remove set
- skip exercise
- finish session
- history derives completed sessions
- PR calculations
- progression hint rules
- kg/lb conversion display helpers
- render tests for Training, Plans, History, Stats, Settings key states

## Definition of Done

For each module:

- targeted tests pass
- `npm run test:run` passes
- `npm run build` passes
- `npm run lint` passes
- UI has loading, success, error, and empty states for affected CRUD paths
- app remains local-first and private

For MVP:

A user can open the app, create or choose a personal training plan, map workouts across weeks/days, start today’s workout, log sets quickly in the gym, finish the workout, and see history with PR/progression feedback.