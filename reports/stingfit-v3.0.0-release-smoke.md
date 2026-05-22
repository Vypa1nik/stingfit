# StingFit V3.0.0 Release Smoke

Date: 2026-05-22
Target: local production PWA preview from `npm run mobile:pwa:start`, plus current public GitHub Pages observation at `https://vypa1nik.github.io/stingfit/`
Status: LOCAL PRODUCTION PREVIEW PASS; PUBLIC V3.0.1 DEPLOYMENT VERIFIED; MANUAL DEVICE SMOKE PENDING

## Summary

The V3.0.0 local production preview built and served the app shell, canonical V3 routes, legacy V2 hash entrypoints, manifest, offline/install pages, icons, screenshots, and built JS/CSS assets. The original 2026-05-21 public GitHub Pages observation was stale because the public manifest still used `./#/training`, `./#/quick`, and `./#/history` before the V3 release push.

That stale public observation is now superseded by V3.0.1: tag `v3.0.1` deployed successfully through GitHub Pages workflow `26273148755`, and the public PWA cache/update verification is recorded in `reports/stingfit-v3.0.1-public-pwa-cache-fix.md`.

No commit, tag, or push was performed during the original local V3.0.0 smoke pass.

## Commands run

The first preview start attempt failed before build because the reduced Windows wrapper `PATH` did not include PowerShell:

```bash
/c/Windows/System32/cmd.exe //d //c "set PATH=C:\Program Files\nodejs;C:\Windows\System32;C:\Windows;%PATH%&& cd /d C:\Users\kiko\Documents\New project\localflow && npm run mobile:pwa:start"
```

Result:

```text
'powershell' is not recognized as an internal or external command,
operable program or batch file.
```

The corrected command added `C:\Windows\System32\WindowsPowerShell\v1.0` to `PATH`:

```bash
/c/Windows/System32/cmd.exe //d //c "set PATH=C:\Program Files\nodejs;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Windows\System32;C:\Windows;%PATH%&& cd /d C:\Users\kiko\Documents\New project\localflow && npm run mobile:pwa:start"
```

Result: PASS. The script ran `npm run build`, Vite built 1942 modules, and production preview started on port `4173`.

Preview URLs generated:

```text
http://192.168.100.32:4173/#/train
http://192.168.56.1:4173/#/train
http://100.114.215.114:4173/#/train
```

Local smoke probes used `http://127.0.0.1:4173`.

## Local production preview checks

| Check | Result | Evidence |
| --- | --- | --- |
| `/` returns production app shell | Pass | HTTP 200, contains `StingFit` and built `/assets/index-*` reference |
| `/#/train` returns app shell | Pass | HTTP 200 |
| `/#/train/quick` returns app shell | Pass | HTTP 200 |
| `/#/progress/lifts` returns app shell | Pass | HTTP 200 |
| `/#/progress/body` returns app shell | Pass | HTTP 200 |
| `/#/progress/journal` returns app shell | Pass | HTTP 200 |
| `/#/progress/history` returns app shell | Pass | HTTP 200 |
| `/#/tools/plates` returns app shell | Pass | HTTP 200 |
| `/#/settings` returns app shell | Pass | HTTP 200 |
| legacy `/#/stats` returns app shell | Pass | HTTP 200 |
| legacy `/#/coach/clients` returns app shell | Pass | HTTP 200 |
| `/manifest.webmanifest` served and parses as JSON | Pass | `name=StingFit`, `id=./#/train`, `start_url=./#/train`, `display=standalone` |
| Manifest shortcuts use V3 routes | Pass | includes `./#/train`, `./#/train/quick`, `./#/progress/history` |
| `/sw.js` served | Pass | HTTP 200 |
| `/offline.html` served | Pass | HTTP 200 |
| `/install.html` served | Pass | HTTP 200 |
| `/stingfit-icon.svg` served | Pass | HTTP 200 |
| `/icon-192.png` served | Pass | HTTP 200 |
| `/icon-512.png` served | Pass | HTTP 200 |
| `/screenshots/stingfit-training.svg` served | Pass | HTTP 200 |
| `/screenshots/stingfit-stats.svg` served | Pass | HTTP 200 |
| `install.html` links to canonical Train route | Pass | contains `./#/train` |
| `offline.html` links to canonical Train route | Pass | contains `./#/train` |
| built JS asset from `index.html` served | Pass | `/assets/index-zrdlq9hx.js`, HTTP 200 |
| built CSS asset from `index.html` served | Pass | `/assets/index-BTO7n7Za.css`, HTTP 200 |

