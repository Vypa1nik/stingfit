import { useMemo } from "react";

import { Activity, BookOpen, History, LineChart, Trophy } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
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
	{
		id: "lifts",
		label: progressHubCopy.tabs.lifts,
		path: "/progress/lifts",
		icon: LineChart,
	},
	{
		id: "prs",
		label: progressHubCopy.tabs.prs,
		path: "/progress/prs",
		icon: Trophy,
	},
	{
		id: "body",
		label: progressHubCopy.tabs.body,
		path: "/progress/body",
		icon: Activity,
	},
	{
		id: "journal",
		label: progressHubCopy.tabs.journal,
		path: "/progress/journal",
		icon: BookOpen,
	},
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
			<section className="fitness-hero-panel relative p-4 sm:p-6 lg:p-8">
				<div className="wasp-stripes absolute inset-0 opacity-25" />
				<div className="relative grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
					<div className="rounded-[2rem] border border-fitness-yellow/20 bg-black/70 p-5">
						<div className="flex flex-wrap items-center gap-3">
							<Badge className="fitness-badge">{progressHubCopy.badge}</Badge>
							<span className="rounded-full border border-fitness-yellow/25 bg-black/60 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow/80">
								{progressHubCopy.kicker}
							</span>
						</div>
						<h1 className="mt-4 text-4xl font-black leading-none tracking-[-0.06em] text-white sm:text-6xl">
							{progressHubCopy.title}
						</h1>
						<p className="mt-4 max-w-xl text-sm leading-6 text-fitness-warm/75 sm:text-base">
							{progressHubCopy.description}
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-[1.75rem] border border-fitness-yellow/30 bg-fitness-yellow p-4 text-black">
							<p className="text-xs font-black uppercase tracking-[0.16em] text-black/60">
								{progressHubCopy.cards.consistency}
							</p>
							<p className="mt-3 text-3xl font-black tracking-[-0.04em]">
								{snapshot.weeklyConsistencyLabel}
							</p>
							<p className="mt-2 text-xs font-semibold text-black/65">
								{progressHubCopy.cards.completedWorkouts(snapshot.completedWorkouts)}
							</p>
						</div>
						<div className="rounded-[1.75rem] border border-fitness-yellow/25 bg-black/80 p-4 text-fitness-warm">
							<p className="text-xs font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
								{progressHubCopy.cards.weeklyVolume}
							</p>
							<p className="mt-3 text-3xl font-black tracking-[-0.04em] text-fitness-yellow">
								{formatWeight(snapshot.totalVolumeKg, settings.displayUnit)}
							</p>
							<p className="mt-2 text-xs text-fitness-warm/65">
								{snapshot.volumeTrendLabel}
							</p>
						</div>
						<div className="rounded-[1.75rem] border border-fitness-yellow/25 bg-black/80 p-4 text-fitness-warm">
							<p className="text-xs font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
								{progressHubCopy.cards.lastPr}
							</p>
							{bestPr ? (
								<>
									<p className="mt-3 text-base font-black text-white">
										{bestPr.exerciseName}
									</p>
									<p className="mt-1 text-sm text-fitness-yellow">
										{bestPr.label}
									</p>
								</>
							) : (
								<p className="mt-3 text-sm leading-6 text-fitness-warm/65">
									{progressHubCopy.cards.emptyPr}
								</p>
							)}
						</div>
					</div>
				</div>
			</section>

			<nav
				aria-label={progressHubCopy.tabs.ariaLabel}
				className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
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
								"min-h-20 rounded-3xl border p-3 text-left transition-colors duration-150",
								isActive
									? "border-fitness-yellow bg-fitness-yellow text-black"
									: "border-fitness-yellow/30 bg-black/70 text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow",
							)}
						>
							<Icon className="size-5" />
							<span className="mt-3 block text-sm font-black uppercase tracking-[0.12em]">
								{definition.label}
							</span>
						</button>
					);
				})}
				<NavLink
					to="/progress/history"
					className={({ isActive }) =>
						cn(
							"min-h-20 rounded-3xl border p-3 text-left transition-colors duration-150",
							isActive
								? "border-fitness-yellow bg-fitness-yellow text-black"
								: "border-fitness-yellow/30 bg-black/70 text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow",
						)
					}
				>
					<History className="size-5" />
					<span className="mt-3 block text-sm font-black uppercase tracking-[0.12em]">
						{progressHubCopy.tabs.history}
					</span>
				</NavLink>
			</nav>

			{tab === "lifts" ? <ProgressLiftsTab /> : null}
			{tab === "prs" ? <ProgressPRsTab /> : null}
			{tab === "body" ? <ProgressBodyTab /> : null}
			{tab === "journal" ? <ProgressJournalTab /> : null}
		</div>
	);
}
