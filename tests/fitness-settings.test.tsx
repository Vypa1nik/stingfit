import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
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

describe('FitnessSettingsPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPplPlan()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:fitness-export') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
    await resetDatabaseState()
  })

  test('updates display units, exports fitness JSON, and resets starter data with confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Aktuálna jednotka zobrazenia: kg')

    const lbButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Použiť lb'))
    expect(lbButton).toBeDefined()

    await act(async () => {
      lbButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Nastavenia uložené: lb')
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ displayUnit: 'lb' })

    const exportButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Exportovať tréningový JSON'))
    expect(exportButton).toBeDefined()

    await act(async () => {
      exportButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Export tréningových dát je pripravený')

    const resetButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Obnoviť štartovacie dáta'))
    expect(resetButton).toBeDefined()

    await act(async () => {
      resetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Obnoviť vstavané štartovacie plány?')

    const confirmResetButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Áno, obnoviť štartovacie dáta')
    expect(confirmResetButton).toBeDefined()

    await act(async () => {
      confirmResetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Štartovacie dáta obnovené: 3 štartovacie plány')
  })
})
