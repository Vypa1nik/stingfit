# StingFit V2 — Master Rebuild Plan

> **This is the single authoritative plan for StingFit V2. Agents must use only
> this plan together with `PRODUCT.md`, `RULES.md`, `AGENTS.md`, `README.md`,
> and the live source tree. Anything in `docs/archive/` is historical context
> only and must NOT influence implementation choices.**

_Last revised: 2026-05-02_
_Owner: Kristián_
_Codename: V2 — "Coach Bridge"_

---

## 0. How to read this document

If you are an AI agent or contributor opening this file for the first time:

1. Read this whole file once before you write any code.
2. Read `PRODUCT.md` (vision and anti-goals) and `RULES.md` (engineering and
   product rules) once before you write any code.
3. Skim `AGENTS.md` for the workflow protocol (small modules, verification
   gate, CHANGELOG entry per module).
4. Confirm with the user **which phase** is active before starting work. Phases
   are sequential. Do not start phase _N+1_ until phase _N_ is signed off.
5. Within a phase, work **one module at a time**. Each module follows the
   per-module protocol in `AGENTS.md`.
6. Treat anything in `docs/archive/` as read-only history. Do not import its
   ideas, TODOs, or wording.

If at any point this plan disagrees with `PRODUCT.md`, `PRODUCT.md` wins on
vision and `RULES.md` wins on engineering. Stop and ask the user to reconcile
the conflict — do not silently pick a side.

---

## 1. Where we are right now (May 2026)

StingFit V1 shipped. The web/PWA build is the verified production path.
The fitness loop **Start → Log → Finish → Learn** is complete. 91 test files
pass, 206 tests pass, the build is green.

What works today is documented in `README.md` (the "What works in V1" section
is the source of truth, not this plan). Treat that section as the V2 starting
inventory.

What does **not** work yet, and is therefore in scope for V2:

- The app is single-persona (solo trainee). There is no concept of "a plan
  written by someone else."
- Plans cannot leave the device in any portable, signed format that another
  StingFit instance can import in one tap.
- Stats are useful but flat. There are no progression charts, no muscle-group
  weekly heatmap, no recovery-aware insight panel.
- Distribution is "open the dev URL." There is no signed desktop installer,
  no published PWA, no install funnel.
- Tauri scaffold exists but is not verified end-to-end on the build machine.
- The bundle has not been audited for size. PWA install on iOS Safari has not
  been physically smoke-tested.
- Test coverage is strong on logic but light on full Coach Mode workflows
  (because Coach Mode does not exist yet).

## 2. What V2 is and is not

V2 is the version of StingFit where:

- A **trainee** (solo or coached) has the most pleasant, fastest gym logbook
  on the market for their hardware (PWA on phone, desktop on laptop).
- A **coach** can author plans inside StingFit, hand them to clients via a
  Plan Pack file, and review what got done — without ever asking the trainee
  to log into anything.
- The whole thing **installs in one tap** on a phone and in one click on a
  desktop.

V2 is **not**:

- A SaaS. There is no server-side component shipped in V2.
- A native iOS/Android binary. PWA covers mobile.
- A wearables hub. No Apple Health, Garmin, Whoop, etc.
- A nutrition or sleep tracker.
- An AI coach. (Optional local insights are fine; chatbots in the gym are not.)
- A real-time collaborative editor. Coach edits → exports → trainee imports.

For the full vision, see `PRODUCT.md`. For engineering and product rules, see `RULES.md`.

---

## 3. Architecture target for V2

The stack does not change. We are not rewriting the framework.

| Layer        | Stays                                                    | Changes in V2                                            |
| ------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| UI runtime   | React 19 + Vite + Tailwind 4                             | —                                                        |
| Type system  | TypeScript strict                                        | —                                                        |
| Routing      | react-router-dom v7 (HashRouter for Tauri compatibility) | Add Coach Mode routes under `/coach/*`                   |
| Client state | Zustand                                                  | Add `coachStore`, `planPackStore`                        |
| Async state  | TanStack Query                                           | Adopt for fitness reads (currently unused — see Phase 1) |
| Persistence  | sql.js + IndexedDB via idb-keyval                        | Add tables for clients, plan packs, sync metadata        |
| Desktop      | Tauri v2 scaffold                                        | Verified, signed builds for Windows + macOS              |
| Tests        | Vitest + jsdom + fake-indexeddb                          | Add Coach Mode + Plan Pack roundtrip tests               |

