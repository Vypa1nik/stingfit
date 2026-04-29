# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 - 2026-04-25

StingFit V1 ships the local-first fitness product direction: personal training plans, fast live workout logging, immutable session snapshots, workout history, PR/progression signals, kg/lb display, fitness-only export/import/restore, safe local data wipe, quiet guidance mode, High-Voltage Wasp identity, and V1 smoke coverage for the core Start → Log → Finish → Learn loop.

## Unreleased

- stabilized the Today dashboard clock with a live `useCurrentDate` hook and removed the hard-coded date header from `src/features/today/TodayDashboard.tsx`
- added a centralized shortcuts registry, a global `?` cheatsheet modal, and a real command-palette JSON export flow
- wrapped `src/router.tsx` rendering in an error boundary with reload and backup export recovery actions
- made the app shell responsive below `768px` with a hamburger-triggered navigation drawer and mobile-safe top bar controls
- added `public/manifest.webmanifest`, generated `public/icon-192.png` and `public/icon-512.png`, and registered `public/sw.js` for installable offline shell caching
- moved markdown preview parsing behind a lazy `import('marked')` path so note rendering no longer inflates the first-load bundle
- code-split secondary routes with `React.lazy` in `src/router.tsx` so Notes, Tasks, Projects, Search, and Settings no longer ship in the first route payload
- introduced an inbox-first routing shell with sidebar smart views (`/inbox`, `/view/recent`, `/view/unsorted`, `/view/resurface`, `/archive`) and a root redirect away from `/`
- expanded the Inbox smart view with triage actions for pinning, project assignment, conversion between notes and tasks, honest reminder stubs, and archive feedback toasts
- upgraded reminders to a real local feature with a source-aware schema, preset/custom scheduling modal, Notification API polling, and JSON export/import coverage
- implemented per-note locking with encrypted note payloads, passphrase unlock in-session only, idle auto-relock after inactivity, and lock metadata roundtrip in JSON export/import
- added encrypted `.lfbackup` export/import with passphrase-based key derivation, kept raw `.db` backup for power users, and made encrypted backup the default option in Settings
- added chrono-powered smart quick-capture parsing (`#tags`, `!` priority tokens, natural-language due time) with a live parse preview and tests for parser behavior
- introduced first-class note attachments with a dedicated `attachments` table, blob storage in IndexedDB under the `lfa:` prefix, drag-and-drop upload UI, and open/remove actions in the note editor
- added a best-effort OCR pipeline for image attachments using a cached `eng+slk` Tesseract worker with per-attachment progress states, non-blocking failure handling, and persisted `ocr_text` updates
- added a tokenized `search_index` table with incremental reindexing hooks, upgraded search to support phrase + operator queries (`tag:`, `due:`, `project:`, `has:attachment`, `is:*`, `kind:*`), grouped result sections by kind, and covered new search flows in tests
- added Evernote `.enex` import in Settings with preview/confirmation, mapped ENEX notes/resources into LocalFlow notes + attachments, queued best-effort OCR for imported images, and covered parsing/import paths with dedicated tests
- added Obsidian vault import for ZIP and folder picker flows with one-to-one markdown note creation, preserved `[[wikilinks]]` in content, persisted per-note import flags (`note_import_flags`) for future link tooling, and covered parsing/import flow with dedicated tests
- added Apple Notes HTML import for ZIP and folder picker flows, extracted embedded base64 images into real attachments, queued best-effort OCR for imported images, persisted source metadata in `note_import_flags`, and covered parsing/import paths with dedicated tests
- added Google Keep Takeout JSON import for ZIP/file/folder sources, converted checklist notes to markdown checklists, mapped Keep hashtags to LocalFlow tags and labels to the note folder field, skipped trashed notes with warnings, and covered parsing/import flows with dedicated tests
- added template foundations with a persisted `templates` table, three built-in starters (`Meeting notes`, `Daily review`, `Project kickoff`), modal-based `Use template` flows for note/task creation, and `Save template` actions in note/task editors so users can keep reusable structures locally
