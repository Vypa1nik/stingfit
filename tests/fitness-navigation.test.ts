import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { VIEW_NAV_ITEMS } from "@/lib/constants";
import { SHORTCUTS } from "@/lib/shortcuts";

describe("fitness navigation", () => {
	test("promotes the training screen as a primary view", () => {
		expect(VIEW_NAV_ITEMS[0]).toMatchObject({
			id: "fitness",
			label: "Tréning",
			path: "/training",
		});
	});

	test("keeps fitness routes in the application router", () => {
		const routerSource = readFileSync("src/router.tsx", "utf8");

		expect(routerSource).toMatch(/path:\s*["']\/training["']/);
		expect(routerSource).toMatch(/path:\s*["']\/quick["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plans["']/);
		expect(routerSource).toMatch(/path:\s*["']\/history["']/);
		expect(routerSource).toMatch(/path:\s*["']\/stats["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plates["']/);
		expect(routerSource).toMatch(/path:\s*["']\/settings["']/);
		expect(routerSource).not.toMatch(
			/path:\s*["']\/(notes|tasks|projects|inbox|today|archive|search|view)/,
		);
		expect(routerSource).not.toContain("@/features/notes");
		expect(routerSource).not.toContain("@/features/tasks");
		expect(routerSource).not.toContain("@/features/projects");
		expect(routerSource).not.toContain("@/features/search");
		expect(routerSource).not.toContain("@/features/today");
		expect(routerSource).not.toContain("@/features/views");
	});

	test("fitness dashboard uses custom confirmation UI instead of native browser confirm", () => {
		const dashboardSource = readFileSync(
			"src/features/fitness/FitnessDashboard.tsx",
			"utf8",
		);

		expect(dashboardSource).not.toContain("window.confirm");
	});

	test("fitness screens use SPA navigation instead of hard reloads", () => {
		const files = [
			"src/features/fitness/FitnessDashboard.tsx",
			"src/features/fitness/FitnessHistoryPage.tsx",
			"src/features/fitness/FitnessStatsPage.tsx",
		];

		for (const file of files) {
			expect(readFileSync(file, "utf8"), file).not.toContain(
				"window.location.href",
			);
		}
	});

	test("surfaces the plate calculator from quick actions and mobile navigation", () => {
		const appSource = readFileSync("src/App.tsx", "utf8");
		const mobileNavSource = readFileSync(
			"src/components/layout/MobileBottomNav.tsx",
			"utf8",
		);

		expect(appSource).toContain('id: "open-plate-calculator"');
		expect(appSource).toContain('title: "Otvoriť kalkulačku kotúčov"');
		expect(appSource).toContain('navigate("/plates")');
		expect(mobileNavSource).toContain("Kotúče");
		expect(mobileNavSource).toMatch(/path:\s*["']\/plates["']/);
	});

	test("documents the training dashboard shortcut", () => {
		expect(SHORTCUTS).toContainEqual(
			expect.objectContaining({
				group: "Navigate",
				label: "Prejsť na tréning",
				keys: "Cmd/Ctrl + D",
				description: "Otvoriť živý tréningový panel odkiaľkoľvek.",
			}),
		);
	});
});
