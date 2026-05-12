# StingFit Phase 4 exit audit

Date: 2026-05-12
Status: DONE_WITH_ACCEPTED_CONCERNS
Target: V2 Phase 4 — Distribution

## Scope

This checkpoint audits the active Phase 4 distribution state after the PWA install funnel, Tauri build readiness check, GitHub Pages hosting setup, release docs, and static landing one-pager. It uses only active project documentation and reports: `STINGFIT_V2_PLAN.md`, `README.md`, `CHANGELOG.md`, `docs/install.md`, `docs/landing/index.html`, `reports/stingfit-v2-release-readiness.md`, `reports/stingfit-tauri-desktop-builds.md`, `reports/stingfit-mobile-pwa-smoke.md`, `reports/stingfit-phase-3-exit-audit.md`, and `reports/stingfit-privacy-network-audit.md`.

No `docs/archive/` material was used for this audit.

## Phase 4 module status

| Module               | Status              | Evidence                                                                                                                                                                                    |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PWA install funnel   | Done                | `docs/install.md`, `public/install.html`, manifest/offline/service-worker assets, Settings install guidance, and PWA asset tests cover the install path.                                    |
| Tauri desktop builds | Blocked             | `reports/stingfit-tauri-desktop-builds.md` documents missing Rust, Cargo, rustup, and Visual Studio Build Tools with MSVC/Windows SDK components.                                           |
| Public hosting       | Live                | Deploy run `25764435187` completed successfully from commit `a307026`. `https://vypa1nik.github.io/stingfit/` serves the PWA with `/stingfit/` assets from GitHub Pages.                    |
| Release docs         | Approved with accepted concerns | `README.md`, `CHANGELOG.md`, `STINGFIT_V2_PLAN.md`, and `reports/stingfit-v2-release-readiness.md` describe the live PWA-only release path, omitted desktop downloads, owner-accepted concerns, and release-tag approval. |
| Landing one-pager    | Ready               | `docs/landing/index.html` presents the PWA install CTA, coach handoff story, screenshots, privacy FAQ, and disabled desktop pending actions.                                                |

## Automated verification completed

Latest verified Phase 4 gates in this workspace:

```bash
npx vitest run tests/fitness-pwa-assets.test.ts tests/fitness-public-hosting.test.ts tests/fitness-landing-page.test.ts tests/fitness-phase-4-exit-audit.test.ts --reporter=verbose
```

Result: PASS - 4 files / 14 tests passed, including service-worker navigation cache regressions for the install guide and app shell.

```bash
npm run check
```

Result: Covered by the local split gate below and by green GitHub CI/deploy workflow steps for lint, test, and build.

```bash
npx vitest run --reporter=verbose --testTimeout=30000 --hookTimeout=30000
```

Result: PASS - full local suite passed as 112 test files / 281 tests passed.

```bash
npm run lint
npm run build
node ./tools/bundle-budget.mjs
```

Result: PASS - lint clean, production build OK, and main entry remains within the 250 KB gzip budget at 107.89 KB gzip; only >200 KB gzip asset remains `assets/sql-wasm-UFUCzYNW.wasm` at 323.01 KB gzip.

```bash
git diff --check
```

Result: PASS - no whitespace errors in the working tree diff.

Post-deploy smoke on 2026-05-12 confirmed `https://vypa1nik.github.io/stingfit/` returned HTTP 200 after deploy run `25764435187`, loaded JS/CSS assets from `/stingfit/assets/`, served `manifest.webmanifest` and `sw.js`, and rendered the live app beyond the loading state in Playwright at `/#/training`.

GitHub CI run `25763832286` is green for pushed commit `a307026`: lint, test, and build completed successfully. Deploy run `25764435187` is green: lint, test, build, bundle budget, Pages upload, and deploy completed successfully.

Lighthouse verification on 2026-05-12:

- Lighthouse 13.3.0 mobile audit: Performance 87, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse 11.7.1 compatibility audit: PWA 100, installable manifest PASS, Performance 87, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse CLI returned exit 1 after writing valid JSON reports because Chrome launcher could not remove a temporary Windows profile directory (`EPERM`); the parsed reports had no runtime audit errors.

## Acceptance status

| Phase 4 acceptance item                                                  | Status                           | Notes                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anyone with the link can install StingFit on a phone in under 60 seconds | Live; real-phone install accepted as follow-up | The GitHub Pages PWA is live at `https://vypa1nik.github.io/stingfit/`, and Playwright smoke reached Training beyond the loading state. Real iOS Safari and Android Chrome install smoke remains a documented follow-up.                                   |
| Install is signed and trustworthy                                        | Partial                          | HTTPS is live via GitHub Pages. Native desktop signing is not verified because desktop installers remain blocked.                                                                                                                                            |
| Lighthouse PWA Installable                                               | Pass                             | Lighthouse 11.7.1 compatibility audit returned PWA 100 and installable manifest PASS against the live GitHub Pages URL.                                                                                                                                     |
| Lighthouse Performance >= 85 mobile                                      | Pass                             | Lighthouse 13.3.0 mobile audit returned Performance 87 against the live GitHub Pages URL.                                                                                                                                                                    |
| Lighthouse Accessibility >= 95                                           | Pass                             | Lighthouse 13.3.0 mobile audit returned Accessibility 100 against the live GitHub Pages URL.                                                                                                                                                                 |
| Release page lists installable artifacts                                 | Partial                          | The landing page lists the PWA install path and deliberately marks `.msi`/`.dmg` as `Desktop pending` instead of linking unverified downloads.                                                                                                               |
| `v2.0.0` tag exists                                                      | Approved                         | The owner approved the V2.0 PWA-only release and accepted the remaining manual concerns on 2026-05-12.                                                                                                                                                      |

## Accepted concerns for V2.0

1. **Manual paired-device Coach Mode smoke is accepted as a documented concern.** `tests/coach-handoff-flow.test.ts` covers coach `.stfplan` export -> fresh trainee import -> workout log -> trainee `.stfrecap` export -> coach read-only import as one automated rehearsal. Real coach device -> trainee device -> coach preview timing remains a post-release follow-up.
2. **Phase 1 real-device PWA smoke is accepted as a documented follow-up.** `reports/stingfit-mobile-pwa-smoke.md` documents missing physical iOS Safari and Android Chrome devices in this environment.
3. **Phase 2 screenshot audit is accepted as a documented follow-up.** `reports/stingfit-empty-state-audit.md` records the blocked screenshot capture environment.
4. **Tauri desktop installers remain a future release track.** `reports/stingfit-tauri-desktop-builds.md` documents missing native build tooling. No desktop download links are published for V2.0.

## Recommended next step

1. Create the `v2.0.0` tag from the verified release commit after final local checks.
2. Push the tag and verify the tag-triggered GitHub Pages workflow remains green.
3. Publish release notes that list the PWA URL as the installable artifact and explicitly omit desktop installer downloads.

V2.0 is approved as a PWA-only release with accepted concerns.
