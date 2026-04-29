import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { RestTimer } from '@/features/fitness/RestTimer'

async function waitForEffects() {
  await new Promise((resolve) => window.setTimeout(resolve, 0))
}

describe('rest timer alerts', () => {
  let container: HTMLDivElement
  let root: Root
  let vibrateSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vibrateSpy = vi.fn()
    Object.defineProperty(window.navigator, 'vibrate', {
      configurable: true,
      value: vibrateSpy,
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  test('vibrates once when the rest timer reaches zero', async () => {
    const startedAt = new Date(Date.now() - 2_000).toISOString()

    await act(async () => {
      root.render(<RestTimer seconds={1} startedAt={startedAt} soundEnabled={false} vibrationEnabled />)
      await waitForEffects()
    })

    expect(container.textContent).toContain('Pauza hotová')
    expect(vibrateSpy).toHaveBeenCalledTimes(1)
    expect(vibrateSpy).toHaveBeenCalledWith([200, 100, 200])

    await act(async () => {
      root.render(<RestTimer seconds={1} startedAt={startedAt} soundEnabled={false} vibrationEnabled />)
      await waitForEffects()
    })

    expect(vibrateSpy).toHaveBeenCalledTimes(1)
  })

  test('does not vibrate when vibration alerts are disabled', async () => {
    const startedAt = new Date(Date.now() - 2_000).toISOString()

    await act(async () => {
      root.render(<RestTimer seconds={1} startedAt={startedAt} soundEnabled={false} vibrationEnabled={false} />)
      await waitForEffects()
    })

    expect(container.textContent).toContain('Pauza hotová')
    expect(vibrateSpy).not.toHaveBeenCalled()
  })
})
