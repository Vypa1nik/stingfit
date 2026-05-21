# StingFit - Rules

> Reading order for an agent or new contributor:
> 1. [`AGENTS.md`](./AGENTS.md) - workflow protocol.
> 2. [`AGENT_START_HERE.md`](./AGENT_START_HERE.md) - current clean handoff.
> 3. [`STINGFIT_V3_PLAN.md`](./STINGFIT_V3_PLAN.md) - active plan.
> 4. [`PRODUCT.md`](./PRODUCT.md) - vision, personas, anti-goals.
> 5. **This file** - binding engineering and product rules.
>
> `STINGFIT_V2_PLAN.md` and everything under `docs/archive/` are historical
> context only. They must not drive new implementation.

---

## 1. Authority Order

1. **Product contract** - `PRODUCT.md` and this file decide what is allowed.
2. **Active plan** - `STINGFIT_V3_PLAN.md` decides module order and acceptance
   scope.
3. **Execution** - code, tests, migrations, and docs are written one module at
   a time per `AGENTS.md`.

If a rule and the V3 plan disagree, stop and ask the user to reconcile the
conflict. Do not silently pick a side.

## 2. Engineering Rules

- Never generate or rewrite the whole app in one pass.
- Work module by module, using the existing local patterns first.
- Put new UI up first with local/dummy data, then wire stores and database.
- Use TypeScript strict mode. No `any`. No `@ts-ignore` without a comment that
  names the reason.
- Every CRUD path needs loading, success, error, and empty states.
- Every schema change ships with a migration in `src/lib/migrations.ts` and a
  regression test in `tests/`.
- Never silently swallow persistence, import, export, or migration failures.
- Prefer the simpler implementation. Do not pre-optimize.
- If the same bug loops 3+ times, stop and surface two alternatives to the
  user before pushing further.
- Do not add a new dependency without explicit user approval.
- No emojis in product copy. No hex colors in TSX; use Tailwind tokens and
  existing theme variables.
- Accessibility is a release blocker: focus rings, aria labels, keyboard paths,
  useful empty/error states, and readable contrast are required.

## 3. Product Rules

These are stronger than engineering preferences. An agent cannot relax them.
The user can change them only by editing `PRODUCT.md` and this file together.

### 3.1 Local-First And Private

- No cloud sync, account system, login, telemetry, analytics SDK, payment flow,
  subscription, paywall, marketplace, ads, or social graph.
- Training data lives on the device in IndexedDB-backed SQLite.
- A user must be able to train offline for a long period and keep their data.

### 3.2 Sharing Is Explicit

- Data leaves the device only through user-initiated export/import.
- Supported coach<->trainee handoff formats are Plan Pack (`.stfplan`) and
  Recap Pack (`.stfrecap`).
- No background upload. No auto-share. No cloud-shaped sync prompts.

### 3.3 Coach Mode Stays Local

- Coach Mode is a perspective inside the same app, not a separate cloud
  product.
- A coach can hand a Plan Pack to a trainee without either person creating an
  account.
- A trainee can send a Recap Pack back without an account.
- Coach Mode must not mutate trainee data without explicit trainee action.

### 3.4 Anti-Goals

The following are out of scope unless the user explicitly approves them in chat
and updates `PRODUCT.md`:

- AI chatbot in the gym.
- Any cloud sync engine.
- Wearables sync.
- Nutrition, sleep, or habit tracking beyond the narrow V3 journal fields.
- Native iOS / Android binaries beyond the approved Capacitor packaging track.
- Real-time collaborative editing.
- Public profiles, follows, leaderboards, or social feeds.
- A marketplace for paid plans.
- Onboarding tutorial walkthroughs longer than 2 screens.
- Any feature that requires being online to start using.

### 3.5 The Trainee Is Sacred

- Never delete trainee data without typed confirmation.
- Never modify a completed session in place. Corrections add correction
  records; the original snapshot stays intact.
- Never let a Coach Mode action mutate trainee data without trainee
  confirmation.

## 4. Folder Discipline

- The active plan is `STINGFIT_V3_PLAN.md` at the repo root.
- `STINGFIT_V2_PLAN.md` is historical context only.
- Anything under `docs/archive/` is read-only history. Do not link to it from
  active implementation docs except as an archive pointer.
- Scratch/runtime artifacts (`.tmp-*`, `.pi/`, `.pi-lens/`, `.superpowers/`,
  `.playwright-mcp/`, `.ruff_cache/`, `output/`) stay out of git and out of
  planning.
- New documentation files must declare status in the first 5 lines: Active,
  Draft, or Archived.

## 5. Changelog Discipline

- Every module ends with 1-3 sentences in `CHANGELOG.md` under
  `## Unreleased`, written from the user's point of view.
- V3 release work promotes entries under `## 3.0.0`.
- Historical V2 release entries stay under `## v2.0.0`.

## 6. Verification Gate

A change is not done until the strongest relevant gate is green:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:run`
4. `npm run build`

`npm run check` runs lint + tests + build. Run it before declaring behavior,
schema, or UI work complete.
