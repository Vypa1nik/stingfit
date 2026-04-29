import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createEditablePlan() {
  await fitnessRepository.seedStarterData()
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Editable Block', goal: 'Refine structure' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
  if (!week || !benchPress) {
    throw new Error('Structure edit UI setup missing week or Tlak na lavičke')
  }

  const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Push Day' })
  const workout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Tlak Builder' })
  await fitnessRepository.addPlanExercise(workout.id, {
    exerciseId: benchPress.id,
    targetSets: 3,
    minReps: 6,
    maxReps: 8,
    targetRir: 1,
    restSeconds: 150,
  })

  return plan.id
}

describe('FitnessPlansPage structure metadata editing', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    planId = await createEditablePlan()
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

  test('edits day label/slot and workout name/notes inline', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const dayNumberInput = container.querySelector<HTMLInputElement>('input[aria-label="Číslo dňa pre Push Day"]')
    const dayLabelInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov dňa pre Push Day"]')
    expect(dayNumberInput).toBeTruthy()
    expect(dayLabelInput).toBeTruthy()

    await act(async () => {
      if (dayNumberInput) {
        dayNumberInput.value = '3'
        dayNumberInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (dayLabelInput) {
        dayLabelInput.value = 'Upper Day'
        dayLabelInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const saveDayButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť Push Day'))
    expect(saveDayButton).toBeDefined()

    await act(async () => {
      saveDayButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Upper Day aktualizovaný')
    expect(container.textContent).toContain('Deň 3')

    const workoutNameInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov tréningu pre Tlak Builder"]')
    const workoutNotesInput = container.querySelector<HTMLInputElement>('textarea[aria-label="Poznámky k tréningu Tlak Builder"]')
    expect(workoutNameInput).toBeTruthy()
    expect(workoutNotesInput).toBeTruthy()

    await act(async () => {
      if (workoutNameInput) {
        workoutNameInput.value = 'Vrch Builder'
        workoutNameInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (workoutNotesInput) {
        workoutNotesInput.value = 'Controlled tempo'
        workoutNotesInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const saveWorkoutButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť Tlak Builder'))
    expect(saveWorkoutButton).toBeDefined()

    await act(async () => {
      saveWorkoutButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Vrch Builder aktualizovaný')
    expect(container.textContent).toContain('Controlled tempo')

    const structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]).toMatchObject({ label: 'Upper Day', dayIndex: 2 })
    expect(structure.weeks[0]?.days[0]?.workouts[0]).toMatchObject({ name: 'Vrch Builder', notes: 'Controlled tempo' })
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({ exerciseName: 'Tlak na lavičke' })
  })
})
