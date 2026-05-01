import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

describe('FitnessSettingsPage simplified backup safety', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(async () => {
    await resetDatabaseState()
    await clearAllData()
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

  test('starts with local backup safety and keeps imports and reset behind advanced controls', async () => {
    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Bezpečnosť dát')
    expect(container.textContent).toContain('Najprv si sprav lokálnu zálohu')
    expect(container.textContent).toContain('Bez účtu, cloudu a telemetrie')
    expect(container.textContent).toContain('Exportovať lokálnu zálohu')

    const advancedData = Array.from(container.querySelectorAll('details')).find((details) => details.textContent?.includes('Import, obnova a nebezpečná zóna'))
    expect(advancedData).toBeDefined()
    expect(advancedData?.hasAttribute('open')).toBe(false)
    expect(advancedData?.textContent).toContain('Import zo Strong CSV')
    expect(advancedData?.textContent).toContain('Nebezpečná zóna')
  })
})
