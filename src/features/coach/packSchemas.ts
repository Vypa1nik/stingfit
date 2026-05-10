import { z } from "zod";

export const isoStringSchema = z.string().min(1);

export const fitnessMuscleGroupSchema = z.enum([
	"chest",
	"back",
	"quads",
	"hamstrings",
	"glutes",
	"shoulders",
	"biceps",
	"triceps",
	"calves",
	"abs",
	"forearms",
	"other",
]);

export const fitnessExerciseSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	category: z.string().min(1),
	muscleGroup: fitnessMuscleGroupSchema.nullable(),
	defaultRestSeconds: z.number().int().nonnegative(),
	isCustom: z.boolean(),
	createdAt: isoStringSchema,
	updatedAt: isoStringSchema,
	deletedAt: z.string().nullable(),
});
