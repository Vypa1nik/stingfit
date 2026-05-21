import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { AppShell } from "@/components/layout/AppShell";
import { RedirectDeprecationBanner } from "@/components/layout/RedirectDeprecationBanner";
import { sk } from "@/i18n/sk";
import { clearAllData, resetDatabaseState } from "@/lib/database";
import { AppRouter, type LegacyRedirectInfo } from "@/router";

async function waitForAsyncUi() {
	await new Promise((resolve) => window.setTimeout(resolve, 350));
}

function LocationProbe() {
	const location = useLocation();

	return (
		<span data-testid="location-probe">
			{location.pathname}
			{location.search}
		</span>
	);
}

function renderShell(
	initialEntry:
		| string
		| { pathname: string; state: { legacyRedirect: LegacyRedirectInfo } },
) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(
			<MemoryRouter initialEntries={[initialEntry]}>
				<RedirectDeprecationBanner />
				<div>Target content</div>
			</MemoryRouter>,
		);
	});

	return { container, root };
}

async function renderAppRouter(initialEntry: string) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	await act(async () => {
		root.render(
			<MemoryRouter initialEntries={[initialEntry]}>
				<AppShell>
					<AppRouter />
					<LocationProbe />
				</AppShell>
			</MemoryRouter>,
		);
		await waitForAsyncUi();
	});

	return { container, root };
}

describe("redirect deprecation banner", () => {
	let roots: Root[] = [];
	let containers: HTMLDivElement[] = [];

	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
	});

	afterEach(async () => {
		roots.forEach((root) => act(() => root.unmount()));
		containers.forEach((container) => container.remove());
		roots = [];
		containers = [];
		await resetDatabaseState();
	});

	function track(rendered: { container: HTMLDivElement; root: Root }) {
		containers.push(rendered.container);
		roots.push(rendered.root);
		return rendered.container;
	}

	test("shows the legacy source when a V2 redirect lands on a V3 target", () => {
		const container = track(
			renderShell({
				pathname: "/progress/lifts",
				state: {
					legacyRedirect: {
						kind: "v2-deprecation",
						from: "/stats",
						to: "/progress",
					},
				},
			}),
		);

		expect(container.textContent).toContain(
			sk.fitness.redirectBanner.message(
				"/stats",
				sk.fitness.redirectBanner.destination.progress,
			),
		);
	});

	test("shows coach-mode redirect copy for old coach URLs", () => {
		const container = track(
			renderShell({
				pathname: "/plans/coach/clients",
				state: {
					legacyRedirect: {
						kind: "v2-deprecation",
						from: "/coach/clients",
						to: "/plans/coach/clients",
					},
				},
			}),
		);

		expect(container.textContent).toContain("/coach/clients");
		expect(container.textContent).toContain(
			sk.fitness.redirectBanner.destination.coach,
		);
	});

	test("keeps redirect metadata and query strings through the AppRouter chain", async () => {
		const container = track(await renderAppRouter("/stats?window=12"));

		expect(
			container.querySelector('[data-testid="location-probe"]')?.textContent,
		).toBe("/progress/lifts?window=12");
		expect(container.textContent).toContain(
			sk.fitness.redirectBanner.message(
				"/stats",
				sk.fitness.redirectBanner.destination.progress,
			),
		);
	});

	test("does not show on direct canonical V3 routes", () => {
		const container = track(renderShell("/progress/lifts"));

		expect(container.textContent).not.toContain("Presunuté: pôvodná URL");
	});

	test("can be dismissed for the current visit", () => {
		const container = track(
			renderShell({
				pathname: "/tools/plates",
				state: {
					legacyRedirect: {
						kind: "v2-deprecation",
						from: "/plates",
						to: "/tools/plates",
					},
				},
			}),
		);

		expect(container.textContent).toContain("/plates");
		const dismiss = Array.from(container.querySelectorAll("button")).find(
			(button) =>
				button.textContent?.includes(sk.fitness.redirectBanner.dismiss),
		);
		expect(dismiss).toBeDefined();

		act(() => {
			dismiss?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});

		expect(container.textContent).not.toContain("/plates");
	});
});