New runtime concepts introduced in V2:

- **Plan Pack** — a portable, signed JSON file (`.stfplan`) that bundles a
  complete training plan, the exercise library it references, presentation
  hints (Slovak/English copy), an optional cover note from the coach, and a
  signature so a trainee can verify the file is unmodified. The schema and
  validator live in `src/features/coach/planPack/`.
- **Recap Pack** — the symmetric file the trainee can hand back to the coach.
  Read-only history of completed sessions for a given plan, exportable as
  `.stfrecap` JSON. No auto-send. No upload.
- **Profiles** — the local concept of "who is using the app right now." A
  solo user has one profile (default, invisible). A coach has many profiles
  (one per client they work with) with a profile switcher. Each profile is a
  scope inside the same local SQLite DB; deleting a profile wipes only that
  profile's data after typed confirmation.

What we are deliberately **not** doing in V2:

- No Tauri Mobile, no Capacitor, no Expo, no React Native.
- No service-side anything (no Cloudflare Workers, no Supabase, no Firebase).
- No P2P sync engine. (Reserved for V2.1 as opt-in BYO storage. See `PRODUCT.md` §9.)
- No multi-trainer "agency" mode. One coach per install in V2.

---

## 4. Phase plan

V2 ships in **five sequential phases**. Each phase is a tag (`v2-phase-N`)
and a CHANGELOG entry. Acceptance criteria for each phase are non-negotiable;
if they are not green, the phase is not done. A phase may be recorded as
`DONE_WITH_CONCERNS` only when the remaining blockers are external, documented,
and explicitly owner-accepted; that status does not satisfy the final V2
release gate.

### Phase legend

- 🎯 **Goal** — what changes for the user when this phase ships
- 📦 **Modules** — the discrete units of work; each runs through the per-module protocol in `AGENTS.md`
- ✅ **Acceptance** — the gate that has to be green before we move on
- 🔍 **Verification** — exact commands to run

---

### PHASE 0 — Cleanup & ground truth (≈ 3–5 days)

🎯 **Goal:** the repo and its docs reflect V2 reality. The agent has one plan
to read, one vision to follow, one source-tree map to trust. No legacy bones.

📦 **Modules**

1. **Doc consolidation (DONE 2026-05-02)**
   - `docs/archive/` exists and contains the legacy `DEVELOPMENT_PLAN.md`,
     `AUDIT_REBUILD_PLAN.md`, and the entire `superpowers/` plans+specs tree
     from the April 2026 pivot. All carry an ARCHIVED banner.
   - `STINGFIT_V2_PLAN.md`, `PRODUCT.md`, updated `AGENTS.md` and `RULES.md`
     live at the repo root and are cross-linked.
2. **Source tree audit (DONE 2026-05-05)**
   - `docs/source-map.md` exists and describes every top-level folder under
     `src/`. Refresh it whenever the `src/` tree shifts.
   - Confirmed: no `features/notes/`, `features/tasks/`, `features/projects/`,
     `features/today/`, `features/views/`, `features/search/`, `features/capture/`
     directories exist. Only `features/fitness/` and `features/onboarding/`.
3. **Dependency audit (DONE 2026-05-05)**
   - `npm ls --depth=0` was reviewed against `package.json`.
   - Confirmed: no packages from the legacy notes era are installed:
     `tesseract.js`, `argon2-browser`, `chrono-node`, `marked`, `jszip`,
     `fuse.js`.
   - `lucide-react` is pinned to `1.7.0`; `marked` is absent.
4. **Test inventory (DONE 2026-05-05)**
   - `npm run test:run` passes with 92 test files / 211 tests on the current commit.
   - `tests/v2-baseline.test.ts` snapshots the current public surface of
     `fitnessRepository` so Phase 1 refactors don't silently change behavior.
