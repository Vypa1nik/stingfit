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

async function renderTraining(root: Root) {
  await act(async () => {
    root.render(<FitnessDashboard />)
  })
  await act(async () => {
    await waitForAsyncUi()
  })
}

async function startPushDayA(container: HTMLDivElement) {
  const startButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Spustiť Tlakový deň A')
  expect(startButton).toBeDefined()

  await act(async () => {
    startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitForAsyncUi()
  })
}

describe('FitnessDashboard live session snapshot header', () => {
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

  test('shows snapshot guidance and compact live counters during an active workout', async () => {
    await renderTraining(root)
    await startPushDayA(container)

    expect(container.textContent).toContain('Aktívna snímka tréningu')
    expect(container.textContent).toContain('Zmeny plánu neovplyvnia tento tréning.')
    expect(container.textContent).toContain('4 cviky')
    expect(container.textContent).toContain('12 plánovaných sérií')
    expect(container.textContent).toContain('0 dokončených')

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    expect(logButton).toBeDefined()

    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('1 dokončených')
  })

  test('keeps live counters visible when optional guidance is hidden', async () => {
    await fitnessRepository.updateSettings({ showGuidance: false })

    await renderTraining(root)
    await startPushDayA(container)

    expect(container.textContent).not.toContain('Aktívna snímka tréningu')
    expect(container.textContent).not.toContain('Zmeny plánu neovplyvnia tento tréning.')
    expect(container.textContent).toContain('4 cviky')
    expect(container.textContent).toContain('12 plánovaných sérií')
    expect(container.textContent).toContain('0 dokončených')
  })
})
