import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel: string
  onCta: () => void
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white/80 px-8 py-10 text-center dark:border-border-dark dark:bg-white/[0.02]">
      <Icon className="mb-4 size-12 text-text-muted dark:text-text-muted-dark" />
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary dark:text-text-secondary-dark">{description}</p>
      <Button className="mt-5" onClick={onCta}>
        {ctaLabel}
      </Button>
    </div>
  )
}
