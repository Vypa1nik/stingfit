import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type BadgeTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger'

const badgeToneClasses: Record<BadgeTone, string> = {
  accent: 'bg-accent-light text-accent-dark dark:bg-accent-dark/30 dark:text-blue-200',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.18em]',
        badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
