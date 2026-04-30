# Changelog

All notable changes to StingFit will be documented in this file.

## Unreleased

### Added

- PWA install metadata, offline fallback, and install guidance in Settings.
- Manifest shortcuts for Training, Quick Workout, and History, plus screenshot assets for install surfaces.
- mobile swipe gestures for completed live sets: swipe right duplicates the set, swipe left marks it skipped.
- Keyboard/tap equivalents for completed-set duplicate and skip actions so gestures are not the only path.
- Local backup nudge after every 30 completed workouts, with one-click JSON export and snooze until the next 30-workout block.
- telemetry-free privacy/network audit and release handoff report in `reports/stingfit-privacy-network-audit.md`.
- Strong CSV append import for completed workout history.
- Superset metadata in plans and live-session rotation.
- Muscle-group taxonomy, weekly volume guidance, actionable volume recommendations, and recovery signals.
- local production PWA preview helper for phone smoke testing without Expo Go or a public tunnel.
- simple start builder for first-run training setup: 3 days, 4 days, 5–6 days, decide-for-me, or quick workout.

### Changed

- Training dashboard now focuses beginners on one first/next workout and hides the full workout list behind an explicit reveal.
- Plans page now shows a simple beginner summary first and keeps the detailed editor behind `Pokročilé úpravy plánu`.
- Live workout view now focuses on the current exercise and next set, with full workout controls behind `Celý tréning a akcie`.

- Service worker cache is now versioned as a StingFit PWA shell and includes the offline fallback page.
- Settings now explains offline/PWA installation without introducing cloud, login, telemetry, subscription, or paywall flows.
- Release docs and README now describe the current StingFit fitness scope, PWA path, screenshots, privacy audit, and mobile production-preview flow.

### Blocked / deferred

- Desktop installer verification is deferred because the current machine does not expose `cargo`/`rustc` in PATH, so `npm run tauri:build` cannot be verified here.
- Full string extraction to `i18n/sk.ts` remains a future cleanup track; current user-facing copy is already Slovak in the verified app surface.

## 1.0.0 - 2026-04-25

StingFit V1 ships the local-first fitness product direction: personal training plans, fast live workout logging, immutable session snapshots, workout history, PR/progression signals, kg/lb display, fitness-only export/import/restore, safe local data wipe, quiet guidance mode, High-Voltage Wasp identity, and V1 smoke coverage for the core Start → Log → Finish → Learn loop.
