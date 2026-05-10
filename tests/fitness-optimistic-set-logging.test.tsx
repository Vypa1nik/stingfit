import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { LiveTrainingSession } from "@/features/fitness/LiveTrainingSession";
import type {
	FitnessLiveSession,
	LogFitnessSetInput,
} from "@/features/fitness/fitnessTypes";
import { useUiStore } from "@/lib/uiStore";

const timestamp = "2026-05-05T10:00:00.000Z";

function createLiveSession(): FitnessLiveSession {
	return {
		id: "session-1",
		planId: "plan-1",
		planWorkoutId: "workout-1",
		name: "Tlakový deň A",
		status: "active",
		startedAt: timestamp,
		completedAt: null,
		notes: "",
		sessionRpe: null,
		energyLevel: null,
		createdAt: timestamp,
		updatedAt: timestamp,
		exercises: [
			{
				id: "session-exercise-1",
				sessionId: "session-1",
				exerciseId: "bench-press",
				nameSnapshot: "Tlak na lavičke",
				categorySnapshot: "chest",
				muscleGroupSnapshot: "chest",
				sortOrder: 1,
				status: "active",
				targetSets: 3,
				minReps: 6,
				maxReps: 8,
				targetRir: 1,
				restSeconds: 90,
				notes: "",
				supersetGroup: null,
				lastPerformance: null,
				createdAt: timestamp,
				updatedAt: timestamp,
				sets: [1, 2, 3].map((setNumber) => ({
					id: `set-${setNumber}`,
					sessionExerciseId: "session-exercise-1",
					setNumber,
					weightKg: 80,
					reps: 8,
					rir: 1,
					setType: "working",
					weightEntryMode: "total",
					leftWeightKg: null,
					rightWeightKg: null,
					status: "planned",
					completedAt: null,
					correctedAt: null,
					correctionCount: 0,
					createdAt: timestamp,
					updatedAt: timestamp,
				})),
			},
		],
	};
}

async function renderLiveSession(
	root: Root,
	onLogSet: (setId: string, input: LogFitnessSetInput) => Promise<void>,
) {
	await act(async () => {
		root.render(
			<LiveTrainingSession
				session={createLiveSession()}
				exerciseOptions={[]}
				displayUnit="kg"
				onLogSet={onLogSet}
				onUpdateSet={vi.fn()}
				onDuplicateSet={vi.fn()}
				onSkipSet={vi.fn()}
				onAddSet={vi.fn()}
				onRemoveSet={vi.fn()}
				onSkipExercise={vi.fn()}
				onAddUnplannedExercise={vi.fn()}
				onFinish={vi.fn()}
				onAbandon={vi.fn()}
			/>,
		);
	});
}

function getLogButton(container: HTMLElement) {
	return Array.from(container.querySelectorAll("button")).find((button) =>
		button.textContent?.includes("Zapísať sériu ⚡ pauza"),
	);
}

describe("optimistic set logging", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		useUiStore.setState({ toasts: [] });
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
		useUiStore.setState({ toasts: [] });
	});

	test("shows a saved set immediately while the repository write is still pending", async () => {
		let resolveLog!: () => void;
		const onLogSet = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveLog = resolve;
				}),
		);

		await renderLiveSession(root, onLogSet);

		const logButton = getLogButton(container);
		expect(logButton).toBeDefined();

		await act(async () => {
			logButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await Promise.resolve();
		});

		expect(onLogSet).toHaveBeenCalledWith(
			"set-1",
			expect.objectContaining({
				weightKg: 80,
				reps: 8,
				rir: 1,
				setType: "working",
			}),
		);
		expect(
			container.querySelector('[data-testid="completed-set-1"]')?.textContent,
		).toContain("80 kg × 8 · RIR 1");
		expect(container.textContent).toContain("1 dokončených");
		expect(container.textContent).toContain("Séria 2 z 3");

		await act(async () => {
			resolveLog();
			await Promise.resolve();
		});
	});

	test("rolls back the optimistic set and raises a toast when saving fails", async () => {
		let rejectLog!: (error: Error) => void;
		const onLogSet = vi.fn(
			() =>
				new Promise<void>((_resolve, reject) => {
					rejectLog = reject;
				}),
		);

		await renderLiveSession(root, onLogSet);

		const logButton = getLogButton(container);
		expect(logButton).toBeDefined();

		await act(async () => {
			logButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await Promise.resolve();
		});

		expect(
			container.querySelector('[data-testid="completed-set-1"]'),
		).toBeTruthy();

		await act(async () => {
			rejectLog(new Error("IndexedDB write failed"));
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(
			container.querySelector('[data-testid="completed-set-1"]'),
		).toBeNull();
		expect(container.textContent).toContain("Séria 1 z 3");
		expect(useUiStore.getState().toasts).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					tone: "error",
					title: "Séria sa neuložila",
					description: "IndexedDB write failed",
				}),
			]),
		);
	});
});
