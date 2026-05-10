import { describe, expect, test } from "vitest";

import {
	buildProgressSnapshot,
	formatKg,
	formatVolume,
	summarizeSession,
} from "@/features/fitness/fitnessProgress";
import type { FitnessLiveSession } from "@/features/fitness/fitnessTypes";

function makeSession(): FitnessLiveSession {
	return {
		id: "session-1",
		planId: "plan-1",
		planWorkoutId: "workout-1",
		name: "Tlakový deň A",
		status: "completed",
		startedAt: "2026-04-25T10:00:00.000Z",
		completedAt: "2026-04-25T11:00:00.000Z",
		notes: "",
		sessionRpe: null,
		energyLevel: null,
		createdAt: "2026-04-25T10:00:00.000Z",
		updatedAt: "2026-04-25T11:00:00.000Z",
		exercises: [
			{
				id: "session-exercise-1",
				sessionId: "session-1",
				exerciseId: "bench-press",
				nameSnapshot: "Tlak na lavičke",
				sortOrder: 0,
				status: "done",
				targetSets: 3,
				minReps: 6,
				maxReps: 8,
				targetRir: 1,
				restSeconds: 150,
				notes: "",
				createdAt: "2026-04-25T10:00:00.000Z",
				updatedAt: "2026-04-25T11:00:00.000Z",
				sets: [
					{
						id: "set-1",
						sessionExerciseId: "session-exercise-1",
						setNumber: 1,
						weightKg: 100,
						reps: 8,
						rir: 1,
						status: "completed",
						completedAt: "2026-04-25T10:10:00.000Z",
						createdAt: "2026-04-25T10:00:00.000Z",
						updatedAt: "2026-04-25T10:10:00.000Z",
					},
					{
						id: "set-2",
						sessionExerciseId: "session-exercise-1",
						setNumber: 2,
						weightKg: 100,
						reps: 8,
						rir: 1,
						status: "completed",
						completedAt: "2026-04-25T10:15:00.000Z",
						createdAt: "2026-04-25T10:00:00.000Z",
						updatedAt: "2026-04-25T10:15:00.000Z",
					},
					{
						id: "set-3",
						sessionExerciseId: "session-exercise-1",
						setNumber: 3,
						weightKg: 100,
						reps: 8,
						rir: 1,
						status: "completed",
						completedAt: "2026-04-25T10:20:00.000Z",
						createdAt: "2026-04-25T10:00:00.000Z",
						updatedAt: "2026-04-25T10:20:00.000Z",
					},
				],
			},
			{
				id: "session-exercise-2",
				sessionId: "session-1",
				exerciseId: "rope-pushdown",
				nameSnapshot: "Sťahovanie kladky s lanom",
				sortOrder: 1,
				status: "done",
				targetSets: 1,
				minReps: 10,
				maxReps: 12,
				targetRir: 2,
				restSeconds: 75,
				notes: "",
				createdAt: "2026-04-25T10:00:00.000Z",
				updatedAt: "2026-04-25T11:00:00.000Z",
				sets: [
					{
						id: "set-4",
						sessionExerciseId: "session-exercise-2",
						setNumber: 1,
						weightKg: 80,
						reps: 12,
						rir: 2,
						status: "completed",
						completedAt: "2026-04-25T10:35:00.000Z",
						createdAt: "2026-04-25T10:00:00.000Z",
						updatedAt: "2026-04-25T10:35:00.000Z",
					},
				],
			},
		],
	};
}

function makeLowerVolumeSession(): FitnessLiveSession {
	const session = makeSession();
	return {
		...session,
		id: "session-0",
		completedAt: "2026-04-18T11:00:00.000Z",
		exercises: session.exercises.map((exercise) => ({
			...exercise,
			id: `${exercise.id}-previous`,
			sessionId: "session-0",
			sets: exercise.sets.map((set) => ({
				...set,
				id: `${set.id}-previous`,
				sessionExerciseId: `${exercise.id}-previous`,
				weightKg: set.weightKg / 2,
			})),
		})),
	};
}

