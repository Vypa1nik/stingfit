# StingFit pre-production audit handoff

Date: 2026-05-01
Candidate commit: `09a2fc8 fix: add personal plan management`

## Scope

This candidate is the React/Vite web/PWA production path for StingFit. The app is still local-first and private: no login, cloud sync, telemetry, analytics, subscription, or paywall logic was added.

Recent stabilization focused on beginner gym flow, post-workout handoff, and plan completion:

- Quick workout starts with one-tap common exercise buttons before advanced selection.
- Finishing a workout saves immediately by default.
- After finishing, Training shows `Tréning uložený` with result, history, and local backup actions.
- History recognizes `#/history?from=finish` and labels the latest result as `Práve dokončený tréning`.
- The post-workout result recommends the next planned workout and links back to Training.
- Plans can now create a personal copy from every starter template, not only PPL.
- Unfinished plans no longer look ready; they offer `Dostavať z Celé telo 3×` as the simplest recovery path.
- Personal plans can be renamed, retargeted, and archived without deleting completed workout history.

## Verification run

Full gate run from `C:/Users/kiko/Documents/New project/localflow`:

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Result:

- TypeScript: passed.
- ESLint: passed.
- Vitest: `91` test files passed, `206` tests passed.
- Production build: passed; Vite produced `dist/` successfully.

## Suggested audit smoke path

1. New user path:
   - Open Training.
   - Pick `3 dni / týždeň`.
   - Start `Celé telo A`.
   - Log one set.
   - Finish with the primary `Dokončiť tréning` button.
   - Confirm `Tréning uložený` appears.
   - Click `Pozrieť výsledok`.
   - Confirm History shows `Práve dokončený tréning` and `Čo spraviť nabudúce`.

2. Gym quick path:
   - Open `Rýchly`.
   - Confirm `Rýchly štart bez plánu` appears.
   - Tap `Začať: Tlak na lavičke`.
   - Log a set.
   - Finish and inspect History.

3. Plans path:
   - Open Plans.
   - Confirm every starter template has `Vytvoriť osobnú kópiu`.
   - Create `Celé telo 3×` and confirm the beginner summary shows `3 tréningové dni` and `Celé telo A`.
   - Create a blank plan and confirm it shows `Treba dostavať` / `Dostavať z Celé telo 3×` instead of pretending it is ready.
   - Rename a personal plan, change its goal, save it, then archive it and confirm it disappears from `Osobné plány` without affecting History.

4. Local data safety:
   - Open Settings.
   - Confirm `Bezpečnosť dát` is first.
   - Export local backup.
   - Confirm import/reset controls remain behind advanced sections.

5. Mobile/PWA path:
   - Run production preview with `npm run mobile:pwa:start`.
   - Open printed LAN URL on a phone on the same network.
   - Smoke bottom navigation, Training, Quick, History, Stats, Settings.
   - For real install/offline validation on iOS, use HTTPS/Safari; LAN HTTP is only a layout/runtime smoke.

## Known blockers and boundaries

- Tauri desktop packaging is not verified in this environment because `cargo` and `rustc` are not available in PATH.
- Physical iOS/mobile PWA install/offline lifecycle still requires manual phone testing.
- `.pi-lens/` is local tooling output and should not be committed.

## Current decision

This candidate is ready for pre-production web/PWA audit. Continue feature work only after the smoke/audit pass identifies the next highest-priority issue.
