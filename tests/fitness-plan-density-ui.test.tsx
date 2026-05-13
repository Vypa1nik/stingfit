import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createDensePlan() {
  await fitnessRepository.seedStarterData()
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Dense Block', goal: 'Scan faster' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
  if (!week || !benchPress) {
    throw new Error('Density UI setup missing week or Tlak na lavičke')
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

describe('FitnessPlansPage density controls', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createDensePlan()
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

  test('shows compact statuses and collapses day/week details without losing summaries', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Týždeň 1 prehľad')
    expect(container.textContent).toContain('1 pripravený tréning')
    expect(container.textContent).toContain('1 problém')
    expect(container.textContent).toContain('Pripravené')
    expect(container.textContent).toContain('Chýba tréning')
    expect(container.textContent).toContain('Uložiť ciele pre Tlak na lavičke')

    expect(container.textContent).toContain('Týždeň v skratke')
    expect(container.textContent).toContain('Po')
    expect(container.textContent).toContain('Ut')

    const recoveryChip = container.querySelector<HTMLButtonElement>('button[aria-label="Ut, Recovery Day, otvoriť detail"]')
    expect(recoveryChip).toBeTruthy()

    await act(async () => {
      recoveryChip?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Uložiť Recovery Day')
    expect(container.textContent).not.toContain('Uložiť ciele pre Tlak na lavičke')

    const collapseWeekButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zbaliť týždeň 1'))
    expect(collapseWeekButton).toBeDefined()

    await act(async () => {
      collapseWeekButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Týždeň 1 prehľad')
    expect(container.textContent).toContain('Rozbaliť týždeň 1')
    expect(container.textContent).not.toContain('Uložiť Recovery Day')
  })
})