5. **Tmp / scratch hygiene (DONE 2026-05-05)**
   - Confirmed `.tmp-*`, `.pi/`, `.pi-lens/`, `.superpowers/`, `.playwright-mcp/`,
     `.ruff_cache/` are all gitignored.
6. **README pointer (DONE 2026-05-05)**
   - `README.md` has a short "Working on this repo?" section near the top
     pointing to `STINGFIT_V2_PLAN.md` as the active plan and to `docs/archive/`
     as off-limits.

✅ **Acceptance**

- `npm run check` passes (`lint && test:run && build`).
- `docs/source-map.md` exists and matches reality.
- No legacy dep surfaces in `npm ls --depth=0`.
- A new contributor can answer "what should I read first?" by opening the repo
  root and seeing the V2 plan, vision, agent guide, and rules side by side.

🔍 **Verification**

```bash
npm install
npm run typecheck
npm run lint
npm run test:run
npm run build
npm ls --depth=0
```

---

### PHASE 1 — Performance & stability (≈ 1 week)

🎯 **Goal:** the V1 surface area gets faster and more robust. Nothing visibly
new, but every existing flow has measured budgets and observable failure modes.
This is the foundation Phase 2+ will build on.

📦 **Modules**

1. **Bundle audit and code-splitting (DONE 2026-05-05)**
   - `vite build` shows the main entry at 103.20 KB gzip; the only asset over
     200 KB gzip is `sql-wasm-UFUCzYNW.wasm` at 326.10 KB gzip.
   - `sql.js` runtime loading remains behind the first DB initialization, and
     startup entrypoints no longer statically import the database module.
   - `tools/bundle-budget.mjs` fails the build if the main entry chunk exceeds
     250 KB gzipped.
2. **DB boot path (DONE 2026-05-05)**
   - `sql.js` initialization now publishes boot metrics to
     `window.__STINGFIT_DEBUG__.databaseBoot` / `.databaseBoots`, including
     total, SQL runtime, storage, and migration durations.
   - `useDatabase` exposes an explicit `booting` / `ready` / `error` boundary
     so screens stay behind the app-level DB gate until boot completes.
3. **Adopt TanStack Query for fitness reads (DONE 2026-05-05)**
   - `src/features/fitness/queries/fitnessQueries.ts` wraps the current
     repository read bundles: dashboard reads (`getActiveSession`,
     `listStartableWorkouts`, `listExercises`, `getSettings`,
     `listPersonalPlans`, `listCompletedSessions`, `getPlanStructure`),
     history reads (`listCompletedSessions`, `getSettings`,
     `listStartableWorkouts`), and stats reads (`listCompletedSessions`,
     `getSettings`).
   - `FitnessDashboard`, `FitnessHistoryPage`, and `FitnessStatsPage` consume
     the query hooks while keeping existing loading, error, and empty states.
   - Mutations (`logSet`, `finishWorkout`, etc.) remain plain repository calls
     and invalidate the shared fitness query keys after successful writes.
4. **Optimistic set logging (DONE 2026-05-05)**
   - `LiveTrainingSession` now overlays a submitted set as completed before
     the repository write resolves, so the next planned set is immediately
     visible in the gym log.
   - Failed set writes roll back the optimistic row and raise a non-blocking
     toast while keeping the dashboard error path intact.
5. **Per-feature error boundaries (DONE 2026-05-05)**
   - Added `<FeatureErrorBoundary />` and wrapped Training, Quick Training,
     History, and Stats routes so a feature crash stays inside that screen.
   - Wrapped `LiveTrainingSession` inside `FitnessDashboard` with a local
     fallback, keeping the active session in local storage even if the live
     rendering path crashes.
6. **Mobile PWA smoke run (BLOCKED 2026-05-05)**
   - Requires a real iOS Safari device and a real Android Chrome device.
   - Blocked in the agent environment because no physical mobile devices are
     available here; do not mark Phase 1 complete until the smoke report is
     updated with current device results.
7. **Privacy/network audit refresh (DONE 2026-05-05)**
   - Re-ran the automated audit (`tests/fitness-privacy-network-audit.test.ts`)
     and confirmed zero outbound telemetry/network calls outside the same-origin
     service worker cache path.
   - Refreshed `reports/stingfit-privacy-network-audit.md` with the 2026-05-05
     PASS result.

