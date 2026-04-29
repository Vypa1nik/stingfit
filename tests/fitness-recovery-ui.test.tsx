import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createActivePushSession() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
  const workout = (await fitnessRepository.listStartableWorkouts()).find((item) => item.workoutName === 'Tlakový deň A')
  if (!workout) {
    throw new Error('Tlakový deň A missing')
  }

  return fitnessRepository.startSessionFromPlanWorkout(workout.workoutId)
}

describe('FitnessDashboard workout recovery', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createActivePushSession()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
    await resetDatabaseState()
  })

  test('shows a recovered workout prompt before resuming an active session', async () => {
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

    expect(container.textContent).toContain('Tréning obnovený')
    expect(container.textContent).toContain('Pokračovať: Tlakový deň A')

    const resumeButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pokračovať: Tlakový deň A'))
    expect(resumeButton).toBeDefined()

    await act(async () => {
      resumeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Zapísať sériu ⚡ pauza')
  })

  test('abandons a recovered active workout after custom modal confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

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

    const abandonButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zahodiť tréning'))
    expect(abandonButton).toBeDefined()

    await act(async () => {
      abandonButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Zahodiť rozpracovaný tréning?')

    const confirmAbandonButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Áno, zahodiť tréning'))
    expect(confirmAbandonButton).toBeDefined()

    await act(async () => {
      confirmAbandonButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréning zahodený')
    expect(container.textContent).toContain('Spustiť Tlakový deň A')
    await expect(fitnessRepository.getActiveSession()).resolves.toBeNull()
  })
})
