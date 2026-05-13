import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 700))
}

function findButton(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes(text))
}

describe('FitnessPlansPage weekly preset builder', () => {
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

  test('applies a full push-pull-legs week to an empty plan without duplicating days', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Preset Blank Block', goal: 'Build faster' })

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const presetButton = findButton(container, 'Použiť Tlak / Ťah / Nohy týždeň 1')
    expect(presetButton).toBeDefined()

    await act(async () => {
      presetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Týždeň 1 vyplnený rozdelením Tlak / Ťah / Nohy.')
    expect(container.querySelector('button[aria-label="Po, Tlak, otvoriť detail"]')).toBeTruthy()
    expect(container.querySelector('button[aria-label="St, Voľno, otvoriť detail"]')).toBeTruthy()
    expect(container.querySelector('button[aria-label="Ne, Ťah, otvoriť detail"]')).toBeTruthy()

    const structure = await fitnessRepository.getPlanStructure(plan.id)
    expect(structure.weeks[0]?.days.map((day) => ({ dayIndex: day.dayIndex, label: day.label, isRestDay: day.isRestDay }))).toEqual([
      { dayIndex: 0, label: 'Tlak', isRestDay: false },
      { dayIndex: 1, label: 'Ťah', isRestDay: false },
      { dayIndex: 2, label: 'Voľno', isRestDay: true },
      { dayIndex: 3, label: 'Nohy', isRestDay: false },
      { dayIndex: 4, label: 'Tlak', isRestDay: false },
      { dayIndex: 5, label: 'Voľno', isRestDay: true },
      { dayIndex: 6, label: 'Ťah', isRestDay: false },
    ])

    const secondPresetButton = findButton(container, 'Použiť Tlak / Ťah / Nohy týždeň 1')
    expect(secondPresetButton).toBeDefined()

    await act(async () => {
      secondPresetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    const reappliedStructure = await fitnessRepository.getPlanStructure(plan.id)
    const dayIndexes = reappliedStructure.weeks[0]?.days.map((day) => day.dayIndex) ?? []
    expect(dayIndexes).toHaveLength(7)
    expect(new Set(dayIndexes).size).toBe(7)
  })

  test('updates occupied week slots instead of creating duplicate days', async () => {
    const plan = await fitnessRepository.createBlankPersonalPlan({ name: 'Preset Partial Block', goal: 'Keep indexes stable' })
    const structure = await fitnessRepository.getPlanStructure(plan.id)
    const week = structure.weeks[0]
    if (!week) {
      throw new Error('Preset partial setup missing first week')
    }

    const monday = await fitnessRepository.addPlanDay(week.id, { dayIndex: 0, label: 'Custom Push' })
    const wednesday = await fitnessRepository.addPlanDay(week.id, { dayIndex: 2, label: 'Custom Recovery' })
    await fitnessRepository.addPlanWorkout(wednesday.id, { name: 'Stored recovery workout' })

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    const presetButton = findButton(container, 'Použiť Tlak / Ťah / Nohy týždeň 1')
    expect(presetButton).toBeDefined()

    await act(async () => {
      presetButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    const updatedStructure = await fitnessRepository.getPlanStructure(plan.id)
    const updatedWeek = updatedStructure.weeks[0]
    expect(updatedWeek?.days).toHaveLength(7)

    const updatedMonday = updatedWeek?.days.find((day) => day.dayIndex === 0)
    const updatedWednesday = updatedWeek?.days.find((day) => day.dayIndex === 2)
    expect(updatedMonday).toMatchObject({ id: monday.id, label: 'Tlak', isRestDay: false })
    expect(updatedWednesday).toMatchObject({ id: wednesday.id, label: 'Voľno', isRestDay: true })
    expect(updatedWednesday?.workouts[0]).toMatchObject({ name: 'Stored recovery workout' })
  })
})