✅ **Acceptance**

- Main entry chunk ≤ 250 KB gzipped, `sql.js` WASM lazy-loaded.
- Cold open → first interaction on a 2-year-old Android < 1.5 s.
- `npm run check` green.
- The mobile smoke report is updated with a current date and device list.
- Privacy audit shows zero outbound calls.

🔍 **Verification**

```bash
npm run check
node ./tools/bundle-budget.mjs
npm run mobile:pwa:start  # smoke on a real device, then stop
```

---

### PHASE 2 — UX polish & killer features (≈ 2 weeks)

🎯 **Goal:** the V1 trainee experience goes from "good" to "the one I want
people to see in a demo." This is where StingFit becomes visibly better than
Excel.

📦 **Modules**

1. **SetLogger ergonomic pass (DONE 2026-05-05)**
   - Added one-thumb weight jumps for `±2.5/±5 kg`, kept `reps ±1`, and added
     RIR `0–4` chips on one row without removing numeric RIR input.
   - Confirmed hard ranges stay enforced: weight 0–500 kg, reps 0–999, RIR
     0–10. Submit remains disabled on overflow with inline messages.
   - Updated the `lastPerformance` badge to show `Naposledy: 80 kg × 8 @ RIR 2,
pred 4 dňami`; the badge remains wired through the existing repository
     live-session `lastPerformance` hydration.
2. **Rest timer signals (DONE 2026-05-05)**
   - Confirmed rest end fires `navigator.vibrate([200, 100, 200])` and a
     WebAudio beep through `RestTimer` / `restAlerts`.
   - Added regression coverage that the first `Zapísať sériu` tap arms the
     WebAudio context, and confirmed `FitnessSettingsPage` persists `Zvuk
pauzy` and `Vibrácie pauzy` preferences.
3. **Stats charts (DONE 2026-05-05)**
   - Confirmed the 1RM trend uses the existing small inline SVG renderer and
     now renders from the first completed working point with `Základ` delta.
   - Added chart edge-case coverage for 0 completed sessions, 1 completed
     session, and 200 completed sessions while preserving the 12-week heatmap
     and muscle-group volume summaries.
   - Kept the existing muscle-group volume bars wired to the current recovery
     and volume recommendation engine without adding a charting dependency.
4. **Recovery panel (DONE 2026-05-05)**
   - Surfaced existing recovery signals as a dedicated `Regenerácia dnes` card
     on `FitnessDashboard`.
   - Added a clear `Dnes: ...` action line before the next-workout card, using
     existing strain/volume signals from `buildProgressSnapshot`.
5. **Plate calculator surfacing (DONE 2026-05-05)**
   - Kept the existing plate logic and moved the shared UI into `PlateLoadPanel`.
   - Made the live `SetLogger` plate calculator collapsed by default so it is
     reachable without crowding the one-thumb logging flow.
   - Added a standalone `/plates` screen reachable from the command palette and
     mobile bottom nav.
6. **Empty/error/loading states pass (DONE_WITH_CONCERNS 2026-05-05)**
   - Added an automated empty-database route walk for `/training`, `/quick`,
     `/plans`, `/history`, `/stats`, `/plates`, and `/settings`.
   - Confirmed the audited routes show fitness-specific, actionable empty copy
     and reject generic empty strings such as `Nothing here yet` or `No data`.
   - Browser screenshots are documented as blocked in
     `reports/stingfit-empty-state-audit.md` because the agent environment has
     no browser automation MCP tool or local headless browser.
7. **i18n consolidation (DONE_WITH_CONCERNS 2026-05-05)**
   - Added `src/i18n/en.ts` as a placeholder catalog with the same key/function
     shape as `sk`.
   - Moved shared plate calculator, set-logger plate helper, History route
     shell/empty/loading/error, and Stats route shell/empty/loading/error copy
     into `src/i18n/sk.ts`.
   - Full legacy-string consolidation remains a follow-up risk; see
     `reports/stingfit-i18n-consolidation.md` for remaining large surfaces.