Automated local smoke summary:

```text
SMOKE_PASS count=24
```

## Preview cleanup

Stopped the preview with:

```bash
npm run mobile:pwa:stop
```

Result:

```text
StingFit mobile PWA preview process 27364 was not running.
```

The preview PID and URL files were removed after the stop command. The generated QR assets and `.tmp-stingfit-mobile-preview.*` logs remain ignored scratch artifacts and were not added to git status.

## Original public GitHub Pages observation before V3 deploy

Fetched with browser-grade HTTP from:

- `https://vypa1nik.github.io/stingfit/`
- `https://vypa1nik.github.io/stingfit/manifest.webmanifest`
- `https://vypa1nik.github.io/stingfit/offline.html`

Historical 2026-05-21 result: public root and assets were reachable, but the public manifest was still from the pre-V3 deployment before the V3.0.1 release:

```json
{
  "id": "./#/training",
  "start_url": "./#/training",
  "shortcuts": [
    { "url": "./#/training" },
    { "url": "./#/quick" },
    { "url": "./#/history" }
  ]
}
```

Historical conclusion from 2026-05-21: public production smoke was DEPLOYMENT STALE, not a local V3 runtime failure.

Current conclusion after V3.0.1: public production smoke has been repeated and passed. The public app serves the V3.0.1 service-worker cache namespace `stingfit-v3.0.1-github-pages`, renders the V3 Train / Progress / Plans / Tools navigation, and is documented in `reports/stingfit-v3.0.1-public-pwa-cache-fix.md` and `reports/stingfit-mobile-pwa-smoke.md`.

## Browser/device limitations

No browser automation MCP server was registered in this environment (`MCP: 0/0 servers, 0 tools`). Local command discovery for `msedge`, `chrome`, `chromium`, `firefox`, and `playwright` returned no usable command, so this smoke pass could not execute JavaScript in a real browser.

JavaScript-level route redirect behavior and the redirect-deprecation banner are covered by Vitest (`tests/fitness-redirect-deprecation-banner.test.tsx`) and the latest full `npm run check`. Public deployed browser smoke passed after V3.0.1; physical installed-PWA lifecycle checks remain open.

## Git hygiene notes

Read-only git hygiene audit found the release candidate is broad but expected for V3. Recommended commit grouping:

1. `feat(v3-app): complete StingFit V3 app rebuild` — routes, nav, Progress, migrations, body/journal, redirects.
2. `test(v3): cover V3 routes progress and release behavior` — updated and new tests.
3. `docs(v3): document V3 plan handoff and smoke evidence` — plan, start-here, README, changelog, reports.
4. `chore(release-3.0.0): update package and PWA metadata` — package files, Tauri metadata, public canonical links, preview tool.
5. `chore(archive): move V2 release reports to archive` — V2 release docs under `docs/archive/reports/`.

Hygiene review points before staging:

- turn `reports/stingfit-v2.0.0-release-notes.md` + `docs/archive/reports/stingfit-v2.0.0-release-notes.md` into a clean staged rename;
- confirm `STINGFIT_V2_PLAN.md` edits are archival/status-only and not active backlog changes;
- review CRLF/LF warnings before final staging;
- scratch `.tmp-stingfit-*` preview logs/PID files are ignored and should not be staged.

## Manual follow-up checklist

After V3.0.1 deployment, the public root, manifest, service-worker cache namespace, V3 navigation, and route shell were verified by cache-busted fetches, headless Chrome/CDP, and Android Chrome ADB/CDP smoke. Physical installed-PWA/stateful checks remain:

- [ ] Open `/#/train`, `/#/train/quick`, `/#/progress/lifts`, `/#/progress/body`, `/#/progress/journal`, `/#/progress/history`, `/#/tools/plates`, and `/#/settings` on physical iOS Safari and Android Chrome.
- [ ] Open legacy `/#/stats`, `/#/history`, `/#/plates`, and `/#/coach/clients`; confirm canonical landing route plus one-release redirect banner on physical devices.
- [ ] Install/Add to Home Screen on iOS Safari and Android Chrome.
- [ ] Reopen installed PWA and confirm it lands on Train.
- [ ] Run one quick workout, finish it, and add an optional journal note.
- [ ] Disconnect network after first load and confirm offline app shell/fallback behavior.

## Decision

Local V3.0.0 production preview is accepted as release-candidate evidence. Public V3.0.1 production smoke is accepted in the follow-up reports. Manual physical installed-PWA/stateful device smoke remains open.
