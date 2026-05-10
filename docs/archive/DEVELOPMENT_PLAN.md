> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This document is kept for historical context only. The current, authoritative
> rebuild plan is `STINGFIT_V2_PLAN.md` at the repo root. Agents must NOT plan,
> implement, or refactor based on the content below.
>
> Archived on 2026-05-02.

---

# LocalFlow — Finalizácia: vízia, plán a master prompt

Dokument pre dovedenie LocalFlow do v1.0 a jednu fázu po nej.
Revízia: 2026-04-19

---

## 1. Pozícia a vízia

**Jedna veta:** LocalFlow je najrýchlejší a najpokojnejší súkromný zápisník — napíš, nájdi, zamkni, zálohuj. Hotovo.

LocalFlow nie je „druhý Notion" a nie je „Obsidian pre začiatočníkov". Je to zápisník pre ľudí, ktorí chcú napísať myšlienku rýchlejšie ako ju stratia, nájsť ju o pol roka neskôr a mať istotu, že im text nikto neukradne ani nestratí. Všetko ostatné je rušenie.

Inšpirácia v pomere: Apple Notes (pokoj a rýchlosť) × Google Keep (capture bez trenia) × Bear (estetika a markdown) × Standard Notes / Notesnook (súkromie a zámky). Bez Notion bloatu, bez Obsidian konfiguračnej záťaže, bez Evernote tvrdých limitov.

**Cieľová osoba:** človek, ktorý si dnes zapisuje do Apple Notes / Keep / obyčajného textového súboru, ale chce (a) dôveru, že sa k jeho dátam nikto nedostane, (b) rýchle vyhľadávanie, aj po rokoch, (c) žiadne predplatné a žiadny login.

**Antivízia (čo sa do v1.0 nedostane):** databázy, kanban boardy, formuláre, real-time collaboration, plugin marketplace, AI asistent s bublinami, tagový graph view, wiki backlinks ako default, daily journal mode ako default, onboarding s tutoriálom.

---

## 2. Produktové princípy

Každá nová funkcia musí prejsť týmito piatimi filtrami. Ak padne na ktoromkoľvek, nepridáva sa.

Prvý filter je **local-first vždy.** Žiadna funkcia nevyžaduje sieť. Šifrovanie sa deje v browseri cez WebCrypto. Žiadna telemetria, žiadny login, žiadny payment flow.

Druhý filter je **2-sekundový capture.** Medzi „mám myšlienku" a „je uložená" môžu byť maximálne dva kroky (hotkey → text → enter). Titul nie je povinný. Tagy nie sú povinné. Kategorizácia nie je povinná. Inbox prvé, organizácia neskôr.

Tretí filter je **nájdi čokoľvek.** Ak text existuje v poznámke, v prílohe, v zoskenovanom obrázku alebo v názve, vyhľadávanie ho musí nájsť do 100 ms. Toto je jediný dôvod, prečo appka zostáva cennou po mesiacoch používania.

Štvrtý filter je **pokojné UI.** Žiadne bubliny, žiadne notifikačné bodky, žiadne reklamné rámiky. Jeden accent color. Žiadne emoji v produkte. Ikony iba tam, kde nahradia slovo.

Piaty filter je **žiadny lock-in.** Každá poznámka sa musí dať exportovať do portable formátu (markdown + assets). Každá cudzia poznámka (ENEX, Apple Notes export, Obsidian md, Keep JSON) sa musí dať naimportovať. Užívateľ musí kedykoľvek odísť bez strát.

---

## 3. Master prompt pre agenta

Toto je celý prompt, ktorý odovzdáš vývojárskemu agentovi (Claude Code alebo podobný) pre dotiahnutie LocalFlow do v1.0. Je sebestačný — agent nepotrebuje ďalší kontext okrem repa.

