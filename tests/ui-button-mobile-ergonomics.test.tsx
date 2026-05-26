import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, test } from "vitest";

import { Button } from "@/components/ui/Button";

describe("Button mobile ergonomics", () => {
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

	test("keeps compact buttons at a 44px mobile tap target", () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		act(() => {
			root?.render(<Button size="sm">Upraviť</Button>);
		});

		const button = container.querySelector("button");
		expect(button?.className).toContain("min-h-11");
		expect(button?.className).toContain("sm:h-8");
		expect(button?.className).toContain("sm:min-h-8");
	});
});
