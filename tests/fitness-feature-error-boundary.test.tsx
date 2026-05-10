import { readFileSync } from "node:fs";

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FeatureErrorBoundary } from "@/components/ui/FeatureErrorBoundary";

function BrokenFeature(): null {
	throw new Error("stats render failed");
}

describe("FeatureErrorBoundary", () => {
	let container: HTMLDivElement;
	let root: Root;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
		consoleErrorSpy.mockRestore();
	});

	test("contains a crashed feature without unmounting the surrounding shell", async () => {
		await act(async () => {
			root.render(
				<>
					<p>Training shell stays mounted</p>
					<FeatureErrorBoundary featureName="Štatistiky">
						<BrokenFeature />
					</FeatureErrorBoundary>
				</>,
			);
		});

		expect(container.textContent).toContain("Training shell stays mounted");
		expect(container.textContent).toContain("Štatistiky narazili na problém");
		expect(container.textContent).toContain("Zvyšok StingFit zostáva dostupný");
	});

	test("keeps the planned route and live-session wrappers wired in source", () => {
		const routerSource = readText("src/router.tsx");
		const dashboardSource = readText(
			"src/features/fitness/FitnessDashboard.tsx",
		);

		expect(routerSource).toContain('<FeatureRoute featureName="Tréning">');
		expect(routerSource).toContain('<FeatureRoute featureName="História">');
		expect(routerSource).toContain('<FeatureRoute featureName="Štatistiky">');
		expect(dashboardSource).toMatch(
			/<FeatureErrorBoundary\s+featureName="Živý tréning"/,
		);
		expect(dashboardSource).toContain("<LiveTrainingSession");
	});
});

function readText(path: string) {
	return readFileSync(path, "utf8");
}
