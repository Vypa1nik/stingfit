import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
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

async function startPushDay(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.render(<FitnessDashboard />)
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
}

describe('FitnessDashboard live workout focus', () => {
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

  test('shows one current exercise and one next set before dense workout controls', async () => {
    await startPushDay(root, container)

    expect(container.textContent).toContain('Teraz robíš')
    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Ďalšia séria')
    expect(container.textContent).toContain('Séria 1 z 3')
    expect(container.textContent).toContain('Stačí zapísať aktuálnu sériu')

    const controls = Array.from(container.querySelectorAll('details')).find((details) => details.textContent?.includes('Celý tréning a akcie'))
    expect(controls).toBeDefined()
    expect(controls?.hasAttribute('open')).toBe(false)
    expect(controls?.textContent).toContain('Poradie cvikov')
  })
})
