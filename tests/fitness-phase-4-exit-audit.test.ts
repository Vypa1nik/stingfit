import { existsSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

describe("StingFit Phase 4 exit audit", () => {
	test("documents distribution readiness with release blockers instead of creating a tag", () => {
		const reportPath = "reports/stingfit-phase-4-exit-audit.md";
		expect(existsSync(reportPath)).toBe(true);

		const report = readText(reportPath);
		const plan = readText("STINGFIT_V2_PLAN.md");
		const changelog = readText("CHANGELOG.md");
		const releaseReadiness = readText(
			"reports/stingfit-v2-release-readiness.md",
		);

		expect(report).toContain("Status: DONE_WITH_CONCERNS");
		expect(report).toContain("Target: V2 Phase 4 — Distribution");
		for (const moduleName of [
			"PWA install funnel",
			"Tauri desktop builds",
			"Public hosting",
			"Release docs",
			"Landing one-pager",
		]) {
			expect(report).toContain(moduleName);
		}
		expect(report).toContain("npm run check");
		expect(report).toMatch(/\d+ test files \/ \d+ tests passed/);
		expect(report).toContain("node ./tools/bundle-budget.mjs");
		expect(report).toContain("Lighthouse gates remain pending");
		expect(report).toContain("https://vypa1nik.github.io/stingfit/");
		expect(report).toContain("Deploy run `25759756360` completed successfully");
		expect(report).toContain("Lighthouse CLI is not available");
		expect(report).toContain("tests/coach-handoff-flow.test.ts");
		expect(report).toContain("desktop installers remain blocked");
		expect(report).toContain("Do not create `v2.0.0`");
		expect(report).not.toContain("LocalFlow");

		expect(plan).toContain(
			"PHASE 4 — Distribution (DONE_WITH_CONCERNS 2026-05-10)",
		);
		expect(changelog).toContain("Phase 4 exit audit");
		expect(releaseReadiness).toContain(
			"reports/stingfit-phase-4-exit-audit.md",
		);
	});
});
