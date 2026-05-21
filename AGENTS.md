# StingFit - Agent Guide

> **Read this file first.** Then read, in order:
> 1. [`AGENT_START_HERE.md`](./AGENT_START_HERE.md) - current clean handoff for the next coding agent.
> 2. [`STINGFIT_V3_PLAN.md`](./STINGFIT_V3_PLAN.md) - **the active rebuild plan**.
> 3. [`PRODUCT.md`](./PRODUCT.md) - vision, personas, anti-goals.
> 4. [`RULES.md`](./RULES.md) - binding engineering and product rules.
> 5. [`README.md`](./README.md) - current shipped surface and commands.
>
> `STINGFIT_V2_PLAN.md` is historical context only. V2 shipped. Do not use V2
> open items, phase gates, or module order to plan new work unless
> `STINGFIT_V3_PLAN.md` explicitly restates them.
>
> **Do not read or extract ideas from `docs/archive/`.** Anything in there is
> archived. If something looks worth reviving, raise it in chat and wait for
> the user to fold it into the active V3 plan.

---

## What StingFit Is

StingFit is a private, local-first fitness training app: personal plans, fast
gym logging, workout history, PR tracking, progression feedback, and the
coach<->trainee file handoff. It runs as a React + Vite PWA today, with Tauri
and Capacitor scaffolds kept as separate packaging tracks.

V3 reorganizes the product around three pillars:

- Train - what do I do right now?
- Progress - am I improving?
- Plans - what is next?

No cloud sync, accounts, telemetry, analytics, subscriptions, payments, or
paywalls are allowed.

## Stack

- React 19 + TypeScript strict mode
- Vite 8 + Tailwind 4 (`@tailwindcss/vite`)
- react-router-dom v7 with HashRouter compatibility
- Zustand for client state
- TanStack Query for fitness reads
- `sql.js` persisted via `idb-keyval`
- Vitest + jsdom + fake-indexeddb
- Tauri v2 scaffold and Capacitor mobile scaffold as packaging tracks

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run preview
npm run check
```

PWA / mobile production preview:

```bash
npm run mobile:pwa:start
npm run mobile:pwa:url
npm run mobile:pwa:stop
```

Public preview tunnel:

```bash
npm run public:start
npm run public:url
npm run public:stop
```

## Source Map

- `src/components/layout/` - `AppShell`, `TopBar`, `NavigationSidebar`, `MobileBottomNav`, `MoreSheet`
- `src/components/ui/` - reusable primitives (`Button`, `Card`, `Modal`, `CommandPalette`, `ToastHost`, ...)
- `src/features/fitness/` - shipped training, quick session, plans, history, settings, plate calculator, stats logic
- `src/features/progress/` - V3 Progress hub, lift charts, PR feed, body measurements, journal
- `src/features/coach/` - Coach Mode, Plan Packs, Recap Packs, local file handoff
- `src/features/onboarding/` - first-run flow + simple-start builder
- `src/features/profiles/` - local profile state and switcher
- `src/hooks/` - database, keyboard, onboarding, theme, SPA navigation hooks
- `src/lib/` - database, migrations, downloads, shortcuts, UI store, constants, utilities
- `src/i18n/` - Slovak primary copy plus placeholder English catalog
- `src/styles/` - Tailwind globals and High-Voltage Wasp theme variables
- `src/types/` - shared TypeScript domain types
- `tests/` - Vitest suites
- `tools/` - preview, QR, bundle, mobile packaging scripts
- `docs/` - active docs plus `docs/archive/` history that must not guide implementation
- `reports/` - current audits and packaging/smoke reports

See [`docs/source-map.md`](./docs/source-map.md) for the refreshed live source tree map.

## Per-Session Entry

1. Confirm the repo root is `C:\Users\kiko\Documents\New project\localflow`.
2. Read `AGENT_START_HERE.md` before any older plan or report.
3. Treat `STINGFIT_V3_PLAN.md` as the only active plan.
4. Run the smallest useful baseline before editing:
   - docs-only: `git status -sb`
   - TS/React code: `npm run typecheck` and `npm run lint`
   - behavior or DB changes: `npm run check`
5. If the baseline is red, classify whether it is code breakage or local
   environment breakage. Surface real blockers instead of building on top of a
   broken state.

## Per-Module Protocol

A module is the smallest useful slice from the V3 phase board, not a whole
phase.

1. State a 3-5 sentence plan in chat before code. If the user asked to continue
   directly, proceed after posting the plan.
2. For new UI, build the visible states first with local/dummy data.
3. Wire stores and database after the UI shape is clear.
4. Add or update migrations in `src/lib/migrations.ts` for schema changes.
5. Add focused Vitest coverage for new public functions, schema changes, and
   user-facing flows.
6. Any new user-facing action must be reachable from navigation, keyboard, or
   command palette where appropriate.
7. Add a short `CHANGELOG.md` entry under `## Unreleased`.
8. End with the strongest verification that fits the change.

## V3 Navigation Contract

- `/` redirects to `/train`.
- Train pillar: `/train`, `/train/quick`, `/train/live` alias.
- Progress pillar: `/progress/lifts`, `/progress/prs`, `/progress/body`,
  `/progress/journal`, `/progress/history`.
- Plans pillar: `/plans`, `/plans/coach/*`.
- Tools: `/tools/plates`.
- Settings: `/settings`.
- V2 URLs must keep redirecting for the deprecation window:
  `/training`, `/quick`, `/stats`, `/history`, `/plates`, `/coach/*`.

## Hard Product Rules

- Local-first and private. Never add cloud sync, login, telemetry, analytics,
  subscription, payment, paywall, ads, or marketplace logic.
- Sharing is explicit file export/import only. Plan Packs and Recap Packs leave
  the device only when the user deliberately exports/imports.
- Do not rewrite the existing fitness module to solve one feature.
- Validate inputs and import boundaries with structured schemas where practical.
- Schema changes are versioned and covered by tests.
- Do not silently swallow persistence, import, export, or migration failures.
- Keep accessible tap/click targets, labels, focus states, and keyboard paths.
- Do not add large UI libraries unless the user explicitly approves.

## Definition Of Done

- `npm run build` passes.
- `npm run test:run` passes for affected logic.
- `npm run lint` is clean when TypeScript or React code changed.
- New UI flows are reachable without dev tools.
- Empty/error states are visible and useful.
- The handoff names changed files, verification commands, and any remaining
  risk.

## Repo Discipline

- This folder is the standalone repo root. Run git from here, not from the
  parent workspace.
- Branches stay small and focused.
- Scratch artifacts (`.tmp-*`, `.pi/`, `.pi-lens/`, `.superpowers/`,
  `.playwright-mcp/`, `.ruff_cache/`, `output/`) stay ignored and must not
  become planning inputs.
- The GitHub remote workflow targets the StingFit repo.
