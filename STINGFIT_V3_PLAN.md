# StingFit V3 — Calm Architecture & Progress Journal

> **This is the single authoritative plan for StingFit going forward (V3).**
> It supersedes `STINGFIT_V2_PLAN.md` as the active rebuild brief.
> Agents must use only this plan together with `PRODUCT.md`, `RULES.md`,
> `AGENTS.md`, `README.md`, and the live source tree.
> `STINGFIT_V2_PLAN.md` becomes historical context — read only for "why we got
> here." Anything in `docs/archive/` is read-only history.

_Last revised: 2026-05-22_
_Owner: Kristián_
_Codename: V3 — "Calm & Clear"_
_Replaces: STINGFIT_V2_PLAN.md (V2 shipped; this is the current shipped cycle)_
_Post-release state: V3 shipped locally as `3.0.0`; V3.0.1 is the public GitHub Pages PWA cache/update patch._

---

## 0. Why this plan exists

V2 shipped. The fitness loop **Start → Log → Finish → Learn** works, Coach
Mode and Plan Packs work, the PWA installs. But after V2 the app surface grew
into a *flat tab strip with seven peers* (`/training`, `/quick`, `/plans`,
`/history`, `/stats`, `/plates`, `/settings`, plus four `/coach/*` routes). A
new user opens the app and sees:

- A desktop sidebar with four tabs labeled *Tréning / Plány / História /
  Štatistiky* — none of which obviously means "tap here to see how much
  stronger I'm getting."
- A mobile bottom bar with **six** equally-weighted tiles. Best-practice cap
  is 4–5.
- A "Štatistiky" page that conflates session-aggregate metrics, per-exercise
  e1RM, muscle-group volume, *and* recovery signals — too much in one stream,
  and still no free-form journal or body-weight tracker.
- A "Kotúče" calculator sitting at the **same hierarchical level** as the
  user's whole training history, even though it's a 5-second utility.

V3 fixes that by reorganizing the surface around **three things the user
actually does** (Train, see Progress, manage Plans) and by adding the
**Progress / Journal** space the user asked for. Everything else (plate
calculator, settings, coach mode, data export) recedes to where it belongs.

This plan is also the place that promises: *no feature is removed in V3*. The
plate calculator, the rest timer, the corrections audit, all coach mode
routes, every working V2 feature continues to work and is reachable. The
rebuild is about **information architecture and one new feature surface**, not
about deleting work.

---

## 1. Read first (do not skip)

1. Read this whole file once before writing any code.
2. Read `PRODUCT.md` (vision and anti-goals) and `RULES.md` (engineering rules)
   once before writing any code.
3. Skim `AGENTS.md` for the small-module / verification-gate / changelog
   protocol.
4. Confirm with the user **which phase of section 8** is active before
   starting work. Phases are sequential.
5. Within a phase, work one module at a time per `AGENTS.md`.
6. If this plan disagrees with `PRODUCT.md`, `PRODUCT.md` wins on vision and
   `RULES.md` wins on engineering. Stop and ask the user — don't silently
   pick a side.
7. `STINGFIT_V2_PLAN.md` is **archive context**. Do not import its open TODOs
   into this plan unless this plan explicitly re-states them in section 8.

---

## 2. Inventory — what V3 starts from

The codebase as of 2026-05-17:

- React 19 + Vite + TypeScript + Tailwind. HashRouter. React Query.
- Local-only sql.js database (`stingfit.db`). Migrations in
  `src/lib/migrations.ts` at `v001..v003`.
- Routes (all reachable, all working):
  - `/training` — `FitnessDashboard` (today + live session)
  - `/quick` — `FitnessQuickSessionPage` (free workout)
  - `/plans` — `FitnessPlansPage` (templates + personal builder)
  - `/history` — `FitnessHistoryPage` (session log + detail)
  - `/stats` — `FitnessStatsPage` (PR + heatmap + volume + recovery)
  - `/plates` — `FitnessPlateCalculatorPage`
  - `/settings` — `FitnessSettingsPage` (units, export, coach toggle, danger zone)
  - `/coach/{clients,plans,templates,recaps}` — Coach Mode (behind toggle)
