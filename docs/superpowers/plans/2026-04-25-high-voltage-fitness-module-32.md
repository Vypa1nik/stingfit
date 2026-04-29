# High-Voltage Fitness Module 32 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for behavior changes and superpowers:verification-before-completion before completion claims.

**Goal:** Polish StingFit V1 product identity across browser/PWA/release-facing files.

**Architecture:** Keep historical database/internal storage names stable where changing them would risk user data. Update user-facing metadata, README, loading/error copy, PWA manifest, favicon color, and release version labels to StingFit V1.

**Tech Stack:** React 19, Vite, PWA manifest, Vitest file-level assertions, TypeScript strict mode.

---

## Task 1: Browser/PWA/release metadata

**Files:**
- Modify: `index.html`
- Modify: `public/manifest.webmanifest`
- Modify: `public/favicon.svg`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/lib/constants.ts`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src-tauri/Cargo.toml`
- Test: `tests/fitness-release-identity.test.ts`

- [x] **Step 1: Write failing identity metadata test**

Create a file-level test that verifies:
- `index.html` title is `StingFit`
- browser description mentions local-first fitness training
- theme/background colors match High-Voltage Wasp
- manifest name/short_name/description/theme colors are StingFit/fitness oriented
- favicon uses high-voltage yellow/black, not the old purple icon color
- `APP_VERSION`, `package.json`, package lock, and Tauri config report `1.0.0`
- Tauri product title is `StingFit`

- [x] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/fitness-release-identity.test.ts
```

Expected: FAIL because metadata still contains LocalFlow/productivity copy and old versions.

- [x] **Step 3: Implement metadata polish**

Update:
- `index.html`: title/description/theme/background colors.
- `manifest.webmanifest`: StingFit names, fitness description, `/#/training` start URL, black/yellow colors.
- `favicon.svg`: simple black/yellow lightning/wasp mark.
- `package.json` and `package-lock.json`: version `1.0.0` while leaving package name stable.
- `src/lib/constants.ts`: `APP_VERSION = '1.0.0'`.
- Tauri config/Cargo description: StingFit identity/version.

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/fitness-release-identity.test.ts
```

Expected: PASS.

## Task 2: App shell copy polish

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/router.tsx`
- Modify: `src/components/ui/ShortcutsCheatsheet.tsx`
- Modify: `src/components/ui/AppErrorBoundary.tsx`
- Test: `tests/fitness-release-copy.test.ts`

- [x] **Step 1: Write failing copy test**

Create file-level test that verifies key visible shell files no longer contain `LocalFlow` and do contain StingFit-specific replacement copy.

- [x] **Step 2: Run RED**

Run:

```bash
npm run test:run -- tests/fitness-release-copy.test.ts
```

Expected: FAIL because shell/loading/error/helper copy still says LocalFlow.

- [x] **Step 3: Implement shell copy polish**

Update visible app-shell copy:
- startup/loading/error text says StingFit.
- route loading fallback says StingFit.
- shortcuts description says StingFit.
- error boundary says StingFit.
- command palette data action opens Fitness Settings/Export instead of promoting the old full LocalFlow JSON export.

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run test:run -- tests/fitness-release-copy.test.ts
```

Expected: PASS.

## Task 3: V1 README rewrite

**Files:**
- Modify: `README.md`
- Test: included in `tests/fitness-release-identity.test.ts`

- [x] Rewrite README as StingFit V1:
  - product summary
  - V1 feature list
  - local-first privacy promise
  - commands
  - verified web build path
  - explicit no-cloud/no-login/no-telemetry note

## Task 4: Regression gate

- [x] Run focused tests:

```bash
npm run test:run -- tests/fitness-release-identity.test.ts tests/fitness-release-copy.test.ts tests/fitness-shell.test.ts tests/fitness-navigation.test.ts tests/fitness-v1-smoke.test.tsx
```

- [x] Run full tests:

```bash
npm run test:run
```

- [x] Run build:

```bash
npm run build
```

- [x] Run lint:

```bash
npm run lint
```

## Self-Review

- User-facing V1 identity is StingFit.
- Internal local storage keys are not renamed, avoiding data loss risk.
- No cloud/login/telemetry/paywall logic added.
- Web build remains the verified production path.
