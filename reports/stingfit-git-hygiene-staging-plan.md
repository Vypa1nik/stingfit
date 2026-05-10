# StingFit git hygiene / staging plan

Date: 2026-05-09
Status: READY_FOR_OWNER_REVIEW
Scope: current dirty working tree after V2 Phase 0-3 work

## Goal

Turn the current large dirty tree into reviewable logical checkpoints without losing the ability to prove the app still works. This plan does **not** stage, commit, tag, reset, or delete anything. It is a staging guide for the owner or a follow-up agent session.

## Current state summary

`git status --short` shows four categories of change:

1. **Active documentation reset and archive move**
   - Modified active docs: `AGENTS.md`, `README.md`, `RULES.md`, `CHANGELOG.md`.
   - New active docs: `PRODUCT.md`, `STINGFIT_V2_PLAN.md`, `docs/source-map.md`.
   - Deleted old root plans: `AUDIT_REBUILD_PLAN.md`, `DEVELOPMENT_PLAN.md`.
   - Deleted old `docs/superpowers/...` plan/spec files.
   - New `docs/archive/` directory is present but was not read for this plan.
2. **Phase 0-3 implementation and tests**
   - Large modified fitness files, new coach/profile modules, new i18n catalog, new tests, and new tooling.
3. **Reports / audit records**
   - Updated `reports/stingfit-mobile-pwa-smoke.md` and `reports/stingfit-privacy-network-audit.md`.
   - New reports for empty-state audit, i18n consolidation, Phase 3 exit audit, and this staging plan.
4. **Tooling/config changes**
   - `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.test.json`, and `tools/bundle-budget.mjs`.

Git reported CRLF-to-LF warnings for:

- `package-lock.json`
- `package.json`
- `tests/fitness-plan-builder-page.test.tsx`
- `tests/fitness-training-readiness-repository.test.ts`

Do not treat those warnings as blockers, but inspect the final diff before commit if line-ending churn matters.

## Non-negotiable staging rules

- Do **not** run `git add -A` at repo root.
- Do **not** tag anything while manual smoke checks remain open and the tree is dirty.
- Do **not** read or mine `docs/archive/`; only stage it if the owner confirms the archive move is intended.
- Use `git add -p` for shared files that contain changes from multiple phases.
- Run at least `npm run check` after each large checkpoint if commits are created one by one. If that is too slow, run targeted tests during staging and one full `npm run check` before any tag.
- If a patch hunk is unclear, leave it unstaged and document it rather than forcing it into a commit.

## Recommended checkpoint sequence

### Checkpoint 1 — Active docs reset and archive move

Purpose: make the V2 source of truth explicit before code history.

Candidate files:

```bash
git add AGENTS.md README.md RULES.md PRODUCT.md STINGFIT_V2_PLAN.md docs/source-map.md
# Only after owner confirms the archive move:
git add docs/archive/
git add -u AUDIT_REBUILD_PLAN.md DEVELOPMENT_PLAN.md docs/superpowers
```

Patch-stage these because they also receive later-phase status updates:

```bash
git add -p CHANGELOG.md
```

Suggested commit message:

```text
document StingFit V2 active plan
```

Verification before/after commit:

```bash
npm run check
```

Risk: `docs/archive/` is untracked and intentionally not inspected here. Owner should confirm the archive move before staging it.

---

### Checkpoint 2 — Phase 0/1 baseline, guardrails, and boot/query infrastructure

Purpose: capture the project guardrails and performance/stability base before UX and coach work.

Candidate files:

```bash
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.test.json tools/bundle-budget.mjs
git add src/main.tsx src/hooks/useDatabase.ts src/lib/database.ts
git add src/features/fitness/exportFitnessBackup.ts src/features/fitness/queries/fitnessQueries.ts
git add src/components/ui/FeatureErrorBoundary.tsx
git add tests/v2-baseline.test.ts tests/fitness-bundle-budget.test.mjs tests/fitness-database-lazy-loading.test.ts tests/fitness-database-boot-path.test.tsx tests/fitness-query-hooks.test.tsx tests/fitness-optimistic-set-logging.test.tsx tests/fitness-feature-error-boundary.test.tsx
```

Patch-stage shared app files:

