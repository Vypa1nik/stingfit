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
> 2. [`AGENT_START_HERE.md`](./AGENT_START_HERE.md) — current clean V3 handoff
> 3. [`STINGFIT_V3_PLAN.md`](./STINGFIT_V3_PLAN.md) — **the active rebuild plan**
> 4. [`PRODUCT.md`](./PRODUCT.md) — vision, personas, anti-goals
> 5. [`RULES.md`](./RULES.md) — engineering and product rules
>
> [`STINGFIT_V2_PLAN.md`](./STINGFIT_V2_PLAN.md) remains in the repo as
> historical context — V2 shipped and V3 builds on top. Use it to understand
> "why we got here," not to plan new work.
>
> Anything in [`docs/archive/`](./docs/archive/) is **archived** and must not
> influence implementation choices.

## Current V3 Rebuild

StingFit V3.0.1 is the current shipped release. It keeps every V2 feature
reachable while reshaping the app around Train, Progress, Plans, and Tools:
`/train`, `/progress/*`, `/plans/coach/*`, and `/tools/plates` are the canonical
app-owned routes, and old V2 URLs redirect with a one-release deprecation banner.

The V3.0.0 ship gate passed locally on 2026-05-17 with `npm run check`: lint,
the full Vitest suite, and the production build were green. V3.0.1 is a public
PWA cache/update patch that rotates the GitHub Pages service-worker cache and
nudges already-installed PWAs to reload after the new worker activates.
`STINGFIT_V3_PLAN.md` remains the current plan of record for the V3 scope and
shipped criteria, while `AGENT_START_HERE.md` records the latest handoff and
manual follow-ups.

## Historical V2 Release Readiness

StingFit V2.0 ships as a PWA-only release with the React + Vite PWA and local SQLite storage through `sql.js` persisted in IndexedDB as the verified production path. Coach Mode, Plan Packs, Recap Packs, the PWA install funnel, and the GitHub Pages deployment workflow are implemented; the owner accepted the remaining manual smoke concerns and desktop packaging remains a future track.

## Public install path

Live public PWA URL: `https://vypa1nik.github.io/stingfit/`.

GitHub Pages deployment is defined in `.github/workflows/deploy-pwa.yml`. It builds with `VITE_BASE_PATH=/stingfit/` and publishes the PWA from version tags (`v*`) or manual workflow dispatch. Deploy run `25764435187` completed successfully for V2, deploy run `26214491840` published the `v3.0.0` tag, and V3.0.1 is the patch tag used to force the public PWA cache/update refresh.

Desktop downloads: No verified desktop installers are published yet. The Tauri v2 scaffold is present, but Windows/macOS installer links stay omitted until the native toolchain blocker in `reports/stingfit-tauri-desktop-builds.md` is resolved and `npm run tauri:build` is verified on a machine with Rust, Cargo, rustup, and the required platform build tools.

## V2.1 Mobile App Track

After the PWA-only `v2.0.0` release, StingFit opens a separate V2.1 mobile packaging track with Capacitor. Android debug APK is the first native target; iOS builds are prepared as a handoff package and completed on a MacBook with Xcode/signing. The PWA remains the canonical public install path until native packages pass their own device smoke checks.

Capacitor uses the existing React/Vite app with `webDir: dist`, `appId: com.stingfit.app`, and `appName: StingFit`. Native wrappers must keep the same local-first privacy contract: no accounts, cloud sync, telemetry, analytics, subscriptions, payments, or paywalls.

```bash
npm run mobile:build
npm run cap:android:add
npm run cap:android:sync
npm run cap:android:apk
```

After the Android platform exists, `npm run cap:android:apk` runs the root-base web build, syncs Capacitor, and builds `android/app/build/outputs/apk/debug/app-debug.apk` with a writable Windows Gradle temp directory.

For iOS handoff packaging from Windows:

```powershell
npm run mobile:ios:handoff
```

See `reports/stingfit-mobile-capacitor-track.md` and `reports/stingfit-ios-capacitor-handoff.md` for the Android/iOS build plan and verification checklist.

## What works in V3

- Fitness-first shell with Train, Progress, Plans, Tools, Settings, and one-release redirects from old V2 URLs
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
- Progress hub with lifts, PRs, body measurements, journal, and pinned workout history
- Stats for 1RM trends, 12-week consistency, exercise volume leaders, muscle-group volume, actionable volume recommendations, and recovery signals
- kg/lb display and logging support while storage remains kg-based
- Strong CSV import for appending completed workout history from Strong exports
- Optional guidance visibility for users who prefer a quieter interface
- Fitness-only JSON export/import/restore including Progress body measurements and journal entries
- backup nudge after every 30 completed workouts, encouraging a local JSON export
- Safe starter reset and full local fitness data wipe with typed confirmation
- Automated no-telemetry/privacy audit in `reports/stingfit-privacy-network-audit.md`
- Full local-loop smoke coverage for train, finish, history, export, reset, and restore

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
- `docs/archive/reports/stingfit-v2-release-readiness.md` — archived V2 release-readiness handoff, public URL, accepted concerns, and release approval
- `docs/archive/reports/stingfit-v2.0.0-release-notes.md` — archived PWA-only release notes for `v2.0.0`
- `reports/stingfit-v3.0.1-public-pwa-cache-fix.md` — public GitHub Pages PWA cache/update incident report and verification evidence
- `reports/stingfit-v1-release-checklist.md` — manual mobile/PWA QA checklist and known limitations
- `reports/stingfit-privacy-network-audit.md` — no-telemetry/no-cloud audit
- `public/screenshots/stingfit-training.svg` and `public/screenshots/stingfit-stats.svg` — PWA screenshot assets referenced by the manifest

## Notes for future releases

- The web/PWA build is the verified production path.
- The GitHub Pages URL is live as the public install path, and Lighthouse passed against the live deployment for the V2.0 PWA-only release.
- Desktop packaging should be treated as a future release track until the Tauri build is verified on a machine with Rust tooling.
- Internal database/storage keys remain stable to avoid accidental local data loss across upgrades.
