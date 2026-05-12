import { existsSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

describe("StingFit V1 release documentation", () => {
	test("documents V2 release readiness without claiming blocked artifacts are shipped", () => {
		const changelog = readText("CHANGELOG.md");
		const readme = readText("README.md");
		const plan = readText("STINGFIT_V2_PLAN.md");
		const readinessPath = "reports/stingfit-v2-release-readiness.md";

		expect(existsSync(readinessPath)).toBe(true);
		expect(readme).toContain("StingFit is the calm, fast bridge");
		expect(readme).toContain("Plan Packs");
		expect(readme).toContain("Recap Packs");
		expect(readme).toContain("https://vypa1nik.github.io/stingfit/");
		expect(readme).toContain("GitHub Pages");
		expect(readme).toContain("Desktop downloads");
		expect(readme).toContain(
			"No verified desktop installers are published yet",
		);
		expect(readme).toContain("reports/stingfit-tauri-desktop-builds.md");
		expect(readme).toContain("Lighthouse verification is pending");

		expect(changelog).toContain("## v2.0.0 - Pending release");
		for (const phase of [
			"Phase 0",
			"Phase 1",
			"Phase 2",
			"Phase 3",
			"Phase 4",
		]) {
			expect(changelog).toContain(phase);
		}
		expect(changelog).toContain("PWA-only public release path");
		expect(changelog).toContain(
			"Lighthouse, paired-device smoke, and desktop installers remain pending",
		);

		expect(plan).toContain("Release docs (READY_WITH_CONCERNS 2026-05-10)");
		expect(plan).toContain("Tag `v2.0.0` remains pending");

		const readiness = readText(readinessPath);
		expect(readiness).toContain("Status: READY_WITH_CONCERNS");
		expect(readiness).toContain(
			"Live public PWA URL: https://vypa1nik.github.io/stingfit/",
		);
		expect(readiness).toContain("Post-deploy smoke — 2026-05-12");
		expect(readiness).toContain("No desktop download links are published");
		expect(readiness).toContain("Do not tag `v2.0.0` until");
		expect(readiness).not.toContain("LocalFlow");
	});

	test("documents the V1 release and manual QA checklist", () => {
		const changelog = readText("CHANGELOG.md");
		const checklistPath = "reports/stingfit-v1-release-checklist.md";

		expect(changelog).toContain("## Unreleased");
		expect(changelog).toContain(
			"PWA install metadata, offline fallback, and install guidance",
		);
		expect(changelog).toContain("mobile swipe gestures");
		expect(changelog).toContain("simple start builder");
		expect(changelog).toContain(
			"backup nudge after every 30 completed workouts",
		);
		expect(changelog).toContain("telemetry-free privacy/network audit");
		expect(changelog).toContain("## 1.0.0 - 2026-04-25");
		expect(changelog).toContain("StingFit V1");
		expect(changelog).not.toContain("LocalFlow");
		expect(existsSync(checklistPath)).toBe(true);
		expect(existsSync("reports/stingfit-mobile-pwa-smoke.md")).toBe(true);

		const checklist = readText(checklistPath);
		expect(checklist).toContain("V1 status");
		expect(checklist).toContain("Manual mobile smoke checklist");
		expect(checklist).toContain("3 dni / týždeň");
		expect(checklist).toContain("PWA/offline install checklist");
		expect(checklist).toContain("Screenshot guidance");
		expect(checklist).toContain("Known limitations");
		expect(checklist).toContain("No login, no cloud sync, no telemetry");
		expect(checklist).toContain("reports/stingfit-privacy-network-audit.md");
		expect(checklist).not.toContain("Legacy notes/tasks/projects");
		expect(checklist).toContain("npm run test:run");
		expect(checklist).toContain("npm run build");
		expect(checklist).toContain("npm run lint");

		const readme = readText("README.md");
		expect(readme).toContain("Installable PWA shell with offline fallback");
		expect(readme).toContain("Strong CSV import");
		expect(readme).toContain("backup nudge after every 30 completed workouts");
		expect(readme).toContain("reports/stingfit-privacy-network-audit.md");

		const mobileSmoke = readText("reports/stingfit-mobile-pwa-smoke.md");
		expect(mobileSmoke).toContain("Status: BLOCKED for Phase 1 exit");
		expect(mobileSmoke).toContain(
			"Physical devices are not available in this agent environment",
		);
		expect(mobileSmoke).toContain("npm run mobile:pwa:start");
	});
});
