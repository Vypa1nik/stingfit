import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, test } from 'vitest'

import { AppShell } from '@/components/layout/AppShell'

describe('mobile StingFit shell navigation', () => {
  let container: HTMLDivElement | null = null
  let root: Root | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
    }
    container?.remove()
    root = null
    container = null
  })

  test('keeps primary mobile tabs visible and gives quick workout a centered CTA', async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/quick']}>
          <AppShell>
            <div>Obsah tréningu</div>
          </AppShell>
        </MemoryRouter>,
      )
    })

    const bottomNav = container.querySelector<HTMLElement>('[data-testid="mobile-bottom-nav"]')
    expect(bottomNav).toBeTruthy()
    expect(bottomNav?.textContent).toContain('Tréning')
    expect(bottomNav?.textContent).toContain('Rýchly')
    expect(bottomNav?.textContent).toContain('Plány')
    expect(bottomNav?.textContent).toContain('História')
    expect(bottomNav?.textContent).toContain('Štatistiky')

    const quickLink = bottomNav?.querySelector<HTMLAnchorElement>('a[href="/quick"]')
    expect(quickLink).toBeTruthy()
    expect(quickLink?.getAttribute('aria-current')).toBe('page')
    expect(quickLink?.className).toContain('scale-105')

    const main = container.querySelector('main')
    expect(main?.className).toContain('pb-28')
    expect(main?.className).toContain('md:pb-4')
  })
})
