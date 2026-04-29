import { useState } from 'react'

import { Dumbbell, HardDrive, Palette, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { fitnessRepository } from '@/features/fitness/fitnessRepository'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useTheme } from '@/hooks/useTheme'
import { THEME_OPTIONS } from '@/lib/constants'
import { OnboardingStep } from './OnboardingStep'

const steps = [
  {
    icon: Dumbbell,
    eyebrow: 'StingFit',
    title: 'Rýchly tréningový zápisník bez cloudu',
    description: 'StingFit drží plány, série, históriu a nastavenia lokálne v tomto zariadení.',
  },
  {
    icon: HardDrive,
    eyebrow: 'Súkromie',
    title: 'Tvoje dáta ostávajú u teba',
    description: 'Žiadny login, žiadna synchronizácia, žiadna telemetria. Export a import nájdeš v Nastaveniach.',
  },
  {
    icon: Zap,
    eyebrow: 'Štart',
    title: 'Začni plánom alebo rýchlym tréningom',
    description: 'Priprav si PPL blok na viac týždňov alebo rovno otvor živý zápisník bez plánu.',
  },
  {
    icon: Palette,
    eyebrow: 'Vzhľad',
    title: 'Vyber tréningový režim',
    description: 'Tmavý režim je najčitateľnejší vo fitku, svetlý sa hodí pri plánovaní.',
  },
] as const

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep, complete } = useOnboarding()
  const { mode, setMode } = useTheme()
  const [isPreparing, setIsPreparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const step = steps[currentStep]

  const finishAndNavigate = (path: string) => {
    complete()
    navigate(path)
  }

  const preparePplPlan = async () => {
    setIsPreparing(true)
    setError(null)
    try {
      await fitnessRepository.seedStarterData()
      const starter = (await fitnessRepository.listStarterPlans()).find((plan) => plan.name === 'Tlak / Ťah / Nohy')
      if (!starter) {
        throw new Error('Štartovací PPL plán nie je dostupný.')
      }

      const existingPersonalPlans = await fitnessRepository.listPersonalPlans()
      if (existingPersonalPlans.length === 0) {
        await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
          name: 'Môj Tlak / Ťah / Nohy blok',
          goal: 'Silnejší a prehľadný tréningový rytmus',
        })
      }

      finishAndNavigate('/training')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nepodarilo sa pripraviť tréningový plán.')
    } finally {
      setIsPreparing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#05070B] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((item, index) => (
            <span
              key={item.title}
              className={`h-1.5 w-16 rounded-full ${index === currentStep ? 'bg-fitness-yellow' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <OnboardingStep icon={step.icon} eyebrow={step.eyebrow} title={step.title} description={step.description}>
          {currentStep === 1 ? (
            <div className="rounded-2xl border border-fitness-yellow/20 bg-fitness-yellow/10 px-4 py-4 text-sm font-semibold text-fitness-warm">
              Lokálna databáza je uložená v prehliadači alebo desktopovom profile StingFit. Exportuj JSON pred resetom zariadenia.
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="fitness-action"
                  leadingIcon={<Dumbbell className="size-4" />}
                  onClick={() => void preparePplPlan()}
                  disabled={isPreparing}
                >
                  {isPreparing ? 'Pripravujem plán…' : 'Pripraviť PPL plán'}
                </Button>
                <Button
                  variant="secondary"
                  className="border-white/15 bg-white/10 text-white hover:bg-white/15"
                  leadingIcon={<Zap className="size-4" />}
                  onClick={() => finishAndNavigate('/quick')}
                  disabled={isPreparing}
                >
                  Otvoriť rýchly tréning
                </Button>
              </div>
              <p className="text-sm text-slate-300">
                Obe možnosti sú lokálne. Plán vieš kedykoľvek upraviť v sekcii Plány.
              </p>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                    mode === option.value ? 'border-fitness-yellow bg-fitness-yellow/15' : 'border-white/10 bg-white/5'
                  }`}
                  onClick={() => setMode(option.value)}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-2 text-sm text-slate-300">{option.description}</p>
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
              disabled={currentStep === 0 || isPreparing}
              onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
            >
              Späť
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button className="fitness-action" onClick={() => finishAndNavigate('/training')} disabled={isPreparing}>
                Začať tréning
              </Button>
            ) : (
              <Button className="fitness-action" onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))} disabled={isPreparing}>
                Pokračovať
              </Button>
            )}
          </div>
        </OnboardingStep>
      </div>
    </div>
  )
}