8. **Onboarding refresh (DONE 2026-05-05)**
   - Removed the generic first-run intro steps before setup.
   - First-time onboarding now lands directly on the simple-start builder with
     the Quick Workout path visible immediately.
   - Kept local privacy and theme choice visible as secondary, non-blocking
     context, with new onboarding/simple-start copy in `src/i18n/sk.ts`.

✅ **Acceptance**

- A first-time trainee can go from cold install → logged 5 sets in < 90
  seconds without help.
- Every chart renders correctly with 0 data, 1 data point, and 200 data points.
- All user-facing copy resolves through `src/i18n/sk.ts`.
- `npm run check` green; new tests cover lastPerformance, range validation,
  rest signals settings, and chart edge cases.

🔍 **Verification**

```bash
npm run check
npm run mobile:pwa:start  # eyes on a real device for the chart pass
```

---

### PHASE 3 — Coach Mode & Plan Packs (≈ 2 weeks)

🎯 **Goal:** StingFit becomes the coach↔trainee bridge described in
`PRODUCT.md`. This is the V2-defining phase.

📦 **Modules**

1. **Profiles (DONE 2026-05-05)**
   - Added the local `profiles` table (`id`, `name`, `kind ['solo' | 'coach' | 'client']`,
     `created_at`, `archived_at`) and migrated existing installs into the
     default `solo` profile.
   - Added an explicit `active_profile_id` local app setting plus repository
     helpers for listing, creating, and activating profiles.
   - Added a top-bar profile switcher that stays hidden for solo users until a
     second profile exists.
2. **Coach Mode toggle (DONE 2026-05-05)**
   - Added the local `coach_mode_enabled` app setting, off by default.
   - Added `Som tréner` in Settings to expose Coach Mode without any account,
     cloud, or sync behavior.
   - Added guarded `/coach/clients`, `/coach/plans`, `/coach/templates`, and
     `/coach/recaps` routes. They show an unavailable state until Coach Mode is
     explicitly enabled.
3. **Plan Pack format (`.stfplan`) (DONE 2026-05-05)**
   - Defined the Zod schema in `src/features/coach/planPack/schema.ts`.
   - `exportPlanPack(planId): Blob` emits `application/vnd.stingfit.plan+json`
     with `version`, `createdAt`, `coachName`, `coachNote`, full plan tree,
     referenced exercise library entries, `presentation`, and a HMAC-SHA256
     `signature` over canonical JSON. The signature is tamper evident, not
     tamper proof.
   - `importPlanPack(file)` validates schema + signature, returns a preview,
     and commits the pack as a local draft personal plan without account,
     cloud, or sync behavior.
   - Round-trip coverage verifies export → re-import → identical normalized
     payload, fresh-database commit, and tamper rejection.
4. **Recap Pack format (`.stfrecap`) (DONE 2026-05-05)**
   - Added `src/features/coach/recapPack/schema.ts` with a Zod schema that
     mirrors Plan Pack metadata but carries completed sessions instead of a
     plan tree.
   - Added `exportRecapPack()` and `importRecapPack()` in
     `src/features/coach/recapPack/io.ts`. Recap import validates schema and
     signature and returns a read-only preview; it does not commit data into
     the coach database.
   - Round-trip coverage verifies export → re-import → identical normalized
     payload and tamper rejection.
5. **Coach UI (DONE 2026-05-06)**
   - `/coach/clients` lists local `client` profiles and truthfully shows that
     they have no assigned recap yet because fitness data is not profile-scoped
     in this phase.
   - `/coach/plans` lists local personal plans, links back to the existing plan
     editor, and exports selected plans as `.stfplan` Plan Packs.
   - `/coach/templates` shows a local-first empty state for future private coach
     templates without adding a new table before the template workflow exists.
   - `/coach/recaps` accepts `.stfrecap` files and renders a read-only preview
     without writing recap data into the coach database.
6. **Trainee UI (DONE 2026-05-06)**
   - In `Settings`, `Importovať plán od trénera` opens a `.stfplan` file
     picker, renders a Plan Pack preview, then commits the plan as a local
     draft personal plan.
   - In `History`, `Vytvoriť rekap pre trénera` lets the trainee pick a date
     range and exports a `.stfrecap` from matching completed local sessions.
