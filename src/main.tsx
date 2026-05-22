import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles/globals.css";

type SeedPerformanceDataset = (
	totalItems?: number,
	options?: { clearExisting?: boolean },
) => Promise<{ exercises: number; sessions: number; total: number }>;

declare global {
	interface Window {
		__STINGFIT_DEBUG__?: {
			seedPerformanceDataset?: SeedPerformanceDataset;
		};
	}
}

if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
	void import("./lib/database").then(({ seedPerformanceDataset }) => {
		window.__STINGFIT_DEBUG__ = {
			...window.__STINGFIT_DEBUG__,
			seedPerformanceDataset,
		};
	});
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
	window.addEventListener("load", () => {
		const appBaseUrl = new URL(
			import.meta.env.BASE_URL,
			window.location.origin,
		);
		const serviceWorkerUrl = new URL("sw.js", appBaseUrl).toString();
		const wasControlledBeforeRegistration = Boolean(
			navigator.serviceWorker.controller,
		);
		let reloadPending = false;

		if (wasControlledBeforeRegistration) {
			navigator.serviceWorker.addEventListener("controllerchange", () => {
				if (reloadPending) {
					return;
				}

				reloadPending = true;
				window.location.reload();
			});
		}

		void navigator.serviceWorker
			.register(serviceWorkerUrl)
			.then((registration) => {
				if (wasControlledBeforeRegistration) {
					void registration.update();
				}
			})
			.catch((error: unknown) => {
				console.error("StingFit service worker registration failed.", error);
			});
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
