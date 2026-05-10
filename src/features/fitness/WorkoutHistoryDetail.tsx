import { useState } from "react";

import { CheckCircle2, Dumbbell } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
	buildProgressSnapshot,
	summarizeSession,
} from "@/features/fitness/fitnessProgress";
import {
	formatTotalCorrectionSummary,
	shouldShowTotalCorrectionSummary,
} from "@/features/fitness/fitnessCorrectionAudit";
import { SetLogger } from "@/features/fitness/SetLogger";
import {
	formatFitnessSetTypeLabel,
	getFitnessSetTypeBadgeClass,
} from "@/features/fitness/fitnessSetTypes";
import type {
	FitnessLiveSession,
	FitnessSessionSetRecord,
	LogFitnessSetInput,
} from "@/features/fitness/fitnessTypes";
import {
	formatVolumeWeight,
	formatWeight,
	type FitnessDisplayUnit,
} from "@/features/fitness/fitnessUnits";
import { cn } from "@/lib/utils";

interface WorkoutHistoryDetailProps {
	session: FitnessLiveSession;
	displayUnit?: FitnessDisplayUnit;
	showGuidance?: boolean;
	isMutating?: boolean;
	onUpdateSet?: (setId: string, input: LogFitnessSetInput) => Promise<void>;
}

