# StingFit V3 - Start Here

_Status: V3.0.1 public PWA cache patch shipped; post-release handoff_
_Last updated: 2026-05-22_

This is the clean startup note for the next coding agent in
`C:\Users\kiko\Documents\New project\localflow`.

## Read Order

1. `AGENTS.md`
2. This file
3. `STINGFIT_V3_PLAN.md`
4. `PRODUCT.md`
5. `RULES.md`
6. `README.md`
7. Live source tree and tests

Do not use `STINGFIT_V2_PLAN.md` as an active backlog. Do not read
`docs/archive/` for ideas. V2 shipped; V3 is now the current shipped app shape.

## Current Direction

StingFit V3 reorganizes the app around:

- Train: `/train`, `/train/quick`
- Progress: `/progress/lifts`, `/progress/prs`, `/progress/body`,
  `/progress/journal`, `/progress/history`
- Plans: `/plans`, `/plans/coach/*`
- Tools: `/tools/plates`

Old V2 URLs still redirect during the one-release deprecation window:
`/training`, `/quick`, `/stats`, `/history`, `/plates`, `/coach/*`.

## V3 Ship Status

V3 is shipped locally as version `3.0.0` after the Phase 1-5 gate passed on
2026-05-17. V3.0.1 is now the public PWA cache/update patch release after
GitHub Pages deploy `26273148755` completed successfully from tag `v3.0.1` on
commit `1739499`. The shipped criteria in `STINGFIT_V3_PLAN.md` are complete:

- grouped desktop sidebar and five-tile mobile nav are live;
- `/progress` has lifts, PRs, body, journal, and history surfaces;
- `fitness_body_measurements` and `fitness_journal_entries` exist in additive
  migration `v004` and round-trip through JSON export/import payload v2;
- finish-session check-ins can save an optional linked Progress journal note;
- old V2 URLs redirect to canonical V3 routes and show a dismissible
  deprecation banner;
- mobile FAB / MoreSheet animation polish has behavior coverage;
- `package.json`, `package-lock.json`, `src/lib/constants.ts`, and the Tauri
  scaffold metadata report `3.0.1` after the public cache patch.

## Current Local State

The repo contains the V3 implementation and release metadata:

- `STINGFIT_V3_PLAN.md` is the active plan of record and records the V3 shipped
  criteria.
- `src/router.tsx` has canonical V3 routes plus V2 redirect metadata.
- `src/components/layout/RedirectDeprecationBanner.tsx` is mounted once in
  `AppShell`.
- `src/lib/constants.ts` has `TRAIN_NAV_ITEMS`, `PROGRESS_NAV_ITEMS`,
  `PLAN_NAV_ITEMS`, and `TOOLS_NAV_ITEMS` sourced from i18n labels.
- `NavigationSidebar.tsx`, `MobileBottomNav.tsx`, and `MoreSheet.tsx` implement
  the grouped desktop/mobile navigation.
- `App.tsx`, `useKeyboardShortcuts.ts`, and `shortcuts.ts` point commands and
  keyboard paths at canonical V3 routes.
- `src/features/progress/` contains the Progress hub, lifts chart, PR feed,
  body measurements tab, journal tab, repository, and types.
- `fitnessRepository.exportFitnessData()` writes payload version 2 with Progress
  body measurements and journal entries; v1 imports remain compatible by
  treating missing progress arrays as empty.
- `public/manifest.webmanifest`, `public/install.html`, `public/offline.html`,
  and `tools/start-mobile-pwa-preview.ps1` use canonical V3 routes.
- `public/sw.js` uses cache namespace `stingfit-v3.0.1-github-pages`, and
  `src/main.tsx` asks already-controlled PWAs for a service-worker update and
  reloads once after the new controller activates.
- V2 release reports were moved to `docs/archive/reports/`.

## What Is Still Open

No V3 code/release-metadata blocker is open after the local `npm run check`
gate and the `v3.0.1` GitHub Pages deploy. Remaining follow-ups are manual-device
validation or future packaging work:

- run the full installed-PWA/stateful gym-flow smoke checklist in
  `reports/stingfit-mobile-pwa-smoke.md` when physical iOS Safari and Android
  Chrome devices are available;
- keep desktop installers unpublished until the Tauri Rust/MSVC toolchain in
  `reports/stingfit-tauri-desktop-builds.md` is verified.

## Verification Snapshot

Latest verification from the V3.0.1 public PWA cache patch:

- `npm run test:run -- tests/fitness-pwa-assets.test.ts tests/fitness-public-hosting.test.ts tests/fitness-release-identity.test.ts` - passed (3 files, 17 tests)
- `npm run test:run -- tests/fitness-release-docs.test.ts` - passed (1 file, 2 tests)
- `npm run check` - passed; includes lint, full Vitest, and production build
  (116 files, 300 tests)
- public GitHub Pages smoke via cache-busted fetch and headless Chrome/CDP -
  passed; live app rendered V3 Train / Progress / Plans / Tools navigation and
  `sw.js` served `stingfit-v3.0.1-github-pages`.

This machine is Windows. Use the Windows wrapper if MSYS cannot find Node/npm:

```bash
/c/Windows/System32/cmd.exe //d //c "set PATH=C:\Program Files\nodejs;C:\Windows\System32;C:\Windows;%PATH%&& cd /d C:\Users\kiko\Documents\New project\localflow && npm run <script>"
```

## Safe First Commands

```bash
git status -sb
npm run typecheck
npm run lint
```

For behavior/schema work:

```bash
npm run check
```

## Runtime Cleanup Note

Ignored scratch logs may exist when a dev/tunnel process is running:

- `.tmp-stingfit-dev.err.log`
- `.tmp-stingfit-dev.log`
- `.tmp-stingfit-tunnel.err.log`
- `.tmp-stingfit-tunnel.log`

Stop the preview/tunnel before deleting those. Do not treat them as planning
inputs.

## Ready-To-Paste Kickoff

Use this if starting a fresh agent session:

```text
Work in C:\Users\kiko\Documents\New project\localflow. Read AGENTS.md first,
then AGENT_START_HERE.md, STINGFIT_V3_PLAN.md, PRODUCT.md, RULES.md, and
README.md. Treat STINGFIT_V3_PLAN.md as the active plan of record. Do not read
docs/archive/ for guidance and do not use STINGFIT_V2_PLAN.md as active work.
V3 shipped locally as 3.0.0 on 2026-05-17 with npm run check green. V3.0.1
shipped publicly on 2026-05-22 as the GitHub Pages PWA cache/update patch. Continue
only with post-release follow-ups, manual-device smoke, or owner-requested V3.x
work.
```
