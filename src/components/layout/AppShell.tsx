import { useEffect, useRef, type ReactNode } from 'react'

import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { NavigationSidebar } from '@/components/layout/NavigationSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useUiStore } from '@/lib/uiStore'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen)
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen)
  const mobileDialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileSidebarOpen])

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      mobileDialogRef.current?.focus()
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

  return (
    <div className="surface-shell min-h-screen md:flex">
      <NavigationSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 md:pb-4 lg:px-8">{children}</main>
      </div>
      <MobileBottomNav />

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
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
