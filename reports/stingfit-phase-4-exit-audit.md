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
| Public hosting       | Ready               | `.github/workflows/deploy-pwa.yml` builds with `VITE_BASE_PATH=/stingfit/`, uploads `dist`, and deploys to GitHub Pages from `v2*` tags or manual dispatch.                            |
| Release docs         | Ready with concerns | `README.md`, `CHANGELOG.md`, `STINGFIT_V2_PLAN.md`, and `reports/stingfit-v2-release-readiness.md` describe the PWA-only release path, omitted desktop downloads, and no-tag blockers. |
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

## Acceptance status

| Phase 4 acceptance item                                                  | Status                    | Notes                                                                                                                                                                                          |
| ------------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anyone with the link can install StingFit on a phone in under 60 seconds | Ready for live validation | PWA install docs, manifest, service worker, GitHub Pages workflow, and `/stingfit/` base path are implemented. The live URL has not been deployed and tested from a phone in this environment. |
| Install is signed and trustworthy                                        | Partial                   | HTTPS is expected via GitHub Pages. Native desktop signing is not verified because desktop installers remain blocked.                                                                          |
| Lighthouse PWA Installable                                               | Pending                   | Lighthouse gates remain pending until the GitHub Pages deployment is live.                                                                                                                     |
| Lighthouse Performance >= 85 mobile                                      | Pending                   | Lighthouse gates remain pending until the GitHub Pages deployment is live.                                                                                                                     |
| Lighthouse Accessibility >= 95                                           | Pending                   | Lighthouse gates remain pending until the GitHub Pages deployment is live.                                                                                                                     |
| Release page lists installable artifacts                                 | Partial                   | The landing page lists the PWA install path and deliberately marks `.msi`/`.dmg` as `Desktop pending` instead of linking unverified downloads.                                                 |
| `v2.0.0` tag exists                                                      | Not done                  | Do not create `v2.0.0` until the owner approves the remaining concerns and the live URL is validated.                                                                                          |

## Open concerns before a release tag

1. **GitHub Pages deployment has not been observed live.** The workflow and base-path build are implemented, but the public URL still needs a real deployment and phone install smoke.
2. **Lighthouse gates remain pending.** PWA Installable, mobile Performance >= 85, and Accessibility >= 95 cannot be claimed until Lighthouse runs against the live Pages URL.
3. **Manual paired-device Coach Mode smoke remains outstanding.** Phase 3 automated tests cover `.stfplan` and `.stfrecap`; real coach device -> trainee device -> coach preview timing has not been completed in this environment.
4. **Phase 1 real-device PWA smoke remains blocked.** `reports/stingfit-mobile-pwa-smoke.md` documents missing physical iOS Safari and Android Chrome devices.
5. **Phase 2 screenshot audit remains a documented concern.** `reports/stingfit-empty-state-audit.md` records the blocked screenshot capture environment.
6. **Tauri desktop installers remain blocked.** `reports/stingfit-tauri-desktop-builds.md` documents missing native build tooling. No desktop download links should be published until this is resolved.
7. **The working tree contains intentional uncommitted Phase 4 work.** No phase tag or release tag should be created from this state until the owner explicitly asks for staging/commit/tag work.

## Recommended next step

1. Stage and commit Phase 4 Modules 3-5 plus this exit audit as a coherent distribution checkpoint if the owner wants git hygiene now.
2. Trigger the GitHub Pages workflow from a controlled tag or manual dispatch only after commit review.
3. Run Lighthouse and real phone PWA install smoke against `https://vypa1nik.github.io/stingfit/`.
4. Either resolve desktop installers or explicitly release V2 as PWA-only.
5. Only then ask the owner whether to create `v2.0.0`.

Do not create `v2.0.0` from this audit alone.
