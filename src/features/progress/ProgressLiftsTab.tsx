import { useMemo, useState } from "react";

import { Dumbbell, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
	buildProgressSnapshot,
	estimateOneRepMaxKg,
	formatKg,
} from "@/features/fitness/fitnessProgress";
import { useFitnessStatsStateQuery } from "@/features/fitness/queries/fitnessQueries";
import type {
	FitnessLiveSession,
	FitnessOneRepMaxSeries,
	FitnessSessionExerciseRecord,
	FitnessSessionSetRecord,
} from "@/features/fitness/fitnessTypes";
import {
	MiniLineChart,
	type LineChartSeries,
} from "@/features/progress/MiniLineChart";

type WorkingSetSample = {
	achievedAt: string;
	weightKg: number;
	reps: number;
	estimatedOneRepMaxKg: number;
};

function buildLiftDescription(series: FitnessOneRepMaxSeries): string {
	const oneRm = formatKg(series.latestEstimatedOneRepMaxKg);
	if (series.deltaKg === null) return `Odhad 1RM: ${oneRm}`;
	const sign = series.deltaKg >= 0 ? "+" : "";
	const delta = formatKg(series.deltaKg);
	return `Odhad 1RM: ${oneRm} (delta ${sign}${delta})`;
}

function topWorkingSetPerSession(
	sessions: FitnessLiveSession[],
	exerciseId: string,
): WorkingSetSample[] {
	return sessions
		.filter((s) => s.status === "completed" && Boolean(s.completedAt))
		.map((session) => {
			const exercise = session.exercises.find(
				(e: FitnessSessionExerciseRecord) => e.exerciseId === exerciseId,
			);
			if (!exercise) return null;
			const workingSets = exercise.sets.filter(
				(s: FitnessSessionSetRecord) =>
					s.status === "completed" && (!s.setType || s.setType === "working"),
			);
			if (workingSets.length === 0) return null;
			const top = workingSets.reduce<FitnessSessionSetRecord | null>(
				(best, set) => {
					if (!best || set.weightKg > best.weightKg) return set;
					return best;
				},
				null,
			);
			if (!top || !session.completedAt) return null;
			return {
				achievedAt: session.completedAt,
				weightKg: top.weightKg,
				reps: top.reps,
				estimatedOneRepMaxKg: estimateOneRepMaxKg(top.weightKg, top.reps),
			} satisfies WorkingSetSample;
		})
		.filter((row): row is WorkingSetSample => row !== null)
		.sort(
			(a, b) =>
				new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime(),
		);
}

export function ProgressLiftsTab() {
	const statsQuery = useFitnessStatsStateQuery();
	const sessions = useMemo(
		() => statsQuery.data?.sessions ?? [],
		[statsQuery.data?.sessions],
	);
	const snapshot = useMemo(() => buildProgressSnapshot(sessions), [sessions]);

	const exerciseOptions: FitnessOneRepMaxSeries[] = useMemo(
		() =>
			snapshot.oneRepMaxSeries
				.slice()
				.sort(
					(a, b) =>
						b.latestEstimatedOneRepMaxKg - a.latestEstimatedOneRepMaxKg,
				),
		[snapshot.oneRepMaxSeries],
	);

	const [explicitExerciseId, setExplicitExerciseId] = useState<string | null>(
		null,
	);

	const selectedExerciseId = useMemo(() => {
		if (
			explicitExerciseId &&
			exerciseOptions.some((s) => s.exerciseId === explicitExerciseId)
		) {
			return explicitExerciseId;
		}
		return exerciseOptions[0]?.exerciseId ?? null;
	}, [exerciseOptions, explicitExerciseId]);

	const selectedSeries = useMemo(
		() =>
			exerciseOptions.find((s) => s.exerciseId === selectedExerciseId) ?? null,
		[exerciseOptions, selectedExerciseId],
	);

	const workingSetSamples = useMemo(() => {
		if (!selectedSeries) return [];
		return topWorkingSetPerSession(sessions, selectedSeries.exerciseId);
	}, [sessions, selectedSeries]);

	if (statsQuery.isPending) {
		return (
			<Card title="Načítavam grafy" description="Pripravujem dáta cvikov…">
				<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
					Lokálne ráta pracovnú váhu a odhad 1RM pre každý cvik.
				</div>
			</Card>
		);
	}

	if (exerciseOptions.length === 0) {
		return (
			<Card
				title="Zatiaľ žiadne dokončené série"
				description="Dokonči aspoň jeden tréning s pracovnou sériou a uvidíš krivku pracovnej váhy a odhad 1RM pre každý cvik."
			>
				<div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/20 bg-black/40 px-4 py-4 text-sm text-fitness-warm/75">
					<Dumbbell className="size-5 text-fitness-yellow" />
					Spusti tréning v sekcii Tréning &gt; Dnes.
				</div>
			</Card>
		);
	}

	const chartSeries: LineChartSeries[] = workingSetSamples.length
		? [
				{
					id: "weight",
					label: "Pracovná váha",
					color: "rgb(250, 204, 21)",
					emphasize: true,
					points: workingSetSamples.map((s) => ({
						x: new Date(s.achievedAt).getTime(),
						y: s.weightKg,
					})),
				},
				{
					id: "e1rm",
					label: "Odhad 1RM",
					color: "rgb(96, 165, 250)",
					points: workingSetSamples.map((s) => ({
						x: new Date(s.achievedAt).getTime(),
						y: s.estimatedOneRepMaxKg,
					})),
				},
			]
		: [];

	const allTimePr = workingSetSamples.reduce<WorkingSetSample | null>(
		(best, sample) => {
			if (!best || sample.weightKg > best.weightKg) return sample;
			return best;
		},
		null,
	);

	return (
		<div className="space-y-6">
			<Card
				title="Vyber cvik"
				description="Cviky sú zoradené podľa najvyššieho odhadu 1RM."
			>
				<div className="flex flex-wrap gap-2">
					{exerciseOptions.map((option) => {
						const isActive = option.exerciseId === selectedExerciseId;
						return (
							<button
								key={option.exerciseId}
								type="button"
								onClick={() => setExplicitExerciseId(option.exerciseId)}
								className={
									isActive
										? "rounded-full border border-fitness-yellow bg-fitness-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black"
										: "rounded-full border border-fitness-yellow/30 bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow"
								}
							>
								{option.exerciseName}
							</button>
						);
					})}
				</div>
			</Card>

			{selectedSeries ? (
				<Card
					title={selectedSeries.exerciseName}
					description={buildLiftDescription(selectedSeries)}
				>
					<MiniLineChart
						series={chartSeries}
						yLabelFormatter={(value) => `${Math.round(value)} kg`}
					/>
					<div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-fitness-warm/75">
						{allTimePr ? (
							<Badge className="fitness-badge inline-flex items-center gap-1">
								<TrendingUp className="size-3" /> PR{" "}
								{formatKg(allTimePr.weightKg)} x {allTimePr.reps}
							</Badge>
						) : null}
						<span>
							Posledných {workingSetSamples.length} tréningov.
						</span>
					</div>
				</Card>
			) : null}
		</div>
	);
}
