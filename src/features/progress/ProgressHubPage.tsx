import { useMemo } from "react";

import { Activity, BookOpen, History, LineChart, Trophy } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buildProgressSnapshot } from "@/features/fitness/fitnessProgress";
import { formatWeight } from "@/features/fitness/fitnessUnits";
import { useFitnessStatsStateQuery } from "@/features/fitness/queries/fitnessQueries";
import { ProgressBodyTab } from "@/features/progress/ProgressBodyTab";
import { ProgressJournalTab } from "@/features/progress/ProgressJournalTab";
import { ProgressLiftsTab } from "@/features/progress/ProgressLiftsTab";
import { ProgressPRsTab } from "@/features/progress/ProgressPRsTab";
import { sk } from "@/i18n/sk";
import { cn } from "@/lib/utils";

export type ProgressHubTab = "lifts" | "prs" | "body" | "journal";

interface ProgressHubPageProps {
	tab: ProgressHubTab;
}

interface ProgressTabDef {
	id: ProgressHubTab;
	label: string;
	path: string;
	icon: typeof LineChart;
}

const progressHubCopy = sk.fitness.progressHub;

const PROGRESS_TABS: ProgressTabDef[] = [
	{ id: "lifts", label: progressHubCopy.tabs.lifts, path: "/progress/lifts", icon: LineChart },
	{ id: "prs", label: progressHubCopy.tabs.prs, path: "/progress/prs", icon: Trophy },
	{ id: "body", label: progressHubCopy.tabs.body, path: "/progress/body", icon: Activity },
	{ id: "journal", label: progressHubCopy.tabs.journal, path: "/progress/journal", icon: BookOpen },
];

export function ProgressHubPage({ tab }: ProgressHubPageProps) {
	const navigate = useNavigate();
	const statsQuery = useFitnessStatsStateQuery();
	const sessions = useMemo(
		() => statsQuery.data?.sessions ?? [],
		[statsQuery.data?.sessions],
	);
	const settings = statsQuery.data?.settings ?? {
		displayUnit: "kg" as const,
		showGuidance: true,
		restSoundEnabled: true,
		restVibrationEnabled: true,
		updatedAt: null,
	};
	const snapshot = useMemo(() => buildProgressSnapshot(sessions), [sessions]);
	const bestPr = snapshot.prEvents[0] ?? null;

	return (
		<div className="space-y-6">
			<section className="fitness-hero-panel p-6 lg:p-8">
				<div className="flex flex-wrap items-center gap-3">
					<Badge className="fitness-badge">{progressHubCopy.badge}</Badge>
					<span className="text-sm text-fitness-yellow/80">
						{progressHubCopy.kicker}
					</span>
				</div>
				<h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
					{progressHubCopy.title}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
					{progressHubCopy.description}
				</p>
			</section>

			<section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Card title={progressHubCopy.cards.consistency}>
					<p className="text-2xl font-black text-fitness-yellow">
						{snapshot.weeklyConsistencyLabel}
					</p>
					<p className="mt-1 text-xs text-fitness-warm/65">
						{progressHubCopy.cards.completedWorkouts(snapshot.completedWorkouts)}
					</p>
				</Card>
				<Card title={progressHubCopy.cards.weeklyVolume}>
					<p className="text-2xl font-black text-fitness-yellow">
						{formatWeight(snapshot.totalVolumeKg, settings.displayUnit)}
					</p>
					<p className="mt-1 text-xs text-fitness-warm/65">
						{snapshot.volumeTrendLabel}
					</p>
				</Card>
				<Card title={progressHubCopy.cards.lastPr}>
					{bestPr ? (
						<>
							<p className="text-base font-bold text-white">
								{bestPr.exerciseName}
							</p>
							<p className="mt-1 text-sm text-fitness-yellow">
								{bestPr.label}
							</p>
						</>
					) : (
						<p className="text-sm text-fitness-warm/65">
							{progressHubCopy.cards.emptyPr}
						</p>
					)}
				</Card>
			</section>

			<nav
				aria-label={progressHubCopy.tabs.ariaLabel}
				className="flex flex-wrap items-center gap-2"
			>
				{PROGRESS_TABS.map((definition) => {
					const Icon = definition.icon;
					const isActive = definition.id === tab;
					return (
						<button
							key={definition.id}
							type="button"
							onClick={() => navigate(definition.path)}
							className={cn(
								"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150",
								isActive
									? "border-fitness-yellow bg-fitness-yellow text-black"
									: "border-fitness-yellow/30 bg-black text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow",
							)}
						>
							<Icon className="size-3.5" />
							{definition.label}
						</button>
					);
				})}
				<NavLink
					to="/progress/history"
					className={({ isActive }) =>
						cn(
							"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150",
							isActive
								? "border-fitness-yellow bg-fitness-yellow text-black"
								: "border-fitness-yellow/30 bg-black text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow",
						)
					}
				>
					<History className="size-3.5" />
					{progressHubCopy.tabs.history}
				</NavLink>
			</nav>

			{tab === "lifts" ? <ProgressLiftsTab /> : null}
			{tab === "prs" ? <ProgressPRsTab /> : null}
			{tab === "body" ? <ProgressBodyTab /> : null}
			{tab === "journal" ? <ProgressJournalTab /> : null}
		</div>
	);
}
