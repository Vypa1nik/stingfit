import { useMemo, useState } from "react";

import { AlertTriangle, Clock3, Dumbbell, Trophy, Zap } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkoutHistoryDetail } from "@/features/fitness/WorkoutHistoryDetail";
import {
	formatCorrectedSetSummary,
	formatTotalCorrectionSummary,
	shouldShowTotalCorrectionSummary,
} from "@/features/fitness/fitnessCorrectionAudit";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import { summarizeSession } from "@/features/fitness/fitnessProgress";
import {
	invalidateFitnessQueries,
	useFitnessCompletedHistoryQuery,
} from "@/features/fitness/queries/fitnessQueries";
import { pickRecommendedWorkout } from "@/features/fitness/fitnessWorkoutRecommendation";
import type {
	FitnessLiveSession,
	FitnessSessionSetRecord,
	LogFitnessSetInput,
} from "@/features/fitness/fitnessTypes";
import {
	formatVolumeWeight,
	formatWeight,
} from "@/features/fitness/fitnessUnits";
import { useSpaNavigate } from "@/hooks/useSpaNavigate";
import { sk } from "@/i18n/sk";

export function FitnessHistoryPage() {
	const navigate = useSpaNavigate();
	const historyQuery = useFitnessCompletedHistoryQuery();
	const sessions = useMemo(
		() => historyQuery.data?.sessions ?? [],
		[historyQuery.data?.sessions],
	);
	const startableWorkouts = useMemo(
		() => historyQuery.data?.startableWorkouts ?? [],
		[historyQuery.data?.startableWorkouts],
	);
	const settings = historyQuery.data?.settings ?? {
		displayUnit: "kg",
		showGuidance: true,
		restSoundEnabled: true,
		restVibrationEnabled: true,
		updatedAt: null,
	};
	const isLoading = historyQuery.isPending;
	const queryError = historyQuery.error
		? historyQuery.error instanceof Error
			? historyQuery.error.message
			: sk.fitness.history.queryError
		: null;
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);
	const [historyFilter, setHistoryFilter] = useState("");
	const [correctionFilter, setCorrectionFilter] = useState<"all" | "corrected">(
		"all",
	);
	const [isMutating, setIsMutating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const displayError = error ?? queryError;

	const filteredSessions = useMemo(
		() => filterHistorySessions(sessions, historyFilter, correctionFilter),
		[sessions, historyFilter, correctionFilter],
	);
	const summaries = useMemo(
		() => filteredSessions.map(summarizeSession),
		[filteredSessions],
	);
	const latestSession = sessions[0] ?? null;
	const latestSummary = useMemo(
		() => (latestSession ? summarizeSession(latestSession) : null),
		[latestSession],
	);
	const latestBestSet = useMemo(
		() => (latestSession ? findBestCompletedSet(latestSession) : null),
		[latestSession],
	);
	const selectedSession =
		filteredSessions.find((session) => session.id === selectedSessionId) ??
		filteredSessions[0] ??
		null;
	const hasActiveHistoryFilters =
		historyFilter.trim().length > 0 || correctionFilter !== "all";
	const isPostWorkoutHandoff = hasPostWorkoutHandoffIntent();
	const nextWorkoutRecommendation = useMemo(
		() =>
			isPostWorkoutHandoff
				? pickRecommendedWorkout(startableWorkouts, sessions)
				: null,
		[isPostWorkoutHandoff, sessions, startableWorkouts],
	);

	const updateHistorySet = async (setId: string, input: LogFitnessSetInput) => {
		setIsMutating(true);
		setError(null);
		setSuccessMessage(null);
		try {
			await fitnessRepository.updateLoggedSet(setId, input);
			await invalidateFitnessQueries();
			setSuccessMessage(sk.fitness.history.updateSetSuccess);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: sk.fitness.history.updateSetError,
			);
		} finally {
			setIsMutating(false);
		}
	};


	return (
		<div className="space-y-6">
			<section className="fitness-hero-panel p-6 lg:p-8">
				<Badge className="fitness-badge">{sk.fitness.history.badge}</Badge>
				<h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
					{sk.fitness.history.heroTitle}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
					{sk.fitness.history.heroDescription}
				</p>
			</section>

			{successMessage ? (
				<HistoryStatusMessage tone="success" message={successMessage} />
			) : null}

			{isLoading ? (
				<Card
					title={sk.fitness.history.loadingTitle}
					description={sk.fitness.history.loadingDescription}
				>
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
						{sk.fitness.history.loadingBody}
					</div>
				</Card>
			) : null}

			{displayError ? (
				<Card
					title={sk.fitness.history.errorTitle}
					description={sk.fitness.history.errorDescription}
				>
					<div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
						<AlertTriangle className="mr-2 inline size-4" />
						{displayError}
					</div>
				</Card>
			) : null}

			{!isLoading && !displayError && sessions.length === 0 ? (
				<EmptyState
					icon={Dumbbell}
					title={sk.fitness.history.emptyTitle}
					description={sk.fitness.history.emptyDescription}
					ctaLabel={sk.fitness.history.emptyCta}
					onCta={() => navigate("/training")}
				/>
			) : null}

			{!isLoading && !displayError && sessions.length > 0 ? (
				<>
					{latestSession && latestSummary ? (
						<Card
							title={
								isPostWorkoutHandoff
									? "Práve dokončený tréning"
									: "Posledný výsledok"
							}
							description={
								isPostWorkoutHandoff
									? "Toto je výsledok tréningu, ktorý si práve uložil. Detailné úpravy sú nižšie, iba ak ich potrebuješ."
									: "Najprv jednoduchý záver. Detailné filtre a staršie tréningy otvoríš až keď ich potrebuješ."
							}
						>
							<div className="rounded-3xl border border-fitness-yellow/30 bg-black p-5 text-fitness-warm">
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<Badge className="bg-fitness-yellow text-black">
											Hotovo
										</Badge>
										<h2 className="mt-3 text-2xl font-black text-fitness-yellow">
											Hotovo: {latestSession.name}
										</h2>
										<p className="mt-2 text-sm text-fitness-warm/70">
											{isPostWorkoutHandoff
												? "Toto je tvoj práve dokončený tréning. Ak čísla sedia, nemusíš robiť nič."
												: "Toto je tvoj posledný uložený tréning. Ak chceš, pozri detail alebo oprav preklep nižšie."}
										</p>
									</div>
									<button
										type="button"
										className="min-h-11 rounded-full border border-fitness-yellow/40 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black"
										onClick={() => setSelectedSessionId(latestSession.id)}
									>
										Pozrieť detail
									</button>
								</div>
								<div className="mt-5 grid gap-3 sm:grid-cols-3">
									<div className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4">
										<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
											Objem
										</p>
										<p className="mt-2 text-xl font-black text-white">
											{formatVolumeWeight(
												latestSummary.totalVolumeKg,
												settings.displayUnit,
											)}
										</p>
									</div>
									<div className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4">
										<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
											Série
										</p>
										<p className="mt-2 text-xl font-black text-white">
											{latestSummary.completedSets}/{latestSummary.totalSets}
										</p>
									</div>
									<div className="rounded-2xl border border-fitness-yellow/20 bg-black/80 px-4 py-4">
										<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
											Cviky
										</p>
										<p className="mt-2 text-xl font-black text-white">
											{latestSummary.exerciseCount}
										</p>
									</div>
								</div>
								<div className="mt-3 rounded-2xl border border-fitness-yellow/20 bg-fitness-yellow/10 px-4 py-4">
									<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
										Najlepší zápis
									</p>
									<p className="mt-2 text-sm font-black text-white">
										{latestBestSet
											? `${latestBestSet.exerciseName} · ${formatWeight(latestBestSet.set.weightKg, settings.displayUnit)} × ${latestBestSet.set.reps}`
											: "Zatiaľ bez zapísanej série."}
									</p>
								</div>
								{isPostWorkoutHandoff ? (
									<div className="mt-3 rounded-2xl border border-fitness-yellow/25 bg-black/80 px-4 py-4">
										<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
											Čo spraviť nabudúce
										</p>
										{nextWorkoutRecommendation ? (
											<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
												<div>
													<p className="text-sm font-black text-white">
														Nabudúce ťa čaká:{" "}
														{nextWorkoutRecommendation.workout.workoutName}
													</p>
													<p className="mt-1 text-sm font-semibold leading-6 text-fitness-warm/75">
														Ak čísla sedia, nemusíš robiť nič. StingFit ti tento
														tréning ukáže aj na obrazovke Tréning.
													</p>
												</div>
												<button
													type="button"
													className="min-h-11 rounded-full border border-fitness-yellow/40 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black"
													onClick={() => navigate("/training")}
												>
													Otvoriť Tréning
												</button>
											</div>
										) : (
											<p className="mt-2 text-sm font-semibold leading-6 text-fitness-warm/75">
												Ak čísla sedia, nemusíš robiť nič. Nabudúce otvor
												Tréning a StingFit ti ukáže ďalší jednoduchý krok.
											</p>
										)}
									</div>
								) : null}
							</div>
						</Card>
					) : null}

					<details className="rounded-3xl border border-fitness-yellow/20 bg-black/55 p-4 text-fitness-warm">
						<summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-fitness-yellow">
							Vybrať starší tréning alebo filtrovať
						</summary>
						<p className="mt-2 text-sm text-fitness-warm/65">
							Otvor iba vtedy, keď hľadáš starší tréning, opravený záznam alebo
							konkrétny cvik.
						</p>
						<div className="mt-4 space-y-6">
							<Card
								title="Filter histórie"
								description="Rýchlo nájdi tréning podľa názvu tréningu, cviku alebo zobraz len opravené záznamy."
							>
								<div className="grid gap-3 lg:grid-cols-[1fr,auto]">
									<label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
										Hľadať
										<input
											aria-label="Filter histórie podľa tréningu alebo cviku"
											className="mt-2 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-3 py-3 text-sm font-bold text-fitness-warm outline-none focus:border-fitness-yellow"
											value={historyFilter}
											onInput={(event) =>
												setHistoryFilter(event.currentTarget.value)
											}
											placeholder="Napr. Tlak na lavičke, Ťahový deň…"
										/>
									</label>
									<div className="flex flex-wrap items-end gap-2">
										<button
											type="button"
											aria-label="Zobraziť všetky tréningy"
											className={
												correctionFilter === "all"
													? "min-h-11 rounded-2xl border border-fitness-yellow bg-fitness-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black"
													: "min-h-11 rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-fitness-yellow"
											}
											onClick={() => setCorrectionFilter("all")}
										>
											Všetky
										</button>
										<button
											type="button"
											aria-label="Zobraziť iba tréningy s opravami"
											className={
												correctionFilter === "corrected"
													? "min-h-11 rounded-2xl border border-fitness-yellow bg-fitness-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black"
													: "min-h-11 rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-fitness-yellow"
											}
											onClick={() => setCorrectionFilter("corrected")}
										>
											S opravami
										</button>
										<button
											type="button"
											aria-label="Vymazať filter histórie"
											className="min-h-11 rounded-2xl border border-fitness-warm/20 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-fitness-warm/70 transition-colors hover:border-fitness-yellow hover:text-fitness-yellow disabled:cursor-not-allowed disabled:opacity-40"
											disabled={!hasActiveHistoryFilters}
											onClick={() => {
												setHistoryFilter("");
												setCorrectionFilter("all");
											}}
										>
											Vymazať
										</button>
									</div>
								</div>
								<p className="mt-3 text-xs font-bold text-fitness-warm/65">
									Výsledky filtra: {filteredSessions.length}
								</p>
							</Card>

							<Card
								title="Nedávne tréningy"
								description="Dokončené tréningy sú zoradené od najnovších; objem sa počíta iba zo zapísaných sérií."
							>
								{filteredSessions.length > 0 ? (
									<div data-testid="history-session-list" className="space-y-3">
										{summaries.map((summary) => {
											const selected =
												summary.sessionId === selectedSession?.id;
											return (
												<article
													key={summary.sessionId}
													className={
														selected
															? "rounded-2xl border border-fitness-yellow bg-fitness-yellow/10 px-4 py-4 text-fitness-warm"
															: "rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm"
													}
												>
													<div className="flex flex-wrap items-center justify-between gap-4">
														<div>
															<h2 className="text-sm font-black text-fitness-yellow">
																{summary.name}
															</h2>
															<div className="mt-2 flex flex-wrap gap-3 text-xs text-fitness-warm/70">
																<span className="inline-flex items-center gap-1">
																	<Clock3 className="size-3.5" />
																	{summary.completedAt
																		? new Date(
																				summary.completedAt,
																			).toLocaleDateString()
																		: "Dokončené"}
																</span>
																<span>
																	{formatVolumeWeight(
																		summary.totalVolumeKg,
																		settings.displayUnit,
																	)}
																</span>
																<span>
																	{summary.completedSets}/{summary.totalSets}{" "}
																	sérií
																</span>
																{summary.correctedSetCount > 0 ? (
																	<span>
																		{formatCorrectedSetSummary(
																			summary.correctedSetCount,
																		)}
																	</span>
																) : null}
																{shouldShowTotalCorrectionSummary(
																	summary.correctedSetCount,
																	summary.totalCorrections,
																) ? (
																	<span>
																		{formatTotalCorrectionSummary(
																			summary.totalCorrections,
																		)}
																	</span>
																) : null}
															</div>
														</div>
														<div className="flex flex-wrap items-center gap-2">
															{summary.correctedSetCount > 0 ? (
																<Badge className="border border-fitness-orange/40 bg-fitness-orange/15 text-fitness-warm">
																	Obsahuje opravy
																</Badge>
															) : null}
															<Badge className="bg-fitness-yellow text-black">
																<Trophy className="mr-1 size-3" />
																{selected
																	? "Vybraný detail"
																	: "História nabitá"}
															</Badge>
															<button
																type="button"
																aria-label={`Zobraziť detail tréningu ${summary.name}`}
																className="rounded-full border border-fitness-yellow/30 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black"
																onClick={() =>
																	setSelectedSessionId(summary.sessionId)
																}
															>
																Zobraziť detail
															</button>
														</div>
													</div>
												</article>
											);
										})}
									</div>
								) : (
									<div className="rounded-2xl border border-dashed border-fitness-yellow/30 bg-black px-4 py-4 text-sm font-semibold text-fitness-warm/70">
										Žiadne tréningy nezodpovedajú filtru.
									</div>
								)}
							</Card>
						</div>
					</details>

					{selectedSession ? (
						<div data-testid="selected-history-session">
							<WorkoutHistoryDetail
								session={selectedSession}
								displayUnit={settings.displayUnit}
								showGuidance={settings.showGuidance}
								isMutating={isMutating}
								onUpdateSet={updateHistorySet}
							/>
						</div>
					) : null}
				</>
			) : null}

			{settings.showGuidance ? (
				<Card
					title="Signály progresu"
					description="Transparentné lokálne odporúčania iba z dokončených tréningov."
				>
					<div className="flex items-center gap-3 rounded-2xl border border-dashed border-fitness-yellow/40 bg-fitness-yellow/10 px-4 py-4 text-sm text-text-secondary dark:text-text-secondary-dark">
						<Zap className="size-5 text-fitness-orange" />
						PR a odporúčania progresu sú odvodené z dokončených lokálnych
						tréningov.
					</div>
				</Card>
			) : null}
		</div>
	);
}

