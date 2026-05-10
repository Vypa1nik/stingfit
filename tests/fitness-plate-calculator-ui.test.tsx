import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { FitnessPlateCalculatorPage } from "@/features/fitness/FitnessPlateCalculatorPage";
import { clearAllData, resetDatabaseState } from "@/lib/database";

async function waitForAsyncUi() {
	await new Promise((resolve) => window.setTimeout(resolve, 300));
}

describe("FitnessPlateCalculatorPage", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(async () => {
		await resetDatabaseState();
		await clearAllData();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(async () => {
		act(() => {
			root.unmount();
		});
		container.remove();
		await resetDatabaseState();
	});

	test("renders a standalone plate calculator and updates the loaded plates", async () => {
		await act(async () => {
			root.render(<FitnessPlateCalculatorPage />);
		});
		await act(async () => {
			await waitForAsyncUi();
		});

		expect(container.textContent).toContain("Kalkulačka kotúčov pred sériou");
		expect(container.textContent).toContain("Na stranu: 20 kg × 2");

		const targetInput = container.querySelector<HTMLInputElement>(
			'input[aria-label="Cieľová váha v kg"]',
		);
		const barInput = container.querySelector<HTMLInputElement>(
			'input[aria-label="Hmotnosť tyče v kg"]',
		);
		expect(targetInput).toBeTruthy();
		expect(barInput).toBeTruthy();

		await act(async () => {
			if (targetInput && barInput) {
				targetInput.value = "103";
				targetInput.dispatchEvent(new Event("input", { bubbles: true }));
				barInput.value = "15";
				barInput.dispatchEvent(new Event("input", { bubbles: true }));
			}
		});

		expect(container.textContent).toContain(
			"Najbližšie nižšie: 102.5 kg · chýba 0.5 kg",
		);
	});
});
