> [!WARNING]
> **ARCHIVED — DO NOT USE AS GUIDANCE.**
> This file is from the April 2026 "High-Voltage Fitness" pivot roadmap. Most
> of it has shipped as StingFit V1; the rest is superseded by the V2 plan.
> Agents must NOT plan, implement, or refactor based on the content below.
> The current authoritative plan is `STINGFIT_V2_PLAN.md` at the repo root.
>
> Archived on 2026-05-05.

---

# High-Voltage Fitness Module 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible LocalFlow productivity shell with a focused fitness shell using High-Voltage Wasp styling and the first set of fitness-only screens.

**Architecture:** Keep existing database/productivity code in place for safety, but remove it from primary navigation and command surfaces. Add lightweight fitness pages for Plans, History, Stats, and Settings; route them through the existing app shell. Introduce theme tokens/classes that can be reused by later fitness modules.

**Tech Stack:** React 19, TypeScript strict mode, React Router, Tailwind CSS, Lucide icons, Vitest/jsdom.

---

## File Structure

- Modify `src/lib/constants.ts` — app branding and primary nav.
- Modify `src/components/layout/NavigationSidebar.tsx` — fitness icons and nav groups.
- Modify `src/components/layout/TopBar.tsx` — fitness search/start actions.
- Modify `src/App.tsx` — command palette with fitness actions.
- Modify `src/hooks/useKeyboardShortcuts.ts` — fitness quick nav.
- Modify `src/lib/shortcuts.ts` — fitness shortcut copy.
- Modify `src/router.tsx` — routes for `/plans`, `/history`, `/stats`, `/settings` fitness screens.
- Modify `src/styles/themes.css` and `src/styles/globals.css` — High-Voltage Wasp tokens/utilities.
- Modify `src/features/fitness/FitnessDashboard.tsx` — align hero/CTA with yellow-black style.
- Create `src/features/fitness/FitnessPlansPage.tsx` — starter/personal plan shell.
- Create `src/features/fitness/FitnessHistoryPage.tsx` — history shell.
- Create `src/features/fitness/FitnessStatsPage.tsx` — stats shell.
- Create `src/features/fitness/FitnessSettingsPage.tsx` — fitness settings shell.
- Create `tests/fitness-shell.test.ts` — branding/nav/shortcuts tests.
- Create `tests/fitness-pages.test.tsx` — placeholder page render tests.
- Update `tests/fitness-dashboard.test.tsx` if CTA text changes.
- Update `tests/fitness-navigation.test.ts` if nav expectations change.

## Task 1: Branding, nav, and shortcuts

**Files:**
- Test: `tests/fitness-shell.test.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/shortcuts.ts`

- [ ] **Step 1: Write the failing shell test**

```ts
import { describe, expect, test } from 'vitest'

import { APP_NAME, VIEW_NAV_ITEMS, WORKSPACE_NAV_ITEMS } from '@/lib/constants'
import { SHORTCUTS } from '@/lib/shortcuts'

describe('fitness shell configuration', () => {
  test('uses fitness-first branding and primary navigation', () => {
    expect(APP_NAME).toBe('StingFit')
    expect(VIEW_NAV_ITEMS.map((item) => [item.id, item.label, item.path])).toEqual([
      ['fitness', 'Training', '/training'],
      ['plans', 'Plans', '/plans'],
      ['history', 'History', '/history'],
      ['stats', 'Stats', '/stats'],
    ])
    expect(WORKSPACE_NAV_ITEMS).toEqual([])
  })

  test('documents fitness quick navigation', () => {
    expect(SHORTCUTS).toContainEqual(
      expect.objectContaining({
        group: 'Navigate',
        label: 'Go to Training',
        keys: 'Cmd/Ctrl + D',
      }),
    )
    expect(SHORTCUTS).toContainEqual(
      expect.objectContaining({
        group: 'Navigate',
        label: 'Quick Nav 1–5',
        description: 'Jump across Training, Plans, History, Stats, and Settings.',
      }),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/fitness-shell.test.ts`

Expected: FAIL because branding/nav still expose legacy values.

- [ ] **Step 3: Implement constants and shortcut copy**

Set `APP_NAME` to `StingFit`, set `VIEW_NAV_ITEMS` to Training/Plans/History/Stats, and set `WORKSPACE_NAV_ITEMS` to an empty readonly array. Update shortcut copy to fitness navigation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/fitness-shell.test.ts`

Expected: PASS.

## Task 2: Fitness page shells

**Files:**
- Test: `tests/fitness-pages.test.tsx`
- Create: `src/features/fitness/FitnessPlansPage.tsx`
- Create: `src/features/fitness/FitnessHistoryPage.tsx`
- Create: `src/features/fitness/FitnessStatsPage.tsx`
- Create: `src/features/fitness/FitnessSettingsPage.tsx`

- [ ] **Step 1: Write the failing render tests**

```tsx
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
import { FitnessStatsPage } from '@/features/fitness/FitnessStatsPage'

