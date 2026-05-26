import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AppShell } from "@/components/layout/AppShell";
import { MoreSheet } from "@/components/layout/MoreSheet";
import { sk } from "@/i18n/sk";

async function waitForAsyncUi() {
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

function findButton(container: HTMLDivElement, label: string) {
	const button = Array.from(container.querySelectorAll("button")).find(
		(item) =>
			item.textContent?.includes(label) ||
			item.getAttribute("aria-label") === label,
	);
	expect(button).toBeDefined();
	return button;
}

describe("mobile StingFit shell navigation", () => {
	let container: HTMLDivElement | null = null;
	let root: Root | null = null;

	afterEach(() => {
		vi.restoreAllMocks();
		if (root) {
			act(() => {
				root?.unmount();
			});
		}
		container?.remove();
		root = null;
		container = null;
	});

	async function renderMobileShell() {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(
				<MemoryRouter initialEntries={["/train"]}>
					<AppShell>
						<div>Obsah tréningu</div>
					</AppShell>
				</MemoryRouter>,
			);
			await waitForAsyncUi();
		});

		return container;
	}

	test("keeps the five V3 mobile tiles visible and gives start training a centered CTA", async () => {
		const rendered = await renderMobileShell();

		const bottomNav = rendered.querySelector<HTMLElement>(
			'[data-testid="mobile-bottom-nav"]',
		);
		expect(bottomNav).toBeTruthy();
		expect(bottomNav?.getAttribute("aria-label")).toBe(
			sk.fitness.nav.mobile.ariaLabel,
		);
		expect(bottomNav?.textContent).toContain(sk.fitness.nav.mobile.training);
		expect(bottomNav?.textContent).toContain(sk.fitness.nav.mobile.progress);
		expect(bottomNav?.textContent).toContain(
			sk.fitness.nav.mobile.startTraining,
		);
		expect(bottomNav?.textContent).toContain(sk.fitness.nav.mobile.plans);
		expect(bottomNav?.textContent).toContain(sk.fitness.nav.mobile.more);

		const primaryLink = Array.from(
			bottomNav?.querySelectorAll<HTMLAnchorElement>('a[href="/train"]') ?? [],
		).find((link) =>
			link.textContent?.includes(sk.fitness.nav.mobile.startTraining),
		);
		expect(primaryLink).toBeTruthy();
		expect(primaryLink?.getAttribute("aria-current")).toBe("page");
		expect(primaryLink?.className).toContain("mobile-fab-lift");
		expect(primaryLink?.className).toContain("-mt-5");

		const main = rendered.querySelector("main");
		expect(main?.className).toContain("pb-28");
		expect(main?.className).toContain("md:pb-4");
	});

	test("resets scroll to the top when the route changes", async () => {
		const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		function RouteChangeButton() {
			const navigate = useNavigate();

			return <button onClick={() => navigate("/plans")}>Otvoriť plány</button>;
		}

		await act(async () => {
			root?.render(
				<MemoryRouter initialEntries={["/train"]}>
					<AppShell>
						<RouteChangeButton />
					</AppShell>
				</MemoryRouter>,
			);
			await waitForAsyncUi();
		});
		scrollTo.mockClear();
		const originalScrollY = window.scrollY;
		Object.defineProperty(window, "scrollY", {
			configurable: true,
			value: 320,
		});
		const rendered = container;
		if (!rendered) {
			throw new Error("Mobile shell test container was not created.");
		}

		await act(async () => {
			findButton(rendered, "Otvoriť plány")?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
			await waitForAsyncUi();
		});

		expect(scrollTo).toHaveBeenCalledWith(0, 0);
		Object.defineProperty(window, "scrollY", {
			configurable: true,
			value: originalScrollY,
		});
	});

	test("opens and closes the More sheet with keyboard and overlay actions", async () => {
		const rendered = await renderMobileShell();

		await act(async () => {
			findButton(rendered, sk.fitness.nav.mobile.more)?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
			await waitForAsyncUi();
		});

		const dialog = rendered.querySelector<HTMLElement>(
			'[role="dialog"][aria-modal="true"]',
		);
		expect(dialog).toBeTruthy();
		expect(dialog?.getAttribute("aria-label")).toBe(
			sk.fitness.nav.moreSheet.ariaLabel,
		);
		expect(dialog?.className).toContain("mobile-more-sheet-enter");
		expect(rendered.textContent).toContain(
			sk.fitness.nav.moreSheet.items.plates.label,
		);
		expect(
			rendered.querySelector<HTMLAnchorElement>('a[href="/tools/plates"]'),
		).toBeTruthy();

		await act(async () => {
			window.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
			await waitForAsyncUi();
		});
		expect(rendered.querySelector('[role="dialog"]')).toBeNull();

		await act(async () => {
			findButton(rendered, sk.fitness.nav.mobile.more)?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
			await waitForAsyncUi();
		});
		await act(async () => {
			findButton(
				rendered,
				sk.fitness.nav.moreSheet.closeOverlay,
			)?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
			await waitForAsyncUi();
		});
		expect(rendered.querySelector('[role="dialog"]')).toBeNull();

	});
	test("calls onClose when a More sheet navigation link is selected", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		const onClose = vi.fn();

		await act(async () => {
			root?.render(
				<MemoryRouter initialEntries={["/train"]}>
					<MoreSheet open onClose={onClose} />
				</MemoryRouter>,
			);
			await waitForAsyncUi();
		});

		const historyLink = container.querySelector<HTMLAnchorElement>(
			'a[href="/progress/history"]',
		);
		expect(historyLink).toBeTruthy();
		historyLink?.addEventListener("click", (event) => event.preventDefault(), {
			capture: true,
		});

		await act(async () => {
			historyLink?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
			await waitForAsyncUi();
		});

		expect(onClose).toHaveBeenCalledTimes(1);
	});

});
