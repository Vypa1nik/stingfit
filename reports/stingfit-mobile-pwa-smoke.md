# StingFit Mobile PWA Smoke

Date: 2026-05-23
Target: V3 production PWA preview from `npm run mobile:pwa:start` and public PWA at `https://vypa1nik.github.io/stingfit/`
Status: V3 route matrix updated; V3.0.1 public cache/update smoke passed on 2026-05-22; Android Chrome ADB/CDP V3.0.1 public PWA smoke passed on 2026-05-23; automated asset/build coverage passed in `npm run check`; installed-PWA lifecycle, stateful gym mutation flows, and iOS Safari remain manual follow-ups.

## Preview command

```bash
npm run mobile:pwa:start
npm run mobile:pwa:url
```

Use the first reachable URL from the phone on the same Wi-Fi, or scan `public/stingfit-mobile-preview-qr.png` while the preview is running.

Stop after testing:

```bash
npm run mobile:pwa:stop
```

## Automated production-preview contract

These checks define the V3 production-preview smoke contract. The route and asset assertions are covered by `tests/fitness-public-hosting.test.ts`, `tests/fitness-pwa-assets.test.ts`, `tests/fitness-release-identity.test.ts`, and `tests/fitness-mobile-pwa-preview-tooling.test.ts`.

| Check                                                   | Expected result |
| ------------------------------------------------------- | --------------- |
| `npm run build` before preview                          | Pass            |
| `/` returns production HTML                             | Pass            |
| `/#/train` returns app shell                            | Pass            |
| `/#/train/quick` is a canonical quick workout URL       | Pass            |
| `/#/progress/lifts` is the canonical progress URL       | Pass            |
| `/#/progress/history` is the canonical history URL      | Pass            |
| `/#/tools/plates` is the canonical plate calculator URL | Pass            |
| `/manifest.webmanifest` served                          | Pass            |
| `/sw.js` served                                         | Pass            |
| public `/sw.js` uses `stingfit-v3.0.1-github-pages`     | Pass            |
| `/offline.html` served                                  | Pass            |
| `/stingfit-icon.svg` served                             | Pass            |
| manifest icons served                                   | Pass            |
| manifest screenshots served                             | Pass            |
| built JS/CSS assets from `index.html` served            | Pass            |
| cache-busted public GitHub Pages renders V3 navigation  | Pass            |
| manifest name is `StingFit`                             | Pass            |
| manifest `start_url` is `/#/train`                      | Pass            |
| manifest display mode is `standalone`                   | Pass            |
| LAN URL candidates respond from this machine            | Pass            |

## Manual phone checks still needed for V3

- [ ] Open the first preview URL on a phone connected to the same Wi-Fi.
- [ ] Confirm Train loads first at `/#/train`.
- [ ] Create or seed a startable plan from the empty state.
- [ ] Start a planned workout.
- [ ] Start a quick session from `/#/train/quick` and add the first exercise.
- [ ] Log sets with one thumb and confirm inputs remain usable on a narrow screen.
- [ ] Confirm rest alert settings do not block logging.
- [ ] Swipe a completed set right to duplicate.
- [ ] Swipe a completed set left to skip.
- [ ] Use visible `Duplikovať`, `Preskočiť`, and `Upraviť` buttons as non-gesture alternatives.
- [ ] Finish a workout with RPE, energy, notes, and an optional journal note.
- [ ] Review Progress lifts, PRs, body, journal, and history on mobile.
- [ ] Open `Viac`, confirm the sheet animates in, and close it with Escape/overlay/link.
- [ ] Open the plate calculator from `Viac` and from `/#/tools/plates`.
- [ ] Open old V2 bookmarks such as `/#/stats`, `/#/history`, `/#/plates`, and `/#/coach/clients`; confirm they land on V3 routes and show the one-release redirect banner.
- [ ] Export JSON backup from Settings.
- [ ] Preview and restore JSON via in-app modal.
- [ ] Import a small Strong CSV sample.
- [ ] Verify full reset requires exact `VYMAZAT TRENING` in the in-app typed modal.
- [ ] Install/Add to Home Screen.
- [ ] Reopen installed app and confirm it lands on Train.
- [ ] Disconnect network after first load and confirm the app shell/offline fallback is available.

## Android Chrome ADB/CDP smoke - 2026-05-21

Device: `CPH2449` / `OP594DL1`, Android `16`, Chrome `148.0.7778.167`.
Public target: `https://vypa1nik.github.io/stingfit/`.
Method: ADB opened the public URL in `com.android.chrome`, forwarded Chrome DevTools through `tcp:9222`, and checked the loaded PWA via CDP without resetting or wiping local app data.

Passed checks:

