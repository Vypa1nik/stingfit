# StingFit v2.0.0 Release Notes

Status: Active release notes for the approved V2.0 PWA-only release.
Date: 2026-05-12

## Install

- Live PWA: https://vypa1nik.github.io/stingfit/
- Install guide: `docs/install.md`
- Browser fallback guide: `/install.html` in the deployed PWA
- Desktop installers: not published for V2.0. No `.msi` or `.dmg` artifacts are included because native Tauri packaging is a future track.

## What ships

StingFit V2.0 is a private, local-first fitness training app for solo trainees, coached trainees, and coaches. It ships the fast gym logging loop, personal plans, history, progression feedback, PWA install/offline support, and explicit file-based coach handoff without accounts, cloud sync, telemetry, analytics, subscriptions, or paywalls.

## Highlights

- Coach Mode can be enabled explicitly from Settings and unlocks local coach routes for clients, plans, templates, and recaps.
- Plan Packs (`.stfplan`) let a coach export a tamper-evident plan file that a trainee can import on a fresh StingFit install.
- Recap Packs (`.stfrecap`) let a trainee export completed workout history for coach read-only review.
- Training is optimized for the gym: one-thumb set logging, rest alerts, plate loading, last-performance hints, quick sessions, post-workout handoff, and mobile set gestures with accessible button alternatives.
- Stats and history now surface consistency, volume, PRs, recovery signals, and progression insights from local data.
- The PWA is live on GitHub Pages with `/stingfit/` base-path support, service-worker caching, install metadata, screenshots, offline fallback, and install guidance.

## Verification evidence

- GitHub CI: https://github.com/Vypa1nik/stingfit/actions/runs/25765155163
- GitHub Pages deploy: https://github.com/Vypa1nik/stingfit/actions/runs/25764435187
- Live URL HTTP 200: https://vypa1nik.github.io/stingfit/
- Lighthouse 13.3.0 mobile: Performance 87, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse 11.7.1 compatibility: PWA 100, installable manifest PASS, Performance 87, Accessibility 100, Best Practices 100, SEO 100.
- Local checks: `npm run lint`, full Vitest suite (112 files / 281 tests), `npm run build`, bundle budget, `git diff --check`, and automated coach handoff rehearsal passed.

## Accepted concerns

The owner approved V2.0 as a PWA-only release and accepted these manual concerns on 2026-05-12:

- Real iOS Safari and Android Chrome PWA install/offline smoke remains a post-release follow-up.
- Real paired-device Coach Mode timing smoke remains a post-release follow-up; `tests/coach-handoff-flow.test.ts` covers the same handoff as automated release evidence.
- Desktop installers remain a future track until Rust, Cargo, rustup, MSVC/Windows SDK tooling, and macOS packaging/signing are available and verified.

## Privacy

V2.0 keeps the local-first privacy promise: no accounts, login, cloud sync, telemetry, analytics, subscription, payment, paywall, ads, or background sharing. Data leaves the device only through explicit user export actions.