7. **Privacy guarantees (DONE 2026-05-09)**
   - Plan Pack and Recap Pack payload audits now assert no device identifiers,
     IP metadata, telemetry IDs, accounts, cloud-sync fields, or server routing
     metadata. They use only chosen profile display names plus workout payloads.
   - Re-ran the privacy audit and updated
     `reports/stingfit-privacy-network-audit.md` for the Phase 3 Coach Mode
     handoff flows.
8. **Tests**
   - `tests/coach-plan-pack-roundtrip.test.ts`
   - `tests/coach-recap-pack-roundtrip.test.ts`
   - `tests/coach-ui.test.tsx`
   - `tests/trainee-ui.test.tsx`
   - `tests/fitness-privacy-network-audit.test.ts`
   - `tests/coach-mode-permissions.test.tsx` (Coach routes are 404 unless
     Coach Mode is enabled)

✅ **Acceptance**

- A coach can create a plan, export a `.stfplan`, AirDrop / send / hand it on
  USB to a trainee on a fresh install, and the trainee can be logging the
  first workout from that plan in under 5 minutes total.
- A trainee can build a `.stfrecap`, send it to the coach, and the coach can
  see what the trainee did, without anyone creating an account.
- Coach Mode is invisible (zero UI surface) until the user explicitly enables it.
- `npm run check` green; new round-trip tests pass.

🔍 **Verification**

```bash
npm run check
# Manual: paired-device smoke (two browsers / a phone + a laptop)
```

---

### PHASE 4 — Distribution (DONE_WITH_ACCEPTED_CONCERNS 2026-05-12)

🎯 **Goal:** anyone with the link can install StingFit on a phone and on a
laptop in under 60 seconds, and the install is signed and trustworthy.

📦 **Modules**

1. **PWA install funnel (DONE 2026-05-10)**
   - `public/manifest.webmanifest`, screenshots, iconset, offline fallback,
     and service-worker cached install help are covered by PWA asset tests.
   - `docs/install.md` documents step-by-step install on iOS Safari,
     Android Chrome, and desktop Chrome/Edge.
   - Settings → Inštalácia aplikácie keeps the OS install prompt where
     supported and falls back to the local `/install.html` guide.
2. **Tauri desktop builds (BLOCKED 2026-05-10)**
   - `npm run tauri -- info` confirms WebView2 is available, but Rust, Cargo,
     rustup, and Visual Studio Build Tools with MSVC/Windows SDK components are
     missing on this machine.
   - The blocker is documented in `reports/stingfit-tauri-desktop-builds.md`;
     Phase 4 continues as a PWA-only release until native build tooling is
     available.
   - App version, icons, window title, `frontendDist`, and HashRouter
     compatibility are covered by `tests/fitness-tauri-desktop-builds.test.ts`.
3. **Public hosting (LIVE 2026-05-12)**
   - GitHub Pages is the selected static host because the repo already targets
     `Vypa1nik/stingfit` and does not require Cloudflare account secrets.
   - `.github/workflows/deploy-pwa.yml` builds with `VITE_BASE_PATH=/stingfit/`,
     uploads `dist`, and publishes on `v2*` tag pushes or manual dispatch.
   - Deploy run `25764435187` completed successfully, and the live PWA URL is
     `https://vypa1nik.github.io/stingfit/`.
   - Vite, the manifest, the service worker, and static install/offline pages
     are compatible with the GitHub Pages project URL.
   - Lighthouse passed against the live URL: Performance 87, Accessibility 100,
     Best Practices 100, SEO 100, and PWA installable manifest PASS.
4. **Release docs (APPROVED_WITH_ACCEPTED_CONCERNS 2026-05-12)**
   - `README.md` now has the two-paragraph "What is StingFit" intro aligned
     with `PRODUCT.md`, the live GitHub Pages install URL, and explicit
     desktop-download blocker wording instead of unverified `.msi`/`.dmg` links.
   - `CHANGELOG.md` now has a `## v2.0.0 - 2026-05-12` section listing
     Phases 0-4 and the accepted release concerns.
   - `reports/stingfit-v2-release-readiness.md` records the PWA-only release
     path, omitted desktop download links, live Pages deploy, passing
     Lighthouse verification, and owner-accepted manual smoke concerns.
   - The owner approved the `v2.0.0` PWA-only release on 2026-05-12 and
     accepted the remaining manual concerns: real mobile PWA install/offline
     smoke, paired-device Coach Mode smoke, and desktop installers as a future
     track.
