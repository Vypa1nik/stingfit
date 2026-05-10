import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { exportPlanPack } from "@/features/coach/planPack/io";
import { FitnessHistoryPage } from "@/features/fitness/FitnessHistoryPage";
import { FitnessSettingsPage } from "@/features/fitness/FitnessSettingsPage";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import {
	createProfile,
	setActiveProfile,
} from "@/features/profiles/profileRepository";
import { clearAllData, resetDatabaseState } from "@/lib/database";

async function waitForAsyncUi(delayMs = 500) {
	await new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function render(element: ReactNode) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(element);
	});

	return { container, root };
}

async function createCoachPlanPack() {
	await fitnessRepository.seedStarterData();
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

async function createCompletedTraineeSession() {
	await fitnessRepository.seedStarterData();
	await fitnessRepository.updateSettings({ displayUnit: "lb" });
	const trainee = await createProfile({ name: "Marek Client", kind: "client" });
	await setActiveProfile(trainee.id);
	const starter = (await fitnessRepository.listStarterPlans()).find(
		(plan) => plan.name === "Tlak / Ťah / Nohy",
	);
	if (!starter) {
		throw new Error("PPL starter missing");
	}

	await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
		name: "Client Week 1",
		goal: "Send recap to coach",
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
	});
	return fitnessRepository.finishSession(session.id, {
		sessionRpe: 8,
		energyLevel: 4,
		notes: "Ready for coach review.",
	});
}

describe("Trainee coach handoff UI", () => {
	let roots: Root[] = [];
	let containers: HTMLDivElement[] = [];

	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: vi.fn(() => "blob:trainee-pack"),
		});
		Object.defineProperty(URL, "revokeObjectURL", {
			configurable: true,
			value: vi.fn(),
		});
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
			() => undefined,
		);
	});

	afterEach(async () => {
		roots.forEach((root) => act(() => root.unmount()));
		containers.forEach((container) => container.remove());
		roots = [];
		containers = [];
		vi.restoreAllMocks();
		await resetDatabaseState();
	});

	test("imports a coach Plan Pack from Settings with preview before commit", async () => {
		const planPack = await createCoachPlanPack();

		await resetDatabaseState();
		await clearAllData();
		const trainee = await createProfile({
			name: "Marek Client",
			kind: "client",
		});
		await setActiveProfile(trainee.id);

		const rendered = render(<FitnessSettingsPage />);
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		const input = rendered.container.querySelector(
			'input[aria-label="Importovať plán od trénera"]',
		) as HTMLInputElement | null;
		expect(input).toBeTruthy();
		const file = new File(
			[await planPack.text()],
			"client-hypertrophy-block.stfplan",
			{ type: planPack.type },
		);
		Object.defineProperty(input, "files", {
			configurable: true,
			value: [file],
		});

		await act(async () => {
			input?.dispatchEvent(new Event("change", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Plan Pack načítaný");
		expect(rendered.container.textContent).toContain(
			"Client Hypertrophy Block",
		);
		expect(rendered.container.textContent).toContain("Coach Nina");

		const commitButton = Array.from(
			rendered.container.querySelectorAll("button"),
		).find((button) => button.textContent?.includes("Pridať plán do StingFit"));
		expect(commitButton).toBeDefined();

		await act(async () => {
			commitButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Plán od trénera pridaný");
		await expect(fitnessRepository.listPersonalPlans()).resolves.toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: "Client Hypertrophy Block",
					kind: "personal",
					status: "draft",
				}),
			]),
		);
	});

	test("exports a trainee Recap Pack from History for the picked date range", async () => {
		const finished = await createCompletedTraineeSession();
		const today = finished.completedAt!.slice(0, 10);

		const rendered = render(
			<MemoryRouter>
				<FitnessHistoryPage />
			</MemoryRouter>,
		);
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi(800);
		});

		expect(rendered.container.textContent).toContain(
			"Vytvoriť rekap pre trénera",
		);
		const fromInput = rendered.container.querySelector(
			'input[aria-label="Recap od dátumu"]',
		) as HTMLInputElement | null;
		const toInput = rendered.container.querySelector(
			'input[aria-label="Recap do dátumu"]',
		) as HTMLInputElement | null;
		expect(fromInput).toBeTruthy();
		expect(toInput).toBeTruthy();

		await act(async () => {
			if (fromInput) fromInput.value = today;
			fromInput?.dispatchEvent(new Event("input", { bubbles: true }));
			if (toInput) toInput.value = today;
			toInput?.dispatchEvent(new Event("input", { bubbles: true }));
			await waitForAsyncUi();
		});

		const exportButton = Array.from(
			rendered.container.querySelectorAll("button"),
		).find((button) => button.textContent?.includes("Exportovať .stfrecap"));
		expect(exportButton).toBeDefined();

		await act(async () => {
			exportButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Recap Pack pripravený");
		const exportedBlob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0] as
			| Blob
			| undefined;
		expect(exportedBlob?.type).toBe("application/vnd.stingfit.recap+json");
		const payload = JSON.parse(await exportedBlob!.text()) as {
			traineeName: string;
			sessions: Array<{ id: string; name: string }>;
		};
		expect(payload.traineeName).toBe("Marek Client");
		expect(payload.sessions).toEqual([
			expect.objectContaining({ id: finished.id, name: "Tlakový deň A" }),
		]);
	});
});
