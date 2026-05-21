import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { sk } from "@/i18n/sk";
import { TRAIN_NAV_ITEMS } from "@/lib/constants";
import { SHORTCUTS } from "@/lib/shortcuts";

describe("fitness navigation (V3 IA)", () => {
	test("promotes the training screen as the first Train-pillar entry", () => {
		expect(TRAIN_NAV_ITEMS[0]).toMatchObject({
			id: "train",
			label: sk.fitness.nav.items.today,
			path: "/train",
		});
	});

	test("router exposes V3 routes (and keeps V2 URLs working via redirects)", () => {
		const routerSource = readFileSync("src/router.tsx", "utf8");

		expect(routerSource).toMatch(/path:\s*["']\/train["']/);
		expect(routerSource).toMatch(/path:\s*["']\/train\/quick["']/);
		expect(routerSource).toMatch(/path:\s*["']\/progress\/lifts["']/);
		expect(routerSource).toMatch(/path:\s*["']\/progress\/prs["']/);
		expect(routerSource).toMatch(/path:\s*["']\/progress\/body["']/);
		expect(routerSource).toMatch(/path:\s*["']\/progress\/journal["']/);
		expect(routerSource).toMatch(/path:\s*["']\/progress\/history["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plans["']/);
		expect(routerSource).toMatch(/path:\s*["']\/tools\/plates["']/);
		expect(routerSource).toMatch(/path:\s*["']\/settings["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plans\/coach\/clients["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plans\/coach\/plans["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plans\/coach\/templates["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plans\/coach\/recaps["']/);

		// Backward-compat redirects from V2 must still resolve
		expect(routerSource).toMatch(/path:\s*["']\/training["']/);
		expect(routerSource).toMatch(/path:\s*["']\/quick["']/);
		expect(routerSource).toMatch(/path:\s*["']\/history["']/);
		expect(routerSource).toMatch(/path:\s*["']\/stats["']/);
		expect(routerSource).toMatch(/path:\s*["']\/plates["']/);
		expect(routerSource).toMatch(/path:\s*["']\/coach\/clients["']/);
		expect(routerSource).toContain("function LegacyRedirect");
		expect(routerSource).toContain('<LegacyRedirect from="/stats" to="/progress" />');
		expect(routerSource).toContain('<ForwardRedirect to="/progress/lifts" />');

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

	test("surfaces the plate calculator from quick actions and a discoverable mobile entry", () => {
		const appSource = readFileSync("src/App.tsx", "utf8");
		const moreSheetSource = readFileSync(
			"src/components/layout/MoreSheet.tsx",
			"utf8",
		);

		expect(appSource).toContain('id: "open-plate-calculator"');
		expect(appSource).toContain('title: "Otvoriť kalkulačku kotúčov"');
		expect(appSource).toContain('navigate("/tools/plates")');
		expect(sk.fitness.nav.moreSheet.items.plates.label).toBe("Kalkulačka kotúčov");
		expect(moreSheetSource).toContain("sk.fitness.nav.moreSheet");
		expect(moreSheetSource).toMatch(/path:\s*["']\/tools\/plates["']/);
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
