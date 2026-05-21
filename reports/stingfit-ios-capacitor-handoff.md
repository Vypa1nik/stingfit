# StingFit iOS Capacitor Handoff

Status: READY_FOR_MACBOOK_SETUP_AFTER_BOOTSTRAP_VERIFICATION
Date: 2026-05-12

## Purpose

This handoff lets the Windows workspace prepare a source ZIP that can be sent to a MacBook over Tailscale. The iOS Capacitor project is generated and built on macOS, not Windows.

## Create the ZIP on Windows

```powershell
cd "C:\Users\kiko\Documents\New project\localflow"
npm run mobile:ios:handoff
```

Expected output:

```text
.stingfit-mobile-handoff/stingfit-ios-capacitor-handoff.zip
```

The script prints the SHA-256 hash after creating the ZIP.

## ZIP contents

The handoff ZIP is source-first. It includes tracked and unignored project files needed for install/build/sync, including:

- `src/`
- `public/`
- `index.html`
- `package.json`
- `package-lock.json`
- `capacitor.config.ts`
- `vite.config.ts`
- `tsconfig*.json`
- `eslint.config.js`
- `tools/build-capacitor-web.mjs`
- active docs and reports

It excludes:

- `node_modules/`
- `dist/`
- `.git/`
- `.tmp-*`
- `.pi/`, `.pi-lens/`, `.superpowers/`, `.playwright-mcp/`, `.ruff_cache/`
- `docs/archive/`
- `src-tauri/`
- `android/`
- `ios/`

## MacBook prerequisites

- macOS with Xcode installed
- Xcode Command Line Tools
- Node.js 22+ (Capacitor CLI 8 requires Node 22 or newer)
- npm
- CocoaPods if the generated Capacitor iOS project requires it
- Apple Developer account for real-device signing, TestFlight, or App Store distribution

## MacBook commands

From the unzipped project folder:

```bash
npm ci
npm run mobile:build
npm run cap:ios:add
npm run cap:ios:sync
npm run cap:ios:open
```

Then in Xcode:

1. Select the `App` target.
2. Set the Team.
3. Confirm Bundle Identifier `com.stingfit.app` or adjust only if the Apple Developer account requires a different ID.
4. Build for simulator first.
5. Build on a physical iPhone after signing is valid.
6. Use Product → Archive for TestFlight/App Store distribution.

## iOS smoke checklist

- App launches without a blank screen.
- Hash routes open Training, Plans, History, and Settings.
- Local SQLite/IndexedDB data persists after kill/relaunch.
- Plan Pack `.stfplan` import works or the limitation is documented.
- Recap Pack `.stfrecap` export works or the limitation is documented.
- Fitness JSON backup export/import works or the limitation is documented.
- No network, telemetry, account, subscription, or paywall behavior appears.

## Known blockers outside Windows

- iOS simulator/device build requires macOS/Xcode.
- Physical device install requires signing.
- TestFlight/App Store upload requires Apple Developer account and App Store Connect metadata.
