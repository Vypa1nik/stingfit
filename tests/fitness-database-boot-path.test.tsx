import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { useDatabase, type DatabaseBootStatus } from "@/hooks/useDatabase";
import {
	initDatabase,
	resetDatabaseState,
	type DatabaseBootMetric,
} from "@/lib/database";

function waitForAsyncUi() {
	return new Promise((resolve) => window.setTimeout(resolve, 1000));
}

function getDebugChannel() {
	return globalThis as typeof globalThis & {
		__STINGFIT_DEBUG__?: {
			databaseBoot?: DatabaseBootMetric;
			databaseBoots?: DatabaseBootMetric[];
		};
	};
}

describe("database boot path", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(async () => {
		await resetDatabaseState();
		delete getDebugChannel().__STINGFIT_DEBUG__;
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
		delete getDebugChannel().__STINGFIT_DEBUG__;
	});

	test("records sql.js boot duration in the debug channel", async () => {
		await initDatabase();

		const debug = getDebugChannel().__STINGFIT_DEBUG__;
		const metric = debug?.databaseBoot;

		expect(metric?.status).toBe("ready");
		expect(metric?.durationMs).toBeGreaterThanOrEqual(0);
		expect(metric?.sqlJsDurationMs).toBeGreaterThanOrEqual(0);
		expect(metric?.storageDurationMs).toBeGreaterThanOrEqual(0);
		expect(metric?.migrationDurationMs).toBeGreaterThanOrEqual(0);
		expect(debug?.databaseBoots).toHaveLength(1);
		expect(debug?.databaseBoots?.[0]).toEqual(metric);
	});

	test("exposes an explicit booting to ready boundary from useDatabase", async () => {
		const seenStatuses: DatabaseBootStatus[] = [];

		function Probe() {
			const database = useDatabase();

			useEffect(() => {
				seenStatuses.push(database.status);
			}, [database.status]);

			return (
				<div>
					{database.status}:{database.isReady ? "ready" : "not-ready"}
				</div>
			);
		}

		await act(async () => {
			root.render(<Probe />);
		});

		expect(container.textContent).toBe("booting:not-ready");

		await act(async () => {
			await waitForAsyncUi();
		});

		expect(seenStatuses).toEqual(expect.arrayContaining(["booting", "ready"]));
		expect(container.textContent).toBe("ready:ready");
	});
});
