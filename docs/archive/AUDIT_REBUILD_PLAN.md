> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This document is kept for historical context only. The current, authoritative
> rebuild plan is `STINGFIT_V2_PLAN.md` at the repo root. Agents must NOT plan,
> implement, or refactor based on the content below.
>
> Archived on 2026-05-02.

---

# StingFit / LocalFlow — Audit a Rebuild Plán

_Vyhodnotenie projektu pre fitness zápisník zameraný na rýchlosť vo fitku._
_Spracované: 2026-04-28_

---

## 1. Čo som našiel (skutočný stav)

### 1.1 Stack
- **Frontend:** React 19 + TypeScript 5.9 (strict), Vite 8, Tailwind 4
- **Routing:** react-router-dom 7 (HashRouter)
- **State:** zustand + @tanstack/react-query
- **Lokálna DB:** sql.js (SQLite vo WASM) cez idb-keyval
- **Desktop wrapper:** Tauri 2
- **Testy:** vitest + jsdom — 60+ testovacích súborov pre fitness modul, plus ďalšie pre legacy moduly
- **Lokalizácia:** kompletne slovenčina (UI texty, copy, error messages)

### 1.2 Skutočne fungujúca fitness funkcionalita
Toto je naozaj impozantné, čo už máš hotové:

- **Plány (Plans):** týždeň → deň → workout → cvik s parametrami (sety, min/max reps, RIR, rest)
- **Štartovacie šablóny:** Push/Pull/Legs ako seed
- **Knižnica cvikov:** kategorizácia, custom exercises, default rest seconds
- **Live tréning:** snímkuje plán pri štarte (žiadny retro-edit nezničí históriu)
- **Set logger:** kg/lb, reps, RIR, +/− tlačidlá s krokmi (2.5/5)
- **Rest timer:** automatický štart po dokončení série
- **Recovery:** ak appka spadne uprostred tréningu, ponúkne pokračovanie
- **History:** dokončené tréningy + detail
- **Stats:** PR (e1RM cez Epley), objem, týždenná konzistentnosť, hint na progres
- **Settings:** displayUnit, showGuidance, export/import JSON, full reset
- **Plan readiness:** validátor, či sa plán dá vôbec spustiť (blockers/warnings)
- **Onboarding flow** + **command palette** + **keyboard shortcuts** + **toast host**
- **Service Worker** je registrovaný v `main.tsx` (PWA-ready)

### 1.3 Čo tam ešte zbytočne ostalo (legacy LocalFlow)
Toto je **najväčšia diagnóza**: appka má **rozdvojenú identitu**.

```
package.json    →  "name": "localflow"
main.tsx        →  __LOCALFLOW_DEBUG__, "localflow" hostname check
UI texty        →  "StingFit"
App.tsx         →  "Načítavam StingFit", "tvoj lokálny tréningový priestor"
Sidebar         →  /notes, /tasks, /projects, /inbox, /today, /archive, /search
Router          →  presmerovanie / → /training, ALE všetky legacy routy ešte živé
```

**Dead code, ktorý zbytočne zaťažuje bundle, build čas aj testy:**

| Modul | Súbory | Status |
|---|---|---|
| `features/notes/` | NoteEditor, NotesList, NoteAttachments, NoteLockModal, NotePreview, notesStore | nepatrí do fitness |
| `features/tasks/` | TaskItem, TaskDetail, TasksList, tasksStore | nepatrí do fitness |
| `features/projects/` | ProjectsList, ProjectDetail, projectsStore | nepatrí do fitness |
| `features/templates/` | TemplatePickerModal, TemplateSaveModal | dvojzmyselné — môže byť pre plány |
| `features/capture/` | QuickCapture, CaptureModal, captureParser | inbox-style capture |
| `features/today/`, `features/views/`, `features/search/` | celé | LocalFlow leftover |
| `lib/import*.ts` | Apple Notes, Obsidian, Google Keep, Evernote | nepatrí do fitness |
| `lib/ocr.ts`, `tesseract.js` | OCR knižnice + import | mŕtvy kód, ťažký bundle |
| `lib/noteLocks.ts`, `argon2-browser` | Argon2 šifrovanie poznámok | mŕtvy kód, WASM payload |
| `mobile-expo/`, `localflow/expo-app/` | dva Expo skeletony, prázdne | nedokončené pivoty |

