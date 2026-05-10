import { startTransition, useEffect, useState } from "react";

import { useOnboardingStore } from "@/hooks/useOnboarding";

export type DatabaseBootStatus = "booting" | "ready" | "error";

interface DatabaseBootState {
	status: DatabaseBootStatus;
	isReady: boolean;
	error: string | null;
}

const initialDatabaseBootState: DatabaseBootState = {
	status: "booting",
	isReady: false,
	error: null,
};

async function loadDatabaseApi() {
	return import("@/lib/database");
}

export function useDatabase() {
	const [bootState, setBootState] = useState<DatabaseBootState>(
		initialDatabaseBootState,
	);

	useEffect(() => {
		let cancelled = false;

		const bootstrap = async () => {
			try {
				const { initDatabase, seedPerformanceDataset, settingsApi } =
					await loadDatabaseApi();

				await initDatabase();

				const canUsePerfSeed =
					typeof window !== "undefined" &&
					["127.0.0.1", "localhost"].includes(window.location.hostname);
				const perfSeedParam =
					canUsePerfSeed && typeof window !== "undefined"
						? new URLSearchParams(window.location.search).get("perfSeed")
						: null;

				if (perfSeedParam !== null) {
					const parsedTarget = Number(perfSeedParam);
					if (Number.isFinite(parsedTarget) && parsedTarget >= 0) {
						await seedPerformanceDataset(parsedTarget, { clearExisting: true });

						const params = new URLSearchParams(window.location.search);
						params.delete("perfSeed");
						const query = params.toString();
						window.history.replaceState(
							null,
							"",
							`${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
						);
					}
				}

				const onboardingComplete = await settingsApi.get("onboarding_complete");
				if (!cancelled) {
					useOnboardingStore.setState({
						isComplete: onboardingComplete === "true",
						currentStep: 0,
					});
					startTransition(() => {
						setBootState({ status: "ready", isReady: true, error: null });
					});
				}
			} catch (cause) {
				if (!cancelled) {
					setBootState({
						status: "error",
						isReady: false,
						error:
							cause instanceof Error ? cause.message : "Unknown database error",
					});
				}
			}
		};

		void bootstrap();

		return () => {
			cancelled = true;
		};
	}, []);

	return bootState;
}
