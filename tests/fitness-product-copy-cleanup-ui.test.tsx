import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  await fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

function clickButton(container: HTMLDivElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === label)
  expect(button).toBeDefined()
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('fitness product copy cleanup', () => {
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

  test('uses product-facing copy instead of development module labels in live training and history', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    await act(async () => {
      clickButton(container, 'Spustiť Tlakový deň A')
      await waitForAsyncUi()
    })

    expect(container.textContent).not.toContain('Module 5')
    expect(container.textContent).not.toContain('next module')
    expect(container.textContent).toContain('Trénerská pripomienka')

    const active = await fitnessRepository.getActiveSession()
    expect(active).toBeTruthy()
    if (active) {
      await fitnessRepository.finishSession(active.id)
    }

    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).not.toContain('Module 5')
    expect(container.textContent).not.toContain('next module')
    expect(container.textContent).not.toContain('Next history layer')
    expect(container.textContent).toContain('Signály progresu')
  })
})
