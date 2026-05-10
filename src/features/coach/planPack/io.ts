import { signCanonicalJsonPayload } from "@/features/coach/packSignature";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import type {
	FitnessExerciseRecord,
	FitnessPlanStructure,
} from "@/features/fitness/fitnessTypes";
import { getActiveProfile } from "@/features/profiles/profileRepository";
import { execute } from "@/lib/database";
import {
	getUnsignedPlanPackPayload,
	planPackSchema,
	type PlanPackPayload,
	type UnsignedPlanPackPayload,
} from "./schema";

export const PLAN_PACK_MIME_TYPE = "application/vnd.stingfit.plan+json";

export interface PlanPackPreview {
	planName: string;
	coachName: string;
	units: "kg" | "lb";
	weekCount: number;
	workoutCount: number;
	exerciseCount: number;
	signatureStatus: "valid";
}

export interface PlanPackCommitResult {
	planId: string;
	planName: string;
	workoutCount: number;
	exerciseCount: number;
}

export interface ImportPlanPackResult {
	preview: PlanPackPreview;
	payload: PlanPackPayload;
	commit: () => Promise<PlanPackCommitResult>;
}

function createLocalId(prefix: string) {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return `${prefix}-${crypto.randomUUID()}`;
	}

	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function signPlanPackPayload(payload: UnsignedPlanPackPayload) {
	return signCanonicalJsonPayload(
		payload,
		`${payload.coachName}:${payload.createdAt}`,
		"Plan Pack",
	);
}

function normalizePlanStructureForPack(
	structure: FitnessPlanStructure,
): PlanPackPayload["plan"] {
	return {
		plan: structure.plan,
		weeks: [...structure.weeks]
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
								exercises: [...workout.exercises]
									.sort((first, second) => first.sortOrder - second.sortOrder)
									.map((exercise) => ({
										...exercise,
										supersetGroup: exercise.supersetGroup ?? null,
									})),
							})),
					})),
			})),
	};
}

function getReferencedExerciseIds(plan: PlanPackPayload["plan"]) {
	return new Set(
		plan.weeks.flatMap((week) =>
			week.days.flatMap((day) =>
				day.workouts.flatMap((workout) =>
					workout.exercises.map((exercise) => exercise.exerciseId),
				),
			),
		),
	);
}

function countWorkouts(plan: PlanPackPayload["plan"]) {
	return plan.weeks.reduce(
		(total, week) =>
			total +
			week.days.reduce((dayTotal, day) => dayTotal + day.workouts.length, 0),
		0,
	);
}

function buildPreview(payload: PlanPackPayload): PlanPackPreview {
	return {
		planName: payload.plan.plan.name,
		coachName: payload.coachName,
		units: payload.presentation.units,
		weekCount: payload.plan.weeks.length,
		workoutCount: countWorkouts(payload.plan),
		exerciseCount: payload.exercises.length,
		signatureStatus: "valid",
	};
}

function validatePlanPackReferences(payload: PlanPackPayload) {
	const exerciseIds = new Set(payload.exercises.map((exercise) => exercise.id));
	const missingExerciseId = [...getReferencedExerciseIds(payload.plan)].find(
		(exerciseId) => !exerciseIds.has(exerciseId),
	);

	if (missingExerciseId) {
		throw new Error("Plan Pack is missing a referenced exercise.");
	}
}

async function parsePlanPackBlob(file: Blob) {
	const parsedJson = JSON.parse(await file.text()) as unknown;
	const payload = planPackSchema.parse(parsedJson);
	const expectedSignature = await signPlanPackPayload(
		getUnsignedPlanPackPayload(payload),
	);

	if (payload.signature !== expectedSignature) {
		throw new Error("Plan Pack signature is invalid.");
	}

	validatePlanPackReferences(payload);
	return payload;
}

function findMatchingExercise(
	exercise: PlanPackPayload["exercises"][number],
	localExercises: FitnessExerciseRecord[],
) {
	return localExercises.find(
		(localExercise) =>
			localExercise.name.localeCompare(exercise.name, undefined, {
				sensitivity: "accent",
			}) === 0,
	);
}

