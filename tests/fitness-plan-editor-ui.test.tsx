import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi(delayMs = 500) {
  await new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

async function createPplPlan() {
  await fitnessRepository.seedStarterData()
  const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
  if (!starter) {
    throw new Error('PPL starter missing')
  }

  return fitnessRepository.createPersonalPlanFromStarter(starter.id, { name: 'My PPL Block', goal: 'Build muscle' })
}

describe('FitnessPlansPage plan editor', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    const plan = await createPplPlan()
    planId = plan.id
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

  test('loads a personal plan structure, duplicates a week, and edits planned exercise targets', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Editor plánu')
    expect(container.textContent).toContain('Týždeň 1')
    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('3×6–8 · RIR 1 · 150s pauza')

    const duplicateButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Duplikovať týždeň 1'))
    expect(duplicateButton).toBeDefined()

    await act(async () => {
      duplicateButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Týždeň duplikovaný')
    expect(container.textContent).toContain('Týždeň 2')

    const targetSetsInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové série pre Tlak na lavičke"]')
    const minRepsInput = container.querySelector<HTMLInputElement>('input[aria-label="Minimum opakovaní pre Tlak na lavičke"]')
    const maxRepsInput = container.querySelector<HTMLInputElement>('input[aria-label="Maximum opakovaní pre Tlak na lavičke"]')
    const targetRirInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové RIR pre Tlak na lavičke"]')
    const restInput = container.querySelector<HTMLInputElement>('input[aria-label="Pauza v sekundách pre Tlak na lavičke"]')

    expect(targetSetsInput).toBeTruthy()
    expect(minRepsInput).toBeTruthy()
    expect(maxRepsInput).toBeTruthy()
    expect(targetRirInput).toBeTruthy()
    expect(restInput).toBeTruthy()

    await act(async () => {
      if (targetSetsInput) {
        targetSetsInput.value = '4'
        targetSetsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (minRepsInput) {
        minRepsInput.value = '8'
        minRepsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (maxRepsInput) {
        maxRepsInput.value = '10'
        maxRepsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (targetRirInput) {
        targetRirInput.value = '1'
        targetRirInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (restInput) {
        restInput.value = '90'
        restInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť ciele pre Tlak na lavičke'))
    expect(saveButton).toBeDefined()

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi(1200)
    })

    expect(container.textContent).toContain('Ciele pre Tlak na lavičke aktualizované')
    expect(container.textContent).toContain('4×8–10 · RIR 1 · 90s pauza')

    const structure = await fitnessRepository.getPlanStructure(planId)
    const bench = structure.weeks[0]?.days[0]?.workouts[0]?.exercises[0]
    expect(bench).toMatchObject({ targetSets: 4, minReps: 8, maxReps: 10, targetRir: 1, restSeconds: 90 })
  })
})
