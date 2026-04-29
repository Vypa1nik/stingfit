import { useEffect } from 'react'

import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

import { useUiStore } from '@/lib/uiStore'

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} as const

export function ToastHost() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id)
      }, 3000),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [dismissToast, toasts])

  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone]
        return (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card dark:border-border-dark dark:bg-card-dark"
          >
            <Icon className="mt-0.5 size-4 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">{toast.description}</p>
              ) : null}
            </div>
            <button type="button" aria-label={`Dismiss toast: ${toast.title}`} onClick={() => dismissToast(toast.id)}>
              <X className="size-4 text-text-muted dark:text-text-muted-dark" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
