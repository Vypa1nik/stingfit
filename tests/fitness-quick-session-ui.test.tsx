import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

describe('quick fitness session flow', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
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

  test('shows one-tap common exercise starters before advanced selection', async () => {
    await act(async () => {
      root.render(<FitnessDashboard autoStartQuick />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Rýchly štart bez plánu')
    expect(container.textContent).toContain('Najčastejšie cviky')
    expect(container.textContent).toContain('Začať: Tlak na lavičke')

    const advancedPicker = Array.from(container.querySelectorAll('details')).find((details) => details.textContent?.includes('Pokročilý výber cviku'))
    expect(advancedPicker).toBeDefined()
    expect(advancedPicker?.hasAttribute('open')).toBe(false)
    expect(advancedPicker?.textContent).toContain('Pridať neplánovaný cvik')

    const quickBenchButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Začať: Tlak na lavičke'))
    expect(quickBenchButton).toBeDefined()

    await act(async () => {
      quickBenchButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Zapísať sériu ⚡ pauza')
  })

  test('starts a route-backed quick session and adds the first exercise', async () => {
    await act(async () => {
      root.render(<FitnessDashboard autoStartQuick />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Rýchly tréning')
    expect(container.textContent).toContain('Rýchly štart bez plánu')

    const exerciseSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Neplánovaný cvik"]')
    const benchOption = Array.from(exerciseSelect?.options ?? []).find((option) => option.textContent === 'Tlak na lavičke')
    expect(exerciseSelect).toBeTruthy()
    expect(benchOption).toBeDefined()

    const addExerciseButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať neplánovaný cvik'))
    expect(addExerciseButton).toBeDefined()

    await act(async () => {
      if (exerciseSelect && benchOption) {
        exerciseSelect.value = benchOption.value
        exerciseSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
      addExerciseButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Zapísať sériu ⚡ pauza')

    const activeSession = await fitnessRepository.getActiveSession()
    expect(activeSession).toMatchObject({ name: 'Rýchly tréning', planId: null, planWorkoutId: null })
    expect(activeSession?.exercises[0]?.nameSnapshot).toBe('Tlak na lavičke')
  })
})
