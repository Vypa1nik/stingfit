import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

async function createNotPripravenéWorkout() {
  await fitnessRepository.seedStarterData()
  const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Readiness Block', goal: 'Build a usable plan' })
  const structure = await fitnessRepository.getPlanStructure(plan.id)
  const week = structure.weeks[0]
  if (!week) {
    throw new Error('Readiness setup missing week')
  }

  const day = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Chest Day' })
  await fitnessRepository.addPlanWorkout(day.id, { name: 'Chest Builder' })
}

describe('FitnessDashboard training readiness', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await createNotPripravenéWorkout()
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

  test('does not show workouts without exercises as startable and explains how to fix them', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).not.toContain('Start Chest Builder')
    expect(container.textContent).toContain('Nepripravené tréningy')
    expect(container.textContent).toContain('Týždeň 1 · Chest Day · Chest Builder nemá žiadne cviky.')
    expect(container.textContent).toContain('Otvoriť Plány')
  })
})
