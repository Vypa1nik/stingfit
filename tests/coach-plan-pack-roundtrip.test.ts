import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
	createProfile,
	setActiveProfile,
} from "@/features/profiles/profileRepository";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import { clearAllData, resetDatabaseState } from "@/lib/database";
import { exportPlanPack, importPlanPack } from "@/features/coach/planPack/io";
import {
	normalizePlanPackPayload,
	planPackSchema,
} from "@/features/coach/planPack/schema";

async function createExportableCoachPlan() {
	await fitnessRepository.seedStarterData();
	await fitnessRepository.updateSettings({ displayUnit: "lb" });
	const coachProfile = await createProfile({
		name: "Coach Nina",
		kind: "coach",
	});
	await setActiveProfile(coachProfile.id);

	const starter = (await fitnessRepository.listStarterPlans()).find(
		(plan) => plan.name === "Tlak / Ťah / Nohy",
	);
	if (!starter) {
		throw new Error("PPL starter missing");
	}

	return fitnessRepository.createPersonalPlanFromStarter(starter.id, {
		name: "Client Hypertrophy Block",
		goal: "Build muscle with clear local progression",
	});
}

describe("Coach Plan Pack round-trip", () => {
	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
	});

	afterEach(async () => {
		await resetDatabaseState();
	});

	test("exports a tamper-evident .stfplan and re-imports the same normalized payload", async () => {
		const plan = await createExportableCoachPlan();

		const blob = await exportPlanPack(plan.id);
		expect(blob.type).toBe("application/vnd.stingfit.plan+json");

		const exportedPayload = planPackSchema.parse(JSON.parse(await blob.text()));
		expect(exportedPayload).toMatchObject({
			version: 1,
			coachName: "Coach Nina",
			coachNote: "",
			presentation: { locale: "sk", units: "lb" },
			plan: { plan: { name: "Client Hypertrophy Block", kind: "personal" } },
			signature: expect.stringMatching(/^[a-f0-9]{64}$/),
		});
		expect(
			exportedPayload.exercises.map((exercise) => exercise.name),
		).toContain("Tlak na lavičke");
		expect(JSON.stringify(exportedPayload)).not.toContain("telemetry");
		expect(JSON.stringify(exportedPayload)).not.toContain("device");
		expect(JSON.stringify(exportedPayload)).not.toContain("ipAddress");

		const imported = await importPlanPack(blob);
		expect(imported.preview).toMatchObject({
			planName: "Client Hypertrophy Block",
			coachName: "Coach Nina",
			units: "lb",
			weekCount: 1,
			exerciseCount: exportedPayload.exercises.length,
			signatureStatus: "valid",
		});
		expect(normalizePlanPackPayload(imported.payload)).toEqual(
			normalizePlanPackPayload(exportedPayload),
		);
	});

	test("commits an imported .stfplan as a local personal plan on a fresh database", async () => {
		const sourcePlan = await createExportableCoachPlan();
		const blob = await exportPlanPack(sourcePlan.id);

		await resetDatabaseState();
		await clearAllData();

		const imported = await importPlanPack(blob);
		const result = await imported.commit();

		expect(result).toMatchObject({
			planName: "Client Hypertrophy Block",
			workoutCount: imported.preview.workoutCount,
			exerciseCount: imported.preview.exerciseCount,
		});

		const importedStructure = await fitnessRepository.getPlanStructure(
			result.planId,
		);
		expect(importedStructure.plan).toMatchObject({
			name: "Client Hypertrophy Block",
			kind: "personal",
			status: "draft",
		});
		expect(
			importedStructure.weeks[0]?.days[0]?.workouts[0]?.exercises[0],
		).toMatchObject({
			exerciseName: "Tlak na lavičke",
			targetSets: 3,
			minReps: 6,
			maxReps: 8,
		});
		expect(await fitnessRepository.listStartableWorkouts()).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					planId: result.planId,
					workoutName: "Tlakový deň A",
				}),
			]),
		);
	});

	test("rejects a tampered .stfplan before preview or commit", async () => {
		const plan = await createExportableCoachPlan();
		const blob = await exportPlanPack(plan.id);
		const tamperedPayload = JSON.parse(await blob.text()) as {
			coachName: string;
		};
		tamperedPayload.coachName = "Mallory";

		await expect(
			importPlanPack(
				new Blob([JSON.stringify(tamperedPayload)], { type: blob.type }),
			),
		).rejects.toThrow("Plan Pack signature is invalid.");
	});
});
