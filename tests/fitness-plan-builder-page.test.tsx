import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

function findButton(container: HTMLDivElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes(label))
  expect(button).toBeDefined()
  return button
}

describe('FitnessPlansPage repository integration', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
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

  test('renames and archives a personal plan from the plans page', async () => {
    await fitnessRepository.seedStarterData()
    await fitnessRepository.createBlankPersonalPlan({ name: 'Old Block', goal: 'Old goal' })

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const nameInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov osobného plánu Old Block"]')
    const goalInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľ osobného plánu Old Block"]')
    expect(nameInput).toBeTruthy()
    expect(goalInput).toBeTruthy()

    await act(async () => {
      if (nameInput) {
        nameInput.value = 'Strength Block'
        nameInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (goalInput) {
        goalInput.value = 'Build strength'
        goalInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    await act(async () => {
      findButton(container, 'Uložiť plán')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Strength Block aktualizovaný')
    expect(container.textContent).toContain('Build strength')

    await act(async () => {
      findButton(container, 'Archivovať plán')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Archivovať Strength Block?')

    await act(async () => {
      findButton(container, 'Áno, archivovať plán')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Strength Block archivovaný')
    expect(container.textContent).toContain('Osobné plány: 0')
    await expect(fitnessRepository.listPersonalPlans()).resolves.toEqual([])
  })

  test('loads starter plans and can create personal plans from every starter template', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })

    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Štartovacie šablóny pripravené: 3')
    expect(container.textContent).toContain('Osobné plány: 0')

    const fullBodyButton = container.querySelector<HTMLButtonElement>('button[aria-label="Vytvoriť osobný plán zo šablóny Celé telo 3×"]')
    expect(fullBodyButton).toBeDefined()

    await act(async () => {
      fullBodyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Osobný plán vytvorený zo šablóny Celé telo 3×.')
    expect(container.textContent).toContain('Môj plán Celé telo 3×')
    expect(container.textContent).toContain('3 tréningové dni')
    expect(container.textContent).toContain('Celé telo A')
    expect(container.textContent).toContain('Osobné plány: 1')

    const upperLowerButton = container.querySelector<HTMLButtonElement>('button[aria-label="Vytvoriť osobný plán zo šablóny Vrch / Spodok"]')
    expect(upperLowerButton).toBeDefined()

    await act(async () => {
      upperLowerButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Osobný plán vytvorený zo šablóny Vrch / Spodok.')
    expect(container.textContent).toContain('Môj plán Vrch / Spodok')
    expect(container.textContent).toContain('Osobné plány: 2')

    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(2)
  })
})