```bash
git add -p src/App.tsx src/router.tsx src/features/fitness/FitnessDashboard.tsx src/features/fitness/FitnessHistoryPage.tsx src/features/fitness/FitnessStatsPage.tsx src/features/fitness/LiveTrainingSession.tsx
```

Suggested commit message:

```text
add V2 performance and stability guardrails
```

Verification:

```bash
npx vitest run tests/v2-baseline.test.ts tests/fitness-bundle-budget.test.mjs tests/fitness-database-lazy-loading.test.ts tests/fitness-database-boot-path.test.tsx tests/fitness-query-hooks.test.tsx tests/fitness-optimistic-set-logging.test.tsx tests/fitness-feature-error-boundary.test.tsx --reporter=verbose
node ./tools/bundle-budget.mjs
npm run check
```

Risk: several Phase 2/3 changes also touch the same dashboard/history/stats/settings files, so use patch mode rather than staging the whole files unless the owner accepts a broad Phase 1-3 mega-commit.

---

### Checkpoint 3 — Phase 2 gym UX, empty states, i18n groundwork, and onboarding refresh

Purpose: capture the core trainee/product UX improvements before Coach Mode.

Candidate files:

```bash
git add src/features/fitness/FitnessPlateCalculatorPage.tsx src/features/fitness/PlateLoadPanel.tsx src/i18n/en.ts
git add reports/stingfit-empty-state-audit.md reports/stingfit-i18n-consolidation.md
git add tests/fitness-gym-ergonomics.test.tsx tests/fitness-rest-alerts.test.tsx tests/fitness-progress.test.ts tests/fitness-dashboard-recommendation.test.tsx tests/fitness-plate-calculator-ui.test.tsx tests/fitness-empty-states-ui.test.tsx tests/fitness-i18n-catalog.test.ts tests/fitness-simple-start-builder-ui.test.tsx
```

Patch-stage shared implementation files:

```bash
git add -p src/features/fitness/SetLogger.tsx src/features/fitness/FitnessDashboard.tsx src/features/fitness/FitnessHistoryPage.tsx src/features/fitness/FitnessStatsPage.tsx src/features/fitness/FitnessSettingsPage.tsx src/features/fitness/SimpleStartBuilder.tsx src/features/fitness/WorkoutHistoryDetail.tsx src/features/fitness/fitnessProgress.ts src/features/onboarding/OnboardingFlow.tsx src/i18n/sk.ts src/App.tsx src/router.tsx src/components/layout/MobileBottomNav.tsx
```

Suggested commit message:

```text
improve StingFit gym UX and onboarding
```

Verification:

```bash
npx vitest run tests/fitness-gym-ergonomics.test.tsx tests/fitness-rest-alerts.test.tsx tests/fitness-progress.test.ts tests/fitness-dashboard-recommendation.test.tsx tests/fitness-plate-calculator-ui.test.tsx tests/fitness-empty-states-ui.test.tsx tests/fitness-i18n-catalog.test.ts tests/fitness-simple-start-builder-ui.test.tsx --reporter=verbose
npm run check
```

Risk: this checkpoint is broad because many UX changes are already interleaved in existing large files.

---

### Checkpoint 4 — Phase 3 profiles and Coach Mode foundation

Purpose: isolate local profile state and the guarded Coach Mode toggle/routes.

Candidate files:

```bash
git add src/features/profiles/ src/features/coach/coachModeRepository.ts src/features/coach/CoachModePage.tsx
git add tests/profiles-migration.test.ts tests/profile-switcher-ui.test.tsx tests/coach-mode-permissions.test.tsx
```

Patch-stage shared files:

```bash
git add -p src/lib/migrations.ts src/components/layout/TopBar.tsx src/features/fitness/FitnessSettingsPage.tsx src/router.tsx src/i18n/sk.ts src/i18n/en.ts tests/fitness-i18n-catalog.test.ts tests/fitness-navigation.test.ts
```

Suggested commit message:

```text
add local profiles and gated Coach Mode
```

Verification:

```bash
npx vitest run tests/profiles-migration.test.ts tests/profile-switcher-ui.test.tsx tests/coach-mode-permissions.test.tsx tests/fitness-i18n-catalog.test.ts tests/fitness-navigation.test.ts --reporter=verbose
npm run check
```

