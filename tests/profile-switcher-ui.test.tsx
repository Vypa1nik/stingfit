import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { TopBar } from "@/components/layout/TopBar";
import {
	createProfile,
	listProfiles,
} from "@/features/profiles/profileRepository";
import { initDatabase, resetDatabaseState } from "@/lib/database";

async function waitForAsyncUi(delayMs = 100) {
	await new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function renderTopBar() {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(
			<MemoryRouter initialEntries={["/training"]}>
				<TopBar />
			</MemoryRouter>,
		);
	});

	return { container, root };
}

describe("profile switcher", () => {
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

	test("stays hidden for solo users with only one profile", async () => {
		const rendered = renderTopBar();
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(
			rendered.container.querySelector('[aria-label="Aktívny profil"]'),
		).toBeNull();
		expect(rendered.container.textContent).not.toContain("Moje tréningy");
	});

	test("shows a top-bar profile switcher once a second profile exists", async () => {
		const client = await createProfile({ name: "Klient Adam", kind: "client" });

		const rendered = renderTopBar();
		roots.push(rendered.root);
		containers.push(rendered.container);

		await act(async () => {
			await waitForAsyncUi();
		});

		const switcher = rendered.container.querySelector<HTMLSelectElement>(
			'[aria-label="Aktívny profil"]',
		);
		expect(switcher).toBeTruthy();
		expect(switcher?.value).toBe("solo");
		expect(switcher?.textContent).toContain("Moje tréningy");
		expect(switcher?.textContent).toContain("Klient Adam");

		await act(async () => {
			if (!switcher) return;
			switcher.value = client.id;
			switcher.dispatchEvent(new Event("change", { bubbles: true }));
			await waitForAsyncUi();
		});

		expect(
			(await listProfiles()).find((profile) => profile.id === client.id)
				?.isActive,
		).toBe(true);
	});
});
