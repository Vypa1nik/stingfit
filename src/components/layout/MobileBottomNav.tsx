import { Activity, ClipboardList, Dumbbell, History, PlusCircle, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface MobileNavItem {
  label: string
  path: string
  icon: LucideIcon
  primary?: boolean
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: 'Tréning', path: '/training', icon: Dumbbell },
  { label: 'Plány', path: '/plans', icon: ClipboardList },
  { label: 'Rýchly', path: '/quick', icon: PlusCircle, primary: true },
  { label: 'História', path: '/history', icon: History },
  { label: 'Štatistiky', path: '/stats', icon: Activity },
] as const

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Hlavné mobilné taby"
      data-testid="mobile-bottom-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-fitness-yellow/25 bg-black/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2 shadow-[0_-18px_40px_rgba(0,0,0,0.45)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black transition-all duration-150 ease-out',
                  item.primary ? '-mt-5 min-h-16 scale-105 rounded-3xl border border-fitness-yellow bg-fitness-yellow text-black shadow-[0_0_28px_rgba(255,255,0,0.28)]' : '',
                  !item.primary && isActive ? 'bg-fitness-yellow/15 text-fitness-yellow' : '',
                  !item.primary && !isActive ? 'text-fitness-warm/65 hover:bg-fitness-yellow/10 hover:text-fitness-yellow' : '',
                  item.primary && isActive ? 'ring-2 ring-white/60' : '',
                )
              }
            >
              <Icon className={cn('shrink-0', item.primary ? 'size-5' : 'size-4')} />
              <span className="leading-none">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