```
ROLA
Si senior TypeScript/React vývojár. Pracuješ na LocalFlow — privátnom offline-first
zápisníku, ktorého víziou je byť najrýchlejší a najpokojnejší súkromný zápisník
pre bežného človeka. Nie Obsidian, nie Notion. Skôr Apple Notes + Keep + Bear
s dôrazom na súkromie a lokálne dáta.

EXISTUJÚCI STACK (nemeň ho, ak o to nie si výslovne požiadaný)
- React 19 + Vite, TypeScript strict
- Tailwind CSS v4 (cez @tailwindcss/vite)
- Zustand pre client state
- TanStack Query pre async state
- sql.js (SQLite v WASM) perzistovaný v IndexedDB cez idb-keyval
- HashRouter + react-router-dom v7
- Tauri v2 scaffold (desktop wrapper, build nie je overený, zachovaj kompatibilitu)
- Vitest pre testy, fake-indexeddb pre DB testy

EXISTUJÚCA ŠTRUKTÚRA (rešpektuj ju)
- src/App.tsx a src/router.tsx — shell a routing
- src/features/<modul>/  — UI komponenty + <modul>Store.ts (Zustand) pre každú doménu
  (dnes: capture, notes, onboarding, projects, search, settings, tasks, today)
- src/components/ui/  — zdieľané primitíva (Button, Badge, Card, Input, CommandPalette, ToastHost)
- src/components/layout/  — AppShell a sidebar
- src/lib/  — čisté helpery (database.ts, migrations.ts, search.ts, export.ts,
  import.ts, backup.ts, constants.ts, uiStore.ts, utils.ts)
- src/types/  — zdieľané TS typy (note, task, project, common)
- src/hooks/  — useDatabase, useKeyboardShortcuts, useOnboarding, useTheme
- tests/  — database.test.ts, search.test.ts, export.test.ts + setup
- Alias @/ smeruje na src/

ZÁVÄZNÉ PRAVIDLÁ (nemodifikuj ich)
1. Local-first. Žiadny cloud call, login, telemetria, analytics SDK, payment flow.
   Ak by funkcia vyžadovala sieť, zastav a nahlás — neimplementuj.
2. TypeScript strict. Žiadne `any`. Žiadne `@ts-ignore` bez komentára prečo.
3. Postupuj po moduloch. Pred začatím modulu napíš v 3–5 vetách rozhranie
   (props / store API / DB schema zmeny) a čakaj na potvrdenie.
4. UI najprv s dummy dátami, až potom store a DB. Každý modul má empty state,
   loading state a error state.
5. Každá nová verejná funkcia dostane aspoň 1 Vitest test. Pri zmene DB schémy
   pridaj migráciu v src/lib/migrations.ts a regresný test v tests/database.test.ts.
6. Pri 3 neúspešných pokusoch o opravu tej istej chyby zastav, vráť sa na
   posledný zelený stav a navrhni 2 alternatívy.
7. Nepridávaj závislosti bez konzultácie. Výnimky s odôvodnením: chrono-node
   (NLP dátumy), fuse.js (fuzzy search), tesseract.js (OCR), shiki alebo
   highlight.js (code highlighting), argon2-browser (KDF). Všetko offline.
8. Dizajnový jazyk: jeden accent color, token-based Tailwind triedy
   (card-surface, text-text-primary, dark:* ekvivalenty). Žiadne hex farby
   v kóde. Žiadne emoji v produkte.
9. Každá user-facing akcia musí mať keyboard shortcut alebo byť vystavená
   v CommandPalette. Shortcut cheatsheet je prístupný cez "?".
10. Build a testy musia byť zelené po každom module.
    `npm run build && npm run test:run`. Žiadne nové ESLint warningy.
11. Po každom module pridaj 1–3 vety do CHANGELOG.md (ak neexistuje, vytvor ho).

PROTOKOL PRE JEDEN MODUL
Krok 1 — Plán bez kódu: zmeny v schéme, v store, v UI, v testoch.
Krok 2 — UI kostra s dummy dátami.
Krok 3 — Store a DB napojenie, migrácie.
Krok 4 — Testy (unit + 1 "happy path" integračný).
Krok 5 — Keyboard shortcut a CommandPalette vstup (ak akcia existuje).
Krok 6 — Sebakontrola: build zelený, test run zelený, žiadne console chyby
         pri `npm run dev`, žiadne regresie existujúcich testov.
Krok 7 — CHANGELOG.md záznam.

PROTOKOL PRE CELÝ V1 ROZSAH
Ideš fázami v poradí. Nepreskakuj. Každá fáza sa uzavrie samostatným commitom
s tagom (napr. v0.2-trust-capture). Po každej fáze oznám stav a čakaj na zelenú
pre ďalšiu.

────────────────────────────────────────────────────────────────────────
FÁZA 1 — STABILIZÁCIA (cieľ: appka je pripravená na ďalší vývoj)
────────────────────────────────────────────────────────────────────────
1.1  V src/features/today/TodayDashboard.tsx odstráň natvrdo dátumy
     ("2026-04-05T09:30:00") a nahraď aktuálnym new Date(). Pridaj hook
     useCurrentDate(intervalMs = 60_000) pre minútovú aktualizáciu.
1.2  V src/App.tsx akcia "export-data" v CommandPalette dnes len emitne toast.
     Napoj ju na reálny export flow z src/lib/export.ts (JSON snapshot download).
1.3  Pridaj ErrorBoundary wrapper okolo <AppRouter /> v App.tsx. Pri páde modulu
     zobraz recovery obrazovku s tlačidlom "Reload" a "Export backup" (cez
     backup.ts). Nie celá appka nech zhasne.
1.4  PWA: pridaj public/manifest.webmanifest (name, short_name, icons 192/512,
     theme_color, background_color, display: standalone, start_url: "/"),
     service worker cez vite-plugin-pwa alebo manuálny sw.js (precache statických
     assetov + offline fallback index.html). Appka musí byť "Installable" v Chrome.
1.5  Keyboard cheatsheet modal. Komponent ShortcutsCheatsheet v components/ui/,
     otvárateľný cez "?" globálne (okrem polí s textom) a cez CommandPalette
     akciu "Show shortcuts". Obsah čítaj zo centralizovaného registra skratiek
     (nový súbor src/lib/shortcuts.ts).
1.6  Mobilná responzivita sidebaru v AppShell: pod 768 px sidebar sa skryje,
     hamburger v headeri ho otvorí overlay dialogom. Otestuj v dev tools
     na 360×640 a 768×1024.
1.7  Performance check: `npm run build`, otvor preview, over že first paint
     pri prázdnej DB < 1 s, a pri 1000 dummy notes < 2 s. Ak nie, lazy-load
     markdown preview (`marked`) a sql.js WASM (`import sqlWasmUrl`).

Acceptance: `npm run build` zelený, `npm run test:run` zelený, Lighthouse PWA
check prejde "Installable", manuálny smoke test: vytvor 3 notes, 3 tasks,
1 project, odhlás devserver, otvor ako PWA — dáta sú tam.

────────────────────────────────────────────────────────────────────────
FÁZA 2 — TRUST & CAPTURE (cieľ: zero-friction vstup + dôvera)
────────────────────────────────────────────────────────────────────────
2.1  Inbox-first. Zmeň defaultný route z "/" (Today) na "/inbox". Today zostáva
     ako "/today" dostupný zo sidebaru. Inbox view zobrazuje nezaradené notes
     a tasks v chronologickom poradí (najnovšie hore), s akciami per item:
     "Pin", "Move to Project", "Convert to Task / Note", "Set Reminder", "Archive".
     Empty state: "Nothing to sort. Write, ⌘N."
2.2  Smart views. Pridaj vľavo v sidebare stále prítomné views:
       - Inbox (default)
       - Today (only tasks s due=today + notes pinned today)
       - Recent (posledných 20 items naprieč notes+tasks, by updated_at DESC)
       - Unsorted (notes+tasks bez projectu a bez tagu)
       - Resurface (items staršie ako 30 dní, nevidené 14+ dní, zobraz 5 denne
         pseudo-náhodne so seedom na dnešný dátum)
       - Archived
     Každý view má vlastný prázdny stav a filter v URL (napr. /view/resurface).
2.3  Reminders (nie tasks). Pridaj do DB tabuľku reminders(id, source_id,
     source_kind [note|task], remind_at, state [pending|fired|dismissed],
     created_at). Notifikácia cez Notification API (so žiadosťou o povolenie
     pri prvom nastavení, lokálne); pri Tauri builde použi native notification
     plugin. UI: "Remind me" menu na note/task s presetmi (1h, tomorrow 9am,
     next Monday, custom).
2.4  Per-note lock. Tabuľka note_locks(note_id, kdf_salt, wrapped_key_iv,
     wrapped_key_ciphertext, created_at). Pri lock: užívateľ zadá passphrase,
     odvodíme kľúč (Argon2id, m=64MiB, t=3, p=1), obsah poznámky (title+content)
     zašifrujeme AES-GCM 256. V DB namiesto obsahu uložíme ciphertext do
     notes.content a flag notes.is_locked=1. Odomknutie uloží kľúč v pamäti
     session, nie do storage. Auto-lock po N minútach nečinnosti (default 15).
     UI: menu "Lock note" s passphrase dialógom, placeholder v zozname poznámok
     "🔒 Locked" (bez obsahu). Bez passphrase = žiadne restore.
2.5  Šifrované zálohy. V src/lib/backup.ts pridaj variant `exportEncrypted`
     ktorý celý DB dump zabalí do .lfbackup súboru = {magic:"LFB1", kdf_params,
     salt, iv, ciphertext}. Import vyžiada passphrase. Stará nešifrovaná
     záloha zostáva dostupná pre power-userov, ale v UI je "Encrypted backup"
     default.
2.6  NLP quick capture (pridaj chrono-node). V CaptureModal parser:
       "Call mom tomorrow 5pm #family !!"
       → { title: "Call mom", due_at: 2026-04-20T17:00, tags: ["family"],
           priority: "high" }
     Tokens: `!` (low), `!!` (medium), `!!!` (high), `!!!!` (urgent),
     `#tag` pre tagy, všetko ostatné cez chrono. Vizuálny preview pod inputom
     ukáže rozpoznané polia. Enter potvrdí, Esc zruší.
