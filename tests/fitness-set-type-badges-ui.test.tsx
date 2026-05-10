import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { WorkoutHistoryDetail } from "@/features/fitness/WorkoutHistoryDetail";
import type {
	FitnessLiveSession,
	FitnessSessionSetRecord,
	FitnessSessionSetType,
} from "@/features/fitness/fitnessTypes";

function makeSet(
	setNumber: number,
	setType: FitnessSessionSetType,
): FitnessSessionSetRecord {
	return {
		id: `set-${setType}`,
		sessionExerciseId: "session-exercise-1",
		setNumber,
		weightKg: setType === "warmup" ? 42.5 : 100,
		reps: setType === "failure" ? 10 : 8,
		rir: setType === "failure" ? 0 : 2,
		setType,
		weightEntryMode: setType === "warmup" ? "per_side" : "total",
		leftWeightKg: setType === "warmup" ? 22.5 : null,
		rightWeightKg: setType === "warmup" ? 20 : null,
		status: "completed" as const,
		completedAt: `2026-04-25T10:${String(10 + setNumber).padStart(2, "0")}:00.000Z`,
		createdAt: "2026-04-25T10:00:00.000Z",
		updatedAt: `2026-04-25T10:${String(10 + setNumber).padStart(2, "0")}:00.000Z`,
	};
}

function makeSession(): FitnessLiveSession {
	return {
		id: "session-set-types",
		planId: "plan-1",
		planWorkoutId: "workout-1",
		name: "Tlakový deň A",
		status: "completed",
		startedAt: "2026-04-25T10:00:00.000Z",
		completedAt: "2026-04-25T11:00:00.000Z",
		notes: "",
		sessionRpe: 8,
		energyLevel: 4,
		createdAt: "2026-04-25T10:00:00.000Z",
		updatedAt: "2026-04-25T11:00:00.000Z",
		exercises: [
			{
				id: "session-exercise-1",
				sessionId: "session-set-types",
				exerciseId: "bench-press",
				nameSnapshot: "Tlak na lavičke",
				sortOrder: 0,
				status: "done",
				targetSets: 4,
				minReps: 6,
				maxReps: 10,
				targetRir: 1,
				restSeconds: 150,
				notes: "",
				createdAt: "2026-04-25T10:00:00.000Z",
				updatedAt: "2026-04-25T11:00:00.000Z",
				sets: [
					makeSet(1, "warmup"),
					makeSet(2, "working"),
					makeSet(3, "dropset"),
					makeSet(4, "failure"),
					makeSet(5, "myo"),
				],
			},
		],
	};
}

describe("fitness set type badges", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	test("shows readable set type badges in workout history detail", () => {
		act(() => {
			root.render(<WorkoutHistoryDetail session={makeSession()} />);
		});

		expect(container.textContent).toContain("Rozcvička");
		expect(container.textContent).toContain("Pracovná");
		expect(container.textContent).toContain("Drop set");
		expect(container.textContent).toContain("Do zlyhania");
		expect(container.textContent).toContain("Myo");
		expect(container.textContent).toContain("42.5 kg × 8 · RIR 2 · Rozcvička");
		expect(container.textContent).toContain("Ľ 22.5 / P 20 kg");
		expect(container.textContent).toContain(
			"100 kg × 10 · RIR 0 · Do zlyhania",
		);
	});
});