**Záver:** appka nesie ~40 % zbytočného kódu. Tesseract.js a argon2-browser samé pridajú **stovky kB do bundle**.

### 1.4 Bug a UX nálezy v skutočne používanom fitness módule

#### 🔴 Kritické (bránia rýchlemu používaniu vo fitku)

1. **`window.location.href = '/training'` v `FitnessDashboard.tsx:88` a `FitnessHistoryPage.tsx:88`**
   Toto **rozbije SPA** — tvrdo reloaduje appku. Pri sql.js v IDB to znamená, že DB sa znova bootuje, načítavanie 1-3 sekundy. Vo fitku katastrofa.
   _Fix: použiť `useNavigate()` z react-router._

2. **`window.confirm()` na "Zahodiť tréning" v `FitnessDashboard.tsx:136`**
   Natívny browser dialóg vyzerá neprofesionálne, neladí s tmavým fitness UI a na mobile sa otvorí systémový alert ktorý prerušuje.
   _Fix: vlastný `<Modal />` (už ho máš v `components/ui/Modal.tsx`)._

3. **SetLogger nemá `lastSetForExercise` referenciu.**
   Najdôležitejšia info pri tréningu je **„naposledy som dal X kg na Y opakovaní"**. Užívateľ to vidí len cez históriu, nie počas zápisu série. Toto je #1 dôvod, prečo ľudia chodia s zošitom — chcú vidieť progresiu.
   _Fix: do `FitnessSessionExerciseRecord` pridať `lastPerformance: { weightKg, reps, rir, completedAt } | null` a zobraziť hneď nad set loggerom._

4. **Žiadny audio/haptický signál na koniec rest timera.**
   `RestTimer` len ticháno odpočítava. Vo fitku so slúchadlami užívateľ nezbadá.
   _Fix: `navigator.vibrate([200, 100, 200])` + voliteľný beep. Pri PWA + iOS treba úmyselný gesto-init audio context._

5. **Žiadny „rýchly tréning" bez plánu.**
   Užívateľ MUSÍ mať osobný plán a spustiteľný workout. Ale často chodí ľudí len „na pumpu" — chce zalogovať pár sérií, žiadny plán. Aktuálne to nejde.
   _Fix: route `/quick` ktorý spustí session bez plánu, dynamicky pridáva cviky cez `addUnplannedExercise`._

#### 🟠 Vysoké (zhoršujú UX, ale appka funguje)

6. **SetLogger je vizuálne preplnený.**
   3 stĺpce inputov + 3 stĺpce +/− buttonov + hero hlavička + box „Ovládanie jedným palcom" + submit. Pre tlačidlovú UI vo fitku je to **moc hore-dole pohybu** palcom. Ergonomicky lepšie: jeden veľký numpad, váha ako 2 veľké tlačidlá `+2.5/+5`, reps `+1/−1`, RIR ako single-tap chips (0–4).

7. **Žiadny warmup-set marker.**
   Všetky série sú „working sets". V realite prvé 1–3 série sú warmupy, nepatria do PR výpočtu ani objemu.
   _Fix: pridať `isWarmup: boolean` do `FitnessSessionSetRecord`, vylúčiť z `buildProgressSnapshot`._

8. **Žiadne supersety, drop-sety, myo-rep, cluster sety, AMRAP, time-under-tension.**
   Pre serióznych ľudí toto je dealbreaker.

9. **Nie je „per-side" tracking** (jednoručky), žiadne unilateral rozlíšenie.
   Niekto si dá 22.5 kg do pravej a 20 kg do ľavej (rehab). Aktuálne to nezachytíš.

10. **Žiadny plate calculator.**
    Klasická pomôcka — „chcem 102.5 kg, akú váhu na akú stranu". Triviálny add, veľká hodnota.

11. **Žiadne grafy v `/stats`.**
    Len čísla a bullets. Pre PR napätie chýba graf 1RM v čase, graf objemu na svalovú skupinu, heatmapa konzistentnosti.

12. **Žiadny exercise media (gif/video/foto).**
    Pri custom cvikoch užívateľ nevie, ako sa volá ten cvik na ktorom stroji.

13. **`category` je len string** — nie enum a nie muscle group taxonomy.
    Hrudník, chrbát, nohy, ramená, paže — voľný text v seede. Nemôžeš robiť „objem na svalovú skupinu týždenne" agregáciu spoľahlivo.

