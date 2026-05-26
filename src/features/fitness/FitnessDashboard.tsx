import { useEffect, useRef, useState } from "react";

import {
	Activity,
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	ClipboardList,
	Download,
	Dumbbell,
	Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FeatureErrorBoundary } from "@/components/ui/FeatureErrorBoundary";
import { LiveTrainingSession } from "@/features/fitness/LiveTrainingSession";
import { SimpleStartBuilder } from "@/features/fitness/SimpleStartBuilder";
import {
	FITNESS_BACKUP_NUDGE_STORAGE_KEY,
	shouldShowBackupNudge,
} from "@/features/fitness/fitnessBackupNudge";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import { progressRepository } from "@/features/progress/progressRepository";
import {
	invalidateFitnessQueries,
	useFitnessTrainingStateQuery,
} from "@/features/fitness/queries/fitnessQueries";
import type { FitnessWorkoutRecommendation } from "@/features/fitness/fitnessWorkoutRecommendation";
import type { FitnessSimpleStartChoice } from "@/features/fitness/fitnessSimpleStart";
import type {
	AddUnplannedExerciseInput,
	FinishFitnessSessionInput,
	FitnessLiveSession,
	FitnessRecoverySignal,
	FitnessRecoverySignalSeverity,
	FitnessStartableWorkout,
	LogFitnessSetInput,
} from "@/features/fitness/fitnessTypes";
import { useSpaNavigate } from "@/hooks/useSpaNavigate";
import { sk } from "@/i18n/sk";
import { downloadBlob } from "@/lib/download";

interface FitnessDashboardProps {
	autoStartQuick?: boolean;
}

interface PostWorkoutActionState {
	sessionName: string;
}

const trainHubCopy = sk.fitness.trainHub;

