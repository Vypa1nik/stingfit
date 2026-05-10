# StingFit i18n Consolidation

Date: 2026-05-05
Target: V2 Phase 2 module 7 — i18n consolidation
Status: DONE_WITH_CONCERNS

## What changed

- Added `src/i18n/en.ts` as an English placeholder catalog stub.
- Added a widened `FitnessCopyCatalog` type so non-Slovak catalogs can share the same key/function shape without being forced to reuse Slovak literal values.
- Expanded `src/i18n/sk.ts` with catalog sections for:
  - shared plate-load UI (`fitness.plateLoad`)
  - standalone plate calculator screen (`fitness.plates`)
  - set logger plate calculator summary (`fitness.setLogger`)
  - History route loading/error/empty/hero copy (`fitness.history`)
  - Stats route loading/error/empty/hero copy (`fitness.stats`)
- Migrated these runtime surfaces to read from `sk`:
  - `src/features/fitness/PlateLoadPanel.tsx`
  - `src/features/fitness/FitnessPlateCalculatorPage.tsx`
  - `src/features/fitness/SetLogger.tsx` plate calculator collapsed helper copy
  - `src/features/fitness/FitnessHistoryPage.tsx` route shell/loading/error/empty copy and history update messages
  - `src/features/fitness/FitnessStatsPage.tsx` route shell/loading/error/empty copy
- Extended `tests/fitness-i18n-catalog.test.ts` to verify that `en` and `sk` have matching key/function shape and that migrated surfaces reference `sk`.

## Remaining concerns

Full-string consolidation for every legacy runtime copy is not complete in this pass. Large pre-existing surfaces still contain user-facing Slovak literals, especially:

- `src/features/fitness/FitnessDashboard.tsx`
- `src/features/fitness/FitnessPlansPage.tsx`
- `src/features/fitness/FitnessSettingsPage.tsx`
- deeper sections of `src/features/fitness/FitnessHistoryPage.tsx`
- deeper sections of `src/features/fitness/FitnessStatsPage.tsx`
- `src/features/fitness/SetLogger.tsx` beyond the newly migrated plate helper
- domain/presentation helpers that format Slovak labels and messages

These should be migrated in smaller follow-up modules to avoid a high-risk, broad copy-only diff across several thousand lines.

## Verification

Targeted command:

```bash
npx vitest run tests/fitness-i18n-catalog.test.ts tests/fitness-empty-states-ui.test.tsx tests/fitness-history.test.tsx tests/fitness-stats-simplification-ui.test.tsx --reporter=verbose
```

Result: PASS — 4 files / 21 tests passed.

Full gate:

```bash
npm run check
```

Result: PASS — lint clean, 100 test files / 244 tests passed, build OK.

Bundle budget:

```bash
node ./tools/bundle-budget.mjs
```

Result: PASS — main entry `assets/index-Ge6qgYC2.js` at 103.49 KB gzip / 250 KB; only >200 KB gzip asset is `assets/sql-wasm-UFUCzYNW.wasm` at 323.01 KB gzip.
