import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { setCoachModeEnabled } from "@/features/coach/coachModeRepository";
import { exportRecapPack } from "@/features/coach/recapPack/io";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import {
	createProfile,
	setActiveProfile,
} from "@/features/profiles/profileRepository";
import { clearAllData, resetDatabaseState } from "@/lib/database";
import { AppRouter } from "@/router";

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

function renderRoute(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<AppRouter />
		</MemoryRouter>,
	);
}

async function createCoachPlan() {
	await fitnessRepository.seedStarterData();
	const coach = await createProfile({ name: "Coach Nina", kind: "coach" });
	await setActiveProfile(coach.id);
	const starter = (await fitnessRepository.listStarterPlans()).find(
		(plan) => plan.name === "Tlak / Ťah / Nohy",
	);
	if (!starter) {
		throw new Error("PPL starter missing");
	}

	return fitnessRepository.createPersonalPlanFromStarter(starter.id, {
		name: "Client Hypertrophy Block",
		goal: "Build muscle",
	});
}

async function createRecapBlobForClient() {
	await fitnessRepository.seedStarterData();
	await fitnessRepository.updateSettings({ displayUnit: "lb" });
	const client = await createProfile({ name: "Marek Client", kind: "client" });
	await setActiveProfile(client.id);
	const starter = (await fitnessRepository.listStarterPlans()).find(
		(plan) => plan.name === "Tlak / Ťah / Nohy",
	);
	if (!starter) {
		throw new Error("PPL starter missing");
	}

	await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
		name: "Client Week 1",
		goal: "Send recap",
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
	const finished = await fitnessRepository.finishSession(session.id, {
		sessionRpe: 8,
		energyLevel: 4,
		notes: "Bench moved well.",
	});

	return exportRecapPack({
		sessionIds: [finished.id],
		traineeNote: "Week 1 recap for coach.",
	});
}

describe("Coach Mode UI", () => {
	let roots: Root[] = [];
	let containers: HTMLDivElement[] = [];

	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: vi.fn(() => "blob:coach-pack"),
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

	test("lists client profiles with a local-only empty state", async () => {
		await createProfile({ name: "Marek Client", kind: "client" });
		await setCoachModeEnabled(true);

		const rendered = renderRoute("/coach/clients");
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Klienti trénera");
		expect(rendered.container.textContent).toContain("Marek Client");
		expect(rendered.container.textContent).toContain("Zatiaľ bez rekapu");
		expect(rendered.container.textContent).toContain("Žiadny cloud ani konto");
	});

	test("lists coach plans and exports a selected plan pack", async () => {
		await createCoachPlan();
		await setCoachModeEnabled(true);

		const rendered = renderRoute("/coach/plans");
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Coach plány");
		expect(rendered.container.textContent).toContain(
			"Client Hypertrophy Block",
		);
		expect(rendered.container.textContent).toContain("Upraviť v Plánoch");

		const exportButton = Array.from(
			rendered.container.querySelectorAll("button"),
		).find((button) => button.textContent?.includes("Exportovať .stfplan"));
		expect(exportButton).toBeDefined();

		await act(async () => {
			exportButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(URL.createObjectURL).toHaveBeenCalled();
		expect(rendered.container.textContent).toContain("Plan Pack pripravený");
	});

	test("shows local template guidance without creating cloud-backed template storage", async () => {
		await setCoachModeEnabled(true);

		const rendered = renderRoute("/coach/templates");
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Šablóny trénera");
		expect(rendered.container.textContent).toContain("Zatiaľ bez coach šablón");
		expect(rendered.container.textContent).toContain("Súkromná knižnica");
	});

	test("previews uploaded recap packs read-only", async () => {
		const recapBlob = await createRecapBlobForClient();
		const coach = await createProfile({ name: "Coach Nina", kind: "coach" });
		await setActiveProfile(coach.id);
		await setCoachModeEnabled(true);

		const rendered = renderRoute("/coach/recaps");
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		const input = rendered.container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement | null;
		expect(input).toBeTruthy();
		const file = new File([await recapBlob.text()], "marek-week-1.stfrecap", {
			type: recapBlob.type,
		});
		Object.defineProperty(input, "files", {
			configurable: true,
			value: [file],
		});

		await act(async () => {
			input?.dispatchEvent(new Event("change", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Recap Pack načítaný");
		expect(rendered.container.textContent).toContain("Marek Client");
		expect(rendered.container.textContent).toContain("1 tréning");
		expect(rendered.container.textContent).toContain("1 dokončená séria");
		expect(rendered.container.textContent).toContain("read-only");
	});
});