function render(element: React.ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(element)
  })

  return { container, root }
}

describe('fitness page shells', () => {
  let roots: Root[] = []
  let containers: HTMLDivElement[] = []

  afterEach(() => {
    roots.forEach((root) => {
      act(() => root.unmount())
    })
    containers.forEach((container) => container.remove())
    roots = []
    containers = []
  })

  test('renders Plans with personal plan builder language', () => {
    const rendered = render(<FitnessPlansPage />)
    roots.push(rendered.root)
    containers.push(rendered.container)

    expect(rendered.container.textContent).toContain('Personal Plan Builder')
    expect(rendered.container.textContent).toContain('Push / Pull / Legs')
    expect(rendered.container.textContent).toContain('Duplicate week')
  })

  test('renders History, Stats, and Settings as fitness surfaces', () => {
    const history = render(<FitnessHistoryPage />)
    const stats = render(<FitnessStatsPage />)
    const settings = render(<FitnessSettingsPage />)
    roots.push(history.root, stats.root, settings.root)
    containers.push(history.container, stats.container, settings.container)

    expect(history.container.textContent).toContain('Workout History')
    expect(stats.container.textContent).toContain('PR Voltage')
    expect(settings.container.textContent).toContain('kg / lb')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/fitness-pages.test.tsx`

Expected: FAIL because page files do not exist yet.

- [ ] **Step 3: Implement page shells**

Create each page with High-Voltage Wasp cards and static empty/coming-next content for Module 1. Include copy for starter templates, personal plans, history, PRs, and kg/lb settings.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/fitness-pages.test.tsx`

Expected: PASS.

## Task 3: Routes, sidebar, top bar, and commands

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/components/layout/NavigationSidebar.tsx`
- Modify: `src/components/layout/TopBar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/hooks/useKeyboardShortcuts.ts`
- Update: `tests/fitness-navigation.test.ts`

- [ ] **Step 1: Update route/navigation test expectations**

Ensure `tests/fitness-navigation.test.ts` expects Training as first nav item and the new quick nav text.

- [ ] **Step 2: Wire routes**

Add lazy routes for `/plans`, `/history`, `/stats`, and replace `/settings` with `FitnessSettingsPage`. Keep old productivity routes technically reachable only if still needed, but not in primary nav.

- [ ] **Step 3: Update sidebar icons/groups**

Add icons for `plans`, `history`, and `stats`. Render only non-empty groups so an empty Workspaces group does not appear.

- [ ] **Step 4: Update top bar and command palette**

Change top bar placeholder to fitness copy. Replace Quick Capture action with Start Workout navigation. Replace command palette create/note/task/project actions with fitness navigation/start actions.

- [ ] **Step 5: Update keyboard shortcuts**

Set quick nav mapping to `/training`, `/plans`, `/history`, `/stats`, `/settings`. Keep command palette and Escape behavior.

- [ ] **Step 6: Run focused tests**

Run: `npm run test:run -- tests/fitness-shell.test.ts tests/fitness-pages.test.tsx tests/fitness-navigation.test.ts`

Expected: PASS.

## Task 4: High-Voltage Wasp styling pass

**Files:**
- Modify: `src/styles/themes.css`
- Modify: `src/styles/globals.css`
- Modify: `src/features/fitness/FitnessDashboard.tsx`
- Update: `tests/fitness-dashboard.test.tsx`

- [ ] **Step 1: Update dashboard render expectations**

Expect the dashboard to include `High-Voltage`, `Log set ⚡ rest`, and existing workout content.

- [ ] **Step 2: Run dashboard test to verify expected failure**

Run: `npm run test:run -- tests/fitness-dashboard.test.tsx`

Expected: FAIL until dashboard copy/styling changes.

- [ ] **Step 3: Add theme tokens and utility classes**

Add CSS variables for `--fitness-black`, `--fitness-yellow`, `--fitness-gold`, `--fitness-orange`, `--fitness-surface`, and utility classes for high-voltage surfaces/actions.

- [ ] **Step 4: Update dashboard styling/copy**

Change blue/green hero styling to black/yellow/orange, use high-voltage badge/copy, and change primary CTA to `Log set ⚡ rest`.

- [ ] **Step 5: Run dashboard test**

Run: `npm run test:run -- tests/fitness-dashboard.test.tsx`

Expected: PASS.

## Task 5: Module verification gate

**Files:** all changed files.

- [ ] **Step 1: Run full tests**

Run: `npm run test:run`

Expected: all tests pass.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: ESLint reports no errors.

## Self-Review

- Spec coverage: Module 1 covers shell, nav, routes, visible pages, command surfaces, shortcuts, and High-Voltage Wasp styling.
- Placeholder scan: page shells can say future modules are coming, but no implementation step is left undefined.
- Type consistency: route ids are `fitness`, `plans`, `history`, `stats`; routes are `/training`, `/plans`, `/history`, `/stats`, `/settings`; brand is `StingFit`.