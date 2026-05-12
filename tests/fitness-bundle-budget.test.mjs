import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { auditBundleBudget } from "../tools/bundle-budget.mjs";

const tempRoots = [];

function createViteDist(entrySource, scriptSrc = "/assets/index-test.js") {
	const root = mkdtempSync(path.join(tmpdir(), "stingfit-bundle-budget-"));
	tempRoots.push(root);
	mkdirSync(path.join(root, "assets"), { recursive: true });
	writeFileSync(
		path.join(root, "index.html"),
		`<!doctype html><script type="module" crossorigin src="${scriptSrc}"></script>`,
	);
	writeFileSync(path.join(root, "assets", "index-test.js"), entrySource);
	return root;
}

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		rmSync(root, { recursive: true, force: true });
	}
});

describe("bundle budget tooling", () => {
	test("passes when the Vite main entry chunk is below the gzipped budget", async () => {
		const distDir = createViteDist('console.log("small StingFit shell")');

		const result = await auditBundleBudget({ distDir, mainBudgetKb: 5 });

		expect(result.mainEntry.file).toBe("assets/index-test.js");
		expect(result.mainEntry.gzipKb).toBeLessThan(5);
	});

	test("handles Vite builds served from a GitHub Pages project base path", async () => {
		const distDir = createViteDist(
			'console.log("small StingFit shell")',
			"/stingfit/assets/index-test.js",
		);

		const result = await auditBundleBudget({ distDir, mainBudgetKb: 5 });

		expect(result.mainEntry.file).toBe("assets/index-test.js");
		expect(result.mainEntry.gzipKb).toBeLessThan(5);
	});

	test("fails when the Vite main entry chunk exceeds the gzipped budget", async () => {
		const distDir = createViteDist(
			Array.from(
				{ length: 2000 },
				(_, index) => `const value${index} = "${index}";`,
			).join("\n"),
		);

		await expect(
			auditBundleBudget({ distDir, mainBudgetKb: 0.01 }),
		).rejects.toThrow(/main entry chunk exceeds 0\.01 KB gzipped/);
	});
});
