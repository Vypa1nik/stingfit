import { signCanonicalJsonPayload } from "@/features/coach/packSignature";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import type {
	FitnessExerciseRecord,
	FitnessLiveSession,
} from "@/features/fitness/fitnessTypes";
import { getActiveProfile } from "@/features/profiles/profileRepository";
import {
	getUnsignedRecapPackPayload,
	recapPackSchema,
	type RecapPackPayload,
	type UnsignedRecapPackPayload,
} from "./schema";

export const RECAP_PACK_MIME_TYPE = "application/vnd.stingfit.recap+json";

export interface ExportRecapPackOptions {
	sessionIds?: string[];
	traineeNote?: string;
}

export interface RecapPackPreview {
	traineeName: string;
	units: "kg" | "lb";
	sessionCount: number;
	completedSetCount: number;
	exerciseCount: number;
	signatureStatus: "valid";
}

export interface ImportRecapPackResult {
	preview: RecapPackPreview;
	payload: RecapPackPayload;
}

async function signRecapPackPayload(payload: UnsignedRecapPackPayload) {
	return signCanonicalJsonPayload(
		payload,
		`${payload.traineeName}:${payload.createdAt}`,
		"Recap Pack",
	);
}

function normalizeCompletedSessionsForPack(
	sessions: FitnessLiveSession[],
): RecapPackPayload["sessions"] {
	return sessions
		.filter((session) => session.status === "completed")
		.sort((first, second) => first.id.localeCompare(second.id))
		.map((session) => ({
			...session,
			status: "completed" as const,
			completedAt: session.completedAt ?? "",
			exercises: [...session.exercises]
				.sort((first, second) => first.sortOrder - second.sortOrder)
				.map((exercise) => ({
					...exercise,
					categorySnapshot: exercise.categorySnapshot ?? null,
					muscleGroupSnapshot: exercise.muscleGroupSnapshot ?? null,
					supersetGroup: exercise.supersetGroup ?? null,
					lastPerformance: exercise.lastPerformance ?? null,
					sets: [...exercise.sets]
						.sort((first, second) => first.setNumber - second.setNumber)
						.map((set) => ({
							...set,
							setType: set.setType ?? "working",
							weightEntryMode: set.weightEntryMode ?? "total",
							leftWeightKg: set.leftWeightKg ?? null,
							rightWeightKg: set.rightWeightKg ?? null,
							correctedAt: set.correctedAt ?? null,
							correctionCount: set.correctionCount ?? 0,
						})),
				})),
		}));
}

function getReferencedExerciseIds(sessions: RecapPackPayload["sessions"]) {
	return new Set(
		sessions.flatMap((session) =>
			session.exercises.map((exercise) => exercise.exerciseId),
		),
	);
}

function countCompletedSets(sessions: RecapPackPayload["sessions"]) {
	return sessions.reduce(
		(total, session) =>
			total +
			session.exercises.reduce(
				(exerciseTotal, exercise) =>
					exerciseTotal +
					exercise.sets.filter((set) => set.status === "completed").length,
				0,
			),
		0,
	);
}

function buildPreview(payload: RecapPackPayload): RecapPackPreview {
	return {
		traineeName: payload.traineeName,
		units: payload.presentation.units,
		sessionCount: payload.sessions.length,
		completedSetCount: countCompletedSets(payload.sessions),
		exerciseCount: payload.exercises.length,
		signatureStatus: "valid",
	};
}

function validateRecapPackReferences(payload: RecapPackPayload) {
	const exerciseIds = new Set(payload.exercises.map((exercise) => exercise.id));
	const missingExerciseId = [
		...getReferencedExerciseIds(payload.sessions),
	].find((exerciseId) => !exerciseIds.has(exerciseId));

	if (missingExerciseId) {
		throw new Error("Recap Pack is missing a referenced exercise.");
	}
}

function filterCompletedSessions(
	sessions: FitnessLiveSession[],
	sessionIds?: string[],
) {
	if (!sessionIds || sessionIds.length === 0) {
		return sessions;
	}

	const allowedSessionIds = new Set(sessionIds);
	return sessions.filter((session) => allowedSessionIds.has(session.id));
}

function findReferencedExercises(
	sessions: RecapPackPayload["sessions"],
	exercises: FitnessExerciseRecord[],
) {
	const referencedExerciseIds = getReferencedExerciseIds(sessions);

	return exercises
		.filter((exercise) => referencedExerciseIds.has(exercise.id))
		.sort((first, second) => first.id.localeCompare(second.id));
}

async function parseRecapPackBlob(file: Blob) {
	const parsedJson = JSON.parse(await file.text()) as unknown;
	const payload = recapPackSchema.parse(parsedJson);
	const expectedSignature = await signRecapPackPayload(
		getUnsignedRecapPackPayload(payload),
	);

	if (payload.signature !== expectedSignature) {
		throw new Error("Recap Pack signature is invalid.");
	}

	validateRecapPackReferences(payload);
	return payload;
}

export async function exportRecapPack(
	options: ExportRecapPackOptions = {},
): Promise<Blob> {
	const [activeProfile, settings, completedSessions, exercises] =
		await Promise.all([
			getActiveProfile(),
			fitnessRepository.getSettings(),
			fitnessRepository.listCompletedSessions(),
			fitnessRepository.listExercises(),
		]);
	const sessions = normalizeCompletedSessionsForPack(
		filterCompletedSessions(completedSessions, options.sessionIds),
	);
	const unsignedPayload = {
		version: 1,
		createdAt: new Date().toISOString(),
		traineeName: activeProfile.name,
		traineeNote: options.traineeNote?.trim() ?? "",
		sessions,
		exercises: findReferencedExercises(sessions, exercises),
		presentation: {
			locale: "sk",
			units: settings.displayUnit,
		},
	} satisfies UnsignedRecapPackPayload;
	const payload = recapPackSchema.parse({
		...unsignedPayload,
		signature: await signRecapPackPayload(unsignedPayload),
	});

	validateRecapPackReferences(payload);

	return new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
		type: RECAP_PACK_MIME_TYPE,
	});
}

export async function importRecapPack(
	file: Blob,
): Promise<ImportRecapPackResult> {
	const payload = await parseRecapPackBlob(file);

	return {
		preview: buildPreview(payload),
		payload,
	};
}
