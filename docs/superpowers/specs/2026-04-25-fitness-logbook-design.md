# Fitness Logbook Module 1 Design

## Status

Approved direction: **Live Session First + smart coach hints**.

## Goal

Turn LocalFlow's first visible experience into a private, offline-first fitness training logbook without rewriting the whole app. Module 1 builds a high-quality dummy-data UI first; persistence and full CRUD come later.

## Scope

This module includes:

- A new fitness-first dashboard for today's training session.
- Dummy workout data for a Push Day session.
- Current exercise, current set, planned sets, completed sets, rest timer display, and coach hints.
- Route/navigation/command-palette access to the training screen.
- Pure helper functions and render coverage for the dummy fitness UI.

This module does **not** include:

- Database schema changes.
- Workout persistence.
- Editing exercises, plans, or sets.
- Body weight, nutrition, cloud sync, login, telemetry, subscriptions, or paywalls.

## Product Direction

The app should feel useful in the gym before it becomes a full planning system. The primary screen is therefore the live workout state: what exercise is next, what set to perform, what weight/reps/RIR to aim for, and how long to rest. History and analytics are secondary surfaces for later modules.

## Architecture

Add a focused `src/features/fitness/` module:

- `fitnessDemo.ts` owns temporary domain types, demo session data, and pure helper functions.
- `FitnessDashboard.tsx` renders the dashboard from a session object and remains storage-agnostic.

The router exposes the screen at `/training`; `/` redirects there. Existing LocalFlow workspaces remain in place during the transition so the app keeps building and can be migrated module by module.

## UI States

- **Active session:** shows the current exercise, active set, set targets, coach hint, rest timer, exercise list, and weekly summary.
- **Empty session:** if no current exercise is available, show a clear empty state saying there is no workout ready yet.
- **Future loading/error:** not needed in Module 1 because all data is static dummy data. These states become required when workout CRUD/persistence is introduced.

## Data Flow

`DEMO_FITNESS_SESSION` feeds `FitnessDashboard`. Helper functions derive the current exercise, current set, formatted rest time, and progress metrics. The component does not call the database and does not mutate durable state.

## Testing

- Unit tests cover progress calculation, current exercise/set selection, and rest-time formatting.
- A React render test verifies that the dashboard exposes the key gym-first content: current exercise, set action, coach hint, and weekly summary.
- Verification gate for this module: targeted Vitest tests, full `npm run test:run`, `npm run build`, and `npm run lint` when code changes are complete.

## Spec Self-Review

- No placeholders or deferred requirements are left in module scope.
- Scope is intentionally limited to dummy UI and routing, matching the workspace rule to build UI before storage/backend behavior.
- Non-goals explicitly exclude persistence and cloud/account features.
- File boundaries are small: one data/helper file and one UI file.