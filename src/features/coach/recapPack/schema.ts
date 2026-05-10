import { z } from "zod";

import {
	fitnessExerciseSchema,
	fitnessMuscleGroupSchema,
	isoStringSchema,
} from "@/features/coach/packSchemas";

const sessionSetSchema = z.object({
	id: z.string().min(1),
	sessionExerciseId: z.string().min(1),
	setNumber: z.number().int().positive(),
	weightKg: z.number().nonnegative(),
	reps: z.number().int().nonnegative(),
	rir: z.number().int().nonnegative().nullable(),
	setType: z
		.enum(["working", "warmup", "dropset", "myo", "failure"])
		.optional(),
	weightEntryMode: z.enum(["total", "per_side"]).optional(),
	leftWeightKg: z.number().nonnegative().nullable().optional(),
	rightWeightKg: z.number().nonnegative().nullable().optional(),
	status: z.enum(["pending", "planned", "completed", "skipped"]),
	completedAt: z.string().nullable(),
	correctedAt: z.string().nullable().optional(),
	correctionCount: z.number().int().nonnegative().optional(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
});

const lastPerformanceSchema = z.object({
	weightKg: z.number().nonnegative(),
	reps: z.number().int().nonnegative(),
	rir: z.number().int().nonnegative().nullable(),
	completedAt: z.string().nullable(),
});

const sessionExerciseSchema = z.object({
	id: z.string().min(1),
	sessionId: z.string().min(1),
	exerciseId: z.string().min(1),
	nameSnapshot: z.string().min(1),
	categorySnapshot: z.string().nullable().optional(),
	muscleGroupSnapshot: fitnessMuscleGroupSchema.nullable().optional(),
	sortOrder: z.number().int().nonnegative(),
	status: z.enum(["pending", "active", "done", "skipped"]),
	targetSets: z.number().int().positive(),
	minReps: z.number().int().nonnegative(),
	maxReps: z.number().int().nonnegative(),
	targetRir: z.number().int().nonnegative().nullable(),
	restSeconds: z.number().int().nonnegative(),
	notes: z.string(),
	supersetGroup: z.string().nullable().optional(),
	lastPerformance: lastPerformanceSchema.nullable().optional(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	sets: z.array(sessionSetSchema),
});

const completedSessionSchema = z.object({
	id: z.string().min(1),
	planId: z.string().nullable(),
	planWorkoutId: z.string().nullable(),
	name: z.string().min(1),
	status: z.literal("completed"),
	startedAt: z.string().nullable(),
	completedAt: z.string().min(1),
	notes: z.string(),
	sessionRpe: z.number().int().min(1).max(10).nullable(),
	energyLevel: z.number().int().min(1).max(5).nullable(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	exercises: z.array(sessionExerciseSchema),
});

export const unsignedRecapPackSchema = z.object({
	version: z.literal(1),
	createdAt: isoStringSchema,
	traineeName: z.string().min(1),
	traineeNote: z.string(),
	sessions: z.array(completedSessionSchema),
	exercises: z.array(fitnessExerciseSchema),
	presentation: z.object({
		locale: z.literal("sk"),
		units: z.enum(["kg", "lb"]),
	}),
});

export const recapPackSchema = unsignedRecapPackSchema.extend({
	signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export type UnsignedRecapPackPayload = z.infer<typeof unsignedRecapPackSchema>;
export type RecapPackPayload = z.infer<typeof recapPackSchema>;

export function getUnsignedRecapPackPayload(
	payload: RecapPackPayload,
): UnsignedRecapPackPayload {
	const parsed = recapPackSchema.parse(payload);

	return unsignedRecapPackSchema.parse({
		version: parsed.version,
		createdAt: parsed.createdAt,
		traineeName: parsed.traineeName,
		traineeNote: parsed.traineeNote,
		sessions: parsed.sessions,
		exercises: parsed.exercises,
		presentation: parsed.presentation,
	});
}

export function normalizeRecapPackPayload(
	payload: RecapPackPayload,
): RecapPackPayload {
	const parsed = recapPackSchema.parse(payload);

	return {
		...parsed,
		exercises: [...parsed.exercises].sort((first, second) =>
			first.id.localeCompare(second.id),
		),
		sessions: [...parsed.sessions]
			.sort((first, second) => first.id.localeCompare(second.id))
			.map((session) => ({
				...session,
				exercises: [...session.exercises]
					.sort((first, second) => first.sortOrder - second.sortOrder)
					.map((exercise) => ({
						...exercise,
						sets: [...exercise.sets].sort(
							(first, second) => first.setNumber - second.setNumber,
						),
					})),
			})),
	};
}
