# StingFit V3 - Start Here

_Status: V3 shipped locally; post-release handoff_
_Last updated: 2026-05-17_

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
2026-05-17. The shipped criteria in `STINGFIT_V3_PLAN.md` are complete:

- grouped desktop sidebar and five-tile mobile nav are live;
- `/progress` has lifts, PRs, body, journal, and history surfaces;
- `fitness_body_measurements` and `fitness_journal_entries` exist in additive
  migration `v004` and round-trip through JSON export/import payload v2;
- finish-session check-ins can save an optional linked Progress journal note;
- old V2 URLs redirect to canonical V3 routes and show a dismissible
  deprecation banner;
- mobile FAB / MoreSheet animation polish has behavior coverage;
- `package.json`, `package-lock.json`, `src/lib/constants.ts`, and the Tauri
  scaffold metadata report `3.0.0`.

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
- V2 release reports were moved to `docs/archive/reports/`.

## What Is Still Open

No V3 code/release-metadata blocker is open after the local `npm run check`
gate. Remaining follow-ups are release operations or manual-device validation:

- run the manual physical iOS Safari / Android Chrome PWA smoke checklist in
  `reports/stingfit-mobile-pwa-smoke.md` when devices are available;
- push the local commits/tags from a credentialed shell if the owner wants a
  remote release marker;
- keep desktop installers unpublished until the Tauri Rust/MSVC toolchain in
  `reports/stingfit-tauri-desktop-builds.md` is verified.

## Verification Snapshot

Latest verification from the V3 release metadata closure:

- `npm run typecheck` - passed
- focused Phase 5/release Vitest suite - passed (8 files, 36 tests)
- `npm run lint` - passed
- `npm run check` - passed; includes lint, full Vitest, and production build
  (116 files, 300 tests)

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
V3 shipped locally as 3.0.0 on 2026-05-17 with npm run check green. Continue
only with post-release follow-ups, manual-device smoke, or owner-requested V3.x
work.
```
