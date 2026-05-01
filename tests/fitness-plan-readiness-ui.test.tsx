import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function renderPlans(root: Root) {
  await act(async () => {
    root.render(<FitnessPlansPage />)
  })
  await act(async () => {
    await waitForAsyncUi()
  })
}

describe('FitnessPlansPage plan readiness', () => {
  let container: HTMLDivElement
  let root: Root
  let planId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Readiness Block', goal: 'Build a usable plan' })
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

  test('shows blockers for an unfinished plan and ready state after the plan becomes startable', async () => {
    await renderPlans(root)

    expect(container.textContent).toContain('Pripravenosť plánu')
    expect(container.textContent).toContain('Pred tréningom treba opravy')
    expect(container.textContent).toContain('Týždeň 1 nemá žiadne tréningové dni.')
    expect(container.textContent).toContain('Tento plán ešte nie je spustiteľný')
    expect(container.textContent).toContain('Dostavať z Celé telo 3×')

    const completeFromStarterButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Dostavať z Celé telo 3×'))
    expect(completeFromStarterButton).toBeDefined()

    await act(async () => {
      completeFromStarterButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Osobný plán vytvorený zo šablóny Celé telo 3×.')
    expect(container.textContent).toContain('Pripravené')
    expect(container.textContent).toContain('3 tréningové dni')
    expect(container.textContent).toContain('Celé telo A')

    act(() => {
      root.unmount()
    })
    container.textContent = ''

    const structure = await fitnessRepository.getPlanStructure(planId)
    const week = structure.weeks[0]
    const benchPress = (await fitnessRepository.listExercises()).find((exercise) => exercise.name === 'Tlak na lavičke')
    if (!week || !benchPress) {
      throw new Error('Readiness test setup missing week or Tlak na lavičke')
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

    root = createRoot(container)
    await renderPlans(root)

    expect(container.textContent).toContain('Pripravené na tréning')
    expect(container.textContent).toContain('Spustiteľné tréningy: 1')
  })
})
