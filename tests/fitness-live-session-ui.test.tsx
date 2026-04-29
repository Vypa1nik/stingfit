import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
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

async function renderTraining(containerRoot: Root) {
  await act(async () => {
    containerRoot.render(<FitnessDashboard />)
  })
  await act(async () => {
    await waitForAsyncUi()
  })
}

async function startFirstWorkout(container: HTMLDivElement) {
  const startButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Spustiť Tlakový deň A'))
  expect(startButton).toBeDefined()

  await act(async () => {
    startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitForAsyncUi()
  })
}

describe('FitnessDashboard live session UI', () => {
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

  test('starts a planned workout and logs the current set', async () => {
    await renderTraining(root)

    expect(container.textContent).toContain('Spustiť Tlakový deň A')
    await startFirstWorkout(container)

    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Zapísať sériu ⚡ pauza')

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    expect(logButton).toBeDefined()

    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Séria zapísaná')
    expect(container.textContent).toContain('1 dokončených')
    expect(container.textContent).toContain('Pauza beží')
  })

  test('edits an already logged set from the live workout', async () => {
    await renderTraining(root)
    await startFirstWorkout(container)

    const logButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zapísať sériu ⚡ pauza'))
    expect(logButton).toBeDefined()

    await act(async () => {
      logButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Dokončené série aktuálneho cviku')
    const editButton = container.querySelector<HTMLButtonElement>('button[aria-label="Upraviť sériu 1"]')
    expect(editButton).toBeTruthy()

    await act(async () => {
      editButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Oprava série')

    const weightInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[aria-label="Váha v kg"]'))
    const repsInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[aria-label="Opakovania"]'))
    const rirInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[aria-label="RIR"]'))
    const editWeightInput = weightInputs.at(-1)
    const editRepsInput = repsInputs.at(-1)
    const editRirInput = rirInputs.at(-1)
    expect(editWeightInput).toBeTruthy()
    expect(editRepsInput).toBeTruthy()
    expect(editRirInput).toBeTruthy()

    await act(async () => {
      if (editWeightInput && editRepsInput && editRirInput) {
        editWeightInput.value = '82.5'
        editWeightInput.dispatchEvent(new Event('input', { bubbles: true }))
        editRepsInput.value = '7'
        editRepsInput.dispatchEvent(new Event('input', { bubbles: true }))
        editRirInput.value = '0'
        editRirInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const failureButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-label="Označiť sériu ako do zlyhania"]')).at(-1)
    expect(failureButton).toBeTruthy()
    await act(async () => {
      failureButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const saveEditButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť opravu série'))
    expect(saveEditButton).toBeDefined()

    await act(async () => {
      saveEditButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Séria upravená')
    expect(container.textContent).toContain('82.5 kg × 7 · RIR 0')
    expect(container.textContent).toContain('Do zlyhania')

    const activeSession = await fitnessRepository.getActiveSession()
    expect(activeSession?.exercises[0]?.sets[0]).toMatchObject({ weightKg: 82.5, reps: 7, rir: 0, setType: 'failure' })
  })

  test('supports added set removal and unplanned exercise controls', async () => {
    const cableFly = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', defaultRestSeconds: 75 })
    await renderTraining(root)
    await startFirstWorkout(container)

    const addSetButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať sériu'))
    expect(addSetButton).toBeDefined()

    await act(async () => {
      addSetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Séria pridaná')
    expect(container.textContent).toContain('0/4 sérií')
    expect(container.textContent).toContain('Odstrániť sériu 4')

    const removeSetButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Odstrániť sériu 4'))
    expect(removeSetButton).toBeDefined()

    await act(async () => {
      removeSetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Séria odstránená')
    expect(container.textContent).toContain('0/3 sérií')

    const exerciseSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Neplánovaný cvik"]')
    expect(exerciseSelect).toBeTruthy()
    await act(async () => {
      if (exerciseSelect) {
        exerciseSelect.value = cableFly.id
        exerciseSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    const targetSetsInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové série pre neplánovaný cvik"]')
    expect(targetSetsInput).toBeTruthy()
    await act(async () => {
      if (targetSetsInput) {
        targetSetsInput.value = '2'
        targetSetsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const addUnplannedButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať neplánovaný cvik'))
    expect(addUnplannedButton).toBeDefined()

    await act(async () => {
      addUnplannedButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Neplánovaný cvik pridaný')
    expect(container.textContent).toContain('Cable Fly')
    expect(container.textContent).toContain('0/2 sérií · čaká')
  })
})
