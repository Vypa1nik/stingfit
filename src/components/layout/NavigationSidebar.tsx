import { useEffect, useRef } from 'react'

import {
  Activity,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  History,
  LineChart,
  Notebook,
  Settings,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { Sidebar } from '@/components/ui/Sidebar'
import { sk } from '@/i18n/sk'
import {
  APP_NAME,
  PLAN_NAV_ITEMS,
  PROGRESS_NAV_ITEMS,
  TOOLS_NAV_ITEMS,
  TRAIN_NAV_ITEMS,
} from '@/lib/constants'
import { useUiStore } from '@/lib/uiStore'
import { cn } from '@/lib/utils'

/**
 * Icon registry — every nav-item `id` declared in `constants.ts` must
 * map to one entry here. Missing keys fall back to the Activity icon
 * so the sidebar never crashes if a constant is added in isolation.
 */
const icons: Record<string, LucideIcon> = {
  // Train
  train: Dumbbell,
  quick: Zap,
  // Progress
  lifts: LineChart,
  prs: Trophy,
  body: Activity,
  journal: Notebook,
  history: History,
  // Plans
  plans: ClipboardList,
  coach: Users,
  // Tools
  plates: Calculator,
  // Misc
  settings: Settings,
  default: BookOpen,
}

const navCopy = sk.fitness.nav

interface NavigationSidebarProps {
  mobile?: boolean
}

type NavItem = {
  id: string
  label: string
  path: string
}

export function NavigationSidebar({ mobile = false }: NavigationSidebarProps) {
  const collapsed = useUiStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen)
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)

  useEffect(() => {
    if (!mobile) {
      return
    }

    if (previousPathRef.current !== location.pathname) {
      setMobileSidebarOpen(false)
    }

    previousPathRef.current = location.pathname
  }, [location.pathname, mobile, setMobileSidebarOpen])

  const closeMobileSidebar = () => setMobileSidebarOpen(false)

  const renderNavGroup = (title: string, items: ReadonlyArray<NavItem>) => (
    <div className="space-y-2">
      {!mobile && collapsed ? null : (
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-text-muted-dark">
          {title}
        </p>
      )}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = icons[item.id] ?? icons.default
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={mobile ? closeMobileSidebar : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out',
                  isActive
                    ? 'bg-accent-light text-accent dark:bg-accent-dark/25 dark:text-blue-200'
                    : 'text-text-secondary hover:bg-black/5 hover:text-text-primary dark:text-text-secondary-dark dark:hover:bg-white/5 dark:hover:text-text-primary-dark',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {!mobile && collapsed ? null : <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )

  const content = (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 px-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted dark:text-text-muted-dark">
            {navCopy.sidebar.localBadge}
          </p>
          {!mobile && collapsed ? null : (
            <h1 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              {APP_NAME}
            </h1>
          )}
        </div>

        {mobile ? (
          <button
            type="button"
            aria-label={navCopy.sidebar.closeMenu}
            className="inline-flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-black/5 dark:text-text-secondary-dark dark:hover:bg-white/5"
            onClick={closeMobileSidebar}
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={collapsed ? navCopy.sidebar.expandSidebar : navCopy.sidebar.collapseSidebar}
            className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary hover:bg-black/5 dark:text-text-secondary-dark dark:hover:bg-white/5"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6">
        {TRAIN_NAV_ITEMS.length > 0 ? renderNavGroup(navCopy.groups.train, TRAIN_NAV_ITEMS) : null}
        {PROGRESS_NAV_ITEMS.length > 0 ? renderNavGroup(navCopy.groups.progress, PROGRESS_NAV_ITEMS) : null}
        {PLAN_NAV_ITEMS.length > 0 ? renderNavGroup(navCopy.groups.plans, PLAN_NAV_ITEMS) : null}
        {TOOLS_NAV_ITEMS.length > 0 ? renderNavGroup(navCopy.groups.tools, TOOLS_NAV_ITEMS) : null}
      </div>

      <div className="mt-6 border-t border-border pt-4 dark:border-border-dark">
        <NavLink
          to="/settings"
          onClick={mobile ? closeMobileSidebar : undefined}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out',
              isActive
                ? 'bg-accent-light text-accent dark:bg-accent-dark/25 dark:text-blue-200'
                : 'text-text-secondary hover:bg-black/5 hover:text-text-primary dark:text-text-secondary-dark dark:hover:bg-white/5 dark:hover:text-text-primary-dark',
            )
          }
        >
          <Settings className="size-4 shrink-0" />
          {!mobile && collapsed ? null : <span>{navCopy.sidebar.settings}</span>}
        </NavLink>
      </div>
    </>
  )

  if (mobile) {
    return <div className="flex h-full flex-col px-4 py-4">{content}</div>
  }

  return <Sidebar collapsed={collapsed}>{content}</Sidebar>
}
