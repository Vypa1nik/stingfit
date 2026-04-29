# StingFit V1 Release Checklist

## V1 status

StingFit is a V1 candidate for the verified web build path.

The product now supports the core loop:

```text
Start → Log → Finish → Learn
```

V1 includes:

- fitness-first shell: Training, Plans, History, Stats, Settings
- High-Voltage Wasp identity and StingFit browser/PWA metadata
- starter training templates and personal plan creation
- controlled plan editing, rest days, readiness validation, and ordering controls
- custom exercise creation and custom exercise library management
- Up Next workout recommendation from completed local sessions
- live workout logging with set logging, add/remove set, skip exercise, unplanned exercise, finish, resume, and abandon flows
- immutable session snapshots for completed history
- finish check-in with RPE, energy, and notes
- history, volume, PR events, and quality-aware progression hints
- kg/lb display/logging while storage remains kg-based
- optional guidance visibility / quiet mode
- fitness-only JSON export/import/restore
- full local fitness data wipe behind exact typed confirmation
- V1 smoke test for first-run → train → history → export/reset/restore

## Privacy and non-goals

No login, no cloud sync, no telemetry, no analytics, no subscriptions, and no paywalls are included.

Data remains local to the device through the existing SQLite/WASM + IndexedDB storage path. Fitness export/import is file-based and local.

## Data safety checklist

- [x] Fitness restore replaces only fitness tables.
- [x] Full fitness wipe deletes only fitness data.
- [x] Notes/tasks/projects are not touched by the fitness wipe.
- [x] Completed sessions remain snapshots and are not rewritten by plan edits.
- [x] Archived custom exercises are soft-hidden from future selection while historical snapshots remain readable.
- [x] Stored weights stay in kg; kg/lb is display/input conversion.

## Manual mobile smoke checklist

Use a narrow/mobile viewport or phone on the local dev server:

- [ ] Open StingFit and confirm Training loads first.
- [ ] From empty state, tap `Prepare Push / Pull / Legs`.
- [ ] Confirm `Start Push Day A` is visible without horizontal scrolling.
- [ ] Start the workout.
- [ ] Log one set using the one-thumb logger controls.
- [ ] Add a set, then remove the added set.
- [ ] Skip an exercise.
- [ ] Add an unplanned exercise.
- [ ] Open finish check-in, enter RPE/energy/notes, and finish.
- [ ] Open History and confirm the completed workout detail is readable.
- [ ] Switch to Settings and toggle kg/lb.
- [ ] Hide guidance and confirm helper panels are quieter while controls remain.
- [ ] Export fitness JSON.
- [ ] Preview and restore the exported JSON.
- [ ] Verify Danger zone requires exact `DELETE FITNESS` before deleting local fitness data.

## Known limitations

- Playwright is not installed in this project, so browser/mobile verification is documented as a manual checklist and covered by Vitest/jsdom where possible.
- The Tauri scaffold has StingFit identity metadata, but desktop packaging is not the verified production path yet.
- The repository/workspace folder and some internal storage keys still use historical local names to avoid migration/data-loss risk.
- Legacy notes/tasks/projects code still exists behind non-primary routes, but the verified V1 product surface is fitness-first.
- PNG app icons are still the existing generated assets; the browser SVG favicon and PWA metadata now carry the StingFit identity.

## Automated verification commands

Final V1 gate commands:

```bash
npm run test:run
npm run build
npm run lint
```

Latest verified automated gate in this finalization pass:

- `npm run test:run` → all tests passed after V1 release identity work.
- `npm run build` → passed after V1 release identity work.
- `npm run lint` → passed after V1 release identity work.

## Release decision

Automated coverage and web build gates support marking StingFit as a V1 candidate. Final release should include one manual mobile smoke pass using the checklist above.
