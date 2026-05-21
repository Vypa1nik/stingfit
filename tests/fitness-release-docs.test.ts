import { existsSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

describe("StingFit release documentation", () => {
	test("documents V3 as shipped while keeping V2 release material archived", () => {
		const changelog = readText("CHANGELOG.md");
		const readme = readText("README.md");
		const activePlan = readText("STINGFIT_V3_PLAN.md");
		const startHere = readText("AGENT_START_HERE.md");

		expect(readme).toContain("StingFit is the calm, fast bridge");
		expect(readme).toContain("Current V3 Rebuild");
		expect(readme).toContain("current shipped release (`3.0.0`)");
		expect(readme).toContain(
			"old V2 URLs redirect with a one-release deprecation banner",
		);
		expect(readme).toContain("AGENT_START_HERE.md");
		expect(readme).toContain("STINGFIT_V3_PLAN.md");
		expect(readme).toContain("Plan Packs");
		expect(readme).toContain("Recap Packs");
		expect(readme).toContain("https://vypa1nik.github.io/stingfit/");
		expect(readme).toContain("GitHub Pages");
		expect(readme).toContain("Desktop downloads");
		expect(readme).toContain("No verified desktop installers are published yet");
		expect(readme).toContain("reports/stingfit-tauri-desktop-builds.md");
		expect(readme).toContain(
			"publishes the PWA from version tags (`v*`) or manual workflow dispatch",
		);
		expect(readme).toContain(
			"V3 public smoke stays pending until the `v3.0.0` release tag is pushed and deployed",
		);
		expect(readme).toContain(
			"docs/archive/reports/stingfit-v2-release-readiness.md",
		);

		expect(changelog).toContain("## Unreleased");
		expect(changelog).toContain("## 3.0.0 - 2026-05-17");
		expect(changelog).toContain(
			"[`STINGFIT_V3_PLAN.md`](./STINGFIT_V3_PLAN.md)",
		);
		expect(changelog).toContain(
			"Active agent documentation now points cleanly at the V3 plan",
		);
		expect(changelog).toContain("## v2.0.0 - 2026-05-12");
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
		expect(changelog).toContain("Accepted release concerns");
		expect(changelog).toContain("live GitHub Pages deployment");
		expect(changelog).toContain("automated coach handoff rehearsal");

		expect(activePlan).toContain(
			"This is the single authoritative plan for StingFit going forward (V3)",
		);
		expect(activePlan).toContain('Definition of "V3 shipped"');
		expect(startHere).toContain("V3 Ship Status");
		expect(startHere).toContain("V3 shipped locally as 3.0.0");
		expect(startHere).toContain("What Is Still Open");
		expect(existsSync("reports/stingfit-v3.0.0-release-smoke.md")).toBe(true);
		const v3Smoke = readText("reports/stingfit-v3.0.0-release-smoke.md");
		expect(v3Smoke).toContain("LOCAL PRODUCTION PREVIEW PASS");
		expect(v3Smoke).toContain("PUBLIC DEPLOYMENT STALE/PENDING V3 PUSH");
		expect(v3Smoke).toContain("SMOKE_PASS count=24");
		expect(existsSync("reports/stingfit-v2-release-readiness.md")).toBe(false);
		expect(
			existsSync("docs/archive/reports/stingfit-v2-release-readiness.md"),
		).toBe(true);
		expect(
			existsSync("docs/archive/reports/stingfit-v2.0.0-release-notes.md"),
		).toBe(true);
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
		expect(mobileSmoke).toContain("Status: V3 route matrix updated");
		expect(mobileSmoke).toContain(
			"Physical devices are not available in this agent environment",
		);
		expect(mobileSmoke).toContain("npm run mobile:pwa:start");
	});
});