Risk: `src/features/coach/CoachModePage.tsx` now includes later Coach UI work too. If keeping foundation separate is important, use patch mode on that file or combine checkpoints 4 and 6.

---

### Checkpoint 5 — Plan Pack and Recap Pack formats

Purpose: isolate the file exchange schemas, signatures, and round-trip tests.

Candidate files:

```bash
git add src/features/coach/packSchemas.ts src/features/coach/packSignature.ts src/features/coach/planPack/ src/features/coach/recapPack/
git add tests/coach-plan-pack-roundtrip.test.ts tests/coach-recap-pack-roundtrip.test.ts
```

Patch-stage shared files if needed:

```bash
git add -p src/features/fitness/fitnessRepository.ts src/features/fitness/fitnessTypes.ts src/i18n/sk.ts src/i18n/en.ts
```

Suggested commit message:

```text
add Coach Mode file exchange packs
```

Verification:

```bash
npx vitest run tests/coach-plan-pack-roundtrip.test.ts tests/coach-recap-pack-roundtrip.test.ts --reporter=verbose
npm run check
```

Risk: no DB migration was added for packs; that is intentional.

---

### Checkpoint 6 — Coach UI and trainee handoff UI

Purpose: capture the user-facing Coach Mode bridge flows.

Candidate files:

```bash
git add tests/coach-ui.test.tsx tests/trainee-ui.test.tsx
```

Patch-stage shared files:

```bash
git add -p src/features/coach/CoachModePage.tsx src/features/fitness/FitnessSettingsPage.tsx src/features/fitness/FitnessHistoryPage.tsx src/i18n/sk.ts src/i18n/en.ts tests/fitness-i18n-catalog.test.ts docs/source-map.md CHANGELOG.md STINGFIT_V2_PLAN.md
```

Suggested commit message:

```text
add Coach Mode handoff UI
```

Verification:

```bash
npx vitest run tests/coach-ui.test.tsx tests/trainee-ui.test.tsx tests/coach-plan-pack-roundtrip.test.ts tests/coach-recap-pack-roundtrip.test.ts tests/fitness-i18n-catalog.test.ts --reporter=verbose
npm run check
```

Risk: this shares files with earlier checkpoints. If patch staging becomes too error-prone, combine checkpoints 4-6 into one larger but coherent `add Coach Mode bridge` commit.

---

### Checkpoint 7 — Privacy/network audit and release reports

Purpose: capture audit evidence and documented blockers after implementation.

Candidate files:

```bash
git add reports/stingfit-mobile-pwa-smoke.md reports/stingfit-privacy-network-audit.md reports/stingfit-phase-3-exit-audit.md reports/stingfit-git-hygiene-staging-plan.md
git add tests/fitness-privacy-network-audit.test.ts tests/fitness-release-docs.test.ts
```

Patch-stage docs:

```bash
git add -p CHANGELOG.md STINGFIT_V2_PLAN.md docs/source-map.md
```

Suggested commit message:

```text
refresh StingFit V2 audit reports
```

Verification:

```bash
npx vitest run tests/fitness-privacy-network-audit.test.ts tests/fitness-release-docs.test.ts --reporter=verbose
npm run check
node ./tools/bundle-budget.mjs
```

Risk: this checkpoint should remain last because it references final Phase 3 outcomes.

## Alternative if patch staging is too risky

If `git add -p` across huge files becomes unreliable, use a smaller number of broader commits:

1. `document StingFit V2 active plan`
2. `add V2 fitness performance and UX updates`
3. `add Coach Mode bridge`
4. `refresh V2 audits and reports`

This is less granular but safer than accidentally splitting required hunks incorrectly.

## Pre-commit checklist for every checkpoint

Run:

```bash
git diff --cached --stat
git diff --cached --check
```

Then run the checkpoint-specific tests above. Before tagging or starting Phase 4 distribution work, run:

```bash
npm run check
node ./tools/bundle-budget.mjs
git status --short
```

## Tagging guidance

Do not create `v2-phase-3` yet. Conditions before a tag:

- Working tree clean after reviewed commits.
- `npm run check` green on the commit to tag.
- Bundle budget green.
- Owner explicitly confirms whether manual paired-device smoke is required before the tag or can remain a documented concern.
- Phase 1 mobile PWA smoke status is either resolved or explicitly accepted as still blocked.