14. **Žiadne CSV import** zo Strong, Hevy, FitNotes, Jefit.
    Migration friction — nikto nezačne odznova.

15. **Žiadny zámok na dokončenú sériu.**
    Užívateľ môže omylom prejsť cez `−1` opakovania na `−999`. SetLogger nevaliduje rozsahy (0–999 reps, 0–500 kg).

#### 🟡 Stredné

16. **Sticky bottom CTA na mobile** v `SetLogger` má `lg:bottom-auto lg:top-6` — na desktopu je hore. To je nečakané, mätúce.

17. **Onboarding flow** robí univerzálnu „LocalFlow" cestu, nie fitness-specific. Treba prepísať.

18. **CommandPalette + keyboard shortcuts** sú desktop power-user features — vo fitku na mobile zbytočné, ale stále v bundle.

19. **`HashRouter`** miesto `BrowserRouter` — pre Tauri OK, ale pre PWA/web URL `/#/training` je škaredé.

20. **Žiadne PWA manifest** (alebo som ho nenašiel) — `sw.js` sa registruje, ale nie je `manifest.webmanifest` viditeľný v projekte.

21. **Žiadne dark/light test pre fitness farby** — `fitness-yellow` na čiernej je hyper-kontrastné, ale na svetlej téme vyzerá ako varovanie.

22. **`buildProgressSnapshot` počíta volume ako `weightKg * reps` bez ohľadu na bodyweight cviky** (kliky, brucho, plank). Pre tieto je objem nezmysel.

23. **Žiadne akceptovanie kratších URL z external (napr. notification → otvor /training/active).**

24. **Žiadny offline flag UI** — užívateľ nevie, či má dáta lokálne alebo nie.

25. **Žiadny conflict-free export medzi zariadeniami.**
    Lokálny-only je správna pozícia (napísané v `RULES.md`), ale aspoň „export → import na druhom zariadení" treba dokumentovať.

#### 🟢 Drobnosti

- `expo-app/` a `mobile-expo/` sú **prázdne skeletony** — alebo zmaž alebo dokonči (RN/Expo build pipeline).
- `RULES.md` je len agent-rules, nie product rules. Pridať `PRODUCT.md` s vision.
- `lucide-react@^1.7.0` — verzia 1.x je prastará (aktuálne ~0.500+); ikony môžu mať bugy. **Overiť — toto je červený flag pre dependency resolution**.
- `marked@^17.0.6` — verzia je nereálne vysoká (aktuálne marked je v rozpätí 12–15). Buď je to chyba v package.json, alebo nestable beta.

### 1.5 Architektonické pozorovania

**Plusy:**
- Repository pattern (`fitnessRepository.ts`) krásne izoluje SQL od UI.
- Typy (`fitnessTypes.ts`) sú prehľadné a kryjú celý doménový model.
- Testy: `fitness-repository.test.ts`, `fitness-plan-readiness.test.ts`, `fitness-progress.test.ts` — naozaj solídne, validuje logiku.
- Migrations cez `lib/migrations.ts` — správne pre evolúciu DB schémy.
- Lazy-loading routes (React.lazy + Suspense) — bundle splits.

**Mínusy:**
- `database.ts` mieša fitness, notes, tasks, projects, reminders, templates, attachments. Treba **rozdeliť**.
- Žiadny error boundary pre konkrétny fitness submodul (len globálny `AppErrorBoundary`).
- `react-query` je nainštalované, ale nepoužité na fitness data — všetko je `useEffect + setState`. Nekonzistentné.
- Optimistické updates chýbajú — každý `logSet` čaká na DB roundtrip → pri pomalom IDB to laguje.

---

## 2. Verdikt

**Toto NIE je projekt na rebuild od nuly.** Fitness modul je **80 % hotový a kvalitný**. Problém je:

1. Identitná schizofrénia (LocalFlow ↔ StingFit)
2. ~40 % dead code z pôvodnej notes/tasks aplikácie
3. UX detaily v SetLoggeri a RestTimeri, ktoré rozhodujú o tom, či to je „rýchly zápisník vo fitku" alebo „ďalší pomalý tracker"
4. Chýbajúce killer-features: lastPerformance, audio/haptic, quick session, plate calc, grafy

**Stratégia:** _Subtraction first, addition second._ Najprv zmazať balast, potom doleštiť UX kritickej cesty (set logging), potom pridať killer features.

