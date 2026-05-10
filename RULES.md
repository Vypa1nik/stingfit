# StingFit — Rules

> Reading order for an agent or new contributor:
> 1. [`AGENTS.md`](./AGENTS.md) — workflow protocol
> 2. [`STINGFIT_V2_PLAN.md`](./STINGFIT_V2_PLAN.md) — active plan
> 3. [`PRODUCT.md`](./PRODUCT.md) — vision, personas, anti-goals
> 4. **This file** — engineering and product rules
>
> Anything in `docs/archive/` is ARCHIVED and must not influence implementation.

---

## 1. Three-layer architecture for any change

1. **Rules (this file)** — what is allowed, what is not, naming and patterns.
2. **Orchestration ([`STINGFIT_V2_PLAN.md`](./STINGFIT_V2_PLAN.md))** — phase
   and module order, dependencies between modules, acceptance gates.
3. **Execution** — the actual code, tests, and build, written one module at
   a time per the [`AGENTS.md`](./AGENTS.md) protocol.

If a rule and a plan disagree: rules win on engineering, plan wins on order.
If product wins on either: stop and ask the user.

---

## 2. Engineering rules (binding)

- **Never** generate the whole app in one step. Work module by module.
- **Always** put UI up first with dummy data, then store, then DB wiring.
- **Always** verify with `npm run check` after each module.
- **Always** use TypeScript strict mode. No `any`. No `@ts-ignore` without
  a comment that names the reason.
- **Every** CRUD path must implement loading, success, error, and empty
  states. None of those four is optional.
- **Every** schema change ships with a migration in `src/lib/migrations.ts`
  and a regression test in `tests/`.
- **Never** silently swallow persistence, import, export, or migration
  failures. Surface them — toast at minimum, error boundary if the failure
  breaks the screen.
- **Prefer** the simpler implementation. Do not pre-optimize.
- **If a fix loops 3+ times**, stop, revert to the last green commit, and
  surface two alternatives to the user.
- **Do not add a new dependency** without explicit user approval. The V2
  plan pre-approves **zero** new heavy deps. If you think you need one,
  stop and ask.
- **No emojis in product copy.** No hex colors in TSX (use Tailwind tokens
  and the existing theme variables).
- **Accessibility is a release blocker.** Focus rings, aria-labels,
  keyboard paths, color contrast — all required, all gated by Lighthouse a11y
  >= 95 in V2 Phase 4.

## 3. Product rules (binding — these protect the product itself)

These are stronger than engineering rules. An agent cannot relax them.
The user can change them only by editing `PRODUCT.md` and this file together.

### 3.1 Local-first and private

- **No cloud sync, no account system, no login, no telemetry, no analytics
  SDK, no payment flow, no subscription, no paywall, no ads.**
- All training data lives on the device, in the browser's IndexedDB-backed
  SQLite, full stop.
- A user must be able to use StingFit for a year, fully offline, and lose
  nothing.

### 3.2 Sharing is always explicit

- Data leaves the device only via a user-initiated export.
- The supported share formats in V2 are **Plan Pack (`.stfplan`)** and
  **Recap Pack (`.stfrecap`)**, both portable JSON files.
- No background upload. No "auto-share." No notification asking "send to
  cloud?". If you find yourself wanting one of those, stop.

### 3.3 The coach<->trainee bridge is the V2 thesis

- **Coach Mode** is a perspective inside the same app, not a separate
  product. One install, two perspectives.
- A coach must be able to hand a Plan Pack to a trainee on a fresh install
  in under 60 seconds, with neither of them creating any account.
- A trainee must be able to send a Recap Pack back to the coach with no
  account either.
- See `PRODUCT.md` section 3 for the full personas and `STINGFIT_V2_PLAN.md`
  Phase 3 for the implementation plan.

### 3.4 Anti-goals

The following are **out of scope** for V2 and require explicit user sign-off
in chat plus a written `PRODUCT.md` change to ever revisit:

- AI chatbot in the gym.
- Any cloud-shaped sync engine.
- Wearables sync (Apple Health, Garmin, Whoop, Fitbit, Polar).
- Nutrition, sleep, or habit tracking.
- Native iOS / Android binaries (Expo, Capacitor, React Native).
- Real-time collaborative editing.
- Public profiles, follows, leaderboards, social feeds.
- A marketplace for paid plans.
- Onboarding "tutorial" walkthroughs of more than 2 screens.
- Any feature that requires being online to start using.

### 3.5 The trainee is sacred

- Never delete trainee data without typed confirmation.
- Never modify a completed session. Corrections add a correction record;
  the original snapshot stays intact.
- Never let a Coach Mode action mutate a trainee's data without trainee
  confirmation. (V2 ships Plan Packs as files; importing is always an
  explicit trainee action.)

## 4. Folder discipline

- The active plan is `STINGFIT_V2_PLAN.md` at the repo root.
- Anything under `docs/archive/` is read-only history. Do not link to it
  from active code or active docs. Do not extract TODOs from it without
  explicit user approval.
- Tmp/runtime artifacts (`.tmp-*`, `.pi/`, `.pi-lens/`, `.superpowers/`,
  `.playwright-mcp/`, `.ruff_cache/`) stay out of git.
- New documentation files must declare their status in the first 5 lines
  ("Active", "Draft", or "Archived"). Anything ambiguous gets archived.

## 5. CHANGELOG discipline

- Every module ends with 1-3 sentences in `CHANGELOG.md` under
  `## Unreleased`, written from the user's point of view ("History now...",
  not "refactored useEffect to useQuery in...").
- Phase closes promote `## Unreleased` entries under the phase tag
  (e.g. `## v2-phase-1`).
- The V2 release closes everything under `## v2.0.0`.

## 6. Verification gate

A change is not done until **all** of these are green:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:run`
4. `npm run build`

`npm run check` runs the gate (lint + test:run + build). Run it before
declaring a module done. Run it again before opening a PR.