- Top nav source of truth: `src/lib/constants.ts` (`VIEW_NAV_ITEMS`,
  `WORKSPACE_NAV_ITEMS` — the latter is empty).
- Mobile bottom nav: `src/components/layout/MobileBottomNav.tsx`
  (6 items, primary is `/quick`).
- All UI copy is in `src/i18n/sk.ts` (Slovak primary) and `src/i18n/en.ts`.
- Existing progress signal sources already implemented in
  `src/features/fitness/fitnessProgress.ts`:
  - PR events (`FitnessPrEvent`)
  - e1RM series per exercise (`FitnessOneRepMaxSeries`)
  - Training heatmap, exercise-volume leaders, muscle-group summaries,
    recovery signals, progression hints.
  - **None of these are charted as line graphs yet** — they're displayed as
    badges / cards / heatmap cells.

What is **missing** today, and is therefore the V3 scope:

- A first-class "Progress / Journal" surface (currently scattered across
  `/stats` and `/history`).
- A line chart of working weight and e1RM **per exercise, over weeks**.
- Body-weight tracking and basic body measurements (waist, chest, biceps,
  thigh).
- Per-session free-form journal text the user actually writes (separate from
  RPE / energy fields).
- A calm 5-tab mobile bottom nav.
- A grouped desktop sidebar that reads top-to-bottom: *what you do today →
  what you've done → what you'll do next → tools → settings*.

---

## 3. Product principles for V3 (in addition to `PRODUCT.md`)

V3 inherits every principle in `PRODUCT.md`. V3 adds three operating
principles specific to this rebuild:

1. **One job per surface.** Each top-level destination answers one question:
   *Train* answers "what do I do right now"; *Progress* answers "am I getting
   better"; *Plans* answers "what's my next month look like." If a screen
   answers two questions, it gets split.
2. **Calculators are tools, not destinations.** The plate calculator,
   future tempo calculator, future warm-up calculator are reachable from the
   set-logger and from a "Tools" drawer — they are **not** peers of "Tréning"
   in the main nav.
3. **The journal is a feature, not a settings field.** Free-form notes
   become first-class — searchable, datestamped, exportable — instead of
   buried in the session-finish dialog.

---

## 4. New information architecture

### 4.1 The three pillars

```
TRAIN              PROGRESS             PLAN
("right now")      ("am I improving?")  ("what's next?")
─────────────      ──────────────────   ──────────────
Today              Lifts (charts)       My plans
Live session       PR timeline          Templates
Quick workout      Body measurements    Builder
                   Journal              Coach mode (toggle)
                   History (sessions)
```

Everything else is either inside a pillar (e.g. the plate calculator lives
inside Train) or behind a *secondary* section:

```
TOOLS              SETTINGS
─────────────      ──────────────
Plate calc         Units & display
(future calcs)     Data & backup
                   Coach mode toggle
                   Privacy & reset
```

### 4.2 Route map (V3 target)

V3 keeps every V2 URL working (redirects) and adds new ones. The new map:

| New URL              | Page / state                              | Replaces                |
|----------------------|-------------------------------------------|-------------------------|
| `/` → `/train`       | Train hub (today)                          | `/` → `/training`        |
| `/train`             | `FitnessDashboard` (today + start CTA)     | `/training`              |
| `/train/live`        | Active `LiveTrainingSession`               | (inline in `/training`)  |
| `/train/quick`       | `FitnessQuickSessionPage`                  | `/quick`                 |
| **`/progress`**      | **NEW** — Progress hub (default: lifts)    | part of `/stats`         |
| **`/progress/lifts`**| **NEW** — Per-exercise line charts         | bits of `/stats`         |
| **`/progress/prs`**  | **NEW** — PR timeline feed                 | bits of `/stats`         |
| **`/progress/body`** | **NEW** — Body weight + measurements       | (did not exist)          |
| **`/progress/journal`** | **NEW** — Free-form journal              | (did not exist)          |
| `/progress/history`  | `FitnessHistoryPage` (moved under Progress)| `/history`               |
| `/plans`             | Personal + starter plans (unchanged)       | `/plans`                 |
| `/plans/coach/...`   | Coach Mode (re-nested under plans)         | `/coach/...`             |
| `/tools/plates`      | Plate calculator (moved under tools)       | `/plates`                |
| `/settings`          | Settings (re-grouped, no behavior change)  | `/settings`              |