5. **Landing one-pager (READY 2026-05-10)**
   - `docs/landing/index.html` is a static launch-first one-pager with the
     tagline, PWA install CTA, existing screenshot assets, inline Coach handoff
     mockup, and short FAQ for privacy, accounts, pricing, and coach usage.
   - PWA install links point to `https://vypa1nik.github.io/stingfit/`.
   - `.msi` and `.dmg` actions are shown as disabled `Desktop pending` states,
     not as verified download links.

✅ **Acceptance**

- Lighthouse PWA Installable: pass.
- Lighthouse Performance: ≥ 85 (mobile, mid-range).
- Lighthouse Accessibility: ≥ 95.
- Tag `v2.0.0` exists; the release notes list the PWA as the installable
  artefact, desktop installers as a future track, and the PWA URL is live.

🔍 **Verification**

```bash
npm run check
npm run build
npm run preview          # spot-check the static bundle
npm run tauri:build      # if Rust toolchain available
```

---

## 5. Cross-cutting rules for V2 work

- **Local-first stays the default.** Any deviation requires an explicit
  written change to `PRODUCT.md` plus user sign-off. Agents must not weaken
  this rule on their own.
- **No new heavy dependencies without explicit approval.** A short list of
  pre-approved adds for V2: nothing. (The current stack covers all five phases.)
- **Schema changes require a migration in `src/lib/migrations.ts` and a
  regression test in `tests/`.**
- **Every module ends with a CHANGELOG entry** under `## Unreleased`. Phase
  closes promote those entries under `## v2.0.0` (or interim tag).
- **`npm run check` is the verification gate** for every module. No exceptions.
- **If a fix loops 3+ times, stop and revert** to the last green state, then
  surface the loop to the user with two alternatives.

## 6. What NOT to do during V2

- Do **not** add: cloud sync, login, account system, telemetry, analytics,
  subscription, paywall, ads, social feed, leaderboard, public profile,
  marketplace, AI chatbot, wearables sync, nutrition tracking, sleep tracking,
  habit tracking, real-time collaborative editing.
- Do **not** rewrite the existing fitness module. The V1 fitness loop is the
  product. We extend it; we do not replace it.
- Do **not** revisit ideas from `docs/archive/` without explicit user approval.
- Do **not** delete user data on the device without typed confirmation.
- Do **not** introduce a new framework, router, state library, or DB.

## 7. Definition of Done for V2

This section is the final V2 closing gate, not the current Phase 4 status. The
`v2.0.0` tag waits until each item below is green or explicitly owner-accepted
in the release notes.

- All 5 phases tagged (`v2-phase-0` … `v2-phase-4`) and the meta-tag `v2.0.0`.
- `npm run check` green on `main`.
- Bundle ≤ target budgets (Phase 1 acceptance).
- Lighthouse PWA install + a11y ≥ 95 + perf ≥ 85.
- A coach can hand a Plan Pack to a trainee and the trainee logs from it,
  on hardware neither has touched before, in under 5 minutes.
- `README.md`, `PRODUCT.md`, `CHANGELOG.md`, `STINGFIT_V2_PLAN.md`
  agree with each other. Anything in `docs/archive/` carries the ARCHIVED
  banner and is never linked from active docs.

## 8. Order of operations for the agent

When the user says "let's start V2," the agent's first three actions are:

1. Re-read `STINGFIT_V2_PLAN.md`, `PRODUCT.md`, `RULES.md`, `AGENTS.md`.
2. Run `npm run check` to confirm the baseline is green.
3. Ask the user: "Phase 0 module list — okay to start with module 2 (source
   tree audit)?" then wait for confirmation.

The agent then enters the per-module protocol described in `AGENTS.md` and
does **one module at a time**.

---

_End of plan. If something here disagrees with reality (the source tree
moved, a dep is gone, an acceptance criterion is unmeasurable), STOP and
update this document via a user-approved edit before writing code._
