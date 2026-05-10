# StingFit Empty/Error/Loading State Audit

Date: 2026-05-05
Target: V2 Phase 2 module 6 — fitness routes with an empty local database
Status: DOM route-walk PASS; browser screenshot capture BLOCKED in the agent environment.

## Scope

Routes covered with `clearAllData()` and a fresh database state:

- `/#/training`
- `/#/quick`
- `/#/plans`
- `/#/history`
- `/#/stats`
- `/#/plates`
- `/#/settings`

The audit verifies that each route renders a fitness-specific, actionable state instead of generic empty copy such as `Nothing here yet`, `No data`, `No items`, `Empty state`, `Žiadne dáta`, or `Nič tu nie je`.

## Automated route walk

Command:

```bash
npx vitest run tests/fitness-empty-states-ui.test.tsx --reporter=verbose
```

Result: PASS — 1 file / 7 tests passed.

| Route       | Empty/local-first state verified                                                              | Result |
| ----------- | --------------------------------------------------------------------------------------------- | ------ |
| `/training` | `Začni úplne jednoducho`, `3 dni / týždeň`, `Len rýchly tréning`                              | Pass   |
| `/quick`    | `Rýchly tréning`, `Rýchly štart bez plánu`, `Najčastejšie cviky`                              | Pass   |
| `/plans`    | `Tvorba osobného plánu`, `Zatiaľ nemáš osobné plány`, `Vytvoriť prázdny plán`                 | Pass   |
| `/history`  | `Zatiaľ žiadne dokončené tréningy`, `Spusti a dokonči plánovaný tréning`, `Prejsť na tréning` | Pass   |
| `/stats`    | `Zatiaľ žiadne štatistiky`, `Dokonči tréning`, `Prejsť na tréning`                            | Pass   |
| `/plates`   | `Kalkulačka kotúčov pred sériou`, `Cieľová váha v kg`, `Na stranu: 20 kg × 2`                 | Pass   |
| `/settings` | `Bezpečnosť dát`, `Najprv si sprav lokálnu zálohu`, `Exportovať lokálnu zálohu`               | Pass   |

## Browser screenshot capture

A real browser screenshot pass could not be completed in this agent environment:

- MCP reported `0/0 servers, 0 tools`, so no browser automation/screenshot tool was registered.
- Local command discovery did not find `msedge`, `chrome`, `chromium`, or `firefox`.
- The project does not include Playwright, and adding a heavy browser automation dependency is outside this module.

Manual/browser screenshot follow-up, when a browser-capable environment is available:

1. Run `npm run build`.
2. Run `npm run preview -- --host 127.0.0.1 --port 4173`.
3. Reset local IndexedDB/app storage for the preview origin.
4. Capture `/#/training`, `/#/quick`, `/#/plans`, `/#/history`, `/#/stats`, `/#/plates`, and `/#/settings`.
5. Confirm the visible copy matches the table above and no route shows generic empty copy.

## Findings

No production copy changes were needed. The current empty/loading/error states are already fitness-specific and actionable for the audited empty-database routes. The new regression test keeps this contract covered until a browser screenshot tool is available.