Implementation rule: **old URLs must keep redirecting** (`/stats → /progress`,
`/history → /progress/history`, `/plates → /tools/plates`,
`/coach/* → /plans/coach/*`) for at least one full release so anyone with a
PWA shortcut or a memorized URL doesn't get a 404.

### 4.3 Desktop sidebar (target)

```
StingFit
─────────────────────────────
TRÉNING
  · Dnes
  · Rýchly tréning

PROGRES
  · Cviky (grafy)
  · PR timeline
  · Telo
  · Zápisník
  · História

PLÁNY
  · Moje plány
  · Šablóny
  · Coach Mode        (badge: ON/OFF)

NÁSTROJE
  · Kalkulačka kotúčov

─────────────────────────────
⚙ Nastavenia
```

Three groups (Tréning / Progres / Plány) match the three pillars. *Nástroje*
is a small fourth group. Settings is the footer link.

### 4.4 Mobile bottom nav (target)

Five tiles, primary in the middle:

```
[ Tréning ]  [ Progres ]  [ + Tréning ]  [ Plány ]  [ Viac ]
   Dnes        charts/PR     primary       my plans   sheet
                             (start)
```

- **+ Tréning** (primary, large) routes to `/train` if no live session exists,
  or resumes `/train/live` if one does.
- **Viac** opens a bottom sheet with: Kalkulačka kotúčov, Coach Mode, História,
  Nastavenia, Export/Import. (This replaces today's separate Plates and Stats
  tiles on mobile — both are reachable from inside Progres / Tools.)
- 6 → 5 tiles. The primary tile is no longer ambiguous ("Rýchly" was easy to
  misread as "Tréning"); it now clearly says **+ Tréning**.

### 4.5 What goes where (decision table)

If you are about to add or move a feature, find the row in this table:

| Feature                              | V3 home                                 |
|--------------------------------------|-----------------------------------------|
| Start today's planned session        | `/train` (hero CTA)                     |
| Free workout / no plan               | `/train/quick`                          |
| Continue an active session           | `/train/live`                           |
| See weekly heatmap / consistency     | `/progress` (Progress hub default tab)  |
| Line chart for one exercise          | `/progress/lifts`                       |
| Feed of PR achievements              | `/progress/prs`                         |
| Body weight, waist, chest, etc.      | `/progress/body`                        |
| "How did this session feel" notes    | `/progress/journal` (and inline-prompt at session finish) |
| Old session detail                   | `/progress/history` → session detail    |
| Build / edit a plan                  | `/plans` (builder embedded)             |
| Author a plan as a coach             | `/plans/coach/plans`                    |
| Send / receive a Plan Pack           | `/plans/coach/templates` (export) / `/settings` (import) |
| Plate-on-bar math                    | `/tools/plates` and inside set-logger   |
| Units, theme, data, danger zone      | `/settings`                             |
| Coach Mode on/off                    | `/settings` (master toggle) + visible from sidebar |

If a feature cannot find its row, it does **not get added to the nav** until
this plan is updated.

---

## 5. The Progress / Journal surface (the new feature)

This section is the spec for what the user explicitly asked for: a place to
track *"jak ide hore na váhe s kotúčami a tak ďalej"* — i.e. real
progression — plus a free-form journal.

### 5.1 Structure

`/progress` is a hub with four tabs (lifts / PRs / body / journal) plus a
fifth pinned link to `/progress/history`. The hub remembers the last viewed
tab in `localStorage` (`stingfit:progress:lastTab`).

