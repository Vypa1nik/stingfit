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
    <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-[#0D1117] px-6 py-8 text-white shadow-modal md:px-10 md:py-10">
      <div className="mb-6 inline-flex rounded-2xl bg-white/10 p-4">
        <Icon className="size-8" />
      </div>
      <p className="text-xs uppercase tracking-[0.28em] text-blue-200">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-base text-slate-300">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  )
}
