import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
	listProfiles,
	setActiveProfile,
} from "@/features/profiles/profileRepository";
import { initDatabase, query, resetDatabaseState } from "@/lib/database";

const PROFILE_COLUMNS = [
	"id",
	"name",
	"kind",
	"created_at",
	"archived_at",
] as const;

describe("profile migrations", () => {
	beforeEach(async () => {
		await resetDatabaseState();
	});

	afterEach(async () => {
		await resetDatabaseState();
	});

	test("creates profiles table and migrates existing data into one solo profile", async () => {
		await initDatabase();

		const columns = await query<{ name: string }>(
			`PRAGMA table_info(profiles)`,
		);
		expect(columns.map((row) => row.name)).toEqual(
			expect.arrayContaining([...PROFILE_COLUMNS]),
		);

		const profiles = await listProfiles();
		expect(profiles).toEqual([
			expect.objectContaining({
				id: "solo",
				name: "Moje tréningy",
				kind: "solo",
				archivedAt: null,
				isActive: true,
			}),
		]);
	});

	test("keeps the active profile explicit in local app settings", async () => {
		await initDatabase();
		await setActiveProfile("solo");

		const rows = await query<{ value: string }>(
			`SELECT value FROM app_settings WHERE key = 'active_profile_id'`,
		);
		expect(rows).toEqual([{ value: "solo" }]);
	});
});
