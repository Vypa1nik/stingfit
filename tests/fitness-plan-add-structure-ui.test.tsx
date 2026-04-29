import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

describe('FitnessPlansPage add day/workout/exercise editor flow', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string
  let benchPressId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Blank Strength Block', goal: 'Strength' })
    const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
    if (!benchPress) {
      throw new Error('Tlak na lavičke missing')
    }

    planId = plan.id
    benchPressId = benchPress.id
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

  test('adds a training day, workout, and exercise from the local library', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Editor plánu')
    expect(container.textContent).toContain('Tento týždeň zatiaľ nemá dni')

    const dayNumberInput = container.querySelector<HTMLInputElement>('input[aria-label="Číslo dňa pre týždeň 1"]')
    const dayLabelInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov dňa pre týždeň 1"]')
    expect(dayNumberInput).toBeTruthy()
    expect(dayLabelInput).toBeTruthy()

    await act(async () => {
      if (dayNumberInput) {
        dayNumberInput.value = '1'
        dayNumberInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (dayLabelInput) {
        dayLabelInput.value = 'Chest Day'
        dayLabelInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const addDayButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať tréningový deň do týždňa 1'))
    expect(addDayButton).toBeDefined()

    await act(async () => {
      addDayButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréningový deň pridaný')
    expect(container.textContent).toContain('Chest Day')

    const workoutNameInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov tréningu pre Chest Day"]')
    expect(workoutNameInput).toBeTruthy()

    await act(async () => {
      if (workoutNameInput) {
        workoutNameInput.value = 'Chest Builder'
        workoutNameInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const addWorkoutButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať tréning do Chest Day'))
    expect(addWorkoutButton).toBeDefined()

    await act(async () => {
      addWorkoutButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tréning pridaný')
    expect(container.textContent).toContain('Chest Builder')

    const exerciseSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Cvik pre Chest Builder"]')
    const targetSetsInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové série pre nový cvik v Chest Builder"]')
    const minRepsInput = container.querySelector<HTMLInputElement>('input[aria-label="Minimum opakovaní pre nový cvik v Chest Builder"]')
    const maxRepsInput = container.querySelector<HTMLInputElement>('input[aria-label="Maximum opakovaní pre nový cvik v Chest Builder"]')
    const targetRirInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové RIR pre nový cvik v Chest Builder"]')
    const restInput = container.querySelector<HTMLInputElement>('input[aria-label="Pauza v sekundách pre nový cvik v Chest Builder"]')
    expect(exerciseSelect).toBeTruthy()
    expect(targetSetsInput).toBeTruthy()
    expect(minRepsInput).toBeTruthy()
    expect(maxRepsInput).toBeTruthy()
    expect(targetRirInput).toBeTruthy()
    expect(restInput).toBeTruthy()

    await act(async () => {
      if (exerciseSelect) {
        exerciseSelect.value = benchPressId
        exerciseSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
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

    const addExerciseButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať cvik do Chest Builder'))
    expect(addExerciseButton).toBeDefined()

    await act(async () => {
      addExerciseButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Tlak na lavičke pridaný do Chest Builder')
    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('4×8–10 · RIR 1 · 90s pauza')

    const structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]).toMatchObject({ dayIndex: 0, label: 'Chest Day' })
    expect(structure.weeks[0]?.days[0]?.workouts[0]).toMatchObject({ name: 'Chest Builder' })
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({
      exerciseName: 'Tlak na lavičke',
      targetSets: 4,
      minReps: 8,
      maxReps: 10,
      targetRir: 1,
      restSeconds: 90,
    })
  })
})