export function WorkoutHistoryDetail({
	session,
	displayUnit = "kg",
	showGuidance = true,
	isMutating = false,
	onUpdateSet,
}: WorkoutHistoryDetailProps) {
	const [editingSetId, setEditingSetId] = useState<string | null>(null);
	const summary = summarizeSession(session);
	const progressionHints = buildProgressSnapshot([session]).progressionHints;
	const editingSet =
		session.exercises
			.flatMap((exercise) => exercise.sets)
			.find((set) => set.id === editingSetId) ?? null;

	const submitSetCorrection = async (
		setId: string,
		input: LogFitnessSetInput,
	) => {
		if (!onUpdateSet) return;
		await onUpdateSet(setId, input);
		setEditingSetId(null);
	};

	return (
		<Card
			title="Detail tréningu"
			description="Stabilná snímka toho, čo sa stalo počas dokončeného tréningu."
		>
			<div className="space-y-5">
				<div className="rounded-3xl border border-fitness-yellow/30 bg-black p-5 text-fitness-warm">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
								Dokončený tréning
							</p>
							<h2 className="mt-2 text-2xl font-black text-fitness-yellow">
								{session.name}
							</h2>
							<p className="mt-2 text-sm text-fitness-warm/70">
								{summary.completedSets}/{summary.totalSets} sérií ·{" "}
								{summary.exerciseCount} cvikov ·{" "}
								{formatVolumeWeight(summary.totalVolumeKg, displayUnit)} objem
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							{summary.correctedSetCount > 0 ? (
								<Badge className="border border-fitness-orange/40 bg-fitness-orange/15 text-fitness-warm">
									Obsahuje opravy
								</Badge>
							) : null}
							{shouldShowTotalCorrectionSummary(
								summary.correctedSetCount,
								summary.totalCorrections,
							) ? (
								<Badge className="border border-fitness-orange/40 bg-fitness-orange/15 text-fitness-warm">
									{formatTotalCorrectionSummary(summary.totalCorrections)}
								</Badge>
							) : null}
							<Badge className="bg-fitness-yellow text-black">
								<CheckCircle2 className="mr-1 size-3" />
								Hotovo
							</Badge>
						</div>
					</div>
				</div>

				{showGuidance ? (
					<div className="rounded-3xl border border-fitness-yellow/30 bg-fitness-yellow/10 p-5 text-fitness-warm">
						<Badge className="bg-fitness-yellow text-black">
							Snímka tréningu
						</Badge>
						<h3 className="mt-3 text-lg font-black text-white">
							Úpravy plánu nemenia tento tréning.
						</h3>
						<p className="mt-2 text-sm leading-6 text-fitness-warm/70">
							Tento dokončený tréning si drží poradie cvikov, ciele, poznámky a
							zapísané série tak, ako vznikli počas tréningu.
						</p>
					</div>
				) : null}

				{onUpdateSet ? (
					<div className="rounded-3xl border border-fitness-yellow/30 bg-black/80 p-5 text-fitness-warm">
						<Badge className="bg-fitness-yellow text-black">
							Opravy záznamu
						</Badge>
						<h3 className="mt-3 text-lg font-black text-white">
							Oprav iba preklep v dokončenej sérii.
						</h3>
						<p className="mt-2 text-sm leading-6 text-fitness-warm/70">
							Oprava série prepočíta lokálny objem a PR signály, ale nemení
							plán, poradie cvikov ani tréningovú snímku.
						</p>
					</div>
				) : null}

				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4">
						<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
							RPE tréningu
						</p>
						<p className="mt-2 text-xl font-black text-fitness-yellow">
							{session.sessionRpe === null
								? "Nezapísané"
								: `${session.sessionRpe}/10`}
						</p>
					</div>
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4">
						<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
							Energia
						</p>
						<p className="mt-2 text-xl font-black text-fitness-yellow">
							{session.energyLevel === null
								? "Nezapísané"
								: `${session.energyLevel}/5`}
						</p>
					</div>
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4">
						<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
							Poznámky
						</p>
						<p className="mt-2 text-sm font-bold text-fitness-warm/75">
							{session.notes.trim() || "Bez poznámok k tréningu."}
						</p>
					</div>
				</div>

				{progressionHints.length > 0 ? (
					<div className="rounded-3xl border border-fitness-yellow/30 bg-fitness-yellow/10 p-5">
						<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
							Signál plánu
						</p>
						<div className="mt-3 space-y-3">
							{progressionHints.map((hint) => (
								<div
									key={hint.exerciseId}
									className="rounded-2xl bg-fitness-yellow px-4 py-4 text-sm font-bold text-black"
								>
									<p>
										{hint.exerciseName}: {hint.recommendation}
									</p>
									<p className="mt-1 text-xs font-semibold text-black/70">
										{hint.reason}
									</p>
								</div>
							))}
						</div>
					</div>
				) : null}

				<div className="space-y-3">
					{session.exercises.map((exercise) => {
						const completedSets = exercise.sets.filter(
							(set) => set.status === "completed",
						);
						return (
							<article
								key={exercise.id}
								className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4 text-fitness-warm"
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h3 className="text-sm font-black text-fitness-yellow">
											{exercise.nameSnapshot}
										</h3>
										<p className="mt-1 text-xs text-fitness-warm/65">
											{completedSets.length}/{exercise.sets.length} sérií ·{" "}
											{formatExerciseStatus(exercise.status)}
										</p>
									</div>
									<Dumbbell className="size-4 text-fitness-orange" />
								</div>
								{completedSets.length > 0 ? (
									<div className="mt-3 flex flex-wrap gap-2">
										{completedSets.map((set) => (
											<div key={set.id} className="space-y-3">
												<div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-fitness-yellow/20 px-3 py-1 text-xs font-bold text-fitness-warm/80">
													<span>
														{formatWeight(set.weightKg, displayUnit)} ×{" "}
														{set.reps}
														{set.rir === null ? "" : ` · RIR ${set.rir}`} ·
													</span>{" "}
													<span
														className={cn(
															"rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]",
															getFitnessSetTypeBadgeClass(
																set.setType ?? "working",
															),
														)}
													>
														{formatFitnessSetTypeLabel(
															set.setType ?? "working",
														)}
													</span>
													{formatPerSideWeight(set, displayUnit) ? (
														<span className="rounded-full border border-fitness-yellow/20 bg-fitness-yellow/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-fitness-yellow">
															{formatPerSideWeight(set, displayUnit)}
														</span>
													) : null}
													{formatCorrectionBadge(set) ? (
														<span className="rounded-full border border-fitness-orange/40 bg-fitness-orange/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-fitness-warm">
															{formatCorrectionBadge(set)}
														</span>
													) : null}
													{onUpdateSet ? (
														<Button
															variant="secondary"
															size="sm"
															aria-label={`Opraviť historickú sériu ${set.setNumber} cviku ${exercise.nameSnapshot}`}
															onClick={() => setEditingSetId(set.id)}
															disabled={isMutating}
														>
															Opraviť
														</Button>
													) : null}
												</div>
												{editingSet?.id === set.id ? (
													<SetLogger
														key={`history-edit-${set.id}`}
														set={editingSet}
														displayUnit={displayUnit}
														onLog={submitSetCorrection}
														disabled={isMutating}
														titleLabel="Oprava série"
														submitLabel="Uložiť opravu série"
														showLastPerformance={false}
														showRestCue={false}
														armRestSignal={false}
														sticky={false}
														onCancel={() => setEditingSetId(null)}
													/>
												) : null}
											</div>
										))}
									</div>
								) : (
									<p className="mt-3 text-xs text-fitness-warm/50">
										Žiadne dokončené série.
									</p>
								)}
							</article>
						);
					})}
				</div>
			</div>
		</Card>
	);
}

function formatCorrectionBadge(set: FitnessSessionSetRecord) {
	const correctionCount = set.correctionCount ?? 0;
	return correctionCount > 0 ? `Opravené ${correctionCount}×` : null;
}

function formatPerSideWeight(
	set: FitnessSessionSetRecord,
	displayUnit: FitnessDisplayUnit,
) {
	if (
		set.weightEntryMode !== "per_side" ||
		set.leftWeightKg === null ||
		set.leftWeightKg === undefined ||
		set.rightWeightKg === null ||
		set.rightWeightKg === undefined
	) {
		return null;
	}

	return `Ľ ${formatWeightValue(set.leftWeightKg, displayUnit)} / P ${formatWeightValue(set.rightWeightKg, displayUnit)} ${displayUnit}`;
}

function formatWeightValue(weightKg: number, displayUnit: FitnessDisplayUnit) {
	return formatWeight(weightKg, displayUnit).replace(` ${displayUnit}`, "");
}

function formatExerciseStatus(status: string) {
	if (status === "active") return "aktívny";
	if (status === "pending") return "čaká";
	if (status === "done") return "hotovo";
	if (status === "skipped") return "preskočený";
	return status;
}
