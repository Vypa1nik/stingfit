# StingFit V2.1 Mobile App Track — Capacitor Bootstrap

Status: ANDROID_DEBUG_APK_VERIFIED
Date: 2026-05-13
Owner decision: Capacitor, Android APK first, iOS handoff ZIP for MacBook build.

## Decision

StingFit V2.0 remains a PWA-only public release. V2.1 opens a separate mobile packaging track that wraps the existing React + Vite app with Capacitor.

This track does not add accounts, cloud sync, telemetry, analytics, subscriptions, payments, or paywalls. The PWA stays the canonical public install path until Android and iOS packages pass device-level smoke checks.

## App identity

- App name: `StingFit`
- App ID / bundle identifier: `com.stingfit.app`
- Capacitor web directory: `dist`
- Router strategy: existing `HashRouter`
- Storage strategy: existing `sql.js` + IndexedDB persistence

## Bootstrap files

- `capacitor.config.ts` — Capacitor app identity and `webDir`.
- `package.json` / `package-lock.json` — `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, and `@capacitor/cli`.
- `tools/build-capacitor-web.mjs` — portable mobile web build that forces `VITE_BASE_PATH=/`.
- `tools/build-android-debug-apk.ps1` — Windows-safe Android debug APK build wrapper that sets `JAVA_HOME`, `ANDROID_HOME`, and a writable Gradle temp directory.
- `tools/package-ios-handoff.ps1` — creates a source ZIP for MacBook iOS build handoff.
- `android/` — generated Capacitor Android platform project; generated web assets and APK outputs stay ignored.

## Android debug APK path

Prerequisites on Windows:

- Node.js 22+ (Capacitor CLI 8 requires Node 22 or newer)
- npm
- Android Studio
- Android SDK
- JDK 21 from Android Studio JBR or another compatible JDK
- `ANDROID_HOME`, `JAVA_HOME`, and `PATH` configured when CLI builds need them

Android project generation and sync commands:

```powershell
npm run mobile:build
npm run cap:android:add
npm run cap:android:sync
```

Debug APK build command:

```powershell
npm run cap:android:apk
```

The Windows APK wrapper deliberately sets `TEMP`, `TMP`, `GRADLE_OPTS`, and `_JAVA_OPTIONS` to `%LOCALAPPDATA%\Temp`. Without that, this harness made Android Gradle Plugin `compressDebugAssets` try to write `C:\Windows\*.tmp` and fail with `AccessDeniedException`.

Verified debug artifact:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Latest verified size: `4,819,024` bytes.

## iOS handoff path

Windows prepares the ZIP; MacBook generates/syncs/builds the iOS project.

```powershell
npm run mobile:ios:handoff
```

MacBook commands from the unzipped project:

```bash
npm ci
npm run mobile:build
npm run cap:ios:add
npm run cap:ios:sync
npm run cap:ios:open
```

Xcode then owns Team, signing, simulator/device builds, Archive, and TestFlight/App Store upload.

## Android debug APK verification

- `cap add android`: passed.
- `cap sync android`: passed.
- `gradlew assembleDebug`: passed after forcing Java/Gradle temp files to `%LOCALAPPDATA%\Temp`.
- Debug APK exists at `android/app/build/outputs/apk/debug/app-debug.apk`.
- This is a build artifact only; real Android device smoke is still required before calling the native package user-ready.

## Known risks to validate early

1. `sql.js` WASM asset loading inside Android/iOS WebView.
2. IndexedDB durability after app kill/relaunch and app update.
3. Backup export/import, Plan Pack import, and Recap Pack export inside native wrappers.
4. PWA install UI in Settings is browser-specific and may need native runtime gating after first APK smoke.
5. Store/TestFlight signing is intentionally out of scope for the bootstrap.

## Acceptance for bootstrap

- Governance docs distinguish V2.0 PWA-only from the V2.1 Capacitor track.
- Capacitor packages and config are present.
- `npm run mobile:build` produces a root-base `dist/` build.
- Existing web/PWA checks remain green.
- iOS handoff ZIP script creates a reproducible archive without `node_modules`, `dist`, `.git`, `docs/archive`, `src-tauri`, `android`, or `ios` folders.
