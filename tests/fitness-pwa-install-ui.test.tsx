import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 300))
}

describe('FitnessSettingsPage PWA install guidance', () => {
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

  test('shows install guidance and offline promise without requiring cloud features', async () => {
    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Inštalácia aplikácie')
    expect(container.textContent).toContain('Pridať StingFit na plochu')
    expect(container.textContent).toContain('Offline tréning')
    expect(container.textContent).toContain('Bez účtu, cloudu a telemetrie')
    expect(container.textContent).toContain('Nainštalovať StingFit')
  })
})