---

## 3. Rebuild Plán — 4 fázy, ~3–5 týždňov solo work

### FÁZA 0 — Identita a čistenie (2–3 dni)
**Cieľ:** appka má jeden názov, jednu navigáciu, polovičný bundle.

- [ ] Rozhodnúť meno: **StingFit** (UI už hovorí týmto menom) → premenovať `package.json`, `__LOCALFLOW_DEBUG__`, README.
- [ ] Zmazať `features/notes/`, `features/tasks/`, `features/projects/`, `features/today/`, `features/views/`, `features/search/`, `features/capture/`, `features/templates/` (alebo migrovať `templates/` do `features/fitness/templates/` ak ich plány používajú).
- [ ] Zmazať `lib/import*.ts`, `lib/ocr.ts`, `lib/noteLocks.ts`, `lib/captureParser.ts`, `lib/smartViews.ts`, `lib/reminders.ts`.
- [ ] Z `package.json` vyhodiť: `tesseract.js`, `argon2-browser`, `chrono-node`, `marked` (pokiaľ ho fitness reálne nepoužíva), `idb-keyval` (overiť), `jszip` (z dev deps ak nie je v importoch fitness).
- [ ] Z `database.ts` extrahovať `fitnessDatabase.ts` — len fitness tabuľky a migrácie.
- [ ] Zmazať `mobile-expo/`, `localflow/expo-app/` alebo presunúť do separátneho repo.
- [ ] Z `router.tsx` vyhodiť `/notes`, `/tasks`, `/projects`, `/inbox`, `/today`, `/archive`, `/view/:viewId`, `/search`.
- [ ] `NavigationSidebar` zredukovať na: **Tréning · Plány · História · Štatistiky · Nastavenia**.
- [ ] Audit `lucide-react@^1.7.0` a `marked@^17.0.6` — overiť, či nie je broken pin.
- [ ] Po čistení: `npm run check` musí prejsť (lint + test + build).

**Acceptance:** bundle size −30 % alebo viac. Žiadne legacy routy. Jeden brand naprieč kódom.

---

### FÁZA 1 — Kritické UX fixy (3–5 dní)
**Cieľ:** zápis série je naozaj „2 ťuky a hotovo", appka neruší prácu vo fitku.

- [ ] **Replace `window.location.href` s `useNavigate`** všade (FitnessDashboard, FitnessHistoryPage, NotReadyWorkoutsCard).
- [ ] **Replace `window.confirm`** s vlastným `<ConfirmModal />`.
- [ ] **`lastPerformance` v session exercise:**
  - DB: pridať view alebo helper v `fitnessRepository.getLiveSession` ktorý dohľadá poslednú dokončenú sériu pre `(exerciseId)` z histórie.
  - UI: nad SetLoggerom badge: _„Naposledy: 80 kg × 8 @ RIR 2 (pred 4 dňami)"_.
- [ ] **Audio + haptic na koniec rest timera:**
  - `navigator.vibrate([200, 100, 200])` na mobile.
  - WebAudio beep (gesto-inicializovaný — pri prvom tape na "Zapísať sériu" si sprav `AudioContext`).
  - Toggle v `FitnessSettingsPage`: „Zvuk pauzy", „Vibrácie pauzy".
- [ ] **Validácia rozsahov v SetLoggeri:** weight 0–500, reps 0–999, RIR 0–10. Pri overflow disable submit.
- [ ] **Sticky CTA len na mobile**, na desktope normálny flow (zmaž `lg:top-6`).
- [ ] **Quick session route `/quick`:**
  - Nový flow: žiadny plán, len „Pridaj cvik z knižnice" → sety logujú live.
  - Ukladá sa do rovnakej tabuľky `fitness_sessions` s `planId = null`.
- [ ] **Onboarding** prepísať na fitness scenár: „Chceš začať s PPL? Áno/Nie" → ak nie, otvor Quick session.

**Acceptance:**
- Zalogovať 5 sérií trvá < 30 s.
- Po dokončení série appka vibruje a píska po `restSeconds`.
- Vidím, čo som dával naposledy.

---

### FÁZA 2 — Killer features (5–8 dní)
**Cieľ:** appka má čo iné nemajú a hodí sa pre 80 % gymgoers.

