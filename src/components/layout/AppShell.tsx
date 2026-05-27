import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'

import { useLocation } from 'react-router-dom'

import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { NavigationSidebar } from '@/components/layout/NavigationSidebar'
import { RedirectDeprecationBanner } from '@/components/layout/RedirectDeprecationBanner'
import { TopBar } from '@/components/layout/TopBar'
import { useUiStore } from '@/lib/uiStore'

interface AppShellProps {
  children: ReactNode
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen)
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen)
  const mobileDialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const hasMountedRouteRef = useRef(false)

  useEffect(() => {
    if (!hasMountedRouteRef.current) {
      hasMountedRouteRef.current = true
      return
    }

    if (window.scrollX !== 0 || window.scrollY !== 0) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocusedRef.current?.focus()
    }
  }, [isMobileSidebarOpen])

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const dialog = mobileDialogRef.current
      const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ;(firstFocusable ?? dialog)?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isMobileSidebarOpen])

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [isMobileSidebarOpen, setMobileSidebarOpen])

  const handleMobileDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setMobileSidebarOpen(false)
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const dialog = mobileDialogRef.current
    if (!dialog) {
      return
    }

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const activeElement = document.activeElement

    if (event.shiftKey) {
      if (activeElement === first || !dialog.contains(activeElement)) {
        event.preventDefault()
        last.focus()
      }
      return
    }

    if (activeElement === last || !dialog.contains(activeElement)) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="surface-shell min-h-screen md:flex">
      <NavigationSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 md:pb-4 lg:px-8">
          <RedirectDeprecationBanner />
          {children}
        </main>
      </div>
      <MobileBottomNav />

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" onKeyDown={handleMobileDialogKeyDown}>
          <button
            type="button"
            aria-label="Zatvoriť navigačné menu"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div
            ref={mobileDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigačné menu"
            tabIndex={-1}
            className="relative h-full w-[min(85vw,20rem)] border-r border-border bg-sidebar shadow-2xl dark:border-border-dark dark:bg-sidebar-dark"
          >
            <NavigationSidebar mobile />
          </div>
        </div>
      ) : null}
    </div>
  )
}
