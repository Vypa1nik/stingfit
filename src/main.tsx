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
		void navigator.serviceWorker.register(serviceWorkerUrl);
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
