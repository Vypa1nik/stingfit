# StingFit V3.0.0 Release Smoke

Date: 2026-05-21
Target: local production PWA preview from `npm run mobile:pwa:start`, plus current public GitHub Pages observation at `https://vypa1nik.github.io/stingfit/`
Status: LOCAL PRODUCTION PREVIEW PASS; PUBLIC DEPLOYMENT STALE/PENDING V3 PUSH; MANUAL DEVICE SMOKE PENDING

## Summary

The V3.0.0 local production preview builds and serves the app shell, canonical V3 routes, legacy V2 hash entrypoints, manifest, offline/install pages, icons, screenshots, and built JS/CSS assets. The currently published GitHub Pages deployment is still the pre-V3 build: its manifest uses `./#/training`, `./#/quick`, and `./#/history`, so public production verification must be repeated after the V3 commit/tag/deploy.

No commit, tag, or push was performed during this smoke pass.

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

## Public GitHub Pages observation

Fetched with browser-grade HTTP from:

- `https://vypa1nik.github.io/stingfit/`
- `https://vypa1nik.github.io/stingfit/manifest.webmanifest`
- `https://vypa1nik.github.io/stingfit/offline.html`

Result: public root and assets are reachable, but the public manifest is still from the pre-V3 deployment:

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

Conclusion: public production smoke is DEPLOYMENT STALE, not a local V3 runtime failure. Repeat public smoke after the V3 release candidate is committed, pushed, tagged, and GitHub Pages deploys the new artifact.

## Browser/device limitations

No browser automation MCP server was registered in this environment (`MCP: 0/0 servers, 0 tools`). Local command discovery for `msedge`, `chrome`, `chromium`, `firefox`, and `playwright` returned no usable command, so this smoke pass could not execute JavaScript in a real browser.

JavaScript-level route redirect behavior and the redirect-deprecation banner are covered by Vitest (`tests/fitness-redirect-deprecation-banner.test.tsx`) and the latest full `npm run check`, but still need a real browser/device pass after deployment.

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

After V3 is deployed publicly:

- [ ] Open the public PWA root and confirm the manifest uses `./#/train`.
- [ ] Open `/#/train`, `/#/train/quick`, `/#/progress/lifts`, `/#/progress/body`, `/#/progress/journal`, `/#/progress/history`, `/#/tools/plates`, and `/#/settings` in a real browser.
- [ ] Open legacy `/#/stats`, `/#/history`, `/#/plates`, and `/#/coach/clients`; confirm canonical landing route plus one-release redirect banner.
- [ ] Install/Add to Home Screen on iOS Safari and Android Chrome.
- [ ] Reopen installed PWA and confirm it lands on Train.
- [ ] Run one quick workout, finish it, and add an optional journal note.
- [ ] Disconnect network after first load and confirm offline app shell/fallback behavior.

## Decision

Local V3.0.0 production preview is accepted for release-candidate staging. Public V3 production smoke remains blocked until push/tag/deploy. Manual physical device smoke remains open.
