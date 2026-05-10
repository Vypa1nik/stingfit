import { z } from "zod";

import {
	fitnessExerciseSchema,
	isoStringSchema,
} from "@/features/coach/packSchemas";

const planRecordSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	goal: z.string(),
	kind: z.enum(["starter", "personal"]),
	sourceTemplateId: z.string().nullable(),
	status: z.enum(["draft", "active", "archived"]),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	deletedAt: z.string().nullable(),
});

const planExerciseSchema = z.object({
	id: z.string().min(1),
	planWorkoutId: z.string().min(1),
	exerciseId: z.string().min(1),
	exerciseName: z.string().min(1),
	sortOrder: z.number().int().nonnegative(),
	targetSets: z.number().int().positive(),
	minReps: z.number().int().nonnegative(),
	maxReps: z.number().int().nonnegative(),
	targetRir: z.number().int().nonnegative().nullable(),
	restSeconds: z.number().int().nonnegative(),
	notes: z.string(),
	supersetGroup: z.string().nullable(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
});

const planWorkoutSchema = z.object({
	id: z.string().min(1),
	planDayId: z.string().min(1),
	name: z.string().min(1),
	notes: z.string(),
	sortOrder: z.number().int().nonnegative(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	exercises: z.array(planExerciseSchema),
});

const planDaySchema = z.object({
	id: z.string().min(1),
	weekId: z.string().min(1),
	dayIndex: z.number().int().min(0).max(6),
	label: z.string().min(1),
	isRestDay: z.boolean(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	workouts: z.array(planWorkoutSchema),
});

const planWeekSchema = z.object({
	id: z.string().min(1),
	planId: z.string().min(1),
	weekNumber: z.number().int().positive(),
	notes: z.string(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	days: z.array(planDaySchema),
});

const planStructureSchema = z.object({
	plan: planRecordSchema,
	weeks: z.array(planWeekSchema),
});

export const unsignedPlanPackSchema = z.object({
	version: z.literal(1),
	createdAt: isoStringSchema,
	coachName: z.string().min(1),
	coachNote: z.string(),
	plan: planStructureSchema,
	exercises: z.array(fitnessExerciseSchema),
	presentation: z.object({
		locale: z.literal("sk"),
		units: z.enum(["kg", "lb"]),
	}),
});

export const planPackSchema = unsignedPlanPackSchema.extend({
	signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export type UnsignedPlanPackPayload = z.infer<typeof unsignedPlanPackSchema>;
export type PlanPackPayload = z.infer<typeof planPackSchema>;

export function getUnsignedPlanPackPayload(
	payload: PlanPackPayload,
): UnsignedPlanPackPayload {
	const parsed = planPackSchema.parse(payload);

	return unsignedPlanPackSchema.parse({
		version: parsed.version,
		createdAt: parsed.createdAt,
		coachName: parsed.coachName,
		coachNote: parsed.coachNote,
		plan: parsed.plan,
		exercises: parsed.exercises,
		presentation: parsed.presentation,
	});
}

export function normalizePlanPackPayload(
	payload: PlanPackPayload,
): PlanPackPayload {
	const parsed = planPackSchema.parse(payload);

	return {
		...parsed,
		exercises: [...parsed.exercises].sort((first, second) =>
			first.id.localeCompare(second.id),
		),
		plan: {
			plan: parsed.plan.plan,
			weeks: [...parsed.plan.weeks]
				.sort((first, second) => first.weekNumber - second.weekNumber)
				.map((week) => ({
					...week,
					days: [...week.days]
						.sort((first, second) => first.dayIndex - second.dayIndex)
						.map((day) => ({
							...day,
							workouts: [...day.workouts]
								.sort((first, second) => first.sortOrder - second.sortOrder)
								.map((workout) => ({
									...workout,
									exercises: [...workout.exercises].sort(
										(first, second) => first.sortOrder - second.sortOrder,
									),
								})),
						})),
				})),
		},
	};
}
