import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { en } from "@/i18n/en";
import { sk } from "@/i18n/sk";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

function collectShape(value: unknown, prefix = ""): string[] {
	if (typeof value === "function") {
		return [`${prefix}:function`];
	}
	if (!value || typeof value !== "object") {
		return [`${prefix}:${typeof value}`];
	}

	return Object.keys(value as Record<string, unknown>)
		.sort()
		.flatMap((key) =>
			collectShape(
				(value as Record<string, unknown>)[key],
				prefix ? `${prefix}.${key}` : key,
			),
		);
}

describe("Slovak i18n catalog scaffold", () => {
	test("ships an English placeholder catalog with the same key shape", () => {
		expect(collectShape(en)).toEqual(collectShape(sk));
		expect(en.fitness.plates.heroTitle).toBe(
			"[en] Kalkulačka kotúčov pred sériou.",
		);
	});

	test("centralizes Phase 3 install, backup, and gesture copy", () => {
		expect(sk.fitness.pwa.installTitle).toBe("Inštalácia aplikácie");
		expect(sk.fitness.pwa.privatePromise).toContain(
			"Bez účtu, cloudu a telemetrie",
		);
		expect(sk.fitness.pwa.installGuideButton).toBe(
			"Otvoriť návod na inštaláciu",
		);
		expect(sk.fitness.backupNudge.title).toBe("Čas na lokálnu zálohu");
		expect(sk.fitness.backupNudge.snoozeButton).toBe(
			"Pripomenúť pri ďalších 30",
		);
		expect(sk.fitness.setGestures.completedSetAria(2)).toContain("Séria 2");
		expect(sk.fitness.setGestures.duplicateAria(2)).toBe("Duplikovať sériu 2");
	});

	test("centralizes shared plate calculator, logger, history, stats, onboarding, and profile copy", () => {
		expect(sk.fitness.plates.heroTitle).toBe("Kalkulačka kotúčov pred sériou.");
		expect(sk.fitness.plates.targetWeightLabel("kg")).toBe("Cieľová váha v kg");
		expect(sk.fitness.plateLoad.title).toBe("Kalkulačka kotúčov");
		expect(sk.fitness.setLogger.plateCalculatorCollapsedHint).toContain(
			"aktuálnu váhu série",
		);
		expect(sk.fitness.history.emptyTitle).toBe(
			"Zatiaľ žiadne dokončené tréningy",
		);
		expect(sk.fitness.stats.emptyTitle).toBe("Zatiaľ žiadne štatistiky");
		expect(sk.fitness.onboarding.title).toBe("Vyber jednoduchý začiatok");
		expect(sk.fitness.simpleStart.quickButton).toBe("Len rýchly tréning");
		expect(sk.fitness.profiles.activeProfileLabel).toBe("Aktívny profil");
		expect(sk.fitness.coachMode.settingsTitle).toBe("Som tréner");
		expect(sk.fitness.coachMode.settingsStatus(false)).toBe(
			"Coach Mode: vypnutý",
		);
		expect(sk.fitness.traineeCoach.planImportTitle).toBe(
			"Importovať plán od trénera",
		);
		expect(sk.fitness.traineeCoach.recapExportTitle).toBe(
			"Vytvoriť rekap pre trénera",
		);
	});

	test("centralizes V3 shell and progress hub copy", () => {
		expect(sk.fitness.nav.items.today).toBe("Dnes");
		expect(sk.fitness.nav.items.progressLifts).toBe("Cviky (grafy)");
		expect(sk.fitness.nav.groups.tools).toBe("Nástroje");
		expect(sk.fitness.nav.mobile.startTraining).toBe("+ Tréning");
		expect(sk.fitness.nav.moreSheet.items.plates.label).toBe(
			"Kalkulačka kotúčov",
		);
		expect(sk.fitness.progressHub.badge).toBe("Progres & Zápisník");
		expect(sk.fitness.progressHub.cards.completedWorkouts(2)).toBe(
			"2 dokončených tréningov.",
		);
		expect(sk.fitness.progressHub.tabs.history).toBe("História");
		expect(sk.fitness.redirectBanner.message("/stats", "Progres")).toBe(
			"Presunuté: pôvodná URL `/stats` automaticky otvára Progres. Aktualizuj záložky.",
		);
		expect(en.fitness.nav.items.today).toBe("[en] Dnes");
	});

	test("uses the catalog in V3 shell and Progress hub surfaces", () => {
		expect(readText("src/lib/constants.ts")).toContain("sk.fitness.nav.items");
		expect(readText("src/components/layout/NavigationSidebar.tsx")).toContain(
			"sk.fitness.nav",
		);
		expect(readText("src/components/layout/MobileBottomNav.tsx")).toContain(
			"sk.fitness.nav.mobile",
		);
		expect(readText("src/components/layout/MoreSheet.tsx")).toContain(
			"sk.fitness.nav.moreSheet",
		);
		expect(readText("src/features/progress/ProgressHubPage.tsx")).toContain(
			"sk.fitness.progressHub",
		);
		expect(
			readText("src/components/layout/RedirectDeprecationBanner.tsx"),
		).toContain("sk.fitness.redirectBanner");
	});

	test("uses the catalog in the Phase 3 user-facing surfaces", () => {
		expect(readText("src/features/fitness/FitnessSettingsPage.tsx")).toContain(
			"sk.fitness.pwa.installTitle",
		);
		expect(readText("src/features/fitness/FitnessSettingsPage.tsx")).toContain(
			"sk.fitness.pwa.installGuideButton",
		);
		expect(readText("src/features/fitness/FitnessDashboard.tsx")).toContain(
			"sk.fitness.backupNudge.title",
		);
		expect(readText("src/features/fitness/LiveTrainingSession.tsx")).toContain(
			"sk.fitness.setGestures.completedSetAria",
		);
	});

	test("uses the catalog in plate calculator, set logger, history, stats, onboarding, and profile surfaces", () => {
		expect(
			readText("src/features/fitness/FitnessPlateCalculatorPage.tsx"),
		).toContain("sk.fitness.plates.heroTitle");
		expect(readText("src/features/fitness/PlateLoadPanel.tsx")).toContain(
			"sk.fitness.plateLoad.title",
		);
		expect(readText("src/features/fitness/SetLogger.tsx")).toContain(
			"sk.fitness.setLogger.plateCalculatorCollapsedHint",
		);
		expect(readText("src/features/fitness/FitnessHistoryPage.tsx")).toContain(
			"sk.fitness.history.emptyTitle",
		);
		expect(readText("src/features/fitness/FitnessStatsPage.tsx")).toContain(
			"sk.fitness.stats.emptyTitle",
		);
		expect(readText("src/features/onboarding/OnboardingFlow.tsx")).toContain(
			"sk.fitness.onboarding.title",
		);
		expect(readText("src/features/fitness/SimpleStartBuilder.tsx")).toContain(
			"sk.fitness.simpleStart.quickButton",
		);
		expect(readText("src/features/profiles/ProfileSwitcher.tsx")).toContain(
			"sk.fitness.profiles.activeProfileLabel",
		);
		expect(readText("src/features/coach/CoachModePage.tsx")).toContain(
			"sk.fitness.coachMode.disabledTitle",
		);
		expect(readText("src/features/fitness/FitnessSettingsPage.tsx")).toContain(
			"sk.fitness.coachMode.settingsTitle",
		);
		expect(readText("src/features/fitness/FitnessSettingsPage.tsx")).toContain(
			"sk.fitness.traineeCoach.planImportTitle",
		);
		expect(readText("src/features/fitness/FitnessHistoryPage.tsx")).toContain(
			"sk.fitness.traineeCoach.recapExportTitle",
		);
	});
});
