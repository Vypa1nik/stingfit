import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createPlanWithRecoveryDay() {
  await fitnessRepository.seedStarterData()
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Rest Toggle Block', goal: 'Control day status' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
  if (!week || !benchPress) {
    throw new Error('Rest day UI setup missing week or Tlak na lavičke')
  }

  const pushDay = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Push Day' })
  const pushWorkout = await fitnessRepository.addPlanWorkout(pushDay.id, { name: 'Tlak Builder' })
  await fitnessRepository.addPlanExercise(pushWorkout.id, {
    exerciseId: benchPress.id,
    targetSets: 3,
    minReps: 6,
    maxReps: 8,
    targetRir: 1,
    restSeconds: 150,
  })
  await fitnessRepository.addPlanDay(week.id, { dayIndex: 1, label: 'Recovery Day' })
}

describe('FitnessPlansPage rest day controls', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createPlanWithRecoveryDay()
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

  test('marks an empty training day as rest and can reverse it back to training', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Týždeň 1 · Recovery Day nemá žiadny tréning.')
    expect(container.textContent).toContain('Označiť Recovery Day ako voľno')

    const markRestButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Označiť Recovery Day ako voľno'))
    expect(markRestButton).toBeDefined()

    await act(async () => {
      markRestButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Recovery Day označený ako voľno')
    expect(container.textContent).toContain('Pripravené na tréning')
    expect(container.textContent).toContain('Spustiteľné tréningy: 1')
    expect(container.textContent).toContain('Označiť Recovery Day ako tréning')
    expect(container.textContent).not.toContain('Týždeň 1 · Recovery Day nemá žiadny tréning.')

    const markTrainingButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Označiť Recovery Day ako tréning'))
    expect(markTrainingButton).toBeDefined()

    await act(async () => {
      markTrainingButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Recovery Day označený ako tréning')
    expect(container.textContent).toContain('Týždeň 1 · Recovery Day nemá žiadny tréning.')
    expect(container.textContent).toContain('Označiť Recovery Day ako voľno')
  })
})
