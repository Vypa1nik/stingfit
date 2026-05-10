# StingFit Source Map

_Status: Active_
_Last verified: 2026-05-05_

This map reflects the live `src/` tree for StingFit V2 Phase 3. It is based on `find src -type f` and describes the top-level source folders agents should use before editing.

## Top-level source folders

- `src/assets/` — Static image assets bundled by Vite. The current files are starter React/Vite images plus `hero.png`; product screenshots and install assets live under `public/`, not here.
- `src/components/` — Shared React UI outside a single feature. `layout/` contains the shell/navigation surfaces, and `ui/` contains reusable primitives such as buttons, cards, modals, command palette, toast host, app/feature error boundaries, and typed confirmation.
- `src/features/` — Product feature modules. The current live modules are `fitness/` for the shipped training loop, `onboarding/` for first-run setup, `profiles/` for Phase 3 local profile state, and `coach/` for the gated Coach Mode shell.
- `src/hooks/` — Shared React hooks for database readiness, keyboard shortcuts, onboarding state, SPA navigation, and theme preference.
- `src/i18n/` — Copy catalogs used by the current app surface. `sk.ts` is the active Slovak catalog; `en.ts` is a placeholder stub with the same key shape for future English localization.
- `src/lib/` — App infrastructure and side-effect helpers: SQLite boot/persistence, migrations, downloads, shortcuts, UI store, constants, and small utilities.
- `src/styles/` — Global Tailwind/theme styles. `globals.css` wires Tailwind and base styles; `themes.css` carries the High-Voltage Wasp visual identity variables.
- `src/types/` — Shared TypeScript declarations that are not owned by one feature, including common route/nav types and the `sql.js` runtime declaration.

## Root source files

- `src/App.tsx` wires the app shell and router outlet.
- `src/main.tsx` is the React/Vite browser entrypoint.
- `src/router.tsx` defines the HashRouter route tree used by the PWA and Tauri-compatible shell, including `/training`, `/quick`, `/plans`, `/history`, `/stats`, `/plates`, `/settings`, and the guarded `/coach/*` routes.

## Feature modules

- `src/features/fitness/` — The full V1/V2 product surface: dashboards, training, quick sessions, live logging, plan builder/editor, history, stats, standalone plate calculator, settings, TanStack Query read hooks under `queries/`, repository/persistence logic, seed data, Strong CSV import, coach Plan Pack import from Settings, trainee Recap Pack export from History, backup nudges, units, rest alerts, shared plate-load UI, and recommendation/progression helpers.
- `src/features/onboarding/` — First-run onboarding surface. It now opens directly on the simple-start builder or Quick Workout path, with local privacy and theme choices kept as secondary context.
- `src/features/profiles/` — Phase 3 local profile model, repository helpers, and top-bar profile switcher. The switcher remains hidden while only the default solo profile exists.
- `src/features/coach/` — Phase 3 Coach Mode shell. `coachModeRepository.ts` owns the local `coach_mode_enabled` setting. `CoachModePage.tsx` guards `/coach/clients`, `/coach/plans`, `/coach/templates`, and `/coach/recaps`, then renders local client lists, Plan Pack export actions, template empty states, and read-only Recap Pack previews once Coach Mode is enabled. `planPack/` defines `.stfplan` schema plus local export/import helpers, and `recapPack/` defines `.stfrecap` schema plus read-only preview helpers. The Phase 3 privacy audit for these explicit file handoffs lives in `reports/stingfit-privacy-network-audit.md`.

## Legacy feature directory check

Verified absent during Phase 0 source tree audit:

- `src/features/notes/`
- `src/features/tasks/`
- `src/features/projects/`
- `src/features/today/`
- `src/features/views/`
- `src/features/search/`
- `src/features/capture/`
