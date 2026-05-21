# StingFit Empty/Error/Loading State Audit

Date: 2026-05-17
Target: V3 Phase 5 final smoke — canonical Train, Progress, Plans, Tools, and Settings routes with an empty local database
Status: DOM route-walk PASS in `npm run check`; browser screenshot capture remains blocked in the agent environment.

## Scope

Canonical V3 routes covered with `clearAllData()` and a fresh database state:

- `/#/train`
- `/#/train/quick`
- `/#/plans`
- `/#/progress/history`
- `/#/progress`
- `/#/tools/plates`
- `/#/settings`

Legacy V2 routes remain covered by redirect tests and the one-release redirect banner instead of being the primary smoke matrix.

The audit verifies that each route renders a fitness-specific, actionable state instead of generic empty copy such as `Nothing here yet`, `No data`, `No items`, `Empty state`, `Žiadne dáta`, or `Nič tu nie je`.

## Automated route walk

Command:

```bash
npm run test:run -- tests/fitness-empty-states-ui.test.tsx
```

Latest full-gate result: PASS in `npm run check` on 2026-05-17.

| Route               | Empty/local-first state verified                                                              | Result |
| ------------------- | --------------------------------------------------------------------------------------------- | ------ |
| `/train`            | `Začni úplne jednoducho`, `3 dni / týždeň`, `Len rýchly tréning`                              | Pass   |
| `/train/quick`      | `Rýchly tréning`, `Rýchly štart bez plánu`, `Najčastejšie cviky`                              | Pass   |
| `/plans`            | `Tvorba osobného plánu`, `Zatiaľ nemáš osobné plány`, `Vytvoriť prázdny plán`                 | Pass   |
| `/progress/history` | `Zatiaľ žiadne dokončené tréningy`, `Spusti a dokonči plánovaný tréning`, `Prejsť na tréning` | Pass   |
| `/progress`         | `Zatiaľ žiadne štatistiky`, `Dokonči tréning`, `Prejsť na tréning`                            | Pass   |
| `/tools/plates`     | `Kalkulačka kotúčov pred sériou`, `Cieľová váha v kg`, `Na stranu: 20 kg × 2`                 | Pass   |
| `/settings`         | `Bezpečnosť dát`, `Najprv si sprav lokálnu zálohu`, `Exportovať lokálnu zálohu`               | Pass   |

## Browser screenshot capture

A real browser screenshot pass could not be completed in this agent environment:

- MCP reported `0/0 servers, 0 tools`, so no browser automation/screenshot tool was registered.
- Local command discovery did not find `msedge`, `chrome`, `chromium`, or `firefox`.
- The project does not include Playwright, and adding a heavy browser automation dependency is outside this module.

Manual/browser screenshot follow-up, when a browser-capable environment is available:

1. Run `npm run build`.
2. Run `npm run preview -- --host 127.0.0.1 --port 4173`.
3. Reset local IndexedDB/app storage for the preview origin.
4. Capture `/#/train`, `/#/train/quick`, `/#/plans`, `/#/progress/lifts`, `/#/progress/prs`, `/#/progress/body`, `/#/progress/journal`, `/#/progress/history`, `/#/tools/plates`, and `/#/settings`.
5. Confirm the visible copy matches the table above and no route shows generic empty copy.
6. Capture one legacy URL such as `/#/stats` and confirm the redirect banner appears on the V3 target.

## Findings

The V3 canonical route matrix is covered by automated DOM smoke tests. Browser screenshot capture remains a manual follow-up because this environment has no registered browser automation tool.
