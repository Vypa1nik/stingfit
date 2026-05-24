import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface OnboardingStepProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

export function OnboardingStep({ icon: Icon, eyebrow, title, description, children }: OnboardingStepProps) {
  return (
    <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-[#0D1117] px-4 py-5 text-white shadow-modal sm:rounded-[28px] sm:px-6 sm:py-8 md:px-10 md:py-10">
      <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 sm:mb-6 sm:p-4">
        <Icon className="size-6 sm:size-8" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200 sm:text-xs sm:tracking-[0.28em]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight sm:mt-3 sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-3 sm:text-base">{description}</p>
      {children ? <div className="mt-5 sm:mt-8">{children}</div> : null}
    </div>
  )
}
