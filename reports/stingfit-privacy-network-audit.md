# StingFit privacy/network audit

Date: 2026-04-29

## Scope

This audit verifies the Phase 3 distribution requirement: StingFit remains a private, local-first fitness logger with no outbound analytics or telemetry behavior.

Non-negotiable product rule confirmed:

> No login, no cloud sync, no telemetry, no analytics, no subscriptions, and no paywalls.

## Checks performed

- Scanned `package.json` for common analytics/error-reporting/RUM dependencies.
- Scanned `src/`, `index.html`, `public/manifest.webmanifest`, and `public/offline.html` for outbound browser APIs:
  - `fetch()`
  - `navigator.sendBeacon`
  - `XMLHttpRequest`
  - `WebSocket`
  - `EventSource`
  - common analytics SDK names and snippets.
- Verified `public/sw.js` fetch usage remains the only allowed network-facing runtime code.

## Result

- No analytics, telemetry, RUM, cloud-sync, login, subscription, or paywall dependencies are present.
- The app runtime does not call outbound network APIs from React/TypeScript code.
- Service worker fetch is limited to same-origin cache/runtime requests and offline app-shell fallback behavior.
- Strong CSV import, JSON backup/export, PWA install metadata, and workout history remain local-device flows.

## Verification command

```bash
npm run test:run -- tests/fitness-privacy-network-audit.test.ts
```

Full release gate should still be run after adjacent Phase 3 changes:

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```
