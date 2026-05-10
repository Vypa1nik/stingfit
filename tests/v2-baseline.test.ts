import { describe, expect, test } from "vitest";

import { fitnessRepository } from "@/features/fitness/fitnessRepository";

const FITNESS_REPOSITORY_PUBLIC_SURFACE = [
	"abandonSession",
	"activatePersonalPlan",
	"addPlanDay",
	"addPlanExercise",
	"addPlanWorkout",
	"addSessionSet",
	"addUnplannedExerciseToSession",
	"archiveCustomExercise",
	"archivePersonalPlan",
	"createBlankPersonalPlan",
	"createExercise",
	"createNextWeekFromWeek",
	"createPersonalPlan",
	"createPersonalPlanFromStarter",
	"duplicateSessionSet",
	"duplicateWeek",
	"exportFitnessData",
	"finishSession",
	"getActiveSession",
	"getLiveSession",
	"getPlanStructure",
	"getSessionHistoryDetail",
	"getSettings",
	"importFitnessData",
	"importStrongCsvData",
	"listCompletedSessions",
	"listExercises",
	"listPersonalPlans",
	"listStartableWorkouts",
	"listStarterPlans",
	"logSet",
	"movePlanExercise",
	"movePlanWorkout",
	"previewFitnessImport",
	"previewStrongCsvImport",
	"removePlanDay",
	"removePlanExercise",
	"removePlanWorkout",
	"removeSessionSet",
	"resetFitnessData",
	"resetStarterData",
	"seedStarterData",
	"setPlanDayRest",
	"skipSessionExercise",
	"skipSessionSet",
	"startQuickSession",
	"startSessionFromPlanWorkout",
	"updateCustomExercise",
	"updateLoggedSet",
	"updatePersonalPlan",
	"updatePlanDay",
	"updatePlanExercise",
	"updatePlanWorkout",
	"updateSettings",
] satisfies Array<keyof typeof fitnessRepository>;

describe("V2 Phase 0 baseline", () => {
	test("snapshots the fitnessRepository public method surface", () => {
		expect(Object.keys(fitnessRepository).sort()).toEqual(
			[...FITNESS_REPOSITORY_PUBLIC_SURFACE].sort(),
		);

		for (const methodName of FITNESS_REPOSITORY_PUBLIC_SURFACE) {
			expect(typeof fitnessRepository[methodName]).toBe("function");
		}
	});
});
