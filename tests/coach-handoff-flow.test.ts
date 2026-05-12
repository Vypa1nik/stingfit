import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { exportPlanPack, importPlanPack } from "@/features/coach/planPack/io";
import {
	exportRecapPack,
	importRecapPack,
} from "@/features/coach/recapPack/io";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import {
	createProfile,
	setActiveProfile,
} from "@/features/profiles/profileRepository";
import { clearAllData, resetDatabaseState } from "@/lib/database";

async function createCoachPlanPack() {
	await fitnessRepository.seedStarterData();
	await fitnessRepository.updateSettings({ displayUnit: "lb" });
	const coach = await createProfile({ name: "Coach Nina", kind: "coach" });
	await setActiveProfile(coach.id);

	const starter = (await fitnessRepository.listStarterPlans()).find(
		(plan) => plan.name === "Tlak / Ťah / Nohy",
	);
	if (!starter) {
		throw new Error("PPL starter missing");
	}

	const plan = await fitnessRepository.createPersonalPlanFromStarter(
		starter.id,
		{
			name: "Client Hypertrophy Block",
			goal: "Build muscle with a coach plan",
		},
	);

	return exportPlanPack(plan.id);
}

describe("Coach handoff flow", () => {
	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
	});

	afterEach(async () => {
		await resetDatabaseState();
	});

	test("moves a plan from coach to trainee and a read-only recap back to coach", async () => {
		const planPack = await createCoachPlanPack();

		await resetDatabaseState();
		await clearAllData();
		const trainee = await createProfile({
			name: "Marek Client",
			kind: "client",
		});
		await setActiveProfile(trainee.id);

		const importedPlan = await importPlanPack(planPack);
		expect(importedPlan.preview).toMatchObject({
			planName: "Client Hypertrophy Block",
			coachName: "Coach Nina",
			units: "lb",
			signatureStatus: "valid",
		});

		const committedPlan = await importedPlan.commit();
		expect(committedPlan).toMatchObject({
			planName: "Client Hypertrophy Block",
		});

		const workout = (await fitnessRepository.listStartableWorkouts()).find(
			(item) =>
				item.planId === committedPlan.planId &&
				item.workoutName === "Tlakový deň A",
		);
		expect(workout).toBeDefined();

		const session = await fitnessRepository.startSessionFromPlanWorkout(
			workout!.workoutId,
		);
		const firstSet = session.exercises[0]?.sets[0];
		expect(firstSet).toBeDefined();

		await fitnessRepository.logSet(firstSet!.id, {
			weightKg: 100,
			reps: 8,
			rir: 1,
			setType: "working",
		});
		const finished = await fitnessRepository.finishSession(session.id, {
			sessionRpe: 8,
			energyLevel: 4,
			notes: "Ready for coach review.",
		});
		expect(finished).toMatchObject({
			name: "Tlakový deň A",
			status: "completed",
		});

		const recapPack = await exportRecapPack({
			sessionIds: [finished.id],
			traineeNote: "Week 1 recap for Coach Nina.",
		});

		await resetDatabaseState();
		await clearAllData();
		const coach = await createProfile({ name: "Coach Nina", kind: "coach" });
		await setActiveProfile(coach.id);

		const importedRecap = await importRecapPack(recapPack);
		expect(importedRecap.preview).toMatchObject({
			traineeName: "Marek Client",
			units: "kg",
			sessionCount: 1,
			completedSetCount: 1,
			signatureStatus: "valid",
		});
		expect("commit" in importedRecap).toBe(false);
		expect(importedRecap.payload.sessions[0]).toMatchObject({
			id: finished.id,
			name: "Tlakový deň A",
			status: "completed",
		});
		expect(
			importedRecap.payload.sessions[0]?.exercises[0]?.sets[0],
		).toMatchObject({
			status: "completed",
			weightKg: 100,
			reps: 8,
			rir: 1,
		});
	});
});
