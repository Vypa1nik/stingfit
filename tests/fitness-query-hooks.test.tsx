import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
	fitnessQueryKeys,
	readFitnessCompletedHistory,
	readFitnessStatsState,
	readFitnessTrainingState,
} from "@/features/fitness/queries/fitnessQueries";
import { clearAllData, resetDatabaseState } from "@/lib/database";

describe("fitness query read bundles", () => {
	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
	});

	afterEach(async () => {
		await resetDatabaseState();
	});

	test("defines stable query keys for dashboard, history, and stats reads", () => {
		expect(fitnessQueryKeys.all).toEqual(["fitness"]);
		expect(fitnessQueryKeys.trainingState()).toEqual([
			"fitness",
			"training-state",
		]);
		expect(fitnessQueryKeys.completedHistory()).toEqual([
			"fitness",
			"completed-history",
		]);
		expect(fitnessQueryKeys.statsState()).toEqual(["fitness", "stats-state"]);
	});

	test("loads the dashboard read bundle through one query function", async () => {
		const state = await readFitnessTrainingState();

		expect(Array.isArray(state.startableWorkouts)).toBe(true);
		expect(Array.isArray(state.exerciseOptions)).toBe(true);
		expect(Array.isArray(state.notReadyReasons)).toBe(true);
		expect(state.settings.displayUnit).toBe("kg");
		expect(state.completedSessionCount).toBeGreaterThanOrEqual(0);
	});

	test("loads history and stats read bundles through query functions", async () => {
		const history = await readFitnessCompletedHistory();
		const stats = await readFitnessStatsState();

		expect(history.sessions).toEqual([]);
		expect(history.startableWorkouts.length).toBeGreaterThanOrEqual(0);
		expect(history.settings.displayUnit).toBe("kg");
		expect(stats.sessions).toEqual([]);
		expect(stats.settings.displayUnit).toBe("kg");
	});
});