```
PROGRES
┌──────────────────────────────────────────────────────────────┐
│ Cviky   PR Timeline   Telo   Zápisník        ⤺ História       │
└──────────────────────────────────────────────────────────────┘
[ Hero strip: weekly consistency · weekly volume · last PR ]
[ Active tab content ]
```

### 5.2 Tab 1 — Cviky (per-exercise lifts)

The headline feature. For every exercise the user has ever completed a
working set on:

- **Exercise picker** (default: top 5 by completed-set count; "All exercises"
  drawer).
- **Line chart** with two series toggled by chips:
  - "Pracovná váha" — heaviest working set per session (kg, y-axis).
  - "Odhad 1RM" — Epley-estimated e1RM per session, already computed in
    `fitnessProgress.ts::estimateOneRepMaxKg`.
- **Reference markers** on the chart: the user's all-time PR (gold ⭐) and
  the current 4-week trailing average (dashed).
- **Recent sets** mini-table under the chart (last 6 sessions, columns:
  date, weight×reps@RIR, e1RM, Δ vs prior session).
- **Plate suggestion link** for the next session ("Skús 82.5 kg → 2× 20 + 1×
  1.25 na stranu"), delegating to existing `plateCalculator.ts`.

Data source: existing `FitnessOneRepMaxSeries` aggregator. No new tables
needed for this tab.

### 5.3 Tab 2 — PR Timeline

Chronological feed of `FitnessPrEvent` rows (already computed). Each card:

- Date + exercise + the magic line: *"82.5 kg × 5 — odhad 1RM 95.7 kg
  (+3.2 kg od posledného)"*.
- Tag chips: 1RM PR / 3RM PR / 5RM PR / Volume PR (we can derive the four
  variants from the existing series; spec a `prType` field — see 5.6).
- Tap → opens that session's detail page.

Filters: exercise (multi-select), date range, PR type. Empty state:
*"Zatiaľ žiadne PR. Dokonči tréning a sem napadajú odznaky."*

### 5.4 Tab 3 — Telo

Track body-weight and circumferences over time. Inputs:

- **Bodyweight** (kg or lb, follows `displayUnit`).
- **Obvody** (cm): pás, hrudník, biceps (ľ/p), stehno (ľ/p), lýtko (ľ/p).
  All optional. Free-form note per entry.
- **Photo URL slot** (optional, local file pointer — V3 does **not** upload).

Display: three small line charts (bodyweight, waist, chest) stacked, plus a
"latest measurements" pinned card.

Requires a new table — see 5.6 for the migration.

### 5.5 Tab 4 — Zápisník (journal)

A simple, fast journal:

- One entry per day, free-form markdown (rendered with the project's existing
  markdown story — or plain text if not available).
- Each entry can be linked to a session (auto-linked when written inside the
  session finish dialog).
- Tags via `#` prefix in the body (auto-extracted, not a separate UI field).
- Search bar across all entries (substring, in-memory — never leaves device).
- "Quick prompts" buttons under the textarea: *Ako som sa cítil?* / *Spánok?*
  / *Energia?* / *Strava pred tréningom?*. Tapping inserts a header line.

Requires a new table — see 5.6.

### 5.6 Schema additions (migration `v004`)

`v004` introduces two new tables and one column. All additive; no V2 column
is changed.

```sql
-- v004 — Progress journal & body measurements
CREATE TABLE IF NOT EXISTS fitness_body_measurements (
  id TEXT PRIMARY KEY,
  recorded_on TEXT NOT NULL,           -- YYYY-MM-DD
  bodyweight_kg REAL DEFAULT NULL,
  waist_cm REAL DEFAULT NULL,
  chest_cm REAL DEFAULT NULL,
  biceps_left_cm REAL DEFAULT NULL,
  biceps_right_cm REAL DEFAULT NULL,
  thigh_left_cm REAL DEFAULT NULL,
  thigh_right_cm REAL DEFAULT NULL,
  calf_left_cm REAL DEFAULT NULL,
  calf_right_cm REAL DEFAULT NULL,
  note TEXT NOT NULL DEFAULT '',
  photo_uri TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fitness_body_measurements_date
  ON fitness_body_measurements(recorded_on);

CREATE TABLE IF NOT EXISTS fitness_journal_entries (
  id TEXT PRIMARY KEY,
  entry_date TEXT NOT NULL,            -- YYYY-MM-DD
  session_id TEXT DEFAULT NULL,        -- optional link to a session
  body TEXT NOT NULL DEFAULT '',
  mood INTEGER DEFAULT NULL,           -- 1..5
  sleep_hours REAL DEFAULT NULL,
  energy INTEGER DEFAULT NULL,         -- 1..5
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES fitness_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_fitness_journal_entries_date
  ON fitness_journal_entries(entry_date);

-- (No FitnessPrEvent table — PR events stay derived. We add a
--  derived `prType` field in TypeScript, not in SQL.)
```

Append a `v004` block to the `MIGRATIONS` array in
`src/lib/migrations.ts`. **Do not** edit `v001..v003`.

### 5.7 Export / import

Both new tables become part of `FitnessExportPayload` (bump
`FitnessExportPayload.version` from `1` to `2`, and add a migration shim that
treats v1 imports as "no body measurements, no journal"). Coach Mode Plan
Packs and Recap Packs do **not** include journal entries — those are
deeply personal and stay on-device unless the user runs the full backup
export.

---

## 6. Visual / interaction rules (deltas only)

The full design system lives in `RULES.md` and the existing Tailwind theme.
V3 only adds:

- **Section header rhythm:** every Progress tab opens with the same
  three-card hero strip (weekly consistency · weekly volume · last PR) so the
  user always sees their headline numbers regardless of which tab is active.
- **Charts:** use the existing chart library (or `recharts` if not yet
  installed; check `package.json` before importing). Default 12-week window,
  toggle to 4 / 12 / 26 / all.
- **Color rule:** PR markers and the "+ Tréning" mobile FAB share the
  fitness-yellow accent. All other accents stay calm/secondary.
- **No emoji in product copy.** Stays consistent with `PRODUCT.md` principle 4.

---

## 7. Migration & risk plan

Each phase below is small enough to ship behind a feature flag if needed and
big enough to be a single PR. All work follows the per-module protocol in
`AGENTS.md` (small modules, verification gate, CHANGELOG entry).

### Phase 1 — IA rebuild (no behavior change)

1. Rename / add routes in `src/router.tsx`:
   - Add `/train`, `/train/live`, `/train/quick`, `/progress`,
     `/progress/lifts`, `/progress/prs`, `/progress/body`, `/progress/journal`,
     `/progress/history`, `/tools/plates`, `/plans/coach/...`.
   - Add redirects for every old URL (`/training → /train`, `/quick →
     /train/quick`, `/stats → /progress`, `/history → /progress/history`,
     `/plates → /tools/plates`, `/coach/* → /plans/coach/*`).
2. Update `src/lib/constants.ts` `VIEW_NAV_ITEMS` (and a new
   `PROGRESS_NAV_ITEMS`, `TOOLS_NAV_ITEMS`) to drive the sidebar groups.
3. Update `src/components/layout/NavigationSidebar.tsx` to render four
   groups (Tréning / Progres / Plány / Nástroje) + footer Settings, with
   correct icons (`Dumbbell`, `Activity`, `ClipboardList`, `Calculator`).
4. Update `src/components/layout/MobileBottomNav.tsx` to 5 tiles: Tréning,
   Progres, **+ Tréning** (primary), Plány, Viac (sheet trigger).
5. Add `MoreSheet.tsx` — bottom sheet listing Kalkulačka kotúčov / Coach Mode
   / História / Nastavenia / Export-Import.
6. Update `src/i18n/sk.ts` + `src/i18n/en.ts` with new labels.
7. Update `App.tsx` command palette `actions` to point at new paths.
8. Verification gate: `npm run typecheck && npm run lint && npm run test:run`
   green; smoke-click every nav tile on desktop and mobile preview.

### Phase 2 — Progress hub (extract from Stats)

1. Create `src/features/progress/` directory.
2. Move PR rendering and e1RM-series rendering from `FitnessStatsPage.tsx`
   into `ProgressPRsTab.tsx` and `ProgressLiftsTab.tsx`.
3. Build `ProgressHubPage.tsx` with tab routing and the shared hero strip.
4. `FitnessStatsPage.tsx` becomes a thin wrapper that re-exports the hub for
   `/progress` while the redirect from `/stats` lands users on `/progress`.
5. Add line charts for `ProgressLiftsTab` using the existing
   `FitnessOneRepMaxSeries` data — no new aggregation logic needed yet.
6. Verification gate.

### Phase 3 — Body measurements

1. Add migration `v004` (body measurements table) to
   `src/lib/migrations.ts`.
2. Create `src/features/progress/bodyMeasurementsRepository.ts` mirroring
   the style of `fitnessRepository.ts`.
3. Create `ProgressBodyTab.tsx` — list + add/edit form + small charts.
4. Wire into `ProgressHubPage`.
5. Add export/import support (bump payload version to 2; v1 imports
   gracefully ignore missing keys).
6. Unit tests for the repository + the v1→v2 import shim.
7. Verification gate.

### Phase 4 — Journal

1. Add migration `v004` (already from phase 3) — second table:
   `fitness_journal_entries`.
2. Create `journalRepository.ts`.
3. Create `ProgressJournalTab.tsx` — date-grouped entry list, editor with
   quick-prompt chips, in-memory text search.
4. Add an opt-in *"Pridať poznámku"* CTA inside `LiveTrainingSession`'s
   finish dialog that writes a journal entry linked to the session.
5. Verification gate.

### Phase 5 — Polish & redirect deprecation window

1. Banner on every redirect target: *"Presunuté: pôvodná URL `/stats`
   automaticky otvára Progres. Aktualizuj záložky."* — shown for one release.
2. Mobile bottom nav animation polish (the FAB lift, sheet open spring).
3. Smoke audit pass: every empty state, every i18n key, every tab focus
   order.
4. CHANGELOG entry: `## 3.0.0`.

### Risks

- **Bookmark breakage.** Mitigated by the redirect table (4.2) and one
  release of in-app banners (Phase 5).
- **Coach Mode under `/plans/coach/*`.** Anyone running the desktop wrapper
  with a Coach session may have a bookmark on `/coach/clients`. The redirect
  must land them on `/plans/coach/clients` *and* keep their Coach Mode toggle
  state. Test on the same browser profile.
- **Migration v004 on existing devices.** The new tables are additive and
  `IF NOT EXISTS`. The biggest risk is the export payload version bump;
  cover it with a unit test that round-trips a v1 export through the v2
  importer.
- **Mobile chart performance.** PWA on iOS Safari needs to render a 26-week
  line chart smoothly. Use SVG (not Canvas) and keep series ≤ 100 points;
  downsample by day if longer.

---

## 8. Phase board

Use this as the working checklist. Each row is one PR-sized module per
`AGENTS.md`.

_Status snapshot: 2026-05-22. V3 is shipped locally as `3.0.0`, and the public
PWA cache/update patch shipped as `3.0.1` from tag `v3.0.1`. The missing
tests/export/import/polish items are complete, `npm run check` is green on
Windows, and public GitHub Pages V3.0.1 smoke is documented in
`reports/stingfit-v3.0.1-public-pwa-cache-fix.md`._

| # | Phase | Module | Owner | Status |
|---|-------|--------|-------|--------|
| 1.1 | IA | Add new routes + redirects (`router.tsx`) | Codex | _done_ |
| 1.2 | IA | Rewrite `NavigationSidebar.tsx` to 4-group layout | Codex | _done_ |
| 1.3 | IA | Rewrite `MobileBottomNav.tsx` to 5 tiles + MoreSheet | Codex | _done_ |
| 1.4 | IA | Update i18n strings (`sk.ts`, `en.ts`) for new labels | Codex | _done_ |
| 1.5 | IA | Update command palette actions in `App.tsx` | Codex | _done_ |
| 2.1 | Progress | Extract `ProgressHubPage.tsx` shell + tab router | Codex | _done_ |
| 2.2 | Progress | `ProgressLiftsTab.tsx` with line chart per exercise | Codex | _done_ |
| 2.3 | Progress | `ProgressPRsTab.tsx` (chronological PR feed + filters) | Codex | _done_ |
| 3.1 | Body | Migration `v004` (body measurements table) | Codex | _done_ |
| 3.2 | Body | `bodyMeasurementsRepository.ts` + tests | Codex | _done_ |
| 3.3 | Body | `ProgressBodyTab.tsx` | Codex | _done_ |
| 3.4 | Body | Export payload v2 + v1→v2 import shim | Codex | _done_ |
| 4.1 | Journal | Migration `v004` (journal table) | Codex | _done_ |
| 4.2 | Journal | `journalRepository.ts` + tests | Codex | _done_ |
| 4.3 | Journal | `ProgressJournalTab.tsx` (editor + search) | Codex | _done_ |
| 4.4 | Journal | Wire journal entry into finish-session dialog | Codex | _done_ |
| 5.1 | Polish | Redirect-deprecation banners + CHANGELOG `## 3.0.0` | Codex | _done_ |
| 5.2 | Polish | Mobile FAB / MoreSheet animation pass | Codex | _done_ |

Phase 1 is the only phase that's a hard prerequisite for everything after it.
Within Phases 2 / 3 / 4, modules can be picked in parallel.

---

## 9. Out of scope for V3

The same anti-goals as `PRODUCT.md` still apply. In addition, V3 will **not**:

- Add nutrition tracking, sleep tracking, or wearables sync.
- Add cloud sync or accounts.
- Add an AI coach / chat surface.
- Add social / sharing features beyond the existing local Plan Packs.
- Add a native iOS or Android binary (the V2.1 Capacitor track stays
  separate).
- Rename the product. *StingFit* stays.

If any of those become V3.x scope, this plan must be amended and the
amendment dated above section 1.

---

## 10. Definition of "V3 shipped"

V3 shipped locally as `3.0.0` on 2026-05-17 when **all** of these became true:

1. The desktop sidebar shows the four groups in section 4.3 and the mobile
   bottom nav shows the five tiles in section 4.4.
2. `/progress` exists with all four tabs (lifts, PRs, body, journal) plus
   the history pin.
3. `fitness_body_measurements` and `fitness_journal_entries` tables exist
   and round-trip through export/import.
4. Every old V2 URL still resolves (via redirect) for one full release.
5. The Phase 1–5 verification gate (typecheck + lint + tests + smoke nav
   pass) is green on the main branch.
6. `package.json` `version` is bumped to `3.0.0` and `CHANGELOG.md` has a
   `## 3.0.0` entry that links to this plan.
7. `STINGFIT_V2_PLAN.md` is left in place (for history) and this file —
   `STINGFIT_V3_PLAN.md` — is the document linked from `README.md` as the
   *current* plan of record.

## 11. Post-release patch status

V3.0.1 shipped publicly on 2026-05-22 to rotate the GitHub Pages PWA service-worker
cache to `stingfit-v3.0.1-github-pages` and force already-controlled installed
PWAs to request a fresh service-worker update. The patch is documented in
`reports/stingfit-v3.0.1-public-pwa-cache-fix.md` and the public deploy passed
workflow `26273148755` from tag `v3.0.1`.

Remaining V3 follow-ups are not feature-plan blockers:

- physical installed-PWA/stateful smoke on iOS Safari and Android Chrome;
- desktop installer verification after Rust, Cargo, rustup, MSVC, CMake, and
  Ninja are available.

---

_End of plan._
