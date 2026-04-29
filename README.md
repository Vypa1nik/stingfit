# StingFit

StingFit is a private, local-first fitness training app for personal plans, fast gym logging, workout history, PR tracking, and transparent progression signals.

V1 is built around one simple loop:

```text
Start → Log → Finish → Learn
```

No login, no cloud sync, no telemetry, no analytics, no subscriptions, and no paywalls.

## V1 status

StingFit V1 is a React + Vite web app with local SQLite storage through `sql.js` persisted in IndexedDB. The verified production path is the web build. A Tauri v2 desktop scaffold is present for future packaging, but the web app is the tested target in this workspace.

## What works in V1

- Fitness-first shell with Training, Plans, History, Stats, and Settings
- High-Voltage Wasp visual identity: black base, sharp yellow, orange accents
- Starter templates for Push/Pull/Legs, Upper/Lower, and Full Body 3×
- Personal plan creation from templates or blank plans
- Controlled plan editing for weeks, days, workouts, exercises, targets, rest days, and ordering
- Custom exercise creation and custom exercise library management
- Readiness validation before workouts appear in Training
- Up Next workout recommendation from local completed history
- Fast live workout logging with one-thumb set controls
- Add/remove set, skip exercise, add unplanned exercise, finish, resume, and abandon flows
- Session snapshots so completed workouts do not change when plans are edited later
- Finish check-in with session RPE, energy, and notes
- Workout history, PR events, volume, and quality-aware progression hints
- kg/lb display and logging support while storage remains kg-based
- Optional guidance visibility for users who prefer a quieter interface
- Fitness-only JSON export/import/restore
- Safe starter reset and full local fitness data wipe with typed confirmation
- V1 smoke coverage for the full local loop

## Local-first privacy promise

StingFit keeps training data on the device. Fitness data is stored in browser storage using a local SQLite database compiled to WASM and persisted through IndexedDB helpers.

The product deliberately does not include:

- accounts
- login
- cloud sync
- telemetry
- analytics
- subscriptions
- paywalls

## Stack

- React 19
- TypeScript strict mode
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- `sql.js` persisted through IndexedDB/local storage helpers
- Vitest
- Tauri v2 scaffold for future desktop packaging

## Setup

```bash
npm install
```

## Development

Run the web app:

```bash
npm run dev
```

Open the local preview at:

- `http://localhost:5173/`

Run a network-accessible preview:

```bash
npm run dev -- --host 0.0.0.0
```

## Build

```bash
npm run build
```

## Tests

```bash
npm run test:run
```

## Lint

```bash
npm run lint
```

## Full local verification gate

```bash
npm run test:run
npm run build
npm run lint
```

## Notes for future releases

- The web build is the verified production path.
- Desktop packaging should be treated as a future release track until the Tauri build is verified on a machine with Rust tooling.
- Internal database/storage keys remain stable to avoid accidental local data loss across upgrades.
