# StingFit Source Map

_Status: Active_
_Last verified: 2026-05-17_

This map reflects the live `src/` tree for the StingFit V3 cycle. Use it after
reading `AGENTS.md`, `AGENT_START_HERE.md`, and `STINGFIT_V3_PLAN.md`.

## Top-Level Source Folders

- `src/assets/` - static image assets bundled by Vite. Product screenshots and
  install assets live under `public/`.
- `src/components/` - shared React UI outside a single feature. `layout/`
  contains the app shell and V3 navigation surfaces. `ui/` contains reusable
  primitives such as buttons, cards, modals, command palette, toast host,
  app/feature error boundaries, and typed confirmation.
- `src/features/` - product feature modules: `fitness/`, `progress/`,
  `coach/`, `onboarding/`, and `profiles/`.
- `src/hooks/` - shared React hooks for database readiness, keyboard
  shortcuts, onboarding state, SPA navigation, and theme preference.
- `src/i18n/` - copy catalogs. `sk.ts` is the active Slovak catalog; `en.ts`
  is a placeholder catalog with the same key shape.
- `src/lib/` - app infrastructure and side-effect helpers: SQLite
  boot/persistence, migrations, downloads, shortcuts, UI store, constants, and
  utilities.
- `src/styles/` - global Tailwind/theme styles.
- `src/types/` - shared TypeScript declarations that are not owned by one
  feature.

## Root Source Files

- `src/App.tsx` wires the app shell, command palette, shortcuts cheatsheet, and
  V3 command actions.
- `src/main.tsx` is the React/Vite browser entrypoint.
- `src/router.tsx` defines the HashRouter route tree. V3 routes are `/train`,
  `/train/quick`, `/progress/*`, `/plans`, `/plans/coach/*`, `/tools/plates`,
  and `/settings`. V2 URLs redirect for the deprecation window.

## Layout Module

- `AppShell.tsx` - shell composition.
- `TopBar.tsx` - top bar and profile/context affordances.
- `NavigationSidebar.tsx` - desktop grouped navigation for Train, Progress,
  Plans, Tools, and Settings.
- `MobileBottomNav.tsx` - five-tile mobile nav.
- `MoreSheet.tsx` - secondary mobile destinations such as tools, Coach Mode,
  history, and settings.

## Feature Modules

- `src/features/fitness/` - shipped training loop, quick sessions, live
  logging, personal plan builder/editor, history, legacy stats logic, settings,
  plate calculator, import/export, backup nudges, units, rest alerts,
  repository/persistence logic, seed data, Strong CSV import, and
  recommendation/progression helpers.
- `src/features/progress/` - V3 Progress surface. Contains `ProgressHubPage`,
  `ProgressLiftsTab`, `ProgressPRsTab`, `ProgressBodyTab`,
  `ProgressJournalTab`, `MiniLineChart`, `progressRepository`, and
  `progressTypes`.
- `src/features/coach/` - gated local Coach Mode. Owns Plan Pack (`.stfplan`)
  and Recap Pack (`.stfrecap`) explicit file handoffs.
- `src/features/onboarding/` - first-run onboarding and simple-start builder.
- `src/features/profiles/` - local profile model, repository helpers, and
  top-bar profile switcher.

## Database And Migrations

- `src/lib/database.ts` owns SQLite boot/persistence.
- `src/lib/migrations.ts` currently includes `v001` through `v004`.
- `v004` adds `fitness_body_measurements` and `fitness_journal_entries`.

## Active Tests To Check First

- `tests/fitness-shell.test.ts`
- `tests/fitness-navigation.test.ts`
- `tests/fitness-migrations.test.ts`
- `tests/fitness-progress.test.ts`
- Add focused progress repository tests before marking V3 body/journal work
  complete.

## Legacy Directory Check

The old LocalFlow productivity-era modules are not part of the live app:

- `src/features/notes/`
- `src/features/tasks/`
- `src/features/projects/`
- `src/features/today/`
- `src/features/views/`
- `src/features/search/`
- `src/features/capture/`
