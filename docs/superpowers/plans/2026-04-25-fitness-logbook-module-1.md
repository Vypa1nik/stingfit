# Fitness Logbook Module 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first fitness-logbook module: a dummy-data, live-session-first training dashboard reachable from the app shell.

**Architecture:** Add a focused `src/features/fitness/` module with pure demo data/helpers and a storage-agnostic React dashboard. Wire the route, navigation, command palette, and shortcuts to `/training` while leaving existing productivity modules intact for later migration.

**Tech Stack:** React 19, TypeScript strict mode, Vite, Tailwind CSS utility classes, Lucide icons, Vitest with jsdom.

---

## File Structure

- Create `src/features/fitness/fitnessDemo.ts` — temporary fitness domain types, demo session, and pure helper functions.
- Create `src/features/fitness/FitnessDashboard.tsx` — responsive dummy UI for the active workout.
- Create `tests/fitness-demo.test.ts` — unit coverage for pure helper behavior.
- Create `tests/fitness-dashboard.test.tsx` — render coverage for the dashboard's key gym-first content.
- Modify `src/router.tsx` — add `/training` route and make `/` redirect to it.
- Modify `src/lib/constants.ts` — add Training to primary navigation.
- Modify `src/components/layout/NavigationSidebar.tsx` — add a fitness icon.
- Modify `src/App.tsx` — add command palette navigation for Training.
- Modify `src/hooks/useKeyboardShortcuts.ts` — point dashboard shortcuts to `/training`.
- Modify `src/lib/shortcuts.ts` — update shortcut copy from Today to Training.

## Task 1: Fitness demo model and helpers

**Files:**
- Create: `src/features/fitness/fitnessDemo.ts`
- Test: `tests/fitness-demo.test.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
import { describe, expect, test } from 'vitest'

import {
  DEMO_FITNESS_SESSION,
  calculateSessionProgress,
  formatRestTime,
  getCurrentExercise,
  getCurrentSet,
} from '@/features/fitness/fitnessDemo'

describe('fitness demo helpers', () => {
  test('selects the active exercise and current set from the demo session', () => {
    const exercise = getCurrentExercise(DEMO_FITNESS_SESSION)
    expect(exercise?.name).toBe('Bench Press')

    const set = exercise ? getCurrentSet(exercise) : null
    expect(set).toMatchObject({ setNumber: 3, weightKg: 97.5, reps: 8, rir: 1, status: 'current' })
  })

  test('calculates completed set progress across the full session', () => {
    expect(calculateSessionProgress(DEMO_FITNESS_SESSION)).toEqual({
      completedSets: 5,
      totalSets: 15,
      completedExercises: 1,
      totalExercises: 5,
      percent: 33,
    })
  })

  test('formats rest time as digital minutes and seconds', () => {
    expect(formatRestTime(84)).toBe('01:24')
    expect(formatRestTime(9)).toBe('00:09')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/fitness-demo.test.ts`

Expected: FAIL because `@/features/fitness/fitnessDemo` does not exist yet.

- [ ] **Step 3: Implement minimal demo data and helpers**

Create exported types, `DEMO_FITNESS_SESSION`, `getCurrentExercise`, `getCurrentSet`, `calculateSessionProgress`, and `formatRestTime` with deterministic dummy values.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/fitness-demo.test.ts`

Expected: PASS.

## Task 2: Fitness dashboard component

**Files:**
- Create: `src/features/fitness/FitnessDashboard.tsx`
- Test: `tests/fitness-dashboard.test.tsx`

- [ ] **Step 1: Write the failing render test**

```tsx
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'

describe('FitnessDashboard', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  test('renders the live workout controls and coach hint', () => {
    act(() => {
      root.render(<FitnessDashboard />)
    })

    expect(container.textContent).toContain('Push Day')
    expect(container.textContent).toContain('Bench Press')
    expect(container.textContent).toContain('Log set + start rest')
    expect(container.textContent).toContain('Try +2.5 kg')
    expect(container.textContent).toContain('Weekly consistency')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/fitness-dashboard.test.tsx`

Expected: FAIL because the dashboard component does not exist yet.

- [ ] **Step 3: Implement the dashboard**

Render the active workout hero, current-set form-like summary, coach card, exercise queue, and weekly summary using existing `Card`, `Badge`, `Button`, and `EmptyState` primitives.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/fitness-dashboard.test.tsx`

Expected: PASS.

## Task 3: Route, navigation, commands, shortcuts

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/lib/constants.ts`
- Modify: `src/components/layout/NavigationSidebar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/hooks/useKeyboardShortcuts.ts`
- Modify: `src/lib/shortcuts.ts`

- [ ] **Step 1: Wire `/training`**

Add a lazy import for `FitnessDashboard`, route `/training`, and redirect `/` to `/training`.

- [ ] **Step 2: Update navigation**

Add a `fitness`/Training nav item with a `Dumbbell` icon while retaining existing workspaces.

- [ ] **Step 3: Update quick navigation paths and copy**

Point Cmd/Ctrl+D and quick nav slot 2 to `/training`. Update command palette and shortcuts text to say Training instead of Today.

- [ ] **Step 4: Run focused tests**

Run: `npm run test:run -- tests/fitness-demo.test.ts tests/fitness-dashboard.test.tsx`

Expected: PASS.

## Task 4: Verification gate

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

- Spec coverage: module 1 dummy UI, helper logic, routing, command access, and verification are covered.
- Placeholder scan: no TBD/TODO markers are present.
- Type consistency: the plan consistently uses `FitnessDashboard`, `DEMO_FITNESS_SESSION`, `/training`, and helper names declared in Task 1.