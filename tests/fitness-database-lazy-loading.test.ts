import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

describe("database lazy loading", () => {
	test("keeps the database module out of startup entrypoints", () => {
		const appSource = readText("src/App.tsx");
		const mainSource = readText("src/main.tsx");
		const useDatabaseSource = readText("src/hooks/useDatabase.ts");

		expect(mainSource).not.toMatch(/from ['"].*lib\/database['"]/);
		expect(useDatabaseSource).not.toMatch(/from ['"]@\/lib\/database['"]/);
		expect(useDatabaseSource).toMatch(/import\(['"]@\/lib\/database['"]\)/);
		expect(appSource).not.toContain(
			"import('@/features/fitness/fitnessRepository')",
		);
	});
});
