# StingFit V1 Release Checklist

## V1 status

StingFit is a V1 candidate for the verified web/PWA build path.

The product supports the core loop:

```text
Start → Log → Finish → Learn
```

V1 includes:

- fitness-first shell: Training, Quick, Plans, History, Stats, Settings
- High-Voltage Wasp identity and StingFit browser/PWA metadata
- installable PWA manifest, offline fallback page, install shortcuts, and screenshot assets
- starter training templates and personal plan creation
- controlled plan editing, supersets, rest days, readiness validation, and ordering controls
- custom exercise creation and custom exercise library management
- Up Next workout recommendation from completed local sessions
- quick sessions without a plan
- live workout logging with set logging, rest alerts, warmup/working set types, per-side weight entry, plate calculator, add/remove set, skip exercise, unplanned exercise, finish, resume, and abandon flows
- mobile swipe gestures for duplicate/skip completed sets, plus visible buttons for accessibility
- immutable session snapshots for completed history
- live/history set corrections with lightweight correction audit badges
- finish check-in with RPE, energy, and notes
- history filtering, selected detail, volume, PR events, 1RM trend, consistency heatmap, exercise leaders, muscle-group guidance, and recovery signals
- kg/lb display/logging while storage remains kg-based
- Strong CSV append import for completed workout history
- optional guidance visibility / quiet mode
- fitness-only JSON export/import/restore
- backup nudge after every 30 completed workouts
- full local fitness data wipe behind exact typed confirmation
- V1 smoke test for first-run → train → history → export/reset/restore

## Privacy and non-goals

No login, no cloud sync, no telemetry, no analytics, no subscriptions, and no paywalls are included.

Data remains local to the device through the SQLite/WASM + IndexedDB storage path. Fitness export/import is file-based and local.

Automated audit: `reports/stingfit-privacy-network-audit.md`.

## Data safety checklist

- [x] Fitness restore replaces only fitness tables.
- [x] Strong CSV import appends completed sessions and does not overwrite existing data.
- [x] Full fitness wipe deletes only fitness data.
- [x] Completed sessions remain snapshots and are not rewritten by plan edits.
- [x] Set corrections keep a lightweight audit count instead of a sensitive full diff history.
- [x] Archived custom exercises are soft-hidden from future selection while historical snapshots remain readable.
- [x] Stored weights stay in kg; kg/lb is display/input conversion.
- [x] Backup nudge exports local JSON only; no cloud account or telemetry is introduced.

## Manual mobile smoke checklist

Use a narrow/mobile viewport or phone on the local production preview URL. Preferred local command:

```bash
npm run mobile:pwa:start
npm run mobile:pwa:url
```

Open the first printed URL or scan `public/stingfit-mobile-preview-qr.png` from a phone on the same Wi-Fi. If the machine has virtual adapters, `npm run mobile:pwa:url` can list additional URL candidates. This serves the production build, exercises the production PWA service worker path, and avoids any public tunnel.

- [ ] Open StingFit and confirm Training loads first.
- [ ] From empty state, tap `Pripraviť Tlak / Ťah / Nohy`.
- [ ] Confirm a startable workout is visible without horizontal scrolling.
- [ ] Start the workout.
- [ ] Log one set using the one-thumb logger controls.
- [ ] Confirm rest alert controls do not block logging.
- [ ] Swipe the completed set right and confirm a duplicate planned set appears.
- [ ] Swipe a completed set left and confirm it becomes skipped.
- [ ] Use the visible `Duplikovať` and `Preskočiť` buttons as non-gesture alternatives.
- [ ] Add a set, then remove the added set.
- [ ] Skip an exercise.
- [ ] Add an unplanned exercise.
- [ ] Open finish check-in, enter RPE/energy/notes, and finish.
- [ ] Open History and confirm the completed workout detail is readable.
- [ ] Filter history by workout or exercise name.
- [ ] Open Stats and confirm muscle-group guidance and recovery signals render.
- [ ] Switch to Settings and toggle kg/lb.
- [ ] Hide guidance and confirm helper panels are quieter while controls remain.
- [ ] Export fitness JSON.
- [ ] Preview and restore the exported JSON.
- [ ] Paste a small Strong CSV and import it into local history.
- [ ] Verify Danger zone opens the in-app typed modal and requires exact `VYMAZAT TRENING` before deleting local fitness data.
- [ ] Verify plan cleanup and settings restore/reset use StingFit modals, not native browser confirm/prompt dialogs.

## PWA/offline install checklist

Use a production build or preview that serves `public/sw.js`:

- [ ] Run `npm run mobile:pwa:start` or run `npm run build` and serve `dist/`.
- [ ] Confirm the production preview URL opens on the phone.
- [ ] Confirm manifest identity is `StingFit` with yellow/black theme color.
- [ ] Install from browser UI or Settings → `Inštalácia aplikácie`.
- [ ] On iOS, use Share → Add to Home Screen.
- [ ] Open installed app and confirm it lands on Training.
- [ ] Disconnect network after first load.
- [ ] Reopen the installed app and confirm the shell or `offline.html` fallback is available.
- [ ] Confirm the offline fallback says training data stays on the device.
- [ ] Stop the local preview after testing with `npm run mobile:pwa:stop`.

## Screenshot guidance

Manifest screenshot assets are committed for install surfaces:

- `public/screenshots/stingfit-training.svg` — narrow/mobile training logger view
- `public/screenshots/stingfit-stats.svg` — wide stats/recovery view

Before a public release, capture real browser screenshots from the production build and replace or supplement the SVG placeholders if the target app store/browser surface requires PNG/JPEG screenshots.

## Known limitations

- Playwright is not installed in this project, so browser/mobile verification is documented as a manual checklist and covered by Vitest/jsdom where possible.
- The Tauri scaffold has StingFit identity metadata, but desktop packaging is not the verified production path yet.
- `npm run tauri:build` is currently blocked on this machine because `cargo` and `rustc` are not available in PATH.
- Full string extraction to `i18n/sk.ts` is deferred; current verified product-facing copy is Slovak.
- Internal database/storage keys are intentionally stable to avoid accidental local data loss across upgrades.

## Automated verification commands

Final V1 gate commands:

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Focused Phase 3 checks:

```bash
npm run test:run -- tests/fitness-pwa-assets.test.ts tests/fitness-pwa-install-ui.test.tsx
npm run test:run -- tests/fitness-live-session-repository.test.ts tests/fitness-live-session-ui.test.tsx
npm run test:run -- tests/fitness-backup-nudge.test.ts tests/fitness-backup-nudge-ui.test.tsx
npm run test:run -- tests/fitness-privacy-network-audit.test.ts
npm run test:run -- tests/fitness-release-docs.test.ts
```

## Release decision

Automated coverage and web build gates support marking StingFit as a V1 web/PWA candidate. Final release should include one manual mobile/PWA smoke pass using the checklist above.
