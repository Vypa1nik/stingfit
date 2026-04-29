import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessSettingsPage } from '@/features/fitness/FitnessSettingsPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

describe('FitnessSettingsPage guidance visibility', () => {
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

  test('toggles rest sound and vibration alerts from local settings', async () => {
    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Signál pauzy')
    expect(container.textContent).toContain('Zvuk pauzy: zapnutý')
    expect(container.textContent).toContain('Vibrácie pauzy: zapnuté')

    const muteButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Vypnúť zvuk'))
    const vibrationOffButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Vypnúť vibrácie'))
    expect(muteButton).toBeDefined()
    expect(vibrationOffButton).toBeDefined()

    await act(async () => {
      muteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })
    await act(async () => {
      vibrationOffButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Zvuk pauzy: vypnutý')
    expect(container.textContent).toContain('Vibrácie pauzy vypnuté')
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({
      restSoundEnabled: false,
      restVibrationEnabled: false,
    })
  })

  test('hides and shows optional guidance from local settings', async () => {
    await act(async () => {
      root.render(<FitnessSettingsPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Viditeľnosť pomoci')
    expect(container.textContent).toContain('Pomocné texty: zapnuté')

    const hideButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Skryť pomoc'))
    expect(hideButton).toBeDefined()

    await act(async () => {
      hideButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Pomocné texty skryté')
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ showGuidance: false })

    const showButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Zobraziť pomoc'))
    expect(showButton).toBeDefined()

    await act(async () => {
      showButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Pomocné texty zobrazené')
    await expect(fitnessRepository.getSettings()).resolves.toMatchObject({ showGuidance: true })
  })
})