2.7  Tauri native layer (ak je Rust toolchain dostupný; ak nie, nahlás a preskoč
     2.7 — appka musí fungovať aj bez tohto kroku ako PWA):
       - tauri-plugin-global-shortcut: Cmd/Ctrl+Shift+L otvorí quick capture aj
         keď appka beží len v trayi
       - tauri-plugin-autostart: voliteľný toggle v Settings
       - system tray s položkami "New note", "Quick capture", "Open LocalFlow",
         "Quit"
       - native notifikácie pre reminders

Acceptance: user bez tutoriálu zvládne vytvoriť poznámku za < 2 s od hotkey,
zamknúť ju passphraseom, a zašifrovaný backup reimportovať na čistej inštalácii.

────────────────────────────────────────────────────────────────────────
FÁZA 3 — FIND ANYTHING (cieľ: vyhľadávanie po mesiacoch stále funguje)
────────────────────────────────────────────────────────────────────────
3.1  Attachments ako first-class. Tabuľka attachments(id, owner_id, owner_kind,
     filename, mime, size, content_blob_key, ocr_text, created_at). Blob sám
     ulož do idb-keyval pod prefixom "lfa:". Max velkosť 50 MB per file.
     UI: drag-and-drop do note editora, zoznam príloh pod editorom, klik otvorí
     v novom tabe (object URL).
