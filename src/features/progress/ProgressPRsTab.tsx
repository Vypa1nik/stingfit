import { useMemo, useState } from "react";

import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
	buildProgressSnapshot,
	formatKg,
} from "@/features/fitness/fitnessProgress";
import { useFitnessStatsStateQuery } from "@/features/fitness/queries/fitnessQueries";

export function ProgressPRsTab() {
	const statsQuery = useFitnessStatsStateQuery();
	const sessions = useMemo(
		() => statsQuery.data?.sessions ?? [],
		[statsQuery.data?.sessions],
	);
	const snapshot = useMemo(() => buildProgressSnapshot(sessions), [sessions]);

	const allExercises = useMemo(() => {
		const set = new Set<string>();
		snapshot.prEvents.forEach((event) => set.add(event.exerciseName));
		return Array.from(set).sort();
	}, [snapshot.prEvents]);

	const [exerciseFilter, setExerciseFilter] = useState<string | "all">("all");

	const filteredEvents = useMemo(() => {
		if (exerciseFilter === "all") return snapshot.prEvents;
		return snapshot.prEvents.filter((e) => e.exerciseName === exerciseFilter);
	}, [snapshot.prEvents, exerciseFilter]);

	if (statsQuery.isPending) {
		return (
			<Card title="Načítavam PR timeline" description="Pripravujem dáta…">
				<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
					Lokálne ráta PR udalosti zo všetkých dokončených tréningov.
				</div>
			</Card>
		);
	}

	if (snapshot.prEvents.length === 0) {
		return (
			<Card
				title="Zatiaľ žiadne PR"
				description="Dokonči tréning s pracovnou sériou a sem napadajú odznaky."
			>
				<div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/20 bg-black/40 px-4 py-4 text-sm text-fitness-warm/75">
					<Trophy className="size-5 text-fitness-yellow" />
					PR Timeline ukazuje chronologický feed všetkých 1RM a top-set rekordov.
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card title="Filtre" description="Zúž timeline na jeden cvik.">
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setExerciseFilter("all")}
						className={
							exerciseFilter === "all"
								? "rounded-full border border-fitness-yellow bg-fitness-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black"
								: "rounded-full border border-fitness-yellow/30 bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow"
						}
					>
						Všetky cviky
					</button>
					{allExercises.map((name) => {
						const active = exerciseFilter === name;
						return (
							<button
								key={name}
								type="button"
								onClick={() => setExerciseFilter(name)}
								className={
									active
										? "rounded-full border border-fitness-yellow bg-fitness-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black"
										: "rounded-full border border-fitness-yellow/30 bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow"
								}
							>
								{name}
							</button>
						);
					})}
				</div>
			</Card>

			<div className="space-y-3">
				{filteredEvents.map((event) => (
					<Card
						key={`${event.exerciseId}-${event.achievedAt}-${event.weightKg}-${event.reps}`}
						className="border-l-4 border-l-fitness-yellow"
					>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-wider text-fitness-yellow">
									{event.label}
								</p>
								<h3 className="mt-1 text-base font-bold text-white">
									{event.exerciseName}
								</h3>
								<p className="mt-1 text-sm text-fitness-warm/80">
									{formatKg(event.weightKg)} × {event.reps} — odhad 1RM{" "}
									<span className="font-semibold text-fitness-yellow">
										{formatKg(event.estimatedOneRepMaxKg)}
									</span>
								</p>
							</div>
							<div className="text-right text-xs text-fitness-warm/65">
								<Badge className="fitness-badge inline-flex items-center gap-1">
									<Trophy className="size-3" /> PR
								</Badge>
								<p className="mt-2">
									{event.achievedAt
										? new Date(event.achievedAt).toLocaleDateString("sk-SK", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})
										: "—"}
								</p>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