- Public app opened and resolved to `https://vypa1nik.github.io/stingfit/#/train`.
- Service worker controlled the page and the manifest was loaded from `/stingfit/manifest.webmanifest`.
- Canonical mobile routes rendered without CDP runtime exceptions or console errors: `/#/train`, `/#/train/quick`, `/#/progress/lifts`, `/#/progress/prs`, `/#/progress/body`, `/#/progress/journal`, `/#/progress/history`, and `/#/tools/plates`.
- Legacy V2 routes redirected with the deprecation banner: `/#/stats` -> `/#/progress/lifts`, `/#/history` -> `/#/progress/history`, and `/#/plates` -> `/#/tools/plates`.
- Mobile `Viac` opened a bottom-sheet dialog containing Rýchly tréning, Kalkulačka kotúčov, História, Coach Mode, and Nastavenia.
- CDP offline reload simulation on `/#/train` kept the app shell available while service-worker controlled.

## Android Chrome ADB/CDP V3.0.1 smoke - 2026-05-23

Device: `CPH2449` / `OP594DL1`, Android `16`, Chrome `148.0.7778.178`.
Public target: `https://vypa1nik.github.io/stingfit/`.
Method: ADB opened a cache-busted public URL in `com.android.chrome`, forwarded Chrome DevTools through `tcp:9222`, and checked the loaded PWA via CDP without resetting or wiping local app data.

Passed checks:

- Public app opened at `/#/train` with service-worker controller `https://vypa1nik.github.io/stingfit/sw.js`.
- Public `sw.js` reported cache namespace `stingfit-v3.0.1-github-pages`.
- Public manifest kept `id: "./#/train"`, `start_url: "./#/train"`, `scope: "./"`, and `display: "standalone"`.
- Canonical mobile routes rendered without CDP runtime exceptions or serious log errors: `/#/train`, `/#/train/quick`, `/#/progress/lifts`, `/#/progress/prs`, `/#/progress/body`, `/#/progress/journal`, `/#/progress/history`, and `/#/tools/plates`.
- Legacy V2 routes redirected with the deprecation banner: `/#/stats` -> `/#/progress/lifts`, `/#/history` -> `/#/progress/history`, and `/#/plates` -> `/#/tools/plates`.
- Mobile `Viac` opened a bottom-sheet dialog containing Rýchly tréning, Kalkulačka kotúčov, História, Coach Mode, and Nastavenia.
- CDP offline reload simulation on `/#/train` kept the app shell available while service-worker controlled.

Not covered in this Android pass:

- Installed Add-to-Home-Screen lifecycle and existing installed-client update timing.
- Full workout mutation flow with plan creation, set logging, finish check-in, and restore.
- Gesture flows for duplicate/skip/edit sets.
- Export/import/reset flows.
- iOS Safari behavior.

## Public V3.0.1 PWA cache-update smoke - 2026-05-22

Public target: `https://vypa1nik.github.io/stingfit/`.
Release: tag `v3.0.1`, deploy workflow `26273148755`, commit `173949907f172c308fc6548a0c1f542e00414972`.
Method: cache-busted public fetches plus headless Chrome/CDP against `/#/train` after the V3.0.1 deploy.

Passed checks:

- Public HTML served main JS `/stingfit/assets/index-Bp1YSjxj.js`.
- Public `sw.js` served `const CACHE_VERSION = "stingfit-v3.0.1-github-pages";`.
- Public manifest kept `id` and `start_url` on `./#/train` with scope `./`.
- Headless Chrome rendered V3 desktop navigation: Tréning, Progres, Cviky, PR Timeline, Telo, Zápisník, Plány, Nástroje, and Kalkulačka kotúčov.
- Headless Chrome rendered V3 mobile navigation labels: Tréning, Progres, + Tréning, Plány, and Viac.
- Service worker controller was active from `https://vypa1nik.github.io/stingfit/sw.js`.

Not covered in this public cache-update smoke:

- Installed Add-to-Home-Screen lifecycle.
- Existing installed-client update timing on physical devices.
- Gesture flows for duplicate/skip/edit sets.
- Export/import/reset flows.
- Full workout mutation flow with plan creation, set logging, finish check-in, and restore.
- iOS Safari behavior.

Not covered in the automated phone passes:

- Installed Add-to-Home-Screen lifecycle.
- Gesture flows for duplicate/skip/edit sets.
- Export/import/reset flows.
- Full workout mutation flow with plan creation, set logging, finish check-in, and restore.
- iOS Safari behavior.

## Issue log

| Severity  | Area              | Steps                                                             | Expected                        | Actual                                                                                                  | Status                |
| --------- | ----------------- | ----------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------- |
| Follow-up | Manual phone pass | Run checklist above on real iOS Safari and Android Chrome devices | All critical gym/PWA paths pass | Android Chrome ADB/CDP route smoke, Android Chrome V3.0.1 public smoke, and V3.0.1 public cache/update smoke passed; installed PWA lifecycle, stateful gym flows, and iOS Safari remain open | Open manual follow-up |

## Notes

- Expo Go is not applicable because StingFit is a React/Vite web PWA, not an Expo app.
- The mobile preview helper intentionally avoids public tunnels and keeps testing local to the LAN.
- Browser service worker/offline behavior still needs physical browser validation because Vitest/jsdom and HTTP probes cannot fully emulate installed PWA lifecycle behavior.
