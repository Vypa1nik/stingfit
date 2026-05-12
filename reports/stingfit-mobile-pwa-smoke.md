# StingFit Mobile PWA Smoke

Date: 2026-05-12
Target: production PWA preview from `npm run mobile:pwa:start` and live PWA at `https://vypa1nik.github.io/stingfit/`
Status: ACCEPTED FOLLOW-UP for V2.0; physical iOS Safari and Android Chrome devices were not available in the agent environment, and the owner accepted this as a documented manual concern for the PWA-only release.

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

## Automated production-preview checks

These checks were run against the local `vite preview` production server after a fresh build.

| Check                                        | Result |
| -------------------------------------------- | ------ |
| `npm run build` before preview               | Pass   |
| `/` returns production HTML                  | Pass   |
| `/#/training` returns app shell              | Pass   |
| `/manifest.webmanifest` served               | Pass   |
| `/sw.js` served                              | Pass   |
| `/offline.html` served                       | Pass   |
| `/stingfit-icon.svg` served                  | Pass   |
| manifest icons served                        | Pass   |
| manifest screenshots served                  | Pass   |
| built JS/CSS assets from `index.html` served | Pass   |
| manifest name is `StingFit`                  | Pass   |
| manifest `start_url` is `/#/training`        | Pass   |
| manifest display mode is `standalone`        | Pass   |
| LAN URL candidates respond from this machine | Pass   |

## Manual phone checks still needed after V2.0

- [ ] Open the first preview URL on a phone connected to the same Wi-Fi.
- [ ] Confirm Training loads first.
- [ ] Create or seed a startable plan from the empty state.
- [ ] Start a planned workout.
- [ ] Start a quick session and add the first exercise.
- [ ] Log sets with one thumb and confirm inputs remain usable on a narrow screen.
- [ ] Confirm rest alert settings do not block logging.
- [ ] Swipe a completed set right to duplicate.
- [ ] Swipe a completed set left to skip.
- [ ] Use visible `Duplikovať`, `Preskočiť`, and `Upraviť` buttons as non-gesture alternatives.
- [ ] Finish a workout with RPE, energy, and notes.
- [ ] Review History and Stats on mobile.
- [ ] Export JSON backup from Settings.
- [ ] Preview and restore JSON via in-app modal.
- [ ] Import a small Strong CSV sample.
- [ ] Verify full reset requires exact `VYMAZAT TRENING` in the in-app typed modal.
- [ ] Install/Add to Home Screen.
- [ ] Reopen installed app and confirm it lands on Training.
- [ ] Disconnect network after first load and confirm the app shell/offline fallback is available.

## Issue log

| Severity | Area              | Steps                                                             | Expected                        | Actual                                                       | Status |
| -------- | ----------------- | ----------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ | ------ |
| Follow-up | Manual phone pass | Run checklist above on real iOS Safari and Android Chrome devices | All critical gym/PWA paths pass | Physical devices are not available in this agent environment; owner accepted this as a documented V2.0 concern | Accepted for V2.0 |

## Notes

- Expo Go is not applicable for the current V1 path because StingFit is a React/Vite web PWA, not an Expo app.
- The mobile preview helper intentionally avoids public tunnels and keeps testing local to the LAN.
- Browser service worker/offline behavior still needs physical browser validation because Vitest/jsdom and HTTP probes cannot fully emulate installed PWA lifecycle behavior.
