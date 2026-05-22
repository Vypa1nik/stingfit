# StingFit V3.0.1 Public PWA Cache Fix

Status: Active post-release report
Date: 2026-05-22
Target: `https://vypa1nik.github.io/stingfit/`

## Symptom

The GitHub Pages deploy was green, but the public installed PWA could still show the old V2 behavior/UI. The investigation treated this as a fresh production bug, not as a completed release.

## Reality checks

Local repo state before the fix:

- `git status -sb` was clean against `origin/main`.
- `package.json`, `package-lock.json`, `src/lib/constants.ts`, and Tauri metadata already reported `3.0.0`.
- Local code contained V3 routes and UI: `/train`, `/progress/*`, `/plans/coach/*`, `/tools/plates`, grouped desktop navigation, five-tile mobile nav, More sheet, and V2 redirect banners.
- Local focused tests confirmed the V3 navigation and public-hosting contracts.

Public GitHub Pages state before the fix:

- Cache-busted public HTML served V3 assets, including a V3 main bundle and Progress chunks.
- Public manifest already used `id: "./#/train"`, `start_url: "./#/train"`, and `scope: "./"`.
- Public `sw.js` still contained `const CACHE_VERSION = "stingfit-v2-github-pages";`.
- Client registration in `src/main.tsx` was passive and did not call `registration.update()` or reload an already-controlled PWA after a new controller activated.

## Root cause

The public server could serve V3, but installed or long-lived PWA clients could remain controlled by old cache behavior because the service-worker cache namespace still used the V2 release key and the client did not actively ask for a service-worker update.

## Fix

Release `3.0.1` changed the service-worker and client update path:

- `public/sw.js` now uses `stingfit-v3.0.1-github-pages`.
- `src/main.tsx` detects whether the page was already service-worker controlled before registration.
- Already-controlled PWA clients call `registration.update()` on load.
- Already-controlled PWA clients reload once after `controllerchange` so the new shell takes over.
- First-time visitors are not force-reloaded.

Release metadata was bumped to `3.0.1` in `package.json`, `package-lock.json`, `src/lib/constants.ts`, and `src-tauri/tauri.conf.json`.

## Verification

Local verification:

```text
npm run test:run -- tests/fitness-pwa-assets.test.ts tests/fitness-public-hosting.test.ts tests/fitness-release-identity.test.ts
```

Result: 3 test files, 17 tests passed.

```text
npm run test:run -- tests/fitness-release-docs.test.ts
```

Result: 1 test file, 2 tests passed.

```text
npm run check
```

Result: lint passed, 116 test files passed, 300 tests passed, production build passed.

Public deploy verification:

- Commit: `173949907f172c308fc6548a0c1f542e00414972`
- Tag: `v3.0.1`
- GitHub Pages workflow: `26273148755`
- Workflow URL: `https://github.com/Vypa1nik/stingfit/actions/runs/26273148755`
- Workflow result: completed success

Cache-busted public URL checks after deploy:

- `https://vypa1nik.github.io/stingfit/?v=3.0.1-...` served main JS `/stingfit/assets/index-Bp1YSjxj.js`.
- `https://vypa1nik.github.io/stingfit/sw.js?v=3.0.1-...` served `const CACHE_VERSION = "stingfit-v3.0.1-github-pages";`.
- `https://vypa1nik.github.io/stingfit/manifest.webmanifest?v=3.0.1-...` served `id`, `start_url`, and `scope` for `./#/train` / `./`.

Headless Chrome/CDP public smoke after deploy:

- URL: `https://vypa1nik.github.io/stingfit/?v=3.0.1-cdp#/train`
- Script source: `https://vypa1nik.github.io/stingfit/assets/index-Bp1YSjxj.js`
- Service worker controller: `https://vypa1nik.github.io/stingfit/sw.js`
- Rendered V3 desktop navigation: Tréning, Progres, Cviky, PR Timeline, Telo, Zápisník, Plány, Nástroje, Kalkulačka kotúčov.
- Rendered V3 mobile nav labels: Tréning, Progres, + Tréning, Plány, Viac.

## Follow-ups

- Full installed-PWA/stateful gym-flow smoke remains a physical-device follow-up, especially iOS Safari Add to Home Screen behavior.
- Desktop installers remain unpublished until the Tauri Rust/MSVC toolchain is verified.