- [ ] **Plate calculator panel** v SetLoggeri (collapsible). Input: cieľová váha + bar weight. Output: vizuálny rozpis platní per side.
- [ ] **Set typy:** `working` | `warmup` | `dropset` | `myo` | `failure` (enum). Warmupy mimo PR a objem výpočtov.
- [ ] **Per-side weight tracking** — checkbox „Per side" → dva inputy `Lavá / Pravá`. Default off.
- [ ] **Supersety** — možnosť označiť 2+ cviky ako pair, počas tréningu sa medzi nimi prepína bez rest timera.
- [ ] **Muscle group taxonomy:**
  - Vytvoriť enum `MuscleGroup` (chest, back, quads, hamstrings, glutes, shoulders, biceps, triceps, calves, abs, forearms).
  - Migrácia: ku každému `exercise.category` priradiť muscle group.
  - Stats: weekly volume per muscle group s odporúčanými 10–20 sets/week.
- [ ] **Stats grafy:**
  - 1RM progres na cvik (line chart) — odporúčam Recharts (už by bol kompatibilný), alebo inline SVG.
  - Heatmapa tréningov posledných 12 týždňov (GitHub-style).
  - Volume per muscle group — stacked bar.
- [ ] **CSV import** zo Strong (jeden formát stačí na MVP).

**Acceptance:**
- Vidím PR krivku pre Bench Press za posledné 3 mesiace.
- Vidím, že som dával nohy 4 týždne pod 10 sets/week, appka to označí.

---

### FÁZA 3 — Polish + distribúcia (3–5 dní)
**Cieľ:** dať to ľuďom.

- [ ] **PWA manifest** — `manifest.webmanifest`, install prompt, offline fallback page.
- [ ] **Iconset** zladený s názvom (StingFit + včela/blesk identita — už máš yellow/black tému).
- [ ] **Tauri build** — ak chceš desktop app, `npm run tauri:build` s ikonami a installer pre Windows/macOS.
- [ ] **Mobile gestures:** swipe left na sériu = mark skipped, swipe right = duplicate.
- [ ] **Backup nudge** — po 30 sessions appka navrhne export.
- [ ] **Telemetry-free analytics check** — overiť, že nikam nič nelieta (RULES.md to zakazuje).
- [ ] **Jednorázové i18n vyriešenie:** všetky stringy do `i18n/sk.ts` ak by si raz chcel angličtinu.
- [ ] **README** + **CHANGELOG** + **screenshoty**.

**Acceptance:** appka sa dá nainštalovať z prehliadača na iPhone, fungujú vibrácie, tréning sa dá spustiť bez wifi.

---

## 4. Quick wins (urob hneď, < 2 hodiny každé)

1. Zmaž `mobile-expo/` a `localflow/expo-app/`. Sú prázdne.
2. Replace `window.location.href = '/training'` v 2 súboroch s `navigate('/training')`.
3. Pridaj do SetLoggera placeholder „Naposledy: —" pre budúci `lastPerformance` (jasná TODO marka v UI).
4. Validácia inputov v SetLoggeri (max 500/999/10).
5. V `RULES.md` dopíš sekciu **Product**: čo appka JE a čo NIE JE — ako poistka pred ďalším pivotom.

---

## 5. Ako pokračovať

Odporúčam ísť **vo fázach 0 → 1 → 2 → 3**, nie paralelne. Po každej fáze:

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Ak sa zacyklíš (RULES.md hovorí 3+ pokusy), vráť sa na posledný funkčný commit.

---

## 6. Príloha — súbory, ktoré si jednoznačne ponechaj

```
src/features/fitness/                  ← celé, toto je core
src/lib/database.ts (po extrakcii)    ← len fitness časť
src/lib/migrations.ts                  ← migrations engine
src/lib/utils.ts                       ← cn() helper
src/components/ui/Button.tsx, Card.tsx, Badge.tsx, Modal.tsx, EmptyState.tsx, ToastHost.tsx
src/styles/themes.css, globals.css     ← fitness yellow/black téma
tests/fitness-*.test.{ts,tsx}          ← celé, toto je tvoj safety net
RULES.md                               ← agent guardrails
```

---

_Koniec auditu. Ak chceš, môžem ti rozbehnúť **Fázu 0** (čistenie) hneď — premenovanie projektu, zmazanie legacy modulov, redukcia router/sidebar, audit dependencies. Stačí povedať „poďme do Fázy 0"._
