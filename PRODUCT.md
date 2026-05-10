# StingFit — Product Vision

_Last revised: 2026-05-02_
_Status: authoritative product north star for V2_

---

## 1. One sentence

**StingFit is the calm, fast bridge between a coach and the person doing the workout —
the place where a trainer's plan becomes a trainee's clean, friction-free training day.**

## 2. The pain we replace

Coaches build training plans in messy Excel sheets and Google Docs. Trainees
get screenshots in WhatsApp. Nobody has a clean view of what was actually done.
Progress conversations rely on memory.

StingFit replaces that whole loop with one shared format and two lightweight surfaces:

- **Coach surface** — author plans, manage clients, see what got done.
- **Trainee surface** — open the app at the gym, follow today's session, log fast, walk out.

Sharing happens via explicit, file-based **Plan Packs** (and later, opt-in
end-to-end-encrypted P2P sync). No accounts. No SaaS lock-in. The trainee always
owns their own data on their own device.

## 3. Personas

### 3.1 Solo trainee (primary, today)
- Goes to the gym 2–5×/week.
- Wants: open app → see today's workout → log sets in seconds → see progress over weeks.
- Hates: slow apps, ads, login, subscriptions, losing data when changing phones.
- Already there: full V1 fitness loop ships for this persona.

### 3.2 Coach / personal trainer (primary, V2 target)
- Has 5–50 clients. Today writes plans in Excel/Sheets/Notion.
- Wants: build a plan once, hand it to a client in 10 seconds, see what they did.
- Hates: clients who "forget" what they lifted, asking screenshots of Excel.
- New in V2: Coach Mode, plan templates library, Plan Pack export, optional
  read-only "client recap" file the trainee can send back.

### 3.3 Coached trainee (secondary, V2 target)
- Same as 3.1 but their plan was built by a coach.
- Wants: the plan to "just appear" when the coach sends it; the rest is identical to 3.1.
- New in V2: import a `.stfplan` Plan Pack in one tap, optionally export a recap
  for the coach.

## 4. Product principles (all decisions pass these filters)

1. **Local-first by default.** A trainee can train all year offline, on a single
   device, with zero account. Cloud is never required.
2. **Sharing is explicit.** Data leaves the device only when the user runs an
   export action. No background sync, no telemetry, no analytics.
3. **Sub-2-second log.** From "I finished a set" to "it is saved" must be ≤ 2
   taps and ≤ 2 seconds. This rules out any modal that interrupts a working set.
4. **Calm UI.** One accent color. No emojis in product copy. No gamification
   pop-ups. No notification badges except for rest timer and reminders the user
   set themselves.
5. **No lock-in.** Every plan, every session, every set is exportable to a
   portable JSON format. Users can leave with their data at any time.
6. **The coach is a power user, not a separate product.** Coach Mode is a
   toggle/perspective inside the same app, not a different binary, not a different
   subscription. A coach who also trains uses one app.

## 5. What StingFit IS

- A personal training logbook that stays out of the way at the gym.
- A clean plan editor, both for self-coached and coached trainees.
- A Plan Pack format (`.stfplan`) — a portable, signed JSON bundle of a plan +
  exercise library + presentation hints — that travels via any channel
  (AirDrop, email, WhatsApp file, USB stick).
- A PWA installable on any modern phone, plus a desktop wrapper for coaches
  who want a real window.
- A privacy promise that survives audit: see `reports/stingfit-privacy-network-audit.md`.

## 6. What StingFit IS NOT (anti-goals)

These are deliberately excluded from V2 and need an explicit user decision to ever revisit:

- **Not a social network.** No follows, no public profiles, no leaderboards.
- **Not a marketplace.** No paid plan store, no creator revenue split.
- **Not a SaaS.** No subscription. No "free tier with limits." No accounts.
- **Not an AI coach.** No LLM that "writes your plan." Optional local insights
  on history are fine; a chat bot in the gym is not.
- **Not a wearable hub.** No Apple Health / Garmin / Whoop sync in V2. The phone
  in your hand is enough.
- **Not a nutrition tracker, sleep tracker, or habit tracker.** Strength and
  conditioning logging only.
- **Not a real-time multi-user editor.** A coach edits, exports a Plan Pack,
  trainee imports. No "live cursor" anywhere.

## 7. Distribution philosophy

- **Web/PWA is the canonical install path.** One URL, install button, done.
- **Tauri desktop** ships as a co-equal binary for Windows and macOS once the
  build is verified. It exists because some coaches want a real app icon.
- **iOS/Android native** is explicitly **out of scope for V2.** PWA on iOS
  Safari and Android Chrome is the supported mobile path. Re-evaluate after V2 ships.
- **No app store dependency** until web/PWA + desktop are proven with users.

## 8. Success signals for V2 (qualitative, not vanity metrics)

- A coach can hand a plan to a trainee in under 60 seconds, on the spot, without
  either of them creating an account.
- A trainee can open the app on a phone they have never used StingFit on
  before, import the plan, log a workout, and export a recap, in under 5 minutes.
- The most common trainee complaint about Excel-based coaching ("I never know
  what I'm supposed to do today") goes away after one session.
- After 3 months of use a trainee can answer "is my bench going up?" in one
  glance, in under 2 seconds.

## 9. The hardest constraint

**Local-first stays the default forever.** Every cloud-shaped feature request
must pass through: _can we ship this as an explicit file the user moves
themselves, before we touch a server?_ If yes, we ship that first. If no, we
say no until the user explicitly opts into a thin sync layer (planned for
V2.1+, opt-in only, end-to-end encrypted, BYO storage).

Anything that breaks this constraint requires a written change to this document
and the user's explicit go-ahead — not an agent decision.
