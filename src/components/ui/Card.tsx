import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, description, action, children, className }: CardProps) {
  return (
    <section className={cn('card-surface hover-lift p-5', className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{title}</h3> : null}
            {description ? (
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
