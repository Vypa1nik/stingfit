# StingFit V2 Release Readiness

Status: READY_WITH_CONCERNS
Active release handoff for Phase 4 Module 4.
Date: 2026-05-12

## Summary

StingFit V2 is documented for a PWA-only public release path. The product remains local-first and private: no accounts, no cloud sync, no telemetry, no analytics, no subscription, and no paywall behavior were added for release distribution.

Live public PWA URL: https://vypa1nik.github.io/stingfit/

The GitHub Pages workflow builds the app with `VITE_BASE_PATH=/stingfit/`, uploads `dist`, and deploys from `v2*` tags or manual workflow dispatch. Manual deploy run `25764435187` completed successfully from commit `a307026`, and the PWA manifest, service worker, install page, offline fallback, and static assets are live under the `/stingfit/` project URL.

## Installable artifacts

- PWA: live at `https://vypa1nik.github.io/stingfit/` from GitHub Pages workflow deploy run `25764435187`.
- Local install guide: `docs/install.md`.
- Browser fallback guide: `/install.html` in the built PWA.
- Desktop downloads: No desktop download links are published. No `.msi`, `.dmg`, or desktop installer artifact is listed as available.

## Blocked or pending gates

- Lighthouse PWA Installable: PASS via Lighthouse 11.7.1 compatibility audit against the live GitHub Pages URL.
- Lighthouse Performance >= 85 mobile: PASS at 87 via Lighthouse 13.3.0 mobile audit against the live GitHub Pages URL.
- Lighthouse Accessibility >= 95: PASS at 100 via Lighthouse 13.3.0 mobile audit against the live GitHub Pages URL.
- Manual paired-device coach<->trainee smoke: pending or owner-accepted concern; automated repository rehearsal covers coach Plan Pack export -> fresh trainee import -> workout log -> trainee Recap Pack export -> coach read-only import in `tests/coach-handoff-flow.test.ts`.
- Phase 1 real-device mobile PWA smoke: blocked by missing physical iOS Safari and Android Chrome devices in this environment.
- Phase 2 screenshot audit: blocked by unavailable browser screenshot tooling in this environment.
- Desktop installers: blocked by missing Rust, Cargo, rustup, and platform build tools as documented in `reports/stingfit-tauri-desktop-builds.md`.

## No-tag rule

Do not tag `v2.0.0` until all of the following are true or explicitly accepted by the owner:

1. The GitHub Pages deployment is live at the expected public PWA URL. Completed 2026-05-12 via deploy run `25764435187`.
2. Lighthouse PWA, performance, and accessibility gates are run against the live URL. Completed 2026-05-12 with the results below.
3. The coach Plan Pack -> trainee import -> workout log -> trainee Recap Pack -> coach read-only preview smoke is completed on real devices, or the owner explicitly accepts the release concern.
4. Desktop downloads are either verified and linked, or release notes explicitly state that V2 is PWA-only.
5. `npm run check`, the bundle budget, and whitespace checks pass on the release candidate.

## Post-deploy smoke — 2026-05-12

- `https://vypa1nik.github.io/stingfit/` returned HTTP 200 after deploy run `25764435187`.
- Manual deploy run `25764435187` completed successfully from commit `a307026`; build and deploy jobs were both green.
- `index.html` referenced the manifest, JavaScript, and CSS assets under `/stingfit/`; fetched `/stingfit/assets/...` JS/CSS assets returned HTTP 200.
- `/stingfit/manifest.webmanifest`, `/stingfit/sw.js`, and `/stingfit/install.html` returned HTTP 200. The manifest keeps `start_url: "./#/training"` and `scope: "./"`; the install guide links back to `./#/training`.
- Playwright browser smoke opened the live URL, confirmed the page title `StingFit`, and rendered `/#/training` with Slovak onboarding/training content.
- No runtime/deploy blocker was found during this smoke pass.

## Lighthouse gates — 2026-05-12

- Lighthouse 13.3.0 mobile audit against `https://vypa1nik.github.io/stingfit/`: Performance 87, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse 11.7.1 compatibility audit against the same live URL: PWA 100, installable manifest audit PASS, Performance 87, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse CLI wrote valid JSON reports but returned exit 1 after report generation because Chrome launcher could not remove a temporary Windows profile directory (`EPERM`). The parsed reports had no runtime audit errors.

## Coach handoff rehearsal — 2026-05-12

- `tests/coach-handoff-flow.test.ts` covers the V2 thesis as one local automated flow: coach exports `.stfplan`, a fresh trainee profile imports and commits it, the trainee starts/logs/finishes the first workout, exports `.stfrecap`, and a fresh coach profile imports that recap read-only.
- Result: PASS - targeted test passed, and the full local suite passed with 112 files / 281 tests.
- This reduces release risk but does not replace the real paired-device timing smoke required by the no-tag rule.

## Release docs covered

- `README.md` states the V2 product positioning, live public install URL, GitHub Pages deployment path, and desktop download blocker.
- `CHANGELOG.md` includes `## v2.0.0 - Pending release` with Phase 0-4 coverage and blocked release verification.
- `STINGFIT_V2_PLAN.md` marks Phase 4 Module 4 as `READY_WITH_CONCERNS` and keeps the release tag pending.
- `reports/stingfit-phase-4-exit-audit.md` records the Phase 4 distribution exit status as `DONE_WITH_CONCERNS` and repeats the no-tag rule.
