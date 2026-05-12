# StingFit

StingFit is the calm, fast bridge between a coach and the person doing the workout: one local-first app where a trainer's plan becomes a trainee's clean, friction-free training day. It still works for solo training, but V2 adds explicit coach<->trainee file handoff through Plan Packs and Recap Packs without accounts, cloud sync, telemetry, or analytics.

A coach can export a `.stfplan` Plan Pack, a trainee can import it and train offline, and the trainee can later export a `.stfrecap` Recap Pack back to the coach. All sharing is a deliberate file action, and the core gym loop remains fast: open the app, see today's workout, log sets, finish, and review progress from local history.

V1 is built around one simple loop:

```text
Start → Log → Finish → Learn
```

No login, no cloud sync, no telemetry, no analytics, no subscriptions, and no paywalls.

> ## Working on this repo?
>
> Read these four files, in this order, before writing any code:
>
> 1. [`AGENTS.md`](./AGENTS.md) — agent workflow protocol
> 2. [`STINGFIT_V2_PLAN.md`](./STINGFIT_V2_PLAN.md) — **the active rebuild plan**
> 3. [`PRODUCT.md`](./PRODUCT.md) — vision, personas, anti-goals
> 4. [`RULES.md`](./RULES.md) — engineering and product rules
>
> Anything in [`docs/archive/`](./docs/archive/) is **archived** and must not
> influence implementation choices.

## V2 release readiness

StingFit V2 keeps the React + Vite PWA with local SQLite storage through `sql.js` persisted in IndexedDB as the verified production path. Coach Mode, Plan Packs, Recap Packs, the PWA install funnel, and the GitHub Pages deployment workflow are implemented; the release remains gated by live Pages deployment, Lighthouse verification, manual paired-device smoke, and desktop packaging blockers.

## Public install path

Expected public PWA URL: `https://vypa1nik.github.io/stingfit/`.

GitHub Pages deployment is defined in `.github/workflows/deploy-pwa.yml`. It builds with `VITE_BASE_PATH=/stingfit/` and publishes the PWA from `v2*` tags or manual workflow dispatch. Lighthouse verification is pending until the first Pages deployment provides a live URL.

Desktop downloads: No verified desktop installers are published yet. The Tauri v2 scaffold is present, but Windows/macOS installer links stay omitted until the native toolchain blocker in `reports/stingfit-tauri-desktop-builds.md` is resolved and `npm run tauri:build` is verified on a machine with Rust, Cargo, rustup, and the required platform build tools.

## What works in V2

- Fitness-first shell with Training, Quick, Plans, History, Stats, and Settings
- High-Voltage Wasp visual identity: black base, sharp yellow, orange accents
- Installable PWA shell with offline fallback, mobile install metadata, shortcuts, and screenshot assets
- Starter templates for Push/Pull/Legs, Upper/Lower, and Full Body 3×
- Personal plan creation from templates or blank plans
- Controlled plan editing for weeks, days, workouts, exercises, targets, rest days, ordering, supersets, and muscle-group metadata
- Custom exercise creation and custom exercise library management
- Readiness validation before workouts appear in Training
- Up Next workout recommendation from local completed history
- Fast live workout logging with one-thumb set controls, rest alerts, plate calculator, warmups, working-set types, per-side weight entry, and last-performance hints
- Mobile swipe gestures for completed sets: right to duplicate, left to mark skipped; accessible buttons remain available
- Quick sessions without a plan for ad-hoc gym work
- Add/remove set, skip exercise, add unplanned exercise, finish, resume, and abandon flows
- Session snapshots so completed workouts do not change when plans are edited later
- Set corrections in live workouts and history with lightweight correction audit badges
- Finish check-in with session RPE, energy, and notes
- Workout history filtering, selected-detail review, PR events, volume, and quality-aware progression hints
- Stats for 1RM trends, 12-week consistency, exercise volume leaders, muscle-group volume, actionable volume recommendations, and recovery signals
- kg/lb display and logging support while storage remains kg-based
- Strong CSV import for appending completed workout history from Strong exports
- Optional guidance visibility for users who prefer a quieter interface
- Fitness-only JSON export/import/restore
- backup nudge after every 30 completed workouts, encouraging a local JSON export
- Safe starter reset and full local fitness data wipe with typed confirmation
- Automated no-telemetry/privacy audit in `reports/stingfit-privacy-network-audit.md`
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

See `reports/stingfit-privacy-network-audit.md` for the automated privacy/network audit.

## PWA / offline use

The web build includes `public/manifest.webmanifest`, StingFit icons, install shortcuts, screenshot assets, and `public/offline.html`. In production, `public/sw.js` caches the app shell and same-origin runtime assets so the app can reopen for offline training after the first successful load.

Install from the browser menu or Settings → `Inštalácia aplikácie`. On iOS, use Share → Add to Home Screen. The step-by-step install guide lives in [`docs/install.md`](./docs/install.md), and the production app exposes the same fallback at `/install.html`.

For real phone smoke testing, use the local production PWA preview helper instead of Expo Go or the Vite dev server:

```bash
npm run mobile:pwa:start
npm run mobile:pwa:url
npm run mobile:pwa:stop
```

`mobile:pwa:start` runs `npm run build`, serves the production bundle with `vite preview --host 0.0.0.0`, writes LAN URL candidates to `.tmp-stingfit-mobile-preview-url.txt`, and creates local QR assets in `public/stingfit-mobile-preview-qr.*`. It prefers the active adapter with an IPv4 gateway, uses the same service worker path as production, and no public tunnel.

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

Run a network-accessible development server when you need hot reload:

```bash
npm run dev -- --host 0.0.0.0
```

For mobile/PWA QA, prefer the production PWA preview command above because the service worker only registers in production mode.

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
npm run typecheck
npm run lint
npm run test:run
npm run build
```

## Release documentation

- `docs/landing/index.html` — static landing one-pager for the V2 PWA release path
- `reports/stingfit-v2-release-readiness.md` — V2 release-readiness handoff, public URL, blocked artifacts, and no-tag conditions
- `reports/stingfit-v1-release-checklist.md` — manual mobile/PWA QA checklist and known limitations
- `reports/stingfit-privacy-network-audit.md` — no-telemetry/no-cloud audit
- `public/screenshots/stingfit-training.svg` and `public/screenshots/stingfit-stats.svg` — PWA screenshot assets referenced by the manifest

## Notes for future releases

- The web/PWA build is the verified production path.
- The GitHub Pages URL is the intended public install path, but the release tag and Lighthouse gate remain pending until the live deployment is available.
- Desktop packaging should be treated as a future release track until the Tauri build is verified on a machine with Rust tooling.
- Internal database/storage keys remain stable to avoid accidental local data loss across upgrades.
