import { useMemo } from 'react'

import { create } from 'zustand'

import { settingsApi } from '@/lib/database'

const STORAGE_KEY = 'stingfit.onboarding.complete'

interface OnboardingState {
  isComplete: boolean
  currentStep: number
  setCurrentStep: (step: number) => void
  complete: () => void
  reset: () => void
}

const getInitialValue = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isComplete: getInitialValue(),
  currentStep: 0,
  setCurrentStep: (currentStep) => set({ currentStep }),
  complete: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    }
    void settingsApi.set('onboarding_complete', 'true')
    set({ isComplete: true, currentStep: 0 })
  },
  reset: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    void settingsApi.set('onboarding_complete', 'false')
    set({ isComplete: false, currentStep: 0 })
  },
}))

export function useOnboarding() {
  const state = useOnboardingStore()

  return useMemo(
    () => ({
      ...state,
      isVisible: !state.isComplete,
    }),
    [state],
  )
}