function makeSessionOnDate(id: string, date: string): FitnessLiveSession {
	const session = makeSession();
	return {
		...session,
		id,
		startedAt: `${date}T10:00:00.000Z`,
		completedAt: `${date}T11:00:00.000Z`,
		createdAt: `${date}T10:00:00.000Z`,
		updatedAt: `${date}T11:00:00.000Z`,
		exercises: session.exercises.map((exercise) => ({
			...exercise,
			id: `${exercise.id}-${id}`,
			sessionId: id,
			sets: exercise.sets.map((set) => ({
				...set,
				id: `${set.id}-${id}`,
				sessionExerciseId: `${exercise.id}-${id}`,
				completedAt: `${date}T10:10:00.000Z`,
				createdAt: `${date}T10:00:00.000Z`,
				updatedAt: `${date}T10:10:00.000Z`,
			})),
		})),
	};
}

function replaceExerciseSets(
	session: FitnessLiveSession,
	exerciseIndex: number,
	count: number,
	weightKg = 100,
) {
	const exercise = session.exercises[exerciseIndex];
	if (!exercise) {
		throw new Error(`Exercise ${exerciseIndex} missing`);
	}

	exercise.sets = Array.from({ length: count }, (_, index) => ({
		id: `${exercise.id}-custom-set-${index + 1}`,
		sessionExerciseId: exercise.id,
		setNumber: index + 1,
		weightKg,
		reps: 10,
		rir: 1,
		setType: "working",
		weightEntryMode: "total",
		leftWeightKg: null,
		rightWeightKg: null,
		status: "completed",
		completedAt: `${session.completedAt?.slice(0, 10) ?? "2026-04-25"}T10:10:00.000Z`,
		correctedAt: null,
		correctionCount: 0,
		createdAt: `${session.completedAt?.slice(0, 10) ?? "2026-04-25"}T10:00:00.000Z`,
		updatedAt: `${session.completedAt?.slice(0, 10) ?? "2026-04-25"}T10:10:00.000Z`,
	}));
}

