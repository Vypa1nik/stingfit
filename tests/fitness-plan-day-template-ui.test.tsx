import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import type { FitnessPlanStructure } from '@/features/fitness/fitnessTypes'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 700))
}

function findButton(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes(text))
}

function exerciseNamesForDay(structure: FitnessPlanStructure, dayIndex: number) {
  const day = structure.weeks[0]?.days.find((entry) => entry.dayIndex === dayIndex)
  if (!day) {
    throw new Error(`Missing day ${dayIndex}`)
  }
  return day.workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.exerciseName))
}

describe('FitnessPlansPage day template fill', () => {
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

  test('fills supported day types with starter workouts and exercises', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Template Fill Block', goal: 'Make days startable' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)
    const week = structure.weeks[0]
    if (!week) {
      throw new Error('Template fill setup missing first week')
    }

    await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Tlak' })
    await fitnessRepository.addPlanDay(week.id, { dayIndex: 1, label: 'Ťah' })
    await fitnessRepository.addPlanDay(week.id, { dayIndex: 2, label: 'Nohy' })
    await fitnessRepository.addPlanDay(week.id, { dayIndex: 3, label: 'Full body' })

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const templates = [
      {
        chipLabel: 'Po, Tlak, otvoriť detail',
        buttonText: 'Vyplniť Tlak šablónou',
        successText: 'Tlak vyplnený šablónou Tlak.',
        dayIndex: 0,
        exerciseNames: ['Tlak na lavičke', 'Tlaky s jednoručkami na šikmej lavičke', 'Upažovanie', 'Sťahovanie kladky s lanom'],
      },
      {
        chipLabel: 'Ut, Ťah, otvoriť detail',
        buttonText: 'Vyplniť Ťah šablónou',
        successText: 'Ťah vyplnený šablónou Ťah.',
        dayIndex: 1,
        exerciseNames: ['Mŕtvy ťah', 'Príťahy veľkej činky v predklone'],
      },
      {
        chipLabel: 'St, Nohy, otvoriť detail',
        buttonText: 'Vyplniť Nohy šablónou',
        successText: 'Nohy vyplnený šablónou Nohy.',
        dayIndex: 2,
        exerciseNames: ['Drep', 'Rumunský mŕtvy ťah'],
      },
      {
        chipLabel: 'Št, Full body, otvoriť detail',
        buttonText: 'Vyplniť Full body šablónou',
        successText: 'Full body vyplnený šablónou Full body.',
        dayIndex: 3,
        exerciseNames: ['Tlak na lavičke', 'Príťahy veľkej činky v predklone', 'Drep'],
      },
    ]

    for (const template of templates) {
      const chip = container.querySelector<HTMLButtonElement>(`button[aria-label="${template.chipLabel}"]`)
      expect(chip).toBeTruthy()

      await act(async () => {
        chip?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await waitForAsyncUi()
      })

      const fillButton = findButton(container, template.buttonText)
      expect(fillButton).toBeDefined()

      await act(async () => {
        fillButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await waitForAsyncUi()
      })

      expect(container.textContent).toContain(template.successText)
      const updatedStructure = await fitnessRepository.getPlanStructure(plan.id)
      expect(exerciseNamesForDay(updatedStructure, template.dayIndex)).toEqual(template.exerciseNames)
    }
  }, 15000)

  test('does not offer a template fill for rest days or already populated days', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Template Guard Block', goal: 'Avoid duplicates' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)
    const week = structure.weeks[0]
    if (!week) {
      throw new Error('Template guard setup missing first week')
    }

    const pushDay = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Tlak' })
    const existingWorkout = await fitnessRepository.addPlanWorkout(pushDay.id, { name: 'Existing workout' })
    await fitnessRepository.addPlanExercise(existingWorkout.id, {
      exerciseId: 'exercise-bench-press',
      targetSets: 3,
      minReps: 6,
      maxReps: 8,
      targetRir: 1,
      restSeconds: 150,
    })
    await fitnessRepository.addPlanDay(week.id, { dayIndex: 1, label: 'Voľno', isRestDay: true })

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(findButton(container, 'Vyplniť Tlak šablónou')).toBeUndefined()

    const restChip = container.querySelector<HTMLButtonElement>('button[aria-label="Ut, Voľno, otvoriť detail"]')
    expect(restChip).toBeTruthy()

    await act(async () => {
      restChip?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(findButton(container, 'Vyplniť Voľno šablónou')).toBeUndefined()

    const updatedStructure = await fitnessRepository.getPlanStructure(plan.id)
    const updatedPushDay = updatedStructure.weeks[0]?.days.find((day) => day.dayIndex === 0)
    expect(updatedPushDay?.workouts).toHaveLength(1)
    expect(updatedPushDay?.workouts[0]?.exercises).toHaveLength(1)
  }, 10000)
})
