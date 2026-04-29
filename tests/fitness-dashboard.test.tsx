import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 1000))
}

describe('FitnessDashboard', () => {
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

  test('renders the repository-backed training empty state', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Začni úplne jednoducho')
    expect(container.textContent).toContain('3 dni / týždeň')
    expect(container.textContent).toContain('Neviem, vyber za mňa')
    expect(container.textContent).toContain('Len rýchly tréning')
  })
})
