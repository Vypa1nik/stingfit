import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createBlankPlanWithWorkout() {
  await fitnessRepository.seedStarterData()
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Blank Strength Block', goal: 'Strength' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  if (!week) {
    throw new Error('Blank plan week missing')
  }

  const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Chest Day' })
  await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder' })
  return plan
}

describe('FitnessPlansPage custom exercise creation inside plan editor', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    const plan = await createBlankPlanWithWorkout()
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

  test('creates a custom exercise from a workout add-exercise form and then adds it to the plan', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Chest Builder')
    expect(container.textContent).toContain('Vytvoriť chýbajúci cvik')

    const nameInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov vlastného cviku pre Chest Builder"]')
    const categoryInput = container.querySelector<HTMLInputElement>('input[aria-label="Kategória vlastného cviku pre Chest Builder"]')
    const restInput = container.querySelector<HTMLInputElement>('input[aria-label="Predvolená pauza vlastného cviku v sekundách pre Chest Builder"]')
    expect(nameInput).toBeTruthy()
    expect(categoryInput).toBeTruthy()
    expect(restInput).toBeTruthy()

    await act(async () => {
      if (nameInput) {
        nameInput.value = 'Cable Fly'
        nameInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (categoryInput) {
        categoryInput.value = 'chest'
        categoryInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (restInput) {
        restInput.value = '75'
        restInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const createButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Vytvoriť vlastný cvik pre Chest Builder'))
    expect(createButton).toBeDefined()

    await act(async () => {
      createButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Cable Fly vytvorený v knižnici cvikov')

    const exerciseSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Cvik pre Chest Builder"]')
    expect(Array.from(exerciseSelect?.options ?? []).map((option) => option.textContent)).toContain('Cable Fly')
    expect(exerciseSelect?.selectedOptions[0]?.textContent).toBe('Cable Fly')

    const targetSetsInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové série pre nový cvik v Chest Builder"]')
    const minRepsInput = container.querySelector<HTMLInputElement>('input[aria-label="Minimum opakovaní pre nový cvik v Chest Builder"]')
    const maxRepsInput = container.querySelector<HTMLInputElement>('input[aria-label="Maximum opakovaní pre nový cvik v Chest Builder"]')
    const targetRirInput = container.querySelector<HTMLInputElement>('input[aria-label="Cieľové RIR pre nový cvik v Chest Builder"]')
    const plannedRestInput = container.querySelector<HTMLInputElement>('input[aria-label="Pauza v sekundách pre nový cvik v Chest Builder"]')

    await act(async () => {
      if (targetSetsInput) {
        targetSetsInput.value = '3'
        targetSetsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (minRepsInput) {
        minRepsInput.value = '12'
        minRepsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (maxRepsInput) {
        maxRepsInput.value = '15'
        maxRepsInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (targetRirInput) {
        targetRirInput.value = '2'
        targetRirInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (plannedRestInput) {
        plannedRestInput.value = '75'
        plannedRestInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const addExerciseButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Pridať cvik do Chest Builder'))
    expect(addExerciseButton).toBeDefined()

    await act(async () => {
      addExerciseButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Cable Fly pridaný do Chest Builder')
    expect(container.textContent).toContain('3×12–15 · RIR 2 · 75s pauza')

    const exercises = await fitnessRepository.listExercises()
    const customExercise = exercises.find((exercise) => exercise.name === 'Cable Fly')
    expect(customExercise).toMatchObject({ category: 'chest', defaultRestSeconds: 75, isCustom: true })

    const structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts[0]?.exercises[0]).toMatchObject({
      exerciseName: 'Cable Fly',
      targetSets: 3,
      minReps: 12,
      maxReps: 15,
      targetRir: 2,
      restSeconds: 75,
    })
  })
})