async function buildExerciseIdMap(payload: PlanPackPayload) {
	const localExercises = await fitnessRepository.listExercises();
	const exerciseIdMap = new Map<string, string>();

	for (const exercise of payload.exercises) {
		const existingExercise = findMatchingExercise(exercise, localExercises);
		if (existingExercise) {
			exerciseIdMap.set(exercise.id, existingExercise.id);
			continue;
		}

		const createdExercise = await fitnessRepository.createExercise({
			name: exercise.name,
			category: exercise.category,
			muscleGroup: exercise.muscleGroup,
			defaultRestSeconds: exercise.defaultRestSeconds,
		});
		localExercises.push(createdExercise);
		exerciseIdMap.set(exercise.id, createdExercise.id);
	}

	return exerciseIdMap;
}

async function commitPlanPack(
	payload: PlanPackPayload,
): Promise<PlanPackCommitResult> {
	const timestamp = new Date().toISOString();
	const planId = createLocalId("plan-pack-plan");
	const exerciseIdMap = await buildExerciseIdMap(payload);

	await execute(
		`INSERT INTO fitness_plans(id, name, goal, kind, source_template_id, status, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, 'personal', NULL, 'draft', ?, ?, NULL)`,
		[
			planId,
			payload.plan.plan.name,
			payload.plan.plan.goal,
			timestamp,
			timestamp,
		],
	);

	for (const week of payload.plan.weeks) {
		const weekId = createLocalId("plan-pack-week");
		await execute(
			`INSERT INTO fitness_plan_weeks(id, plan_id, week_number, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[weekId, planId, week.weekNumber, week.notes, timestamp, timestamp],
		);

		for (const day of week.days) {
			const dayId = createLocalId("plan-pack-day");
			await execute(
				`INSERT INTO fitness_plan_days(id, week_id, day_index, label, is_rest_day, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					dayId,
					weekId,
					day.dayIndex,
					day.label,
					day.isRestDay ? 1 : 0,
					timestamp,
					timestamp,
				],
			);

			for (const workout of day.workouts) {
				const workoutId = createLocalId("plan-pack-workout");
				await execute(
					`INSERT INTO fitness_plan_workouts(id, plan_day_id, name, notes, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						workoutId,
						dayId,
						workout.name,
						workout.notes,
						workout.sortOrder,
						timestamp,
						timestamp,
					],
				);

				for (const exercise of workout.exercises) {
					const mappedExerciseId = exerciseIdMap.get(exercise.exerciseId);
					if (!mappedExerciseId) {
						throw new Error("Plan Pack exercise mapping failed.");
					}

					await execute(
						`INSERT INTO fitness_plan_exercises(
              id, plan_workout_id, exercise_id, sort_order, target_sets, min_reps, max_reps, target_rir, rest_seconds, notes, superset_group, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
						[
							createLocalId("plan-pack-exercise"),
							workoutId,
							mappedExerciseId,
							exercise.sortOrder,
							exercise.targetSets,
							exercise.minReps,
							exercise.maxReps,
							exercise.targetRir,
							exercise.restSeconds,
							exercise.notes,
							exercise.supersetGroup,
							timestamp,
							timestamp,
						],
					);
				}
			}
		}
	}

	return {
		planId,
		planName: payload.plan.plan.name,
		workoutCount: countWorkouts(payload.plan),
		exerciseCount: payload.exercises.length,
	};
}

export async function exportPlanPack(planId: string): Promise<Blob> {
	const [activeProfile, settings, structure, exercises] = await Promise.all([
		getActiveProfile(),
		fitnessRepository.getSettings(),
		fitnessRepository.getPlanStructure(planId),
		fitnessRepository.listExercises(),
	]);
	const normalizedPlan = normalizePlanStructureForPack(structure);
	const referencedExerciseIds = getReferencedExerciseIds(normalizedPlan);
	const referencedExercises = exercises
		.filter((exercise) => referencedExerciseIds.has(exercise.id))
		.sort((first, second) => first.id.localeCompare(second.id));

	const unsignedPayload = {
		version: 1,
		createdAt: new Date().toISOString(),
		coachName: activeProfile.name,
		coachNote: "",
		plan: normalizedPlan,
		exercises: referencedExercises,
		presentation: {
			locale: "sk",
			units: settings.displayUnit,
		},
	} satisfies UnsignedPlanPackPayload;
	const payload = planPackSchema.parse({
		...unsignedPayload,
		signature: await signPlanPackPayload(unsignedPayload),
	});

	validatePlanPackReferences(payload);

	return new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
		type: PLAN_PACK_MIME_TYPE,
	});
}

export async function importPlanPack(
	file: Blob,
): Promise<ImportPlanPackResult> {
	const payload = await parsePlanPackBlob(file);

	return {
		preview: buildPreview(payload),
		payload,
		commit: () => commitPlanPack(payload),
	};
}
