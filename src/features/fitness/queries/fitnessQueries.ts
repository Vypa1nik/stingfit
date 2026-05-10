import { QueryClient, useQuery } from "@tanstack/react-query";

import { buildProgressSnapshot } from "@/features/fitness/fitnessProgress";
import { buildPlanReadinessReport } from "@/features/fitness/fitnessPlanReadiness";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import type {
	FitnessExerciseRecord,
	FitnessLiveSession,
	FitnessRecoverySignal,
	FitnessSettingsRecord,
	FitnessStartableWorkout,
} from "@/features/fitness/fitnessTypes";
import {
	pickRecommendedWorkout,
	type FitnessWorkoutRecommendation,
} from "@/features/fitness/fitnessWorkoutRecommendation";

const fitnessQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 0,
			retry: false,
		},
	},
});

export const fitnessQueryKeys = {
	all: ["fitness"] as const,
	trainingState: () => [...fitnessQueryKeys.all, "training-state"] as const,
	completedHistory: () =>
		[...fitnessQueryKeys.all, "completed-history"] as const,
	statsState: () => [...fitnessQueryKeys.all, "stats-state"] as const,
};

interface ReadFitnessTrainingStateOptions {
	autoStartQuick?: boolean;
	onAutoStartedQuick?: () => void;
}

export interface FitnessTrainingState {
	activeSession: FitnessLiveSession | null;
	startableWorkouts: FitnessStartableWorkout[];
	notReadyReasons: string[];
	recommendedWorkout: FitnessWorkoutRecommendation | null;
	completedSessionCount: number;
	recoverySignals: FitnessRecoverySignal[];
	exerciseOptions: FitnessExerciseRecord[];
	settings: FitnessSettingsRecord;
}

export interface FitnessCompletedHistoryState {
	sessions: FitnessLiveSession[];
	settings: FitnessSettingsRecord;
	startableWorkouts: FitnessStartableWorkout[];
}

export interface FitnessStatsState {
	sessions: FitnessLiveSession[];
	settings: FitnessSettingsRecord;
}

export async function readFitnessTrainingState(
	options: ReadFitnessTrainingStateOptions = {},
): Promise<FitnessTrainingState> {
	await fitnessRepository.seedStarterData();

	const [
		active,
		workouts,
		exercises,
		loadedSettings,
		personalPlans,
		completedSessions,
	] = await Promise.all([
		fitnessRepository.getActiveSession(),
		fitnessRepository.listStartableWorkouts(),
		fitnessRepository.listExercises(),
		fitnessRepository.getSettings(),
		fitnessRepository.listPersonalPlans(),
		fitnessRepository.listCompletedSessions(),
	]);
	let resolvedActive = active;

	if (!resolvedActive && options.autoStartQuick) {
		resolvedActive = await fitnessRepository.startQuickSession();
		options.onAutoStartedQuick?.();
	}

	const structures = await Promise.all(
		personalPlans.map((plan) => fitnessRepository.getPlanStructure(plan.id)),
	);
	const readinessReasons = structures.flatMap((structure) =>
		buildPlanReadinessReport(structure).blockers.map((issue) => issue.message),
	);

	return {
		activeSession: resolvedActive,
		startableWorkouts: workouts,
		notReadyReasons: readinessReasons,
		recommendedWorkout: pickRecommendedWorkout(workouts, completedSessions),
		completedSessionCount: completedSessions.length,
		recoverySignals: buildProgressSnapshot(completedSessions).recoverySignals,
		exerciseOptions: exercises,
		settings: loadedSettings,
	};
}

export async function readFitnessCompletedHistory(): Promise<FitnessCompletedHistoryState> {
	const [sessions, settings, startableWorkouts] = await Promise.all([
		fitnessRepository.listCompletedSessions(),
		fitnessRepository.getSettings(),
		fitnessRepository.listStartableWorkouts(),
	]);

	return { sessions, settings, startableWorkouts };
}

export async function readFitnessStatsState(): Promise<FitnessStatsState> {
	const [sessions, settings] = await Promise.all([
		fitnessRepository.listCompletedSessions(),
		fitnessRepository.getSettings(),
	]);

	return { sessions, settings };
}

export function invalidateFitnessQueries() {
	return fitnessQueryClient.invalidateQueries({
		queryKey: fitnessQueryKeys.all,
	});
}

export function useFitnessTrainingStateQuery(
	options: ReadFitnessTrainingStateOptions = {},
) {
	return useQuery(
		{
			queryKey: fitnessQueryKeys.trainingState(),
			queryFn: () => readFitnessTrainingState(options),
			refetchOnMount: "always",
		},
		fitnessQueryClient,
	);
}

export function useFitnessCompletedHistoryQuery() {
	return useQuery(
		{
			queryKey: fitnessQueryKeys.completedHistory(),
			queryFn: readFitnessCompletedHistory,
			refetchOnMount: "always",
		},
		fitnessQueryClient,
	);
}

export function useFitnessStatsStateQuery() {
	return useQuery(
		{
			queryKey: fitnessQueryKeys.statsState(),
			queryFn: readFitnessStatsState,
			refetchOnMount: "always",
		},
		fitnessQueryClient,
	);
}
