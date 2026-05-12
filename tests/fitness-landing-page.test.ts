import { existsSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

describe("StingFit V2 landing one-pager", () => {
	test("ships a static launch-first landing page without claiming blocked downloads", () => {
		const landingPath = "docs/landing/index.html";

		expect(existsSync(landingPath)).toBe(true);

		const landing = readText(landingPath);

		expect(landing).toContain("Status: Active");
		expect(landing).toContain("Plan od trénera. Tréning bez trenia.");
		expect(landing).toContain("https://vypa1nik.github.io/stingfit/");
		expect(landing).toContain("Nainštalovať PWA");
		expect(landing).toContain("Desktop pending");
		expect(landing).toContain(
			"No verified desktop installers are published yet",
		);
		expect(landing).toContain(".stfplan");
		expect(landing).toContain(".stfrecap");
		expect(landing).toContain("public/screenshots/stingfit-training.svg");
		expect(landing).toContain("public/screenshots/stingfit-stats.svg");
		expect(landing).toContain("Coach handoff mockup");
		expect(landing).toContain("No login");
		expect(landing).toContain("No cloud sync");
		expect(landing).toContain("No telemetry");
		expect(landing).toContain("No subscription");
		expect(landing).not.toContain("LocalFlow");
		expect(landing).not.toContain('href="downloads/stingfit');
		expect(landing).not.toContain('href="/downloads/stingfit');
	});

	test("keeps active release docs linked to the landing page", () => {
		const readme = readText("README.md");
		const changelog = readText("CHANGELOG.md");
		const plan = readText("STINGFIT_V2_PLAN.md");

		expect(readme).toContain("docs/landing/index.html");
		expect(changelog).toContain("static landing one-pager");
		expect(plan).toContain("Landing one-pager (READY 2026-05-10)");
	});
});
