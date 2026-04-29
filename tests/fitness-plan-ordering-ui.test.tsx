import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createOrderablePlan() {
  await fitnessRepository.seedStarterData()
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Orderable Block', goal: 'Intentional sequence' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  const exercises = await fitnessRepository.listExercises()
  const benchPress = exercises.find((exercise) => exercise.name === 'Tlak na lavičke')
  const barbellRow = exercises.find((exercise) => exercise.name === 'Príťahy veľkej činky v predklone')
  if (!week || !benchPress || !barbellRow) {
    throw new Error('Ordering UI setup missing week or starter exercises')
  }

  const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Push Day' })
  const pushWorkout = await fitnessRepository.addPlanWorkout(day.id, { name: 'Tlak Builder' })
  await fitnessRepository.addPlanWorkout(day.id, { name: 'Accessory Builder' })
  await fitnessRepository.addPlanExercise(pushWorkout.id, {
    exerciseId: benchPress.id,
    targetSets: 3,
    minReps: 6,
    maxReps: 8,
    targetRir: 1,
    restSeconds: 150,
  })
  await fitnessRepository.addPlanExercise(pushWorkout.id, {
    exerciseId: barbellRow.id,
    targetSets: 3,
    minReps: 8,
    maxReps: 10,
    targetRir: 2,
    restSeconds: 120,
  })

  return plan.id
}

describe('FitnessPlansPage constrained ordering controls', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    planId = await createOrderablePlan()
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

  test('moves workouts and planned exercises with explicit up/down buttons only inside their parent', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const topWorkoutUp = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Posunúť Tlak Builder hore'))
    expect(topWorkoutUp).toBeDefined()
    expect(topWorkoutUp).toHaveProperty('disabled', true)

    const moveWorkoutUp = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Posunúť Accessory Builder hore'))
    expect(moveWorkoutUp).toBeDefined()

    await act(async () => {
      moveWorkoutUp?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Accessory Builder posunutý hore')
    await expectWorkoutOrder(['Accessory Builder', 'Tlak Builder'])

    const topExerciseUp = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Posunúť Tlak na lavičke hore'))
    expect(topExerciseUp).toBeDefined()
    expect(topExerciseUp).toHaveProperty('disabled', true)

    const moveExerciseUp = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Posunúť Príťahy veľkej činky v predklone hore'))
    expect(moveExerciseUp).toBeDefined()

    await act(async () => {
      moveExerciseUp?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Príťahy veľkej činky v predklone posunutý hore')
    await expectExerciseOrder(['Príťahy veľkej činky v predklone', 'Tlak na lavičke'])
  })

  async function expectWorkoutOrder(expected: string[]) {
    const structure = await fitnessRepository.getPlanStructure(planId)
    expect(structure.weeks[0]?.days[0]?.workouts.map((workout) => workout.name)).toEqual(expected)
  }

  async function expectExerciseOrder(expected: string[]) {
    const structure = await fitnessRepository.getPlanStructure(planId)
    const pushBuilder = structure.weeks[0]?.days[0]?.workouts.find((workout) => workout.name === 'Tlak Builder')
    expect(pushBuilder?.exercises.map((exercise) => exercise.exerciseName)).toEqual(expected)
  }
})
