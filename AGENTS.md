# StingFit - Project Agent Guide

StingFit is a private, local-first fitness training app for personal plans,
fast gym logging, workout history, PR tracking, and progression feedback. It
runs as a React + Vite app today, with a Tauri scaffold present for a future
desktop build.

## Stack

- React 19
- TypeScript strict mode
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- `sql.js` persisted in IndexedDB through local storage helpers
- Vitest
- Tauri v2 scaffold, not the verified production path yet

## Commands

```powershell
npm install
npm run dev
npm run build
npm run test:run
npm run lint
```

The verified production path in this workspace is the web build.

## Source Map

- `src/components/` - reusable layout and UI primitives
- `src/features/fitness/` - plans, training, history, stats, settings, and fitness UX flows
- `src/hooks/` - app hooks and database/query wiring
- `src/lib/` - local database, import/export, storage, utilities, and shared UI state
- `src/types/` - shared TypeScript domain types
- `src-tauri/` - desktop wrapper scaffold
- `tests/` - Vitest coverage for persistence, plan logic, live-session flows, and release rules

## Git And Agent Workflow

- This folder is the standalone repo root for the fitness app. Run git commands from here, not from `C:\Users\kiko\Documents\New project`.
- GitHub remote workflow targets the StingFit repo, while VS Code MCP integration for GitHub lives in `.vscode/mcp.json`.
- Prefer small focused branches and keep `npm run check` green before pushing.

## StingFit Rules

- Keep the app local-first and private. Do not add cloud sync, login, telemetry, analytics, subscription, or paywall logic.
- Work in small modules. Do not rewrite the whole app to solve one feature.
- Build UI states with dummy data first when adding new screens or flows.
- Every CRUD path needs loading, success, error, and empty states.
- Validate inputs and import boundaries with structured schemas where possible.
- Keep database schema changes versioned and covered by tests.
- Do not silently swallow persistence or import/export failures.
- Keep accessible tap/click targets, labels, focus states, and keyboard paths.
- Do not add large UI libraries unless the local component system cannot reasonably cover the need.

## Definition Of Done

- `npm run build` passes.
- `npm run test:run` passes for affected logic.
- `npm run lint` is run when TypeScript or React code changed.
- New UI flows are reachable without developer tools.
- Empty/error states are visible and useful.
- The handoff names changed files, verification commands, and any remaining risk.
