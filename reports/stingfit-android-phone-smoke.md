# StingFit V2.1 Android Phone Smoke

Status: BLOCKED_NO_PHYSICAL_DEVICE
Date: 2026-05-13
Scope: Android debug APK smoke on a real phone, after emulator smoke passed.

## Current state

The Android debug APK exists and emulator smoke is green, but a real Android phone was not connected to ADB during this check.

Observed from this workspace:

```text
adb exists: True
apk exists: True
android/app/build/outputs/apk/debug/app-debug.apk
APK bytes: 4,819,024
adb devices -l: no devices attached after stopping emulator-5554
```

This means the native package is build-verified and emulator-smoke-verified, not physical-device-verified.

## Prepare the phone

1. Enable Developer options on the phone.
2. Enable USB debugging.
3. Connect the phone by USB.
4. Accept the RSA debugging prompt on the phone.
5. Verify that ADB sees exactly one physical device:

```powershell
cd "C:\Users\kiko\Documents\New project\localflow"
& "C:\Users\kiko\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices -l
```

Expected shape:

```text
List of devices attached
<device-id> device product:<product> model:<model> device:<device> transport_id:<n>
```

Do not count `emulator-5554` as physical-device evidence.

## Install and launch

```powershell
cd "C:\Users\kiko\Documents\New project\localflow"
$adb = "C:\Users\kiko\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$apk = "android\app\build\outputs\apk\debug\app-debug.apk"

& $adb install -r $apk
& $adb shell pm clear com.stingfit.app
& $adb shell am start -W -n com.stingfit.app/.MainActivity
& $adb shell pidof com.stingfit.app
```

Pass criteria:

- Install returns `Success`.
- Launch returns `Status: ok` and `Activity: com.stingfit.app/.MainActivity`.
- `pidof com.stingfit.app` returns a PID.
- StingFit opens to onboarding or the training dashboard.

## Manual app smoke

On the phone, verify:

1. App opens without a crash.
2. First-run screen shows the simple start builder.
3. Tap the 3-day simple-start option and confirm a plan is created.
4. Kill the app from recent apps.
5. Relaunch StingFit.
6. Confirm the plan and local state persist.
7. Open a quick workout and log one set.
8. Finish the workout.
9. Confirm the workout appears in History.
10. Open Settings and export a local backup JSON.
11. If file picker/export works, import the same backup into a fresh app state or a second test install.
12. If available, import a `.stfplan` Plan Pack and export a `.stfrecap` Recap Pack.

## Optional log capture

Run this while launching and using the app:

```powershell
$adb = "C:\Users\kiko\AppData\Local\Android\Sdk\platform-tools\adb.exe"
& $adb logcat -c
& $adb shell am start -W -n com.stingfit.app/.MainActivity
Start-Sleep -Seconds 20
$pid = (& $adb shell pidof com.stingfit.app).Trim()
& $adb logcat -d --pid $pid -t 800
```

Look for the same key evidence as the emulator smoke:

```text
https://localhost/assets/sql-wasm-browser-*.js
https://localhost/assets/sql-wasm-*.wasm
```

Fail the smoke if logs show:

```text
FATAL EXCEPTION
AndroidRuntime crash for com.stingfit.app
Failed to load resource
net::ERR_*
Unable to load sql-wasm
Capacitor exception that stops app startup
```

## Result fields to fill after phone test

```text
Device model:
Android version:
Install result:
Launch result:
sql.js WASM evidence:
Persistence after kill/relaunch:
Backup export/import:
Plan Pack import:
Recap Pack export:
Blocking errors:
Verdict: PASS / FAIL / PASS_WITH_CONCERNS
```

## Remaining concern

Until this report is filled with real-device results, StingFit Android remains emulator-smoke-verified only.