function readBackupNudgeDismissedCount() {
	const stored = window.localStorage.getItem(FITNESS_BACKUP_NUDGE_STORAGE_KEY);
	const count = Number(stored);
	return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

function writeBackupNudgeDismissedCount(completedSessionCount: number) {
	window.localStorage.setItem(
		FITNESS_BACKUP_NUDGE_STORAGE_KEY,
		String(Math.max(0, Math.floor(completedSessionCount))),
	);
}

function createBackupFileName() {
	return `stingfit-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export function FitnessDashboard({
	autoStartQuick = false,
}: FitnessDashboardProps = {}) {
	const navigate = useSpaNavigate();
	const hasAutoStartedQuickRef = useRef(false);
	const hasResolvedInitialTrainingStateRef = useRef(false);
	const trainingStateQuery = useFitnessTrainingStateQuery({
		autoStartQuick: autoStartQuick && !hasAutoStartedQuickRef.current,
		onAutoStartedQuick: () => {
			hasAutoStartedQuickRef.current = true;
		},
	});
	const activeSession = trainingStateQuery.data?.activeSession ?? null;
	const startableWorkouts = trainingStateQuery.data?.startableWorkouts ?? [];
	const notReadyReasons = trainingStateQuery.data?.notReadyReasons ?? [];
	const recommendedWorkout =
		trainingStateQuery.data?.recommendedWorkout ?? null;
	const completedSessionCount =
		trainingStateQuery.data?.completedSessionCount ?? 0;
	const recoverySignals = trainingStateQuery.data?.recoverySignals ?? [];
	const exerciseOptions = trainingStateQuery.data?.exerciseOptions ?? [];
	const settings = trainingStateQuery.data?.settings ?? {
		displayUnit: "kg",
		showGuidance: true,
		restSoundEnabled: true,
		restVibrationEnabled: true,
		updatedAt: null,
	};
	const isLoading = trainingStateQuery.isPending;
	const queryError = trainingStateQuery.error
		? trainingStateQuery.error instanceof Error
			? trainingStateQuery.error.message
			: "Nepodarilo sa načítať tréningový stav."
		: null;
	const [backupNudgeDismissedCount, setBackupNudgeDismissedCount] = useState(
		() => readBackupNudgeDismissedCount(),
	);
	const [isRecoveryPromptVisible, setIsRecoveryPromptVisible] = useState(false);
	const [isMutating, setIsMutating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [postWorkoutAction, setPostWorkoutAction] =
		useState<PostWorkoutActionState | null>(null);
	const [pendingAbandonSessionId, setPendingAbandonSessionId] = useState<
		string | null
	>(null);
	const displayError = error ?? queryError;

	useEffect(() => {
		if (
			!trainingStateQuery.isSuccess ||
			hasResolvedInitialTrainingStateRef.current
		) {
			return;
		}

		hasResolvedInitialTrainingStateRef.current = true;
		setBackupNudgeDismissedCount(readBackupNudgeDismissedCount());
		setIsRecoveryPromptVisible(Boolean(activeSession) && !autoStartQuick);
	}, [activeSession, autoStartQuick, trainingStateQuery.isSuccess]);

	const runMutation = async (
		operation: () => Promise<FitnessLiveSession | null>,
		message: string,
		options: { throwOnError?: boolean } = {},
	) => {
		setIsMutating(true);
		setError(null);
		setSuccessMessage(null);
		setPostWorkoutAction(null);
		try {
			const nextSession = await operation();
			if (!nextSession || nextSession.status !== "active") {
				setIsRecoveryPromptVisible(false);
			}
			await invalidateFitnessQueries();
			setSuccessMessage(message);
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Tréningová akcia zlyhala.",
			);
			if (options.throwOnError) {
				throw cause;
			}
		} finally {
			setIsMutating(false);
		}
	};

	const startWorkout = async (workoutId: string) => {
		setIsRecoveryPromptVisible(false);
		await runMutation(
			() => fitnessRepository.startSessionFromPlanWorkout(workoutId),
			"Tréning spustený",
		);
	};

	const logSet = async (setId: string, input: LogFitnessSetInput) => {
		await runMutation(
			() => fitnessRepository.logSet(setId, input),
			"Séria zapísaná",
			{ throwOnError: true },
		);
	};

	const updateSet = async (setId: string, input: LogFitnessSetInput) => {
		await runMutation(
			() => fitnessRepository.updateLoggedSet(setId, input),
			"Séria upravená",
		);
	};

	const duplicateSet = async (setId: string) => {
		await runMutation(
			() => fitnessRepository.duplicateSessionSet(setId),
			"Séria duplikovaná",
		);
	};

	const skipSet = async (setId: string) => {
		await runMutation(
			() => fitnessRepository.skipSessionSet(setId),
			"Séria preskočená",
		);
	};

	const addSet = async (sessionExerciseId: string) => {
		setIsMutating(true);
		setError(null);
		setSuccessMessage(null);
		try {
			await fitnessRepository.addSessionSet(sessionExerciseId);
			await invalidateFitnessQueries();
			setSuccessMessage("Séria pridaná");
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Nepodarilo sa pridať sériu.",
			);
		} finally {
			setIsMutating(false);
		}
	};

	const removeSet = async (setId: string) => {
		await runMutation(
			() => fitnessRepository.removeSessionSet(setId),
			"Séria odstránená",
		);
	};

	const skipExercise = async (sessionExerciseId: string) => {
		await runMutation(
			() => fitnessRepository.skipSessionExercise(sessionExerciseId),
			"Cvik preskočený",
		);
	};

	const addUnplannedExercise = async (
		sessionId: string,
		input: AddUnplannedExerciseInput,
	) => {
		await runMutation(
			() => fitnessRepository.addUnplannedExerciseToSession(sessionId, input),
			"Neplánovaný cvik pridaný",
		);
	};

	const finishWorkout = async (
		sessionId: string,
		input?: FinishFitnessSessionInput,
	) => {
		setIsMutating(true);
		setError(null);
		setSuccessMessage(null);
		setPostWorkoutAction(null);
		try {
			const { journalBody, ...sessionInput } = input ?? {};
			const completedSession = await fitnessRepository.finishSession(
				sessionId,
				sessionInput,
			);
			let journalSaveFailed = false;
			if (journalBody?.trim()) {
				try {
					await progressRepository.upsertJournalEntry({
						entryDate: (
							completedSession.completedAt ?? new Date().toISOString()
						).slice(0, 10),
						sessionId: completedSession.id,
						body: journalBody.trim(),
						mood: null,
						sleepHours: null,
						energy: sessionInput.energyLevel ?? completedSession.energyLevel,
					});
				} catch {
					journalSaveFailed = true;
				}
			}
			setIsRecoveryPromptVisible(false);
			await invalidateFitnessQueries();
			setSuccessMessage(
				journalSaveFailed
					? "Tréning dokončený. Zápisník sa nepodarilo uložiť."
					: "Tréning dokončený",
			);
			setPostWorkoutAction({ sessionName: completedSession.name });
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Tréningová akcia zlyhala.",
			);
		} finally {
			setIsMutating(false);
		}
	};

	const requestAbandonWorkout = async (sessionId: string) => {
		setPendingAbandonSessionId(sessionId);
	};

	const confirmAbandonWorkout = async () => {
		if (!pendingAbandonSessionId) {
			return;
		}

		const sessionId = pendingAbandonSessionId;
		setPendingAbandonSessionId(null);
		await runMutation(
			() => fitnessRepository.abandonSession(sessionId),
			"Tréning zahodený",
		);
	};

	const abandonConfirmationModal = (
		<ConfirmModal
			open={pendingAbandonSessionId !== null}
			title="Zahodiť rozpracovaný tréning?"
			description="Zapísané dáta zostanú v zahodenom tréningovom zázname, ale tréning už nebude aktívny."
			confirmLabel="Áno, zahodiť tréning"
			cancelLabel="Pokračovať v tréningu"
			isConfirming={isMutating}
			onConfirm={() => void confirmAbandonWorkout()}
			onClose={() => setPendingAbandonSessionId(null)}
		/>
	);

	const dismissBackupNudge = () => {
		writeBackupNudgeDismissedCount(completedSessionCount);
		setBackupNudgeDismissedCount(completedSessionCount);
		setSuccessMessage(sk.fitness.backupNudge.snoozeSuccess);
	};

	const exportBackupFromNudge = async () => {
		setIsMutating(true);
		setError(null);
		setSuccessMessage(null);
		try {
			const payload = await fitnessRepository.exportFitnessData();
			downloadBlob(
				new Blob([JSON.stringify(payload, null, 2)], {
					type: "application/json",
				}),
				createBackupFileName(),
			);
			writeBackupNudgeDismissedCount(completedSessionCount);
			setBackupNudgeDismissedCount(completedSessionCount);
			setSuccessMessage(sk.fitness.backupNudge.exportSuccess);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: sk.fitness.backupNudge.exportError,
			);
		} finally {
			setIsMutating(false);
		}
	};

	const createSimpleStarterPlan = async (choice: FitnessSimpleStartChoice) => {
		setIsMutating(true);
		setError(null);
		setSuccessMessage(null);
		try {
			const starter = (await fitnessRepository.listStarterPlans()).find(
				(plan) => plan.id === choice.starterPlanId,
			);
			if (!starter) {
				throw new Error(`Štartovací plán ${choice.title} nie je dostupný.`);
			}
			await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
				name: choice.personalPlanName,
				goal: choice.goal,
			});
			await invalidateFitnessQueries();
			setSuccessMessage(choice.successMessage);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Nepodarilo sa pripraviť jednoduchý štartovací plán.",
			);
		} finally {
			setIsMutating(false);
		}
	};

	const backupNudge = shouldShowBackupNudge(
		completedSessionCount,
		backupNudgeDismissedCount,
	) ? (
		<BackupNudgeCard
			completedSessionCount={completedSessionCount}
			isMutating={isMutating}
			onExport={() => void exportBackupFromNudge()}
			onDismiss={dismissBackupNudge}
		/>
	) : null;
	const postWorkoutActionCard = postWorkoutAction ? (
		<PostWorkoutActionCard
			sessionName={postWorkoutAction.sessionName}
			isMutating={isMutating}
			onOpenHistory={() => navigate("/progress/history?from=finish")}
			onExportBackup={() => void exportBackupFromNudge()}
			onDismiss={() => setPostWorkoutAction(null)}
		/>
	) : null;
	const recoveryPanel =
		completedSessionCount > 0 ? (
			<RecoveryPanelCard signals={recoverySignals} />
		) : null;

	if (isLoading) {
		return (
			<div className="fitness-hero-panel p-6 lg:p-8">
				<Badge className="fitness-badge">Načítavam tréning</Badge>
				<h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white">
					Nabíjam živý zápisník…
				</h1>
				<p className="mt-3 text-sm text-fitness-warm/70">
					Pripravujem lokálne plány a tréningy.
				</p>
			</div>
		);
	}

	if (activeSession?.status === "active") {
		if (isRecoveryPromptVisible) {
			const completedSets = activeSession.exercises
				.flatMap((exercise) => exercise.sets)
				.filter((set) => set.status === "completed").length;
			const totalSets = activeSession.exercises.flatMap(
				(exercise) => exercise.sets,
			).length;

			return (
				<>
					<div className="space-y-4">
						{successMessage ? (
							<StatusMessage tone="success" message={successMessage} />
						) : null}
						{displayError ? (
							<StatusMessage tone="error" message={displayError} />
						) : null}
						<section className="fitness-hero-panel p-4 sm:p-6 lg:p-8">
							<Badge className="fitness-badge">Tréning obnovený</Badge>
							<h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white sm:mt-4 sm:text-5xl">
								{activeSession.name}
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-5 text-fitness-warm/75 sm:mt-3 sm:leading-6">
								Našli sme aktívny lokálny tréning z predchádzajúceho otvorenia
								aplikácie. Vedome v ňom pokračuj alebo ho zahoď pred štartom
								ďalšieho tréningu.
							</p>
							<div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
								<div className="rounded-xl border border-fitness-yellow/30 bg-black/70 p-3 sm:rounded-2xl sm:p-4">
									<p className="text-[10px] font-black uppercase tracking-[0.14em] text-fitness-yellow/70 sm:text-xs sm:tracking-[0.18em]">
										Pokrok
									</p>
									<p className="mt-1 text-sm font-black text-white sm:mt-2 sm:text-lg">
										{completedSets}/{totalSets}
									</p>
								</div>
								<div className="rounded-xl border border-fitness-yellow/30 bg-black/70 p-3 sm:rounded-2xl sm:p-4">
									<p className="text-[10px] font-black uppercase tracking-[0.14em] text-fitness-yellow/70 sm:text-xs sm:tracking-[0.18em]">
										Začiatok
									</p>
									<p className="mt-1 text-sm font-black text-white sm:mt-2 sm:text-lg">
										{activeSession.startedAt
											? new Date(activeSession.startedAt).toLocaleTimeString()
											: "Lokálny tréning"}
									</p>
								</div>
								<div className="rounded-xl border border-fitness-yellow/30 bg-black/70 p-3 sm:rounded-2xl sm:p-4">
									<p className="text-[10px] font-black uppercase tracking-[0.14em] text-fitness-yellow/70 sm:text-xs sm:tracking-[0.18em]">
										Jednotka
									</p>
									<p className="mt-1 text-sm font-black text-white sm:mt-2 sm:text-lg">
										{settings.displayUnit}
									</p>
								</div>
							</div>
							<div className="mt-4 grid gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
								<Button
									className="fitness-action w-full sm:w-auto"
									leadingIcon={<Zap className="size-4" />}
									onClick={() => setIsRecoveryPromptVisible(false)}
									disabled={isMutating}
								>
									Pokračovať: {activeSession.name}
								</Button>
								<Button
									className="w-full sm:w-auto"
									variant="danger"
									leadingIcon={<AlertTriangle className="size-4" />}
									onClick={() => void requestAbandonWorkout(activeSession.id)}
									disabled={isMutating}
								>
									Zahodiť tréning
								</Button>
							</div>
						</section>
					</div>
					{abandonConfirmationModal}
				</>
			);
		}

		return (
			<div className="space-y-4">
				{successMessage ? (
					<StatusMessage tone="success" message={successMessage} />
				) : null}
				{displayError ? (
					<StatusMessage tone="error" message={displayError} />
				) : null}
				<FeatureErrorBoundary
					featureName="Živý tréning"
					description="Rozbehnutý tréning zostáva uložený lokálne. Ak sa táto časť znovu nenačíta, prejdi do Histórie alebo exportuj zálohu z Nastavení."
					resetKey={activeSession.id}
				>
					<LiveTrainingSession
						session={activeSession}
						exerciseOptions={exerciseOptions}
						displayUnit={settings.displayUnit}
						showGuidance={settings.showGuidance}
						restSoundEnabled={settings.restSoundEnabled}
						restVibrationEnabled={settings.restVibrationEnabled}
						isMutating={isMutating}
						onLogSet={logSet}
						onUpdateSet={updateSet}
						onDuplicateSet={duplicateSet}
						onSkipSet={skipSet}
						onAddSet={addSet}
						onRemoveSet={removeSet}
						onSkipExercise={skipExercise}
						onAddUnplannedExercise={addUnplannedExercise}
						onFinish={finishWorkout}
						onAbandon={requestAbandonWorkout}
					/>
				</FeatureErrorBoundary>
				{abandonConfirmationModal}
			</div>
		);
	}

	if (startableWorkouts.length === 0) {
		if (notReadyReasons.length > 0) {
			return (
				<div className="space-y-4">
					{successMessage ? (
						<StatusMessage tone="success" message={successMessage} />
					) : null}
					{displayError ? (
						<StatusMessage tone="error" message={displayError} />
					) : null}
					{postWorkoutActionCard}
					<section className="fitness-hero-panel p-6 lg:p-8">
						<Badge className="fitness-badge">Tréning zablokovaný</Badge>
						<h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
							Plán potrebuje úpravy pred tréningom.
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
							StingFit našiel osobný plán, ale zatiaľ nie je spustiteľný žiadny
							tréning. Najprv oprav blokery v Plánoch.
						</p>
					</section>
					{backupNudge}
					<NotReadyWorkoutsCard
						reasons={notReadyReasons}
						onOpenPlans={() => navigate("/plans")}
					/>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{successMessage ? (
					<StatusMessage tone="success" message={successMessage} />
				) : null}
				{displayError ? (
					<StatusMessage tone="error" message={displayError} />
				) : null}
				{postWorkoutActionCard}
				<SimpleStartBuilder
					isMutating={isMutating}
					onSelectPlan={(choice) => void createSimpleStarterPlan(choice)}
					onQuickSession={() => navigate("/train/quick")}
				/>
				{backupNudge}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{successMessage ? (
				<StatusMessage tone="success" message={successMessage} />
			) : null}
			{displayError ? (
				<StatusMessage tone="error" message={displayError} />
			) : null}
			{postWorkoutActionCard}

			<section className="fitness-hero-panel relative p-4 sm:p-6 lg:p-8">
				<div className="wasp-stripes absolute inset-0 opacity-30" />
				<div className="relative grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
					<div className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-fitness-yellow/20 bg-black/70 p-5">
						<div>
							<div className="flex flex-wrap items-center gap-3">
								<Badge className="fitness-badge">{trainHubCopy.hero.badge}</Badge>
								<span className="rounded-full border border-fitness-yellow/25 bg-black/60 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow/80">
									{trainHubCopy.hero.kicker}
								</span>
							</div>
							<h1 className="mt-4 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl">
								{trainHubCopy.hero.title}
							</h1>
							<p className="mt-4 max-w-xl text-sm leading-6 text-fitness-warm/75 sm:text-base">
								{trainHubCopy.hero.description}
							</p>
						</div>
						<div className="mt-6 flex flex-col gap-3 sm:flex-row">
							<Button
								variant="secondary"
								className="border-fitness-yellow/30 bg-black/60 text-fitness-warm hover:bg-fitness-yellow/10"
								leadingIcon={<Zap className="size-4" />}
								onClick={() => navigate("/train/quick")}
								disabled={isMutating}
							>
								{trainHubCopy.hero.quickSessionButton}
							</Button>
							<Button
								variant="secondary"
								className="border-fitness-yellow/30 bg-black/60 text-fitness-warm hover:bg-fitness-yellow/10"
								leadingIcon={<ClipboardList className="size-4" />}
								onClick={() => navigate("/plans")}
								disabled={isMutating}
							>
								{trainHubCopy.hero.editPlanButton}
							</Button>
						</div>
					</div>

					{recommendedWorkout ? (
						<UpNextWorkoutCard
							recommendation={recommendedWorkout}
							showGuidance={settings.showGuidance}
							isFirstWorkout={completedSessionCount === 0}
							isMutating={isMutating}
							onStartWorkout={startWorkout}
						/>
					) : (
						<div className="rounded-[2rem] border border-fitness-yellow/25 bg-black/75 p-5 text-fitness-warm">
							<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
								{trainHubCopy.fallback.kicker}
							</p>
							<h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
								{trainHubCopy.fallback.title}
							</h2>
							<p className="mt-2 text-sm leading-6 text-fitness-warm/70">
								{trainHubCopy.fallback.description}
							</p>
						</div>
					)}
				</div>
			</section>

			{backupNudge}
			{recoveryPanel}

			<TrainPillarGatewayCards
				completedSessionCount={completedSessionCount}
				onOpenProgress={() => navigate("/progress/lifts")}
				onOpenPlans={() => navigate("/plans")}
				onQuickSession={() => navigate("/train/quick")}
			/>

			<details className="rounded-3xl border border-fitness-yellow/20 bg-black/55 p-4 text-fitness-warm">
				<summary className="cursor-pointer text-sm font-black uppercase tracking-[0.16em] text-fitness-yellow">
					{trainHubCopy.allWorkouts.summary}
				</summary>
				<p className="mt-2 text-sm text-fitness-warm/65">
					{trainHubCopy.allWorkouts.description}
				</p>
				<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{startableWorkouts.map((workout) => (
						<article
							key={workout.workoutId}
							className="rounded-2xl border border-fitness-yellow/25 bg-black px-4 py-4 text-fitness-warm"
						>
							<div className="flex h-full flex-col gap-4">
								<div>
									<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
										Týždeň {workout.weekNumber} · {workout.dayLabel}
									</p>
									<h2 className="mt-2 text-lg font-black text-fitness-yellow">
										{workout.workoutName}
									</h2>
									<p className="mt-1 text-sm text-fitness-warm/70">
										{workout.planName}
									</p>
									{settings.showGuidance ? (
										<>
											<p className="mt-3 text-sm font-semibold text-fitness-warm/80">
												{formatStartSummary(workout)}
											</p>
											<p className="mt-1 text-xs text-fitness-warm/60">
												{trainHubCopy.firstExerciseLabel}: {" "}
												{workout.firstExerciseName ?? trainHubCopy.unsetExercise}
											</p>
										</>
									) : null}
								</div>
								<Button
									className="fitness-action mt-auto"
									leadingIcon={<Zap className="size-4" />}
									onClick={() => void startWorkout(workout.workoutId)}
									disabled={isMutating}
								>
									Spustiť {workout.workoutName}
								</Button>
							</div>
						</article>
					))}
				</div>
			</details>

			{notReadyReasons.length > 0 ? (
				<NotReadyWorkoutsCard
					reasons={notReadyReasons}
					onOpenPlans={() => navigate("/plans")}
				/>
			) : null}
		</div>
	);
}

function UpNextWorkoutCard({
	recommendation,
	showGuidance,
	isFirstWorkout,
	isMutating,
	onStartWorkout,
}: {
	recommendation: FitnessWorkoutRecommendation;
	showGuidance: boolean;
	isFirstWorkout: boolean;
	isMutating: boolean;
	onStartWorkout: (workoutId: string) => Promise<void>;
}) {
	const { workout } = recommendation;
	const title = isFirstWorkout
		? trainHubCopy.upNext.firstTitle
		: trainHubCopy.upNext.nextTitle;
	const description = isFirstWorkout
		? trainHubCopy.upNext.firstDescription
		: trainHubCopy.upNext.nextDescription;

	return (
		<article className="flex min-h-full flex-col rounded-[2rem] border border-fitness-yellow bg-fitness-yellow p-5 text-black shadow-xl">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs font-black uppercase tracking-[0.18em] text-black/65">
						{title}
					</p>
					<h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">
						{workout.workoutName}
					</h2>
				</div>
				<span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-black text-fitness-yellow">
					<Dumbbell className="size-6" />
				</span>
			</div>
			<p className="mt-3 text-sm font-bold text-black/75">
				Týždeň {workout.weekNumber} · {workout.dayLabel} · {workout.planName}
			</p>
			{showGuidance ? (
				<>
					<div className="mt-4 grid gap-2 sm:grid-cols-2">
						<div className="rounded-2xl bg-black/10 p-3">
							<p className="text-xs font-black uppercase text-black/60">
								{trainHubCopy.upNext.rangeLabel}
							</p>
							<p className="mt-1 text-sm font-black">
								{formatStartSummary(workout)}
							</p>
						</div>
						<div className="rounded-2xl bg-black/10 p-3">
							<p className="text-xs font-black uppercase text-black/60">
								{trainHubCopy.firstExerciseLabel}
							</p>
							<p className="mt-1 text-sm font-black">
								{workout.firstExerciseName ?? trainHubCopy.unsetExercise}
							</p>
						</div>
					</div>
					<p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-black/55">
						{trainHubCopy.upNext.snapshotHint}
					</p>
				</>
			) : null}
			<p className="mt-4 text-sm leading-6 text-black/70">{description}</p>
			{recommendation.lastCompletedWorkoutName ? (
				<p className="mt-2 text-xs font-bold text-black/60">
					{trainHubCopy.upNext.lastCompleted(recommendation.lastCompletedWorkoutName)}
				</p>
			) : null}
			<p className="mt-1 text-xs text-black/55">{recommendation.reason}</p>
			<Button
				className="mt-auto w-full border-0 bg-black font-black text-fitness-yellow hover:bg-black/85"
				leadingIcon={<Zap className="size-4" />}
				onClick={() => void onStartWorkout(workout.workoutId)}
				disabled={isMutating}
			>
				{trainHubCopy.upNext.startNowButton}
			</Button>
		</article>
	);
}

function TrainPillarGatewayCards({
	completedSessionCount,
	onOpenProgress,
	onOpenPlans,
	onQuickSession,
}: {
	completedSessionCount: number;
	onOpenProgress: () => void;
	onOpenPlans: () => void;
	onQuickSession: () => void;
}) {
	return (
		<section className="grid gap-3 md:grid-cols-3">
			<article className="rounded-3xl border border-fitness-yellow/35 bg-black/70 p-4 text-fitness-warm">
				<Dumbbell className="size-6 text-fitness-yellow" />
				<h2 className="mt-3 text-xl font-black text-white">{trainHubCopy.gateway.trainingTitle}</h2>
				<p className="mt-2 text-sm leading-6 text-fitness-warm/65">
					{trainHubCopy.gateway.trainingDescription}
				</p>
				<button
					type="button"
					className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow"
					onClick={onQuickSession}
				>
					{trainHubCopy.gateway.trainingCta} <ArrowRight className="size-3" />
				</button>
			</article>
			<article className="rounded-3xl border border-fitness-yellow/35 bg-black/70 p-4 text-fitness-warm">
				<Activity className="size-6 text-fitness-yellow" />
				<h2 className="mt-3 text-xl font-black text-white">{trainHubCopy.gateway.progressTitle}</h2>
				<p className="mt-2 text-sm leading-6 text-fitness-warm/65">
					{completedSessionCount > 0
						? trainHubCopy.gateway.progressDescriptionWithSessions(
								formatCompletedWorkoutCount(completedSessionCount),
							)
						: trainHubCopy.gateway.progressEmptyDescription}
				</p>
				<button
					type="button"
					className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow"
					onClick={onOpenProgress}
				>
					{trainHubCopy.gateway.progressCta} <ArrowRight className="size-3" />
				</button>
			</article>
			<article className="rounded-3xl border border-fitness-yellow/35 bg-black/70 p-4 text-fitness-warm">
				<ClipboardList className="size-6 text-fitness-yellow" />
				<h2 className="mt-3 text-xl font-black text-white">{trainHubCopy.gateway.plansTitle}</h2>
				<p className="mt-2 text-sm leading-6 text-fitness-warm/65">
					{trainHubCopy.gateway.plansDescription}
				</p>
				<button
					type="button"
					className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow"
					onClick={onOpenPlans}
				>
					{trainHubCopy.gateway.plansCta} <ArrowRight className="size-3" />
				</button>
			</article>
		</section>
	);
}

function RecoveryPanelCard({ signals }: { signals: FitnessRecoverySignal[] }) {
	const primarySignal = signals[0] ?? null;
	const todayAction = primarySignal
		? primarySignal.recommendation
		: "Drž plán a sleduj techniku";
	const title = primarySignal?.title ?? "Bez regeneračného varovania";
	const reason =
		primarySignal?.reason ??
		"Posledné tréningy neukazujú varovanie. Dnes postupuj podľa plánu a sleduj, či výkon alebo technika neklesá.";
	const severity = primarySignal?.severity ?? "watch";

	return (
		<Card
			title="Regenerácia dnes"
			description="Jedna jasná akcia pred tým, než spustíš ďalší tréning."
		>
			<div className="rounded-3xl border border-fitness-yellow/35 bg-black p-5 text-fitness-warm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<Badge className={getRecoveryBadgeClass(severity)}>
							{formatRecoverySeverity(severity)}
						</Badge>
						<h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-fitness-yellow">
							Dnes: {todayAction}
						</h2>
						<p className="mt-2 text-sm font-black text-white">{title}</p>
						<p className="mt-2 max-w-2xl text-sm leading-6 text-fitness-warm/70">
							{reason}
						</p>
					</div>
					<AlertTriangle className="size-8 text-fitness-yellow" />
				</div>
			</div>
		</Card>
	);
}

function getRecoveryBadgeClass(severity: FitnessRecoverySignalSeverity) {
	if (severity === "deload") {
		return "border border-rose-500/40 bg-rose-500/15 text-rose-100";
	}
	if (severity === "reduce") {
		return "border border-fitness-orange/40 bg-fitness-orange/15 text-fitness-warm";
	}
	return "border border-fitness-yellow/40 bg-fitness-yellow/10 text-fitness-yellow";
}

function formatRecoverySeverity(severity: FitnessRecoverySignalSeverity) {
	if (severity === "deload") return "Limit regenerácie";
	if (severity === "reduce") return "Uber objem";
	return "Sleduj únavu";
}

function formatStartSummary(workout: FitnessStartableWorkout) {
	return `${workout.exerciseCount} ${workout.exerciseCount === 1 ? "cvik" : workout.exerciseCount < 5 ? "cviky" : "cvikov"} · ${workout.plannedSetCount} plánovaných ${workout.plannedSetCount === 1 ? "séria" : workout.plannedSetCount < 5 ? "série" : "sérií"}`;
}

function formatCompletedWorkoutCount(count: number) {
	if (count === 1) return "1 dokončený tréning";
	if (count > 1 && count < 5) return `${count} dokončené tréningy`;
	return `${count} dokončených tréningov`;
}

function PostWorkoutActionCard({
	sessionName,
	isMutating,
	onOpenHistory,
	onExportBackup,
	onDismiss,
}: {
	sessionName: string;
	isMutating: boolean;
	onOpenHistory: () => void;
	onExportBackup: () => void;
	onDismiss: () => void;
}) {
	return (
		<Card
			title="Tréning uložený"
			description="Hotovo. Teraz si môžeš pozrieť výsledok, nechať ďalší tréning na neskôr alebo stiahnuť lokálnu zálohu."
		>
			<div className="rounded-3xl border border-fitness-yellow/35 bg-fitness-yellow/10 p-5 text-fitness-warm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<Badge className="bg-fitness-yellow text-black">
							<CheckCircle2 className="mr-1 size-3" />
							Hotovo
						</Badge>
						<h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-fitness-yellow">
							{sessionName}
						</h2>
						<p className="mt-2 text-sm leading-6 text-fitness-warm/75">
							Tréning je uložený v lokálnej histórii. Ak chceš iba odísť z
							fitka, môžeš zavrieť túto kartu.
						</p>
					</div>
					<CheckCircle2 className="size-8 text-fitness-yellow" />
				</div>
				<div className="mt-4 flex flex-wrap gap-3">
					<Button
						className="fitness-action"
						leadingIcon={<Zap className="size-4" />}
						onClick={onOpenHistory}
						disabled={isMutating}
					>
						Pozrieť výsledok
					</Button>
					<Button variant="secondary" onClick={onDismiss} disabled={isMutating}>
						Spustiť ďalší tréning neskôr
					</Button>
					<Button
						variant="secondary"
						leadingIcon={<Download className="size-4" />}
						onClick={onExportBackup}
						disabled={isMutating}
					>
						Exportovať zálohu
					</Button>
				</div>
			</div>
		</Card>
	);
}

function BackupNudgeCard({
	completedSessionCount,
	isMutating,
	onExport,
	onDismiss,
}: {
	completedSessionCount: number;
	isMutating: boolean;
	onExport: () => void;
	onDismiss: () => void;
}) {
	return (
		<Card
			title={sk.fitness.backupNudge.title}
			description={sk.fitness.backupNudge.description}
		>
			<div className="rounded-3xl border border-fitness-yellow/35 bg-fitness-yellow/10 p-5 text-fitness-warm">
				<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/75">
					{formatCompletedWorkoutCount(completedSessionCount)}
				</p>
				<h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-fitness-yellow">
					{sk.fitness.backupNudge.heading}
				</h2>
				<p className="mt-2 text-sm leading-6 text-fitness-warm/75">
					{sk.fitness.backupNudge.body}
				</p>
				<div className="mt-4 flex flex-wrap gap-3">
					<Button
						className="fitness-action"
						leadingIcon={<Download className="size-4" />}
						onClick={onExport}
						disabled={isMutating}
					>
						{sk.fitness.backupNudge.exportButton}
					</Button>
					<Button variant="secondary" onClick={onDismiss} disabled={isMutating}>
						{sk.fitness.backupNudge.snoozeButton}
					</Button>
				</div>
			</div>
		</Card>
	);
}

function NotReadyWorkoutsCard({
	reasons,
	onOpenPlans,
}: {
	reasons: string[];
	onOpenPlans: () => void;
}) {
	return (
		<Card
			title="Nepripravené tréningy"
			description="Tieto položky sú v pláne viditeľné, ale v Tréningu sú zablokované, kým ich neopravíš."
		>
			<div className="space-y-3">
				{reasons.map((reason) => (
					<div
						key={reason}
						className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100"
					>
						<AlertTriangle className="mr-2 inline size-4" />
						{reason}
					</div>
				))}
				<Button
					className="fitness-action"
					leadingIcon={<Zap className="size-4" />}
					onClick={onOpenPlans}
				>
					Otvoriť Plány
				</Button>
			</div>
		</Card>
	);
}

function StatusMessage({
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
