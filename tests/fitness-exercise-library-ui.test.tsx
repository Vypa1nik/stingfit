import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

describe('FitnessPlansPage exercise library management', () => {
  let container: HTMLDivElement
  let root: Root
  let customExerciseId: string

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await fitnessRepository.seedStarterData()
    const custom = await fitnessRepository.createExercise({ name: 'Cable Fly', category: 'chest', muscleGroup: 'chest', defaultRestSeconds: 75 })
    customExerciseId = custom.id
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
    await resetDatabaseState()
  })

  test('edits and archives custom exercises while starter exercises stay protected', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Knižnica cvikov')
    expect(container.textContent).toContain('Cable Fly')
    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Štartovací cvik chránený')

    const nameInput = container.querySelector<HTMLInputElement>('input[aria-label="Názov cviku Cable Fly"]')
    const categoryInput = container.querySelector<HTMLInputElement>('input[aria-label="Kategória cviku Cable Fly"]')
    const muscleGroupSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Svalová skupina cviku Cable Fly"]')
    const restInput = container.querySelector<HTMLInputElement>('input[aria-label="Predvolená pauza v sekundách pre Cable Fly"]')
    expect(nameInput).toBeTruthy()
    expect(categoryInput).toBeTruthy()
    expect(muscleGroupSelect).toBeTruthy()
    expect(restInput).toBeTruthy()

    await act(async () => {
      if (nameInput) {
        nameInput.value = 'Low Cable Fly'
        nameInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (categoryInput) {
        categoryInput.value = 'upper chest'
        categoryInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
      if (muscleGroupSelect) {
        muscleGroupSelect.value = 'shoulders'
        muscleGroupSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (restInput) {
        restInput.value = '60'
        restInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })

    const saveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Uložiť Cable Fly'))
    expect(saveButton).toBeDefined()

    await act(async () => {
      saveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Low Cable Fly aktualizovaný')
    let exercises = await fitnessRepository.listExercises()
    expect(exercises.find((exercise) => exercise.id === customExerciseId)).toMatchObject({
      name: 'Low Cable Fly',
      category: 'upper chest',
      muscleGroup: 'shoulders',
      defaultRestSeconds: 60,
    })

    const archiveButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Archivovať Low Cable Fly'))
    expect(archiveButton).toBeDefined()

    await act(async () => {
      archiveButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Low Cable Fly archivovaný')
    exercises = await fitnessRepository.listExercises()
    expect(exercises.some((exercise) => exercise.id === customExerciseId)).toBe(false)
    expect(container.textContent).not.toContain('Archivovať Low Cable Fly')
  })
})
