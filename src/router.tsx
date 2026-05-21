import { lazy, Suspense, type ReactNode } from "react";

import { Navigate, useLocation, useRoutes } from "react-router-dom";

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
const ProgressHubPage = lazy(() =>
	import("@/features/progress/ProgressHubPage").then((module) => ({
		default: module.ProgressHubPage,
	})),
);

export interface LegacyRedirectInfo {
	kind: "v2-deprecation";
	from: string;
	to: string;
}

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

function readLocationState(state: unknown): Record<string, unknown> {
	return state && typeof state === "object" && !Array.isArray(state)
		? (state as Record<string, unknown>)
		: {};
}

function preserveSearch(to: string, search: string) {
	return `${to}${search}`;
}

function LegacyRedirect({ from, to }: { from: string; to: string }) {
	const location = useLocation();
	const state = readLocationState(location.state);

	return (
		<Navigate
			to={preserveSearch(to, location.search)}
			replace
			state={{
				...state,
				legacyRedirect: {
					kind: "v2-deprecation",
					from,
					to,
				} satisfies LegacyRedirectInfo,
			}}
		/>
	);
}

function ForwardRedirect({ to }: { to: string }) {
	const location = useLocation();

	return (
		<Navigate
			to={preserveSearch(to, location.search)}
			replace
			state={readLocationState(location.state)}
		/>
	);
}

export function AppRouter() {
	return useRoutes([
		// Root → Train hub
		{ path: "/", element: <Navigate to="/train" replace /> },

		// === TRAIN pillar ===========================================
		{
			path: "/train",
			element: (
				<FeatureRoute featureName="Tréning">
					<FitnessDashboard />
				</FeatureRoute>
			),
		},
		{
			path: "/train/quick",
			element: (
				<FeatureRoute featureName="Rýchly tréning">
					<FitnessQuickSessionPage />
				</FeatureRoute>
			),
		},
		// /train/live is rendered inline inside FitnessDashboard; the URL
		// alias just lands users at the same dashboard.
		{ path: "/train/live", element: <Navigate to="/train" replace /> },

		// V2 redirects
		{ path: "/training", element: <LegacyRedirect from="/training" to="/train" /> },
		{ path: "/quick", element: <LegacyRedirect from="/quick" to="/train/quick" /> },

		// === PROGRESS pillar (NEW) ==================================
		{ path: "/progress", element: <ForwardRedirect to="/progress/lifts" /> },
		{
			path: "/progress/lifts",
			element: (
				<FeatureRoute featureName="Progres — Cviky">
					<ProgressHubPage tab="lifts" />
				</FeatureRoute>
			),
		},
		{
			path: "/progress/prs",
			element: (
				<FeatureRoute featureName="Progres — PR Timeline">
					<ProgressHubPage tab="prs" />
				</FeatureRoute>
			),
		},
		{
			path: "/progress/body",
			element: (
				<FeatureRoute featureName="Progres — Telo">
					<ProgressHubPage tab="body" />
				</FeatureRoute>
			),
		},
		{
			path: "/progress/journal",
			element: (
				<FeatureRoute featureName="Progres — Zápisník">
					<ProgressHubPage tab="journal" />
				</FeatureRoute>
			),
		},
		{
			path: "/progress/history",
			element: (
				<FeatureRoute featureName="Progres — História">
					<FitnessHistoryPage />
				</FeatureRoute>
			),
		},

		// V2 redirects → Progress
		{ path: "/stats", element: <LegacyRedirect from="/stats" to="/progress" /> },
		{ path: "/history", element: <LegacyRedirect from="/history" to="/progress/history" /> },

		// === PLANS pillar ===========================================
		{
			path: "/plans",
			element: (
				<LazyRoute>
					<FitnessPlansPage />
				</LazyRoute>
			),
		},

		// Coach Mode (V3 nests under /plans, V2 URLs keep redirecting)
		{
			path: "/plans/coach/clients",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="clients" />
				</FeatureRoute>
			),
		},
		{
			path: "/plans/coach/plans",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="plans" />
				</FeatureRoute>
			),
		},
		{
			path: "/plans/coach/templates",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="templates" />
				</FeatureRoute>
			),
		},
		{
			path: "/plans/coach/recaps",
			element: (
				<FeatureRoute featureName="Coach Mode">
					<CoachModePage section="recaps" />
				</FeatureRoute>
			),
		},

		// V2 coach URL redirects
		{
			path: "/coach/clients",
			element: <LegacyRedirect from="/coach/clients" to="/plans/coach/clients" />,
		},
		{
			path: "/coach/plans",
			element: <LegacyRedirect from="/coach/plans" to="/plans/coach/plans" />,
		},
		{
			path: "/coach/templates",
			element: <LegacyRedirect from="/coach/templates" to="/plans/coach/templates" />,
		},
		{
			path: "/coach/recaps",
			element: <LegacyRedirect from="/coach/recaps" to="/plans/coach/recaps" />,
		},

		// === TOOLS ==================================================
		{
			path: "/tools/plates",
			element: (
				<FeatureRoute featureName="Kalkulačka kotúčov">
					<FitnessPlateCalculatorPage />
				</FeatureRoute>
			),
		},
		// V2 redirect
		{ path: "/plates", element: <LegacyRedirect from="/plates" to="/tools/plates" /> },

		// === SETTINGS ===============================================
		{
			path: "/settings",
			element: (
				<LazyRoute>
					<FitnessSettingsPage />
				</LazyRoute>
			),
		},

		// Fallback
		{ path: "*", element: <Navigate to="/train" replace /> },
	]);
}
