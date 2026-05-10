# Changelog

All notable changes to StingFit will be documented in this file.

## Unreleased

### Added

- V2 Phase 1 starts bundle guardrails with `tools/bundle-budget.mjs`, lazy database/sql.js startup imports, debug-channel DB boot metrics, an explicit `useDatabase` boot boundary, and tests that keep startup entrypoints from pulling the DB layer into the main bundle.
- V2 Phase 0 now has an active source map in `docs/source-map.md`, verified dependency and scratch-hygiene audits, a README contributor pointer, and a baseline repository surface test so future refactors keep the fitness API explicit.
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
- Local profile storage for solo, coach, and client profiles, with a top-bar switcher that appears once a second profile exists.
- Coach Mode can now be explicitly enabled from Settings, unlocking guarded local coach routes without adding accounts, cloud sync, or telemetry.
- Coach Plan Packs can now be exported and imported as tamper-evident `.stfplan` JSON blobs with local-only preview and commit behavior.
- Trainee Recap Packs can now be exported and previewed read-only as tamper-evident `.stfrecap` JSON blobs for explicit coach handoff.
- Coach Mode routes now have local UI for clients, Plan Pack export, future templates, and read-only Recap Pack preview.
- Trainee handoff UI now imports coach `.stfplan` files from Settings and exports date-range `.stfrecap` files from History.
- The privacy/network audit now covers Phase 3 Coach Mode file handoffs and confirms Plan Pack/Recap Pack payloads contain no device, IP, telemetry, account, cloud-sync, or server routing metadata.

### Changed

- V2 Phase 1 now routes Training, History, and Stats read state through TanStack Query hooks while keeping writes as repository calls with query invalidation.
- Live set logging now marks a submitted set as saved immediately, rolls it back on write failure, and surfaces a non-blocking error toast.
- Training, live workout, History, and Stats now have feature-level crash fallbacks so one broken screen does not take down the StingFit shell.
- The privacy/network audit report is refreshed for Phase 1 and still confirms no telemetry or outbound app runtime calls.
- Set logging now has `±2.5/±5 kg` weight jumps, one-row RIR 0–4 chips, and a relative `Naposledy` performance badge for faster one-thumb gym input.
- Rest timer alerts now have regression coverage for vibration, WebAudio beep playback, first-tap audio unlock, and persisted sound/vibration settings.
- Stats charts now cover 0/1/200-session edge cases, and the 1RM SVG trend appears after the first completed working set with a `Základ` delta.
- Training dashboard now shows a `Regenerácia dnes` card with a clear `Dnes: ...` action from existing recovery signals before the next workout recommendation.
- Plate calculator is now a collapsed helper inside the live set logger and a standalone `Kotúče` quick screen reachable from command palette and mobile navigation.
- Empty fitness route states now have regression coverage for a fresh local database across Training, Quick, Plans, History, Stats, Kotúče, and Settings.
- i18n groundwork now includes an `en` placeholder catalog and moved plate calculator plus History/Stats shell copy into `src/i18n/sk.ts`.
- First-run onboarding now opens directly on the simple-start builder with the Quick Workout path visible immediately, while privacy and theme choices stay secondary.
- Training dashboard now focuses beginners on one first/next workout and hides the full workout list behind an explicit reveal.
- Plans page now shows a simple beginner summary first and keeps the detailed editor behind `Pokročilé úpravy plánu`.
- Live workout view now focuses on the current exercise and next set, with full workout controls behind `Celý tréning a akcie`.
- Finish workout flow now saves immediately, with RPE, energy, and notes kept as an optional short check-in.
- History now shows a simple latest-workout result first and keeps filters/older workout selection behind `Vybrať starší tréning alebo filtrovať`.
- Stats now start with `Tréningy tento týždeň`, weekly volume, best progress, and recovery before detailed graphs.
- Settings now start with `Bezpečnosť dát` and a local backup CTA, with import/reset controls moved behind advanced sections.
- Quick workout now starts with one-tap common exercise buttons and keeps the full exercise picker behind `Pokročilý výber cviku`.
- Training now shows a post-workout next-action card with result, history, and local backup actions after finishing a workout.
- History now recognizes the post-workout handoff and labels the latest result as the just-finished workout with a simple next-step note.
- The post-workout history handoff now recommends the next planned workout and links back to Training.
- Plans can now create personal copies from every starter template and unfinished plans offer a one-click `Dostavať z Celé telo 3×` path instead of pretending they are ready.
- Personal plans can now be renamed, retargeted, archived, and marked as the active Training plan while preserving completed workout history.

- Service worker cache is now versioned as a StingFit PWA shell and includes the offline fallback page.
- Settings now explains offline/PWA installation without introducing cloud, login, telemetry, subscription, or paywall flows.
- Release docs and README now describe the current StingFit fitness scope, PWA path, screenshots, privacy audit, and mobile production-preview flow.

### Blocked / deferred

- Phase 1 mobile PWA smoke remains blocked until a real iOS Safari device and a real Android Chrome device are available for `npm run mobile:pwa:start` verification.
- Desktop installer verification is deferred because the current machine does not expose `cargo`/`rustc` in PATH, so `npm run tauri:build` cannot be verified here.
- Full string extraction to `i18n/sk.ts` remains a future cleanup track; current user-facing copy is already Slovak in the verified app surface.

## 1.0.0 - 2026-04-25

StingFit V1 ships the local-first fitness product direction: personal training plans, fast live workout logging, immutable session snapshots, workout history, PR/progression signals, kg/lb display, fitness-only export/import/restore, safe local data wipe, quiet guidance mode, High-Voltage Wasp identity, and V1 smoke coverage for the core Start → Log → Finish → Learn loop.
