import { lazy, Suspense, type ReactNode } from "react";

import { Navigate, useRoutes } from "react-router-dom";

import { FeatureErrorBoundary } from "@/components/ui/FeatureErrorBoundary";

const FitnessDashboard = lazy(() =>
	import("@/features/fitness/FitnessDashboard").then((module) => ({
		default: module.FitnessDashboard,
	})),
);
const FitnessQuickSessionPage = lazy(() =>
	import("@/features/fitness/FitnessQuickSessionPage").then((module) => ({
		default: module.FitnessQuickSessionPage,
	})),
);
const FitnessPlansPage = lazy(() =>
	import("@/features/fitness/FitnessPlansPage").then((module) => ({
		default: module.FitnessPlansPage,
	})),
);
const FitnessHistoryPage = lazy(() =>
	import("@/features/fitness/FitnessHistoryPage").then((module) => ({
		default: module.FitnessHistoryPage,
	})),
);
const FitnessStatsPage = lazy(() =>
	import("@/features/fitness/FitnessStatsPage").then((module) => ({
		default: module.FitnessStatsPage,
	})),
);
const FitnessPlateCalculatorPage = lazy(() =>
	import("@/features/fitness/FitnessPlateCalculatorPage").then((module) => ({
		default: module.FitnessPlateCalculatorPage,
	})),
);
const FitnessSettingsPage = lazy(() =>
	import("@/features/fitness/FitnessSettingsPage").then((module) => ({
		default: module.FitnessSettingsPage,
	})),
);
const CoachModePage = lazy(() =>
	import("@/features/coach/CoachModePage").then((module) => ({
		default: module.CoachModePage,
	})),
);

function RouteLoadingState() {
	return (
		<div className="card-surface flex min-h-[320px] items-center justify-center p-6">
			<div className="space-y-2 text-center">
				<p className="text-sm font-medium uppercase tracking-[0.18em] text-text-muted dark:text-text-muted-dark">
					Načítavam obrazovku
				</p>
				<p className="text-sm text-text-secondary dark:text-text-secondary-dark">
					Pripravujem ďalšiu tréningovú obrazovku StingFit…
				</p>
			</div>
		</div>
	);
}

function LazyRoute({ children }: { children: ReactNode }) {
	return <Suspense fallback={<RouteLoadingState />}>{children}</Suspense>;
}

function FeatureRoute({
	featureName,
	children,
}: {
	featureName: string;
	children: ReactNode;
}) {
	return (
		<FeatureErrorBoundary featureName={featureName}>
			<LazyRoute>{children}</LazyRoute>
		</FeatureErrorBoundary>
	);
}

export function AppRouter() {
	return useRoutes([
		{ path: "/", element: <Navigate to="/training" replace /> },
		{
			path: "/training",
			element: (
				<FeatureRoute featureName="Tréning">
					<FitnessDashboard />
				</FeatureRoute>
			),
		},
		{
			path: "/quick",
			element: (
				<FeatureRoute featureName="Rýchly tréning">
					<FitnessQuickSessionPage />
				</FeatureRoute>
			),
		},
		{
			path: "/plans",
			element: (
				<LazyRoute>
					<FitnessPlansPage />
				</LazyRoute>
			),
		},
		{
			path: "/history",
			element: (
				<FeatureRoute featureName="História">
					<FitnessHistoryPage />
				</FeatureRoute>
			),
		},
		{
			path: "/stats",
			element: (
				<FeatureRoute featureName="Štatistiky">
					<FitnessStatsPage />
				</FeatureRoute>
			),
		},
		{
			path: "/plates",
			element: (
				<FeatureRoute featureName="Kalkulačka kotúčov">
					<FitnessPlateCalculatorPage />
				</FeatureRoute>
			),
		},
		{
			path: "/settings",
			element: (
				<LazyRoute>
					<FitnessSettingsPage />
				</LazyRoute>
			),
		},
		{
			path: "/coach/clients",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="clients" />
				</FeatureRoute>
			),
		},
		{
			path: "/coach/plans",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="plans" />
				</FeatureRoute>
			),
		},
		{
			path: "/coach/templates",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="templates" />
				</FeatureRoute>
			),
		},
		{
			path: "/coach/recaps",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="recaps" />
				</FeatureRoute>
			),
		},
		{ path: "*", element: <Navigate to="/training" replace /> },
	]);
}