function filterHistorySessions(
	sessions: FitnessLiveSession[],
	filter: string,
	correctionFilter: "all" | "corrected",
) {
	const normalizedFilter = normalizeFilterText(filter);
	return sessions.filter((session) => {
		const summary = summarizeSession(session);
		if (correctionFilter === "corrected" && summary.correctedSetCount === 0) {
			return false;
		}

		if (!normalizedFilter) {
			return true;
		}

		const searchableText = normalizeFilterText(
			[
				session.name,
				session.notes,
				...session.exercises.map((exercise) => exercise.nameSnapshot),
			].join(" "),
		);
		return searchableText.includes(normalizedFilter);
	});
}

function findBestCompletedSet(
	session: FitnessLiveSession,
): { exerciseName: string; set: FitnessSessionSetRecord } | null {
	return (
		session.exercises
			.flatMap((exercise) =>
				exercise.sets
					.filter((set) => set.status === "completed")
					.map((set) => ({ exerciseName: exercise.nameSnapshot, set })),
			)
			.sort(
				(left, right) =>
					right.set.weightKg * right.set.reps -
					left.set.weightKg * left.set.reps,
			)[0] ?? null
	);
}

function hasPostWorkoutHandoffIntent() {
	if (typeof window === "undefined") {
		return false;
	}

	const hash = window.location.hash;
	const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
	const params = new URLSearchParams(hashQuery || window.location.search);
	return params.get("from") === "finish";
}

function normalizeFilterText(value: string) {
	return value
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLocaleLowerCase("sk");
}

function HistoryStatusMessage({
	tone,
	message,
}: {
	tone: "success" | "error";
	message: string;
}) {
	const isError = tone === "error";
	return (
		<div
			className={
				isError
					? "rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
					: "rounded-2xl border border-fitness-yellow/40 bg-fitness-yellow/10 px-4 py-3 text-sm font-semibold text-fitness-yellow"
			}
		>
			{isError ? (
				<AlertTriangle className="mr-2 inline size-4" />
			) : (
				<Zap className="mr-2 inline size-4" />
			)}
			{message}
		</div>
	);
}
