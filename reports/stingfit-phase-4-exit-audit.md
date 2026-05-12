# StingFit Phase 4 exit audit

Date: 2026-05-12
Status: DONE_WITH_CONCERNS
Target: V2 Phase 4 — Distribution

## Scope

This checkpoint audits the active Phase 4 distribution state after the PWA install funnel, Tauri build readiness check, GitHub Pages hosting setup, release docs, and static landing one-pager. It uses only active project documentation and reports: `STINGFIT_V2_PLAN.md`, `README.md`, `CHANGELOG.md`, `docs/install.md`, `docs/landing/index.html`, `reports/stingfit-v2-release-readiness.md`, `reports/stingfit-tauri-desktop-builds.md`, `reports/stingfit-mobile-pwa-smoke.md`, `reports/stingfit-phase-3-exit-audit.md`, and `reports/stingfit-privacy-network-audit.md`.

No `docs/archive/` material was used for this audit.

## Phase 4 module status

| Module               | Status              | Evidence                                                                                                                                                                               |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PWA install funnel   | Done                | `docs/install.md`, `public/install.html`, manifest/offline/service-worker assets, Settings install guidance, and PWA asset tests cover the install path.                               |
| Tauri desktop builds | Blocked             | `reports/stingfit-tauri-desktop-builds.md` documents missing Rust, Cargo, rustup, and Visual Studio Build Tools with MSVC/Windows SDK components.                                      |
| Public hosting       | Live                | Deploy run `25759756360` completed successfully. `https://vypa1nik.github.io/stingfit/` serves the PWA with `/stingfit/` assets from GitHub Pages.                              |
| Release docs         | Ready with concerns | `README.md`, `CHANGELOG.md`, `STINGFIT_V2_PLAN.md`, and `reports/stingfit-v2-release-readiness.md` describe the live PWA-only release path, omitted desktop downloads, and no-tag blockers. |
| Landing one-pager    | Ready               | `docs/landing/index.html` presents the PWA install CTA, coach handoff story, screenshots, privacy FAQ, and disabled desktop pending actions.                                           |

## Automated verification completed

Latest verified Phase 4 gates in this workspace:

```bash
npx vitest run tests/fitness-pwa-assets.test.ts tests/fitness-public-hosting.test.ts tests/fitness-landing-page.test.ts tests/fitness-phase-4-exit-audit.test.ts --reporter=verbose
```

Result: PASS — 4 files / 14 tests passed, including service-worker navigation cache regressions for the install guide and app shell.

```bash
npm run check
```

Result: PASS — lint clean, 111 test files / 280 tests passed, production build OK.

```bash
node ./tools/bundle-budget.mjs
```

Result: PASS — main entry remains within the 250 KB gzip budget at 107.89 KB gzip; only >200 KB gzip asset remains `assets/sql-wasm-UFUCzYNW.wasm` at 323.01 KB gzip.

```bash
git diff --check
git diff --cached --check
```

Result: PASS — no whitespace errors in unstaged or staged diffs.

Post-deploy smoke on 2026-05-12 confirmed `https://vypa1nik.github.io/stingfit/` returned HTTP 200, loaded JS/CSS assets from `/stingfit/assets/`, served `manifest.webmanifest`, `sw.js`, and `install.html`, and rendered landing, Training, Plans, and Settings beyond the loading state in headless Chrome/CDP.

GitHub CI run `25761064831` is green for the pushed post-deploy smoke commit: lint, test, and build completed successfully.

## Acceptance status

| Phase 4 acceptance item                                                  | Status                              | Notes                                                                                                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anyone with the link can install StingFit on a phone in under 60 seconds | Live; real-phone install pending    | The GitHub Pages PWA is live at `https://vypa1nik.github.io/stingfit/`, and headless Chrome smoke reached landing, Training, Plans, and Settings beyond the loading state. Real iOS Safari and Android Chrome install smoke still requires physical devices. |
| Install is signed and trustworthy                                        | Partial                             | HTTPS is live via GitHub Pages. Native desktop signing is not verified because desktop installers remain blocked.                                                      |
| Lighthouse PWA Installable                                               | Pending                             | The live URL is available, but Lighthouse CLI is not available in this agent environment; no Lighthouse score is claimed.                                               |
| Lighthouse Performance >= 85 mobile                                      | Pending                             | The live URL is available, but Lighthouse CLI is not available in this agent environment; no Lighthouse score is claimed.                                               |
| Lighthouse Accessibility >= 95                                           | Pending                             | The live URL is available, but Lighthouse CLI is not available in this agent environment; no Lighthouse score is claimed.                                               |
| Release page lists installable artifacts                                 | Partial                             | The landing page lists the PWA install path and deliberately marks `.msi`/`.dmg` as `Desktop pending` instead of linking unverified downloads.                         |
| `v2.0.0` tag exists                                                      | Not done                            | Do not create `v2.0.0` until the owner approves or resolves the remaining concerns.                                                                                     |

## Open concerns before a release tag

1. **Lighthouse gates remain pending.** PWA Installable, mobile Performance >= 85, and Accessibility >= 95 cannot be claimed until Lighthouse runs against the live Pages URL. In this agent environment, `Get-Command lighthouse` found no installed CLI, and `npx --yes lighthouse --version` failed with exit 1: `'lighthouse' is not recognized as an internal or external command, operable program or batch file.`
2. **Manual paired-device Coach Mode smoke remains outstanding.** Phase 3 automated tests cover `.stfplan` and `.stfrecap`; real coach device -> trainee device -> coach preview timing has not been completed in this environment.
3. **Phase 1 real-device PWA smoke remains blocked.** `reports/stingfit-mobile-pwa-smoke.md` documents missing physical iOS Safari and Android Chrome devices.
4. **Phase 2 screenshot audit remains a documented concern.** `reports/stingfit-empty-state-audit.md` records the blocked screenshot capture environment.
5. **Tauri desktop installers remain blocked.** `reports/stingfit-tauri-desktop-builds.md` documents missing native build tooling. No desktop download links should be published until this is resolved.

## Recommended next step

1. Run Lighthouse and real phone PWA install smoke against `https://vypa1nik.github.io/stingfit/` on a release machine with the required browser tooling and physical devices.
2. Complete or owner-accept the paired-device coach Plan Pack -> trainee import -> workout log -> Recap Pack -> coach preview smoke.
3. Either resolve desktop installers or explicitly release V2 as PWA-only.
4. Only then ask the owner whether to create `v2.0.0`.

Do not create `v2.0.0` from this audit alone.
