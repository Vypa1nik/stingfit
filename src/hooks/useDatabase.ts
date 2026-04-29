import { startTransition, useEffect, useState } from 'react'

import { initDatabase, seedPerformanceDataset, settingsApi } from '@/lib/database'
import { useOnboardingStore } from '@/hooks/useOnboarding'

export function useDatabase() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        await initDatabase()

        const canUsePerfSeed =
          typeof window !== 'undefined' && ['127.0.0.1', 'localhost'].includes(window.location.hostname)
        const perfSeedParam =
          canUsePerfSeed && typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('perfSeed')
            : null

        if (perfSeedParam !== null) {
          const parsedTarget = Number(perfSeedParam)
          if (Number.isFinite(parsedTarget) && parsedTarget >= 0) {
            await seedPerformanceDataset(parsedTarget, { clearExisting: true })

            const params = new URLSearchParams(window.location.search)
            params.delete('perfSeed')
            const query = params.toString()
            window.history.replaceState(
              null,
              '',
              `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
            )
          }
        }

        const onboardingComplete = await settingsApi.get('onboarding_complete')
        if (!cancelled) {
          useOnboardingStore.setState({
            isComplete: onboardingComplete === 'true',
            currentStep: 0,
          })
          startTransition(() => setIsReady(true))
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Unknown database error')
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  return { isReady, error }
}
