# StingFit privacy/network audit

Date: 2026-05-09

## Scope

This refreshed Phase 3 audit verifies that StingFit remains a private, local-first fitness logger after adding Coach Mode Plan Pack and Recap Pack handoff flows.

Non-negotiable product rule confirmed:

> No login, no cloud sync, no telemetry, no analytics, no subscriptions, and no paywalls.

## Checks performed

- Re-ran the automated privacy/network audit on 2026-05-09 after Phase 3 modules 5-6.
- Scanned `package.json` for common analytics/error-reporting/RUM dependencies.
- Scanned `src/`, `index.html`, `public/manifest.webmanifest`, and `public/offline.html` for outbound browser APIs:
  - `fetch()`
  - `navigator.sendBeacon`
  - `XMLHttpRequest`
  - `WebSocket`
  - `EventSource`
  - common analytics SDK names and snippets.
- Verified `public/sw.js` fetch usage remains the only allowed network-facing runtime code.
- Audited Coach Mode exchange files:
  - `src/features/coach/packSchemas.ts`
  - `src/features/coach/packSignature.ts`
  - `src/features/coach/planPack/schema.ts`
  - `src/features/coach/planPack/io.ts`
  - `src/features/coach/recapPack/schema.ts`
  - `src/features/coach/recapPack/io.ts`
- Verified Plan Pack export uses the coach profile display name only: `coachName: activeProfile.name`.
- Verified Recap Pack export uses the trainee profile display name only: `traineeName: activeProfile.name`.
- Re-ran Plan Pack, Recap Pack, Coach UI, Trainee UI, and full app gates after the audit assertions were added.

## Result

- Refresh result on 2026-05-09: PASS.
- Phase 3 Coach Mode exchange refresh on 2026-05-09: PASS.
- No analytics, telemetry, RUM, cloud-sync, login, subscription, or paywall dependencies are present.
- The app runtime does not call outbound network APIs from React/TypeScript code.
- Service worker fetch is limited to same-origin cache/runtime requests and offline app-shell fallback behavior.
- Plan Pack and Recap Pack payloads contain no device identifiers, IP metadata, telemetry IDs, accounts, cloud-sync fields, or server routing metadata.
- Plan Pack sharing remains explicit: the coach exports a local `.stfplan` file and sends it manually.
- Recap Pack sharing remains explicit: the trainee exports a local `.stfrecap` file and sends it manually.
- Coach-side Recap Pack import remains read-only; no recap payload is committed into the coach database.
- Strong CSV import, JSON backup/export, PWA install metadata, Plan Pack import/export, Recap Pack import/export, and workout history remain local-device flows.

## Verification commands

```bash
npm run test:run -- tests/fitness-privacy-network-audit.test.ts
npx vitest run tests/coach-plan-pack-roundtrip.test.ts tests/coach-recap-pack-roundtrip.test.ts tests/coach-ui.test.tsx tests/trainee-ui.test.tsx --reporter=verbose
npm run check
node ./tools/bundle-budget.mjs
```

Full release gate remains:

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```
