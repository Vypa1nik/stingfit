import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { FitnessDashboard } from "@/features/fitness/FitnessDashboard";
import { clearAllData, resetDatabaseState } from "@/lib/database";

async function waitForAsyncUi(delayMs = 500) {
	await new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function findButton(container: HTMLDivElement, label: string) {
	const button = Array.from(container.querySelectorAll("button")).find((item) =>
		item.textContent?.includes(label),
	);
	expect(button).toBeDefined();
	return button;
}

describe("Simple Start Builder", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(async () => {
		window.matchMedia ??= (() => ({
			matches: false,
			media: "",
			onchange: null,
			addListener: () => undefined,
			removeListener: () => undefined,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false,
		})) as typeof window.matchMedia;
		window.localStorage.clear();
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
		window.localStorage.clear();
		await resetDatabaseState();
	});

	test("lets a new user create the simplest three-day plan from Training", async () => {
		await act(async () => {
			root.render(<FitnessDashboard />);
		});
		await act(async () => {
			await waitForAsyncUi();
		});

		expect(container.textContent).toContain("Začni úplne jednoducho");
		expect(container.textContent).toContain("3 dni / týždeň");
		expect(container.textContent).toContain("Najjednoduchšie");
		expect(container.textContent).toContain("Neviem, vyber za mňa");
		expect(container.textContent).not.toContain(
			"Žiadny pripravený osobný plán",
		);

		await act(async () => {
			findButton(container, "3 dni / týždeň")?.dispatchEvent(
				new MouseEvent("click", { bubbles: true }),
			);
			await waitForAsyncUi(700);
		});

		expect(container.textContent).toContain(
			"Jednoduchý 3-dňový plán je pripravený",
		);
		expect(container.textContent).toContain("Spustiť Celé telo A");
	});

	test("lands first-time onboarding directly on simple start and quick workout choices", async () => {
		const { OnboardingFlow } = await import(
			"@/features/onboarding/OnboardingFlow"
		);

		await act(async () => {
			root.render(
				<MemoryRouter initialEntries={["/"]}>
					<OnboardingFlow />
				</MemoryRouter>,
			);
		});

		expect(container.textContent).toContain("Vyber jednoduchý začiatok");
		expect(container.textContent).toContain("Začni úplne jednoducho");
		expect(container.textContent).toContain("Neviem, vyber za mňa");
		expect(container.textContent).toContain("Len rýchly tréning");
		expect(container.textContent).not.toContain(
			"Rýchly tréningový zápisník bez cloudu",
		);
		expect(container.textContent).not.toContain("Pokračovať");

		await act(async () => {
			findButton(container, "Len rýchly tréning")?.dispatchEvent(
				new MouseEvent("click", { bubbles: true }),
			);
		});

		expect(window.localStorage.getItem("stingfit.onboarding.complete")).toBe(
			"true",
		);
	});
});
