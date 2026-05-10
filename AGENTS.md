# StingFit — Agent Guide

> **Read this file first.** Then read, in order:
> 1. [`STINGFIT_V2_PLAN.md`](./STINGFIT_V2_PLAN.md) — the active rebuild plan
> 2. [`PRODUCT.md`](./PRODUCT.md) — vision, personas, anti-goals
> 3. [`RULES.md`](./RULES.md) — engineering and product rules
> 4. [`README.md`](./README.md) — current shipped surface
>
> **Do not read or extract ideas from `docs/archive/`.** Anything in there is
> historical context only and carries an ARCHIVED banner. If something in the
> archive looks worth reviving, raise it in chat — only the user folds it into
> the active plan.

---

## What StingFit is

StingFit is a private, local-first fitness training app: personal plans, fast
gym logging, workout history, PR tracking, progression feedback, and — in V2
— the coach<->trainee bridge. It runs as a React + Vite PWA today, with a Tauri
v2 desktop scaffold for V2 distribution.

For the full vision, including the V2 coach<->trainee positioning, read `PRODUCT.md`.

## Stack

- React 19 + TypeScript strict mode
- Vite 8 + Tailwind 4 (`@tailwindcss/vite`)
- react-router-dom v7 (HashRouter for Tauri compatibility)
- Zustand for client state
- TanStack Query for fitness reads (V2 Phase 1 adopts this for the legacy `useEffect+setState` paths)
- `sql.js` (SQLite WASM) persisted via `idb-keyval`
- Vitest + jsdom + fake-indexeddb
- Tauri v2 scaffold — desktop builds become a verified path in V2 Phase 4

## Commands

```bash
npm install
npm run dev          # local dev (HMR)
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run preview      # serve the production bundle locally
npm run check        # lint + test:run + build (the verification gate)
```

PWA / mobile production preview:

```bash
npm run mobile:pwa:start
npm run mobile:pwa:url
npm run mobile:pwa:stop
```

The verified production path in this workspace is the web/PWA build. Tauri
desktop builds become a verified path in V2 Phase 4 (Distribution).

## Source map

- `src/components/layout/` — `AppShell`, `TopBar`, `NavigationSidebar`, `MobileBottomNav`
- `src/components/ui/` — reusable primitives (`Button`, `Card`, `Modal`, `CommandPalette`, `ToastHost`, ...)
- `src/features/fitness/` — the entire shipped product surface (plans, training, history, stats, settings, plate calculator, rest alerts, etc.)
- `src/features/onboarding/` — first-run flow + simple-start builder
- `src/features/coach/` — **created in V2 Phase 3.** Plan Packs, Recap Packs, profile switcher, coach views. Does not exist yet.
- `src/hooks/` — `useDatabase`, `useKeyboardShortcuts`, `useOnboarding`, `useTheme`, `useSpaNavigate`
- `src/lib/` — `database.ts`, `migrations.ts`, `download.ts`, `shortcuts.ts`, `uiStore.ts`, `utils.ts`, `constants.ts`
- `src/i18n/sk.ts` — Slovak strings (V2 Phase 2 consolidates remaining hardcoded copy here)
- `src/styles/` — `globals.css`, `themes.css` (High-Voltage Wasp identity)
- `src/types/` — shared TypeScript domain types
- `src-tauri/` — desktop wrapper scaffold (verified in V2 Phase 4)
- `tests/` — Vitest suites for repository, plan logic, live session, history, stats, UI
- `tools/` — PWA preview scripts, QR generators, bundle budget (added in V2 Phase 1)
- `docs/` — `github-agent-workflow.md` (active) and `archive/` (ARCHIVED — do not read for guidance, includes the legacy `superpowers/` plans and specs)
- `reports/` — release checklist, privacy/network audit, mobile smoke, pre-production audit handoff

See [`docs/source-map.md`](./docs/source-map.md) for the live source tree map (produced in V2 Phase 0 module 2; refresh it whenever the `src/` tree shifts).

## Workflow protocol

### Per-session entry

1. Re-read `STINGFIT_V2_PLAN.md` to confirm the active phase.
2. Run `npm run check` to confirm the baseline is green before any edit.
3. If `check` is red on entry, **stop and surface to the user**. Do not start
   new work on top of a broken main.

### Per-module protocol

A "module" is the smallest unit of work in the active phase (e.g. "Adopt
TanStack Query for `FitnessHistoryPage`", not "Phase 1").

1. **Plan in 3-5 sentences.** State the change in DB schema (if any), in
   stores, in UI, in tests. Wait for user confirmation before writing code.
2. **UI first with dummy data** for any new screen or flow.
3. **Wire stores and DB.** Add a migration in `src/lib/migrations.ts` if the
   schema moves. Add a regression test in `tests/`.
4. **Tests.** Every new public function gets at least one Vitest test. New
   UI gets a happy-path integration test.
5. **Keyboard / command palette.** Any new user-facing action is reachable
   via shortcut and from the command palette.
6. **Self-check.** `npm run check` green. No new ESLint warnings. No console
   errors in `npm run dev`. No regressions in existing tests.
7. **CHANGELOG entry.** 1-3 sentences under `## Unreleased` describing what
   the user notices.

### Per-phase exit

- Acceptance criteria from `STINGFIT_V2_PLAN.md` are all green.
- The phase is tagged (`v2-phase-N`).
- A short note posted to the user summarizing what shipped and what is next.

### Stuck protocol

- 3 failed attempts on the same bug -> stop, revert to the last green commit,
  and present the user with two alternatives. Do not push past the third
  attempt without user input.
- Whenever something in `STINGFIT_V2_PLAN.md` disagrees with reality, **stop
  and propose a doc edit** before writing code. The plan is the source of truth.

## Hard product rules (cannot be relaxed by an agent)

- Local-first and private. **Never** add cloud sync, login, telemetry,
  analytics, subscription, payment, or paywall logic. (V2.1+ may introduce
  opt-in BYO storage; that requires explicit user sign-off and a written
  change to `PRODUCT.md`.)
- Sharing is always explicit. Plan Packs and Recap Packs leave the device
  only when the user takes a deliberate export action.
- Do not rewrite the existing fitness module to solve one feature.
- Build UI states with dummy data first. Every CRUD path needs loading,
  success, error, and empty states.
- Validate inputs and import boundaries with structured schemas (Zod where
  practical).
- Schema changes are versioned and covered by tests.
- Do not silently swallow persistence or import/export failures.
- Keep accessible tap/click targets, labels, focus states, and keyboard paths.
- Do not add large UI libraries unless the local component system cannot
  reasonably cover the need. The V2 plan pre-approves zero new heavy deps.

## Definition of Done (per change)

- `npm run build` passes.
- `npm run test:run` passes for affected logic.
- `npm run lint` is clean when TypeScript or React code changed.
- New UI flows are reachable without dev tools.
- Empty/error states are visible and useful.
- The handoff names changed files, the verification commands run, and any
  remaining risk is called out.

## Repo discipline

- This folder is the standalone repo root. Run `git` commands from here, not
  from the parent workspace.
- Branches small and focused. Keep `npm run check` green before pushing.
- Tmp/scratch artifacts (`.tmp-*`, `.pi/`, `.pi-lens/`, `.superpowers/`,
  `.playwright-mcp/`, `.ruff_cache/`) stay gitignored.
- The GitHub remote workflow targets the StingFit repo. VS Code MCP wiring
  for GitHub lives in `.vscode/mcp.json`.
