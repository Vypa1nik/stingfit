import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FITNESS_BACKUP_NUDGE_STORAGE_KEY } from '@/features/fitness/fitnessBackupNudge'
import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

function findButton(container: HTMLDivElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes(label))
  expect(button).toBeDefined()
  return button
}

async function importCompletedStrongWorkouts(count: number) {
  const rows = ['Date,Workout Name,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Notes,Workout Notes']
  for (let index = 0; index < count; index += 1) {
    const day = String((index % 28) + 1).padStart(2, '0')
    rows.push(`2026-01-${day} 10:00:00,Strong tréning ${index + 1},Bench Press,1,100,kg,5,8,,lokálna história`)
  }

  await fitnessRepository.importStrongCsvData(rows.join('\n'))
}

describe('FitnessDashboard backup nudge', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
    await importCompletedStrongWorkouts(30)
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:stingfit-backup') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(async () => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
    await resetDatabaseState()
  })

  test('suggests a local export after 30 completed workouts and snoozes after export', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Čas na lokálnu zálohu')
    expect(container.textContent).toContain('30 dokončených tréningov')
    expect(container.textContent).toContain('Bez účtu, cloudu a telemetrie')

    await act(async () => {
      findButton(container, 'Exportovať zálohu')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Záloha tréningov pripravená')
    expect(container.textContent).not.toContain('Čas na lokálnu zálohu')
    expect(window.localStorage.getItem(FITNESS_BACKUP_NUDGE_STORAGE_KEY)).toBe('30')
  })
})
