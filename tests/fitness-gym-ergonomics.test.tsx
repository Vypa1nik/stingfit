import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { SetLogger } from '@/features/fitness/SetLogger'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

describe('mobile gym logger ergonomics', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    await resetDatabaseState()
  })

  test('keeps the sticky logger centered above the mobile tab bar', async () => {
    await act(async () => {
      root.render(
        <SetLogger
          displayUnit="kg"
          onLog={async () => undefined}
          set={{
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 60,
            reps: 8,
            rir: 2,
            status: 'pending',
            completedAt: null,
            createdAt: '2026-04-28T10:00:00.000Z',
            updatedAt: '2026-04-28T10:00:00.000Z',
          }}
        />,
      )
    })

    const logger = container.querySelector<HTMLElement>('[data-testid="set-logger-panel"]')
    expect(logger).toBeTruthy()
    expect(logger?.className).toContain('mx-auto')
    expect(logger?.className).toContain('max-w-xl')
    expect(logger?.className).toContain('bottom-24')
    expect(logger?.className).toContain('lg:static')
  })

  test('shows the previous completed set above the logger', async () => {
    await act(async () => {
      root.render(
        <SetLogger
          displayUnit="kg"
          onLog={async () => undefined}
          set={{
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 0,
            reps: 8,
            rir: 1,
            status: 'pending',
            completedAt: null,
            createdAt: '2026-04-28T10:00:00.000Z',
            updatedAt: '2026-04-28T10:00:00.000Z',
          }}
          lastPerformance={{
            weightKg: 80,
            reps: 8,
            rir: 2,
            completedAt: '2026-04-24T10:00:00.000Z',
          }}
        />,
      )
    })

    expect(container.textContent).toContain('Naposledy')
    expect(container.textContent).toContain('80 kg × 8 @ RIR 2')
  })

  test('blocks out-of-range set values before logging', async () => {
    const onLog = vi.fn(async () => undefined)

    await act(async () => {
      root.render(
        <SetLogger
          displayUnit="kg"
          onLog={onLog}
          set={{
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 0,
            reps: 8,
            rir: 1,
            status: 'pending',
            completedAt: null,
            createdAt: '2026-04-28T10:00:00.000Z',
            updatedAt: '2026-04-28T10:00:00.000Z',
          }}
        />,
      )
    })

    const weightInput = container.querySelector<HTMLInputElement>('input[aria-label="Váha v kg"]')
    const repsInput = container.querySelector<HTMLInputElement>('input[aria-label="Opakovania"]')
    const rirInput = container.querySelector<HTMLInputElement>('input[aria-label="RIR"]')
    expect(weightInput).toBeTruthy()
    expect(repsInput).toBeTruthy()
    expect(rirInput).toBeTruthy()

    await act(async () => {
      if (weightInput && repsInput && rirInput) {
        weightInput.value = '501'
        weightInput.dispatchEvent(new Event('input', { bubbles: true }))
        repsInput.value = '1000'
        repsInput.dispatchEvent(new Event('input', { bubbles: true }))
        rirInput.value = '11'
        rirInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('Váha musí byť medzi 0 a 500 kg')
    expect(container.textContent).toContain('Opakovania musia byť medzi 0 a 999')
    expect(container.textContent).toContain('RIR musí byť medzi 0 a 10')

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    expect(logButton?.disabled).toBe(true)

    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(onLog).not.toHaveBeenCalled()
  })

  test('shows a plate calculator that follows the current set weight', async () => {
    await act(async () => {
      root.render(
        <SetLogger
          displayUnit="kg"
          onLog={async () => undefined}
          set={{
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 100,
            reps: 8,
            rir: 1,
            status: 'pending',
            completedAt: null,
            createdAt: '2026-04-28T10:00:00.000Z',
            updatedAt: '2026-04-28T10:00:00.000Z',
          }}
        />,
      )
    })

    expect(container.textContent).toContain('Kalkulačka kotúčov')
    expect(container.textContent).toContain('Na stranu: 20 kg × 2')

    const barInput = container.querySelector<HTMLInputElement>('input[aria-label="Hmotnosť tyče v kg"]')
    const weightInput = container.querySelector<HTMLInputElement>('input[aria-label="Váha v kg"]')
    expect(barInput).toBeTruthy()
    expect(weightInput).toBeTruthy()

    await act(async () => {
      if (barInput && weightInput) {
        barInput.value = '15'
        barInput.dispatchEvent(new Event('input', { bubbles: true }))
        weightInput.value = '103'
        weightInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('Najbližšie nižšie: 102.5 kg · chýba 0.5 kg')
  })

  test('lets the current set be marked as a warmup before logging', async () => {
    const onLog = vi.fn(async () => undefined)

    await act(async () => {
      root.render(
        <SetLogger
          displayUnit="kg"
          onLog={onLog}
          set={{
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 40,
            reps: 8,
            rir: 4,
            status: 'planned',
            completedAt: null,
            createdAt: '2026-04-28T10:00:00.000Z',
            updatedAt: '2026-04-28T10:00:00.000Z',
          }}
        />,
      )
    })

    expect(container.textContent).toContain('Typ série')
    expect(container.textContent).toContain('Pracovná')
    expect(container.textContent).toContain('Rozcvička')

    const warmupButton = container.querySelector<HTMLButtonElement>('button[aria-label="Označiť sériu ako rozcvičku"]')
    expect(warmupButton).toBeTruthy()

    await act(async () => {
      warmupButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onLog).toHaveBeenCalledWith('set-1', expect.objectContaining({ setType: 'warmup' }))
  })

  test('lets the current set be logged with left and right side weights', async () => {
    const onLog = vi.fn(async () => undefined)

    await act(async () => {
      root.render(
        <SetLogger
          displayUnit="kg"
          onLog={onLog}
          set={{
            id: 'set-1',
            sessionExerciseId: 'session-exercise-1',
            setNumber: 1,
            weightKg: 40,
            reps: 10,
            rir: 2,
            status: 'planned',
            completedAt: null,
            createdAt: '2026-04-28T10:00:00.000Z',
            updatedAt: '2026-04-28T10:00:00.000Z',
          }}
        />,
      )
    })

    expect(container.textContent).toContain('Zápis váhy')
    const perSideButton = container.querySelector<HTMLButtonElement>('button[aria-label="Zapisovať váhu na ľavú a pravú stranu"]')
    expect(perSideButton).toBeTruthy()

    await act(async () => {
      perSideButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const leftInput = container.querySelector<HTMLInputElement>('input[aria-label="Ľavá strana v kg"]')
    const rightInput = container.querySelector<HTMLInputElement>('input[aria-label="Pravá strana v kg"]')
    expect(leftInput).toBeTruthy()
    expect(rightInput).toBeTruthy()

    await act(async () => {
      if (leftInput && rightInput) {
        leftInput.value = '22.5'
        leftInput.dispatchEvent(new Event('input', { bubbles: true }))
        rightInput.value = '20'
        rightInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('Spolu: 42.5 kg')

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onLog).toHaveBeenCalledWith('set-1', expect.objectContaining({
      weightKg: 42.5,
      weightEntryMode: 'per_side',
      leftWeightKg: 22.5,
      rightWeightKg: 20,
    }))
  })

  test('quick controls adjust the current set and persist kg storage values', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <FitnessDashboard />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const startButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Spustiť Tlakový deň A'))
    expect(startButton).toBeDefined()

    await act(async () => {
      startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Ovládanie jedným palcom')

    const increaseWeight = container.querySelector<HTMLButtonElement>('button[aria-label="Zvýšiť váhu o 2.5 kg"]')
    const increaseReps = container.querySelector<HTMLButtonElement>('button[aria-label="Zvýšiť počet opakovaní"]')
    const increaseRir = container.querySelector<HTMLButtonElement>('button[aria-label="Zvýšiť RIR"]')
    expect(increaseWeight).toBeTruthy()
    expect(increaseReps).toBeTruthy()
    expect(increaseRir).toBeTruthy()

    await act(async () => {
      increaseWeight?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      increaseReps?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      increaseRir?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector<HTMLInputElement>('input[aria-label="Váha v kg"]')?.value).toBe('2.5')
    expect(container.querySelector<HTMLInputElement>('input[aria-label="Opakovania"]')?.value).toBe('9')
    expect(container.querySelector<HTMLInputElement>('input[aria-label="RIR"]')?.value).toBe('2')

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    expect(logButton).toBeDefined()

    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    const activeSession = await fitnessRepository.getActiveSession()
    expect(activeSession?.exercises[0]?.sets[0]).toMatchObject({ weightKg: 2.5, reps: 9, rir: 2, status: 'completed' })
  })
})