describe("fitness progress calculations", () => {
	test("summarizes completed session volume, set counts, and correction audit", () => {
		const session = makeSession();
		session.exercises[0]!.sets[0] = {
			...session.exercises[0]!.sets[0]!,
			correctedAt: "2026-04-25T12:00:00.000Z",
			correctionCount: 2,
		};
		const summary = summarizeSession(session);

		expect(summary).toMatchObject({
			sessionId: "session-1",
			name: "Tlakový deň A",
			completedSets: 4,
			correctedSetCount: 1,
			totalCorrections: 2,
			exerciseCount: 2,
			totalVolumeKg: 3360,
		});
		expect(formatVolume(summary.totalVolumeKg)).toBe("3,360 kg");
		expect(formatKg(126.666)).toBe("126.7 kg");
	});

	test("builds PR events and transparent progression hints from completed working sets", () => {
		const session = makeSession();
		session.exercises[0]?.sets.unshift({
			id: "warmup-set",
			sessionExerciseId: "session-exercise-1",
			setNumber: 0,
			weightKg: 200,
			reps: 1,
			rir: 5,
			status: "completed",
			setType: "warmup",
			completedAt: "2026-04-25T10:05:00.000Z",
			createdAt: "2026-04-25T10:00:00.000Z",
			updatedAt: "2026-04-25T10:05:00.000Z",
		});

		const snapshot = buildProgressSnapshot([session]);

		expect(snapshot).toMatchObject({
			completedWorkouts: 1,
			totalVolumeKg: 3360,
		});
		expect(snapshot.prEvents[0]).toMatchObject({
			exerciseId: "bench-press",
			exerciseName: "Tlak na lavičke",
			weightKg: 100,
			reps: 8,
			estimatedOneRepMaxKg: 126.7,
		});
		expect(snapshot.progressionHints[0]).toMatchObject({
			exerciseId: "bench-press",
			exerciseName: "Tlak na lavičke",
			recommendation: "Nabudúce pridaj 2,5 kg",
			reason: "Splnil si 3×8 na Tlak na lavičke s RIR 1.",
		});
	});

	test("holds load instead of adding weight when a top-range session had high strain", () => {
		const highStrainSession = {
			...makeSession(),
			sessionRpe: 9,
			energyLevel: 2,
			notes: "Grindy but completed.",
		};

		const snapshot = buildProgressSnapshot([highStrainSession]);

		expect(snapshot.progressionHints[0]).toMatchObject({
			exerciseName: "Tlak na lavičke",
			recommendation: "Nabudúce podrž váhu",
		});
		expect(snapshot.progressionHints[0]?.reason).toContain("RPE 9/10");
		expect(snapshot.progressionHints[0]?.reason).toContain("energia 2/5");
	});

	test("calculates volume trend from the two newest completed sessions", () => {
		const snapshot = buildProgressSnapshot([
			makeLowerVolumeSession(),
			makeSession(),
		]);

		expect(snapshot.volumeTrendPercent).toBe(100);
		expect(snapshot.volumeTrendLabel).toBe("+100%");
	});

	test("builds 12-week training heatmap anchored to the latest completed workout week", () => {
		const snapshot = buildProgressSnapshot([
			makeSessionOnDate("outside-window", "2026-01-25"),
			makeSessionOnDate("first-visible", "2026-02-02"),
			makeSessionOnDate("double-a", "2026-04-25"),
			makeSessionOnDate("double-b", "2026-04-25"),
		]);
		const heatmapDays = snapshot.trainingHeatmapWeeks.flatMap(
			(week) => week.days,
		);

		expect(snapshot.trainingHeatmapWeeks).toHaveLength(12);
		expect(
			snapshot.trainingHeatmapWeeks.every((week) => week.days.length === 7),
		).toBe(true);
		expect(heatmapDays[0]?.date).toBe("2026-02-02");
		expect(heatmapDays.at(-1)?.date).toBe("2026-04-26");
		expect(
			heatmapDays.find((day) => day.date === "2026-01-25"),
		).toBeUndefined();
		expect(heatmapDays.find((day) => day.date === "2026-02-02")).toMatchObject({
			completedWorkoutCount: 1,
			intensity: 1,
		});
		expect(heatmapDays.find((day) => day.date === "2026-04-25")).toMatchObject({
			completedWorkoutCount: 2,
			intensity: 2,
		});
	});

	test("builds 12-week muscle group set summaries from completed working sets", () => {
		const session = makeSessionOnDate("muscle-window", "2026-04-25");
		session.exercises[0] = {
			...session.exercises[0]!,
			categorySnapshot: "hrudník",
			muscleGroupSnapshot: "shoulders",
		};
		session.exercises[1] = {
			...session.exercises[1]!,
			categorySnapshot: "paže",
		};
		session.exercises[0]?.sets.unshift({
			id: "ignored-muscle-warmup",
			sessionExerciseId: "session-exercise-1-muscle-window",
			setNumber: 0,
			weightKg: 300,
			reps: 5,
			rir: 5,
			status: "completed",
			setType: "warmup",
			completedAt: "2026-04-25T10:05:00.000Z",
			createdAt: "2026-04-25T10:00:00.000Z",
			updatedAt: "2026-04-25T10:05:00.000Z",
		});

		const snapshot = buildProgressSnapshot([session]);

		expect(snapshot.muscleGroupSummaries[0]).toMatchObject({
			muscleGroup: "shoulders",
			label: "Ramená",
			completedSets: 3,
			totalVolumeKg: 2400,
			weeklySetAverage: 0.3,
			latestWeekSets: 3,
			latestWeekStatus: "low",
			volumeStatus: "low",
			actionLabel: "Pridaj objem",
		});
		expect(snapshot.muscleGroupSummaries[0]?.actionReason).toContain(
			"3 pracovné série",
		);
		expect(snapshot.muscleGroupSummaries[0]?.actionReason).toContain(
			"12-týždňový priemer 0.3",
		);
		expect(snapshot.muscleGroupSummaries[1]).toMatchObject({
			muscleGroup: "triceps",
			label: "Triceps",
			completedSets: 1,
			totalVolumeKg: 960,
		});
	});

	test("classifies latest-week muscle volume as target or high using 10-20 working sets", () => {
		const olderChest = makeSessionOnDate("older-chest-volume", "2026-04-12");
		olderChest.exercises[0] = {
			...olderChest.exercises[0]!,
			muscleGroupSnapshot: "chest",
		};
		replaceExerciseSets(olderChest, 0, 3);

		const targetChest = makeSessionOnDate("target-chest-volume", "2026-04-25");
		targetChest.exercises[0] = {
			...targetChest.exercises[0]!,
			muscleGroupSnapshot: "chest",
		};
		replaceExerciseSets(targetChest, 0, 12);

		const highBack = makeSessionOnDate("high-back-volume", "2026-04-26");
		highBack.exercises[0] = {
			...highBack.exercises[0]!,
			exerciseId: "custom-back-row",
			nameSnapshot: "Veslovanie na stroji",
			muscleGroupSnapshot: "back",
		};
		replaceExerciseSets(highBack, 0, 21);

		const snapshot = buildProgressSnapshot([olderChest, targetChest, highBack]);
		const chest = snapshot.muscleGroupSummaries.find(
			(summary) => summary.muscleGroup === "chest",
		);
		const back = snapshot.muscleGroupSummaries.find(
			(summary) => summary.muscleGroup === "back",
		);

		expect(chest).toMatchObject({
			completedSets: 15,
			latestWeekSets: 12,
			latestWeekStatus: "target",
			volumeStatus: "target",
			actionLabel: "Drž objem",
		});
		expect(chest?.actionReason).toContain("cieľovom pásme");
		expect(back).toMatchObject({
			completedSets: 21,
			latestWeekSets: 21,
			latestWeekStatus: "high",
			volumeStatus: "high",
			actionLabel: "Zváž regeneráciu",
		});
		expect(back?.actionReason).toContain("nad cieľom");
	});

	test("builds recovery signals when high muscle volume overlaps with high session strain", () => {
		const highBack = makeSessionOnDate("high-back-strain", "2026-04-26");
		highBack.sessionRpe = 9;
		highBack.energyLevel = 2;
		highBack.exercises[0] = {
			...highBack.exercises[0]!,
			exerciseId: "custom-back-row-strain",
			nameSnapshot: "Veslovanie na stroji",
			muscleGroupSnapshot: "back",
		};
		replaceExerciseSets(highBack, 0, 21);

		const snapshot = buildProgressSnapshot([highBack]);

		expect(snapshot.recoverySignals[0]).toMatchObject({
			severity: "deload",
			title: "Regenerácia je pravdepodobne limit",
			recommendation: "Uber objem a zaraď ľahší tréning",
			muscleGroup: "back",
			muscleGroupLabel: "Chrbát",
		});
		expect(snapshot.recoverySignals[0]?.reason).toContain(
			"21 pracovných sérií",
		);
		expect(snapshot.recoverySignals[0]?.reason).toContain("RPE 9/10");
		expect(snapshot.recoverySignals[0]?.reason).toContain("energia 2/5");
	});

	test("builds a general recovery signal when recent strain is high without excessive muscle volume", () => {
		const strainedSession = makeSessionOnDate("recent-strain", "2026-04-26");
		strainedSession.sessionRpe = 9;
		strainedSession.energyLevel = 2;

		const snapshot = buildProgressSnapshot([strainedSession]);

		expect(snapshot.recoverySignals[0]).toMatchObject({
			severity: "watch",
			title: "Zaraď ľahší tréning",
			recommendation: "Drž objem a sleduj výkon",
		});
		expect(snapshot.recoverySignals[0]?.reason).toContain("RPE 9/10");
		expect(snapshot.recoverySignals[0]?.reason).toContain("energia 2/5");
	});

	test("builds 12-week exercise volume leaders from completed working sets", () => {
		const outsideWindow = makeSessionOnDate(
			"outside-window-heavy",
			"2026-01-25",
		);
		outsideWindow.exercises[0]!.sets = outsideWindow.exercises[0]!.sets.map(
			(set) => ({ ...set, weightKg: 500 }),
		);

		const insideWindow = makeSessionOnDate("inside-window", "2026-04-25");
		insideWindow.exercises[0]?.sets.unshift({
			id: "ignored-volume-warmup",
			sessionExerciseId: "session-exercise-1-inside-window",
			setNumber: 0,
			weightKg: 300,
			reps: 5,
			rir: 5,
			status: "completed",
			setType: "warmup",
			completedAt: "2026-04-25T10:05:00.000Z",
			createdAt: "2026-04-25T10:00:00.000Z",
			updatedAt: "2026-04-25T10:05:00.000Z",
		});

		const snapshot = buildProgressSnapshot([outsideWindow, insideWindow]);

		expect(snapshot.exerciseVolumeLeaders[0]).toMatchObject({
			exerciseId: "bench-press",
			exerciseName: "Tlak na lavičke",
			completedSets: 3,
			sessionCount: 1,
			totalVolumeKg: 2400,
		});
		expect(snapshot.exerciseVolumeLeaders[1]).toMatchObject({
			exerciseId: "rope-pushdown",
			exerciseName: "Sťahovanie kladky s lanom",
			totalVolumeKg: 960,
		});
	});

	test("keeps chart snapshots safe with zero completed sessions", () => {
		const snapshot = buildProgressSnapshot([]);

		expect(snapshot.trainingHeatmapWeeks).toEqual([]);
		expect(snapshot.oneRepMaxSeries).toEqual([]);
		expect(snapshot.muscleGroupSummaries).toEqual([]);
	});

	test("builds a 1RM trend series from one completed exercise point", () => {
		const snapshot = buildProgressSnapshot([makeSession()]);

		expect(snapshot.oneRepMaxSeries[0]).toMatchObject({
			exerciseId: "bench-press",
			exerciseName: "Tlak na lavičke",
			latestEstimatedOneRepMaxKg: 126.7,
			deltaKg: null,
			points: [
				{
					sessionId: "session-1",
					estimatedOneRepMaxKg: 126.7,
					weightKg: 100,
					reps: 8,
				},
			],
		});
	});

	test("keeps chart snapshots stable with 200 completed sessions", () => {
		const sessions = Array.from({ length: 200 }, (_, index) => {
			const day = String((index % 28) + 1).padStart(2, "0");
			const month = String(Math.floor(index / 28) + 1).padStart(2, "0");
			const session = makeSessionOnDate(
				`chart-load-${index + 1}`,
				`2026-${month}-${day}`,
			);
			session.exercises[0]!.sets = session.exercises[0]!.sets.map((set) => ({
				...set,
				weightKg: 80 + index,
			}));
			return session;
		});

		const snapshot = buildProgressSnapshot(sessions);

		expect(snapshot.trainingHeatmapWeeks).toHaveLength(12);
		expect(
			snapshot.trainingHeatmapWeeks.flatMap((week) => week.days),
		).toHaveLength(84);
		expect(snapshot.oneRepMaxSeries[0]).toMatchObject({
			exerciseId: "bench-press",
			exerciseName: "Tlak na lavičke",
			points: expect.arrayContaining([
				expect.objectContaining({ sessionId: "chart-load-1" }),
				expect.objectContaining({ sessionId: "chart-load-200" }),
			]),
		});
		expect(snapshot.oneRepMaxSeries[0]?.points).toHaveLength(200);
		expect(snapshot.muscleGroupSummaries.length).toBeGreaterThan(0);
	});

	test("builds chronological 1RM trend points per exercise from completed working sets", () => {
		const previous = makeLowerVolumeSession();
		previous.exercises[0]?.sets.unshift({
			id: "ignored-warmup-pr",
			sessionExerciseId: "session-exercise-1-previous",
			setNumber: 0,
			weightKg: 250,
			reps: 1,
			rir: 5,
			status: "completed",
			setType: "warmup",
			completedAt: "2026-04-18T10:05:00.000Z",
			createdAt: "2026-04-18T10:00:00.000Z",
			updatedAt: "2026-04-18T10:05:00.000Z",
		});

		const snapshot = buildProgressSnapshot([makeSession(), previous]);

		expect(snapshot.oneRepMaxSeries[0]).toMatchObject({
			exerciseId: "bench-press",
			exerciseName: "Tlak na lavičke",
			latestEstimatedOneRepMaxKg: 126.7,
			deltaKg: 63.4,
			points: [
				{
					sessionId: "session-0",
					estimatedOneRepMaxKg: 63.3,
					weightKg: 50,
					reps: 8,
				},
				{
					sessionId: "session-1",
					estimatedOneRepMaxKg: 126.7,
					weightKg: 100,
					reps: 8,
				},
			],
		});
	});
});
