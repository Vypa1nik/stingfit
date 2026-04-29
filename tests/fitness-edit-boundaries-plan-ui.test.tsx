import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessPlansPage } from '@/features/fitness/FitnessPlansPage'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

describe('FitnessPlansPage edit boundary messaging', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
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

  test('explains starter protection and that personal plan edits affect future workouts only', async () => {
    await act(async () => {
      root.render(<FitnessPlansPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Šablóna chránená')
    expect(container.textContent).toContain('Na úpravy vytvor osobnú kópiu.')

    const createButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Vytvoriť z Tlak / Ťah / Nohy'))
    expect(createButton).toBeDefined()

    await act(async () => {
      createButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Iba budúce tréningy')
    expect(container.textContent).toContain('Úpravy plánu ovplyvnia iba budúce tréningy.')
  })
})
