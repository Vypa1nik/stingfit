# StingFit Tauri desktop builds

Status: FUTURE_TRACK_FOR_V2.0
Date: 2026-05-12
Scope: Phase 4 Module 2 — Tauri desktop builds

## Summary

The StingFit Tauri scaffold is present and aligned with the Vite/HashRouter app shell, but native desktop artifacts cannot be built in this environment. The build machine is missing Rust and the Windows native build toolchain that Tauri requires.

V2.0 proceeds as a **PWA-only release**. The owner accepted desktop installers as a future release track until the missing desktop build prerequisites are installed and verified.

## Configuration checked

- `package.json` exposes `npm run tauri`, `npm run tauri:dev`, and `npm run tauri:build`.
- `src-tauri/tauri.conf.json` uses:
  - `productName: "StingFit"`
  - `version: "2.0.0"`
  - `identifier: "com.stingfit.app"`
  - `frontendDist: "../dist"`
  - `beforeBuildCommand: "npm run build"`
  - main window title `StingFit`
  - bundle icons under `src-tauri/icons/`.
- `src/App.tsx` uses `HashRouter`, keeping desktop routing compatible with the Tauri webview bundle.

## Toolchain check

Command run:

```bash
npm run tauri -- info
```

Relevant result:

```text
WebView2: 147.0.3912.98
Couldn't detect any Visual Studio or VS Build Tools instance with MSVC and SDK components.
rustc: not installed!
Cargo: not installed!
rustup: not installed!
Rust toolchain: couldn't be detected!
```

Direct shell checks also returned no toolchain executables:

```bash
cargo --version
rustc --version
rustup --version
```

Result: all three commands were unavailable in PATH.

## Build status

`npm run tauri:build` is intentionally not reported as a passing gate in this environment. It requires the missing Rust + MSVC/Windows SDK components above, so desktop installer verification remains blocked.

Expected prerequisites before retrying desktop artifacts:

1. Install Rust via rustup.
2. Install Visual Studio Build Tools with MSVC and Windows SDK components.
3. Re-run `npm run tauri -- info` until Rust/Cargo/MSVC are green.
4. Run `npm run tauri:build` and archive the generated Windows bundle path.
5. On macOS hardware, run the macOS `.dmg` build and handle notarization as an owner/manual release step.

## Decision

For V2.0, do not promise `.msi` or `.dmg` artifacts. Continue with the verified PWA install path and keep desktop installers as a future track until a machine with the required native toolchain is available.
