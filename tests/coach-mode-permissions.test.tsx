import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { FitnessSettingsPage } from "@/features/fitness/FitnessSettingsPage";
import { AppRouter } from "@/router";
import {
	getCoachModeEnabled,
	setCoachModeEnabled,
} from "@/features/coach/coachModeRepository";
import { initDatabase, resetDatabaseState } from "@/lib/database";

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

describe("Coach Mode permissions", () => {
	let roots: Root[] = [];
	let containers: HTMLDivElement[] = [];

	beforeEach(async () => {
		await resetDatabaseState();
		await initDatabase();
	});

	afterEach(async () => {
		roots.forEach((root) => act(() => root.unmount()));
		containers.forEach((container) => container.remove());
		roots = [];
		containers = [];
		await resetDatabaseState();
	});

	test("keeps Coach Mode disabled by default and blocks coach routes", async () => {
		await expect(getCoachModeEnabled()).resolves.toBe(false);

		const rendered = renderRoute("/coach/clients");
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Coach Mode je vypnutý");
		expect(rendered.container.textContent).not.toContain("Klienti trénera");
	});

	test.each([
		["/coach/clients", "Klienti trénera"],
		["/coach/plans", "Coach plány"],
		["/coach/templates", "Šablóny trénera"],
		["/coach/recaps", "Rekapy od klientov"],
	])("opens %s only after Coach Mode is enabled", async (path, title) => {
		await setCoachModeEnabled(true);

		const rendered = renderRoute(path);
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain(title);
		expect(rendered.container.textContent).toContain("Coach Mode");
		expect(rendered.container.textContent).not.toContain(
			"Coach Mode je vypnutý",
		);
	});

	test("toggles Coach Mode from Settings without exposing cloud features", async () => {
		const rendered = render(<FitnessSettingsPage />);
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Som tréner");
		expect(rendered.container.textContent).toContain("Coach Mode: vypnutý");
		expect(rendered.container.textContent).toContain("bez účtu alebo cloudu");

		const enableButton = Array.from(
			rendered.container.querySelectorAll("button"),
		).find((button) => button.textContent?.includes("Zapnúť Coach Mode"));
		expect(enableButton).toBeDefined();

		await act(async () => {
			enableButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(rendered.container.textContent).toContain("Coach Mode zapnutý");
		await expect(getCoachModeEnabled()).resolves.toBe(true);
	});
});
