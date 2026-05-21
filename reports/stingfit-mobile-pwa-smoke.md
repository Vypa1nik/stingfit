# StingFit Mobile PWA Smoke

Date: 2026-05-17
Target: V3 production PWA preview from `npm run mobile:pwa:start` and public PWA at `https://vypa1nik.github.io/stingfit/`
Status: V3 route matrix updated; automated asset/build coverage passed in `npm run check`; Android Chrome ADB/CDP public PWA route smoke passed on 2026-05-21, while full installed-PWA/stateful gym flows and iOS Safari remain manual follow-ups.

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
| `/offline.html` served                                  | Pass            |
| `/stingfit-icon.svg` served                             | Pass            |
| manifest icons served                                   | Pass            |
| manifest screenshots served                             | Pass            |
| built JS/CSS assets from `index.html` served            | Pass            |
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

Not covered in this automated phone pass:

- Installed Add-to-Home-Screen lifecycle.
- Gesture flows for duplicate/skip/edit sets.
- Export/import/reset flows.
- Full workout mutation flow with plan creation, set logging, finish check-in, and restore.
- iOS Safari behavior.

## Issue log

| Severity  | Area              | Steps                                                             | Expected                        | Actual                                                                                                  | Status                |
| --------- | ----------------- | ----------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------- |
| Follow-up | Manual phone pass | Run checklist above on real iOS Safari and Android Chrome devices | All critical gym/PWA paths pass | Android Chrome ADB/CDP route smoke passed; installed PWA, stateful gym flows, and iOS Safari remain open | Open manual follow-up |

## Notes

- Expo Go is not applicable because StingFit is a React/Vite web PWA, not an Expo app.
- The mobile preview helper intentionally avoids public tunnels and keeps testing local to the LAN.
- Browser service worker/offline behavior still needs physical browser validation because Vitest/jsdom and HTTP probes cannot fully emulate installed PWA lifecycle behavior.
