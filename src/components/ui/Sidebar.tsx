import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed?: boolean
  children: ReactNode
}

export function Sidebar({ collapsed = false, children }: SidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r border-border bg-sidebar px-3 py-4 transition-[width] duration-150 ease-out md:flex md:flex-col dark:border-border-dark dark:bg-sidebar-dark',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {children}
    </aside>
  )
}
