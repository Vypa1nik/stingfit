# StingFit install guide

Status: Active
Last updated: 2026-05-10
Scope: Phase 4 PWA install funnel

This guide shows how to install StingFit as a private, local-first PWA on a phone or laptop. StingFit remains local after install: **Bez účtu, cloudu a telemetrie**. Training data stays in this browser profile unless you explicitly export a backup, Plan Pack, or Recap Pack file.

## Before you install

1. Open the production StingFit URL in the target browser. The GitHub Pages project URL is expected to be `https://vypa1nik.github.io/stingfit/` after the deploy workflow runs from a release tag.
2. Wait for the app shell to load once while online.
3. Open Settings -> Inštalácia aplikácie if you want the in-app install prompt.
4. If the prompt is not available, use the browser-specific steps below.

## iOS Safari

1. Open the StingFit URL in Safari. iOS PWA install is Safari-only.
2. Tap the Share button.
3. Choose **Add to Home Screen**.
4. Keep the name **StingFit** and tap **Add**.
5. Launch StingFit from the Home Screen icon before going offline.

Expected result: StingFit opens in a standalone window and can reopen the cached training shell after the first successful load.

## Android Chrome

1. Open the StingFit URL in Chrome.
2. If Chrome shows an install banner, tap **Install**.
3. If no banner appears, open the three-dot menu and choose **Install app** or **Add to Home screen**.
4. Confirm the install.
5. Launch StingFit from the app icon before going offline.

Expected result: StingFit appears with the app name and icon, starts at Training, and keeps the offline shell available after first load.

## desktop Chrome/Edge

1. Open the StingFit URL in Chrome or Edge.
2. Use the install icon in the address bar, or open the browser menu and choose **Install StingFit** / **Apps -> Install this site as an app**.
3. Confirm the install.
4. Pin the installed app if you want a one-click coach planning window.

Expected result: StingFit opens as a standalone desktop PWA window with the same local database as that browser profile.

## Local phone smoke with this repo

When validating on a real phone from this workspace, use the production PWA preview helper instead of the Vite dev server:

```bash
npm run mobile:pwa:start
npm run mobile:pwa:url
npm run mobile:pwa:stop
```

Open one of the LAN URL candidates on the phone, then install with the browser steps above. The helper does not create a public tunnel and does not add telemetry.

## What remains local

- Workout history, plans, settings, and profiles stay in the browser's local IndexedDB-backed SQLite database.
- Backups are explicit JSON downloads.
- Coach Plan Packs (`.stfplan`) and trainee Recap Packs (`.stfrecap`) leave the device only when you export and send the file yourself.
- There is no account, login, cloud sync, analytics, telemetry, subscription, paywall, or server requirement in this install path.

## Troubleshooting

- If the install prompt does not appear, reload once and use the browser menu.
- If iOS opens the app in a browser tab, confirm you installed from Safari using **Add to Home Screen**.
- If offline launch fails, open StingFit once online in the installed PWA so the service worker can cache the app shell.
- If you switch browsers or browser profiles, export a StingFit backup first and import it in the new profile.
