import { lazy, Suspense, type ReactNode } from 'react'

import { Navigate, useRoutes } from 'react-router-dom'

const FitnessDashboard = lazy(() => import('@/features/fitness/FitnessDashboard').then((module) => ({ default: module.FitnessDashboard })))
const FitnessQuickSessionPage = lazy(() => import('@/features/fitness/FitnessQuickSessionPage').then((module) => ({ default: module.FitnessQuickSessionPage })))
const FitnessPlansPage = lazy(() => import('@/features/fitness/FitnessPlansPage').then((module) => ({ default: module.FitnessPlansPage })))
const FitnessHistoryPage = lazy(() => import('@/features/fitness/FitnessHistoryPage').then((module) => ({ default: module.FitnessHistoryPage })))
const FitnessStatsPage = lazy(() => import('@/features/fitness/FitnessStatsPage').then((module) => ({ default: module.FitnessStatsPage })))
const FitnessSettingsPage = lazy(() => import('@/features/fitness/FitnessSettingsPage').then((module) => ({ default: module.FitnessSettingsPage })))

function RouteLoadingState() {
  return (
    <div className="card-surface flex min-h-[320px] items-center justify-center p-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-text-muted dark:text-text-muted-dark">Načítavam obrazovku</p>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Pripravujem ďalšiu tréningovú obrazovku StingFit…</p>
      </div>
    </div>
  )
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoadingState />}>{children}</Suspense>
}

export function AppRouter() {
  return useRoutes([
    { path: '/', element: <Navigate to="/training" replace /> },
    {
      path: '/training',
      element: (
        <LazyRoute>
          <FitnessDashboard />
        </LazyRoute>
      ),
    },
    {
      path: '/quick',
      element: (
        <LazyRoute>
          <FitnessQuickSessionPage />
        </LazyRoute>
      ),
    },
    {
      path: '/plans',
      element: (
        <LazyRoute>
          <FitnessPlansPage />
        </LazyRoute>
      ),
    },
    {
      path: '/history',
      element: (
        <LazyRoute>
          <FitnessHistoryPage />
        </LazyRoute>
      ),
    },
    {
      path: '/stats',
      element: (
        <LazyRoute>
          <FitnessStatsPage />
        </LazyRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <LazyRoute>
          <FitnessSettingsPage />
        </LazyRoute>
      ),
    },
    { path: '*', element: <Navigate to="/training" replace /> },
  ])
}
