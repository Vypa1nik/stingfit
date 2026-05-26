import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

async function waitForAsyncUi() {
	await new Promise((resolve) => window.setTimeout(resolve, 50));
}

function ShortcutHarness() {
	useKeyboardShortcuts();
	const location = useLocation();

	return (
		<div>
			<input aria-label="Názov plánu" />
			<div data-testid="path">{location.pathname}</div>
		</div>
	);
}

describe("StingFit keyboard shortcuts", () => {
	let container: HTMLDivElement | null = null;
	let root: Root | null = null;

	afterEach(() => {
		if (root) {
			act(() => {
				root?.unmount();
			});
		}
		container?.remove();
		root = null;
		container = null;
	});

	async function renderShortcutsHarness() {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<MemoryRouter initialEntries={["/train"]}>
					<ShortcutHarness />
				</MemoryRouter>,
			);
			await waitForAsyncUi();
		});

		return container;
	}

	test("does not steal global navigation shortcuts while typing", async () => {
		const rendered = await renderShortcutsHarness();
		const input = rendered.querySelector<HTMLInputElement>(
			'input[aria-label="Názov plánu"]',
		);
		expect(input).toBeTruthy();

		await act(async () => {
			input?.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "n",
					ctrlKey: true,
					bubbles: true,
					cancelable: true,
				}),
			);
			await waitForAsyncUi();
		});

		expect(rendered.querySelector('[data-testid="path"]')?.textContent).toBe(
			"/train",
		);
	});

	test("keeps global navigation shortcuts outside text fields", async () => {
		const rendered = await renderShortcutsHarness();

		await act(async () => {
			window.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "3",
					ctrlKey: true,
					bubbles: true,
					cancelable: true,
				}),
			);
			await waitForAsyncUi();
		});

		expect(rendered.querySelector('[data-testid="path"]')?.textContent).toBe(
			"/plans",
		);
	});
});
