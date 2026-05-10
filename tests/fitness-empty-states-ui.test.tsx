import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FitnessDashboard } from "@/features/fitness/FitnessDashboard";
import { FitnessHistoryPage } from "@/features/fitness/FitnessHistoryPage";
import { FitnessPlansPage } from "@/features/fitness/FitnessPlansPage";
import { FitnessPlateCalculatorPage } from "@/features/fitness/FitnessPlateCalculatorPage";
import { FitnessQuickSessionPage } from "@/features/fitness/FitnessQuickSessionPage";
import { FitnessSettingsPage } from "@/features/fitness/FitnessSettingsPage";
import { FitnessStatsPage } from "@/features/fitness/FitnessStatsPage";
import { clearAllData, resetDatabaseState } from "@/lib/database";

async function waitForAsyncUi() {
	await new Promise((resolve) => window.setTimeout(resolve, 700));
}

function renderRoute(element: ReactNode) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(<MemoryRouter>{element}</MemoryRouter>);
	});

	return { container, root };
}

const genericEmptyCopy = [
	"Nothing here yet",
	"No data",
	"No items",
	"Empty state",
	"Žiadne dáta",
	"Nič tu nie je",
];

describe("fitness empty route states", () => {
	let rendered: Array<{ container: HTMLDivElement; root: Root }> = [];

	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: vi.fn(() => "blob:stingfit-backup"),
		});
		Object.defineProperty(URL, "revokeObjectURL", {
			configurable: true,
			value: vi.fn(),
		});
	});

	afterEach(async () => {
		rendered.forEach(({ root }) => {
			act(() => root.unmount());
		});
		rendered.forEach(({ container }) => container.remove());
		rendered = [];
		vi.restoreAllMocks();
		await resetDatabaseState();
	});

	test.each([
		{
			route: "/training",
			element: <FitnessDashboard />,
			expectedCopy: [
				"Začni úplne jednoducho",
				"3 dni / týždeň",
				"Len rýchly tréning",
			],
		},
		{
			route: "/quick",
			element: <FitnessQuickSessionPage />,
			expectedCopy: [
				"Rýchly tréning",
				"Rýchly štart bez plánu",
				"Najčastejšie cviky",
			],
		},
		{
			route: "/plans",
			element: <FitnessPlansPage />,
			expectedCopy: [
				"Tvorba osobného plánu",
				"Zatiaľ nemáš osobné plány",
				"Vytvoriť prázdny plán",
			],
		},
		{
			route: "/history",
			element: <FitnessHistoryPage />,
			expectedCopy: [
				"Zatiaľ žiadne dokončené tréningy",
				"Spusti a dokonči plánovaný tréning",
				"Prejsť na tréning",
			],
		},
		{
			route: "/stats",
			element: <FitnessStatsPage />,
			expectedCopy: [
				"Zatiaľ žiadne štatistiky",
				"Dokonči tréning",
				"Prejsť na tréning",
			],
		},
		{
			route: "/plates",
			element: <FitnessPlateCalculatorPage />,
			expectedCopy: [
				"Kalkulačka kotúčov pred sériou",
				"Cieľová váha v kg",
				"Na stranu: 20 kg × 2",
			],
		},
		{
			route: "/settings",
			element: <FitnessSettingsPage />,
			expectedCopy: [
				"Bezpečnosť dát",
				"Najprv si sprav lokálnu zálohu",
				"Exportovať lokálnu zálohu",
			],
		},
	])("renders actionable empty-state copy for $route with an empty local database", async ({
		element,
		expectedCopy,
	}) => {
		const route = renderRoute(element);
		rendered.push(route);

		await act(async () => {
			await waitForAsyncUi();
		});

		for (const copy of expectedCopy) {
			expect(route.container.textContent).toContain(copy);
		}
		for (const genericCopy of genericEmptyCopy) {
			expect(route.container.textContent).not.toContain(genericCopy);
		}
	});
});