3.2  OCR pipeline. Pri pridaní obrázka (image/*) spusti tesseract.js Worker
     (lang=eng+slk stiahnuté raz, cacheované v IndexedDB). Výsledný text uloží
     do attachments.ocr_text. Progress indicator per attachment. Zlyhanie
     neblokuje upload — OCR je best-effort.
3.3  Fulltext index a operátory. Keďže sql.js nemá FTS5 v našom WASM builde:
     udržuj invertovanú tabuľku search_index(token, owner_id, owner_kind,
     field, position). Aktualizuje sa triggerom po INSERT/UPDATE/DELETE.
     Parser dotazu podporuje:
       "doslovná fráza"
       tag:work           (len items s tagom)
       due:today          (only-today, this-week, overdue)
       project:<id|name>
       has:attachment
       is:locked / is:archived / is:pinned
       kind:note / kind:task
     Aj operátory a plain text sa dajú kombinovať. Výsledky sú zoskupené
     po kind, snippet so zvýrazneným matchom.
3.4  Import z iných aplikácií. Nová sekcia v Settings > Data > Import:
       - ENEX (Evernote export) — XML parser, prevedie <note> na LocalFlow note,
         <resource> na attachment (s OCR trigger pre obrázky)
       - Obsidian vault (zip alebo folder picker) — markdown súbory jeden-na-jeden,
         `[[links]]` sa zachovajú ako plain text s flagom "wikilink" (zatiaľ
         nezmienkovaný v UI, uložený pre možnú budúcu feature)
       - Apple Notes export (HTML dump z File → Export) — base64 obrázky
         sa extrahujú do attachments
       - Google Keep Takeout (JSON) — poznámky + checkliste, tagy sa mapujú
         na tagy, labels na folder
     Každý import ukáže preview (počet notes, tasks, attachments) a pýta
     potvrdenie.
3.5  Export. Rozšír src/lib/export.ts:
       - plný JSON snapshot (už existuje)
       - markdown export celej databázy do ZIP (notes/*.md, attachments/*)
       - per-note markdown download z NoteEditor hlavičky
       - per-project export (všetky note + task + reminders naviazané na projekt)
3.6  Šablóny. Tabuľka templates(id, name, kind [note|task], body, variables_json,
     created_at). Pri vytváraní note/task — tlačidlo "Use template". Vstavané
     3 šablóny: "Meeting notes", "Daily review", "Project kickoff". User si
     môže uložiť vlastné.

Acceptance: user importuje 500 Evernote notes, spraví full-text hľadanie
s operátormi, nájde poznámku s textom zo scanu PDF, exportuje všetko do
markdown ZIP, obnoví na novom stroji.

────────────────────────────────────────────────────────────────────────
FÁZA 4 — LEŠTENIE + RELEASE (cieľ: v1.0 na verejnosť)
────────────────────────────────────────────────────────────────────────
4.1  Accessibility audit. WCAG 2.1 AA: focus rings všade, aria-labels,
     keyboard-only prechod cez celú appku, Lighthouse a11y ≥ 95.
4.2  Performance audit. Lighthouse Performance ≥ 90 na prázdnej DB a na
     DB s 5000 items. Bundle analyzer: identify code-split opportunities
     (marked, sql.js WASM, tesseract už lazy).
4.3  Dokumentácia. README s 1 GIF demo (capture + search + lock), 3 screenshoty,
     inštalačný návod web + desktop. CHANGELOG.md zoradený podľa fáz.
     Privacy statement v repe (1 A4: žiadne siete, žiadna telemetria, kde sú
     dáta fyzicky uložené).
4.4  Licencia. Navrhni maintenerovi voľbu MIT vs. AGPL-3.0 a čakaj na rozhodnutie.
4.5  Landing page. Jedna HTML stránka v docs/ (alebo separate repo) s:
       - hero tagline "Your notes. On your disk. Forever."
       - 3 screenshoty (Inbox, Search, Lock)
       - 1 GIF
       - download tlačidlá (Web/PWA, .dmg, .exe, .AppImage)
       - FAQ (privacy, sync, pricing)
       - GitHub link
4.6  Release artefakty. Tauri builds podpísané (macOS notarization sa rieši
     manuálne majiteľom; iba priprav pipeline). GitHub Release s checksumami.
     PWA deployment na GitHub Pages alebo Cloudflare Pages (statický build).

Acceptance: verzia v1.0.0 taggnutá, assets nahrané, landing page live, CHANGELOG
zoradený, žiadne P0/P1 bugy v issue trackeri.

────────────────────────────────────────────────────────────────────────

DEFINÍCIA DONE PRE V1.0
- Všetky 4 fázy ukončené a otagované
- `npm run build && npm run test:run` zelený
- Lighthouse: PWA Installable, a11y ≥ 95, performance ≥ 90
- Bundle < 1.5 MB gzipped (sql.js WASM a tesseract vylúčené z hlavného chunku)
- Tauri build beží na macOS + Windows + Linux (alebo explicitne nahlásené
  ktoré chýbajú)
- Import zvládne 1000 ENEX notes bez pádu
- Encrypted backup roundtrip (export → reinstall → import) zachová 100 % dát
- Žiadna závislosť nespadá pod licenciu, ktorá kolísuje s vybranou projektovou
  licenciou

ČO NEROBIŤ POČAS V1.0
- Žiadne wiki `[[links]]` ako default (plánované v2, viď vízia)
- Žiadny graph view
- Žiadny Kanban
- Žiadny AI asistent, žiadna cloud AI
- Žiadny sync engine (to je v2)
- Žiadne plugin / user scripts
- Žiadny onboarding „cirkus" — prvý otvor appky = prázdny Inbox a kurzor v poli
```

Tento prompt odovzdaj agentovi celý v prvej správe. Ďalšie tvoje správy sa majú obmedziť na schvaľovanie plánu medzi fázami a odpovede na konkrétne otázky, ktoré agent položí.

---

## 4. Vízia po v1.0

v1.0 má byť pokojná a úzka. Ale trh ide ďalej — tu je smer, ktorý má zmysel sledovať. Všetko nižšie je **voliteľné** a nič z toho sa nesmie robiť pred v1.0.

**v1.1 — Bring-your-own-sync.** Namiesto cloudového sync engineu dá LocalFlow užívateľovi vybrať priečinok (iCloud Drive, Dropbox, Syncthing, Google Drive desktop folder) a uloží tam SQLite súbor. Konflikty riešime last-write-wins s viditeľným warningom. Nula infraštruktúry, plné vlastníctvo dát.

**v1.2 — Wiki linky `[[...]]` ako opt-in.** Kto nikdy nenapíše `[[`, neexistujú. Kto napíše, dostane autocomplete a panel „Linked from". Graph view odkaz vľavo dole, žiadne pushovanie.

**v1.3 — Lokálne AI iba na povel.** Whisper.cpp WASM pre voice-to-text capture, malý lokálny LLM (napr. Phi-3 mini cez WebGPU) pre „Summarize this note" a „Extract tasks from this meeting note". Žiadne bubliny v UI, žiadny default trigger. Vyžaduje sa výslovná akcia.

**v1.4 — Web clipper bookmarklet.** 1 klik = URL + selected text + title do Inbox. Zero extension, zero permission dialog.

**v1.5 — Inline tasky v note (opt-in).** `- [ ] kúpiť mlieko` v note vytvorí reálny task prepojený na note. Nie default behaviour — zapína sa v settings „Smart markdown".

**v2.0 — Plugin sandbox.** Užívateľské skripty v Web Workeri s obmedzenou API (read-only dáta + register command). Bez runtime cloud calls. Komunita okolo toho dokáže appku držať nažive roky.

Čo nikdy nechceme (ani v2, ani v3): telemetria, prihlasovanie, reklamy, freemium s obmedzeniami na počet poznámok, lock-in pri exporte, real-time collaborative editing, marketplace s revenue share.

---

## 5. Riziká a úprimné kontra-argumenty

**Riziko prvé: priestor je preplnený.** Apple Notes je zadarmo a predinštalované. Obsidian má 5-ročnú komunitu. Standard Notes má trakciu v privacy nike. LocalFlow musí mať jeden dôvod, prečo existuje. Ten dôvod v tomto pláne znie: „najrýchlejší pokojný zápisník, ktorý nevyžaduje, aby si sa niekam prihlásil, a ktorý zamkne konkrétnu poznámku za 2 kliky." Ak sa pri demo tento rozdiel nevie vysvetliť 10-sekundovou vetou, projekt stráca ťah.

**Riziko druhé: scope creep.** V roadmape som radil fázu 5 na verejnosť len ak fázy 1–3 držia. Ak cítiš tlak pridávať (wiki linky, graph, AI), zatlač späť. Každá ďalšia funkcia naviac je 2× pomalšie vydanie.

**Riziko tretie: Tauri komplikácie.** Rust toolchain, macOS notarization, Windows code signing. Ak nie je rozpočet/čas, vydaj najprv PWA-only verziu a desktop buildy ako „beta" bez podpisu, s README poznámkou. Web build je dosť silný ako v1.

**Kontra k úplnej lokálnosti:** časť trhu chce sync medzi zariadeniami aj bez vlastného Dropboxu. Odpoveď je bring-your-own-sync (v1.1), nie vlastný cloud. Kto sync nechce, nezapne ho — kto chce, nech si vyberie vlastný backend. Toto je férový kompromis, ktorý nerúca základný sľub.
