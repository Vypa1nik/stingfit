import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { FitnessDashboard } from '@/features/fitness/FitnessDashboard'
import { FitnessHistoryPage } from '@/features/fitness/FitnessHistoryPage'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { clearAllData, resetDatabaseState } from '@/lib/database'

async function waitForAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
}

function findButton(container: HTMLDivElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.trim() === label)
  expect(button).toBeDefined()
  return button
}

async function clickButton(container: HTMLDivElement, label: string) {
  await act(async () => {
    findButton(container, label)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await waitForAsyncUi()
  })
}

describe('StingFit V1 smoke flow', () => {
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

  test('new user can prepare a plan, train, finish, review history, export, reset, and restore locally', async () => {
    await act(async () => {
      root.render(<FitnessDashboard />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Žiadny pripravený osobný plán')
    expect(container.textContent).toContain('Pripraviť Tlak / Ťah / Nohy')

    await clickButton(container, 'Pripraviť Tlak / Ťah / Nohy')

    expect(container.textContent).toContain('Štartovací PPL plán je pripravený')
    expect(container.textContent).toContain('Spustiť Tlakový deň A')

    await clickButton(container, 'Spustiť Tlakový deň A')

    expect(container.textContent).toContain('Tréning spustený')
    expect(container.textContent).toContain('Tlak na lavičke')
    expect(container.textContent).toContain('Zapísať sériu ⚡ pauza')

    await clickButton(container, 'Zapísať sériu ⚡ pauza')

    expect(container.textContent).toContain('Séria zapísaná')
    expect(container.textContent).toContain('1 dokončených')

    await clickButton(container, 'Dokončiť tréning')

    expect(container.textContent).toContain('Kontrola pred dokončením')
    expect(container.textContent).toContain('RPE tréningu')
    expect(container.textContent).toContain('Energia')

    await clickButton(container, 'Uložiť kontrolu a dokončiť')

    expect(container.textContent).toContain('Tréning dokončený')

    await act(async () => {
      root.render(<FitnessHistoryPage />)
    })
    await act(async () => {
      await waitForAsyncUi()
    })

    expect(container.textContent).toContain('Nedávne tréningy')
    expect(container.textContent).toContain('Tlakový deň A')
    expect(container.textContent).toContain('Detail tréningu')

    const exported = await fitnessRepository.exportFitnessData()
    expect(exported.personalPlans).toHaveLength(1)
    expect(exported.sessions).toHaveLength(1)
    expect(exported.sessions[0]?.status).toBe('completed')

    await fitnessRepository.resetFitnessData()
    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(0)
    await expect(fitnessRepository.listCompletedSessions()).resolves.toHaveLength(0)

    await fitnessRepository.importFitnessData(exported, { mode: 'replace' })

    await expect(fitnessRepository.listPersonalPlans()).resolves.toHaveLength(1)
    await expect(fitnessRepository.listCompletedSessions()).resolves.toHaveLength(1)
  }, 10_000)
})
