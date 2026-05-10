import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
	exportRecapPack,
	importRecapPack,
} from "@/features/coach/recapPack/io";
import {
	normalizeRecapPackPayload,
	recapPackSchema,
} from "@/features/coach/recapPack/schema";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import {
	createProfile,
	setActiveProfile,
} from "@/features/profiles/profileRepository";
import { clearAllData, resetDatabaseState } from "@/lib/database";

async function createFinishedTraineeSession() {
	await fitnessRepository.seedStarterData();
	await fitnessRepository.updateSettings({ displayUnit: "lb" });
	const traineeProfile = await createProfile({
		name: "Marek Client",
		kind: "client",
	});
	await setActiveProfile(traineeProfile.id);

	const starter = (await fitnessRepository.listStarterPlans()).find(
		(plan) => plan.name === "Tlak / Ťah / Nohy",
	);
	if (!starter) {
		throw new Error("PPL starter missing");
	}

	await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
		name: "Coach Plan Week 1",
		goal: "Share completed training with coach",
	});
	const workout = (await fitnessRepository.listStartableWorkouts()).find(
		(item) => item.workoutName === "Tlakový deň A",
	);
	if (!workout) {
		throw new Error("Push workout missing");
	}

	const session = await fitnessRepository.startSessionFromPlanWorkout(
		workout.workoutId,
	);
	await fitnessRepository.logSet(session.exercises[0]!.sets[0]!.id, {
		weightKg: 100,
		reps: 8,
		rir: 1,
		setType: "working",
	});
	return fitnessRepository.finishSession(session.id, {
		sessionRpe: 8,
		energyLevel: 4,
		notes: "Bench felt strong.",
	});
}

describe("Coach Recap Pack round-trip", () => {
	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
	});

	afterEach(async () => {
		await resetDatabaseState();
	});

	test("exports a tamper-evident .stfrecap and re-imports the same normalized payload read-only", async () => {
		const finished = await createFinishedTraineeSession();

		const blob = await exportRecapPack({
			sessionIds: [finished.id],
			traineeNote: "Week 1 recap for coach.",
		});
		expect(blob.type).toBe("application/vnd.stingfit.recap+json");

		const exportedPayload = recapPackSchema.parse(
			JSON.parse(await blob.text()),
		);
		expect(exportedPayload).toMatchObject({
			version: 1,
			traineeName: "Marek Client",
			traineeNote: "Week 1 recap for coach.",
			presentation: { locale: "sk", units: "lb" },
			sessions: [
				expect.objectContaining({
					id: finished.id,
					name: "Tlakový deň A",
					status: "completed",
				}),
			],
			signature: expect.stringMatching(/^[a-f0-9]{64}$/),
		});
		expect(
			exportedPayload.exercises.map((exercise) => exercise.name),
		).toContain("Tlak na lavičke");
		expect(JSON.stringify(exportedPayload)).not.toContain("telemetry");
		expect(JSON.stringify(exportedPayload)).not.toContain("device");
		expect(JSON.stringify(exportedPayload)).not.toContain("ipAddress");

		const imported = await importRecapPack(blob);
		expect(imported.preview).toMatchObject({
			traineeName: "Marek Client",
			units: "lb",
			sessionCount: 1,
			completedSetCount: 1,
			exerciseCount: exportedPayload.exercises.length,
			signatureStatus: "valid",
		});
		expect("commit" in imported).toBe(false);
		expect(normalizeRecapPackPayload(imported.payload)).toEqual(
			normalizeRecapPackPayload(exportedPayload),
		);
	});

	test("rejects a tampered .stfrecap before preview", async () => {
		const finished = await createFinishedTraineeSession();
		const blob = await exportRecapPack({ sessionIds: [finished.id] });
		const tamperedPayload = JSON.parse(await blob.text()) as {
			traineeName: string;
		};
		tamperedPayload.traineeName = "Mallory";

		await expect(
			importRecapPack(
				new Blob([JSON.stringify(tamperedPayload)], { type: blob.type }),
			),
		).rejects.toThrow("Recap Pack signature is invalid.");
	});
});
