import { existsSync, readdirSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

class ServiceWorkerResponse {
	readonly ok = true;
	private readonly body: string;

	constructor(body: string) {
		this.body = body;
	}

	clone() {
		return new ServiceWorkerResponse(this.body);
	}

	async text() {
		return this.body;
	}
}

interface ServiceWorkerRequest {
	method: string;
	mode: string;
	url: string;
}

interface ServiceWorkerFetchEvent {
	request: ServiceWorkerRequest;
	respondWith(response: Promise<ServiceWorkerResponse | undefined>): void;
}

interface ServiceWorkerListeners {
	fetch?: (event: ServiceWorkerFetchEvent) => void;
}

function cacheRequestKey(request: string | { url: string }) {
	return typeof request === "string" ? request : request.url;
}

function createServiceWorkerHarness(
	fetchResponse: (
		request: ServiceWorkerRequest,
	) => Promise<ServiceWorkerResponse>,
) {
	const cacheStores = new Map<string, Map<string, ServiceWorkerResponse>>();
	const listeners: ServiceWorkerListeners = {};
	const scope = "https://example.test/stingfit/";
	const ensureCache = (name: string) => {
		const existing = cacheStores.get(name);
		if (existing) {
			return existing;
		}
		const cache = new Map<string, ServiceWorkerResponse>();
		cacheStores.set(name, cache);
		return cache;
	};

	runInNewContext(readText("public/sw.js"), {
		URL,
		caches: {
			delete: async (name: string) => cacheStores.delete(name),
			keys: async () => Array.from(cacheStores.keys()),
			open: async (name: string) => ({
				addAll: async (paths: string[]) => {
					const cache = ensureCache(name);
					for (const path of paths) {
						cache.set(path, new ServiceWorkerResponse(`cached:${path}`));
					}
				},
				match: async (request: string | { url: string }) =>
					ensureCache(name).get(cacheRequestKey(request)),
				put: async (
					request: string | { url: string },
					response: ServiceWorkerResponse,
				) => {
					ensureCache(name).set(cacheRequestKey(request), response);
				},
			}),
		},
		fetch: fetchResponse,
		self: {
			addEventListener: (type: string, listener: unknown) => {
				if (type === "fetch") {
					listeners.fetch = listener as ServiceWorkerListeners["fetch"];
				}
			},
			clients: { claim: () => undefined },
			location: { origin: "https://example.test" },
			registration: { scope },
			skipWaiting: () => undefined,
		},
	});

	return { cacheStores, listeners, scope };
}

async function dispatchNavigation(
	listeners: ServiceWorkerListeners,
	url: string,
) {
	let responsePromise: Promise<ServiceWorkerResponse | undefined> | undefined;
	listeners.fetch?.({
		request: { method: "GET", mode: "navigate", url },
		respondWith: (response) => {
			responsePromise = response;
		},
	});
	if (!responsePromise) {
		throw new Error("Service worker did not handle navigation");
	}
	return responsePromise;
}

describe("StingFit PWA install and offline assets", () => {
	test("manifest exposes install metadata, shortcuts, and screenshots for the fitness app", () => {
		const manifest = JSON.parse(readText("public/manifest.webmanifest")) as {
			name: string;
			display: string;
			orientation?: string;
			categories?: string[];
			shortcuts?: Array<{ name: string; url: string }>;
			screenshots?: Array<{
				src: string;
				sizes: string;
				type: string;
				form_factor?: string;
			}>;
			icons: Array<{ src: string; purpose?: string }>;
		};

		expect(manifest.name).toBe("StingFit");
		expect(manifest.display).toBe("standalone");
		expect(manifest.orientation).toBe("portrait");
		expect(manifest.categories).toEqual(
			expect.arrayContaining(["fitness", "health", "sports"]),
		);
		expect(manifest.shortcuts).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "Tréning", url: "./#/training" }),
				expect.objectContaining({ name: "Rýchly tréning", url: "./#/quick" }),
				expect.objectContaining({ name: "História", url: "./#/history" }),
			]),
		);
		expect(manifest.screenshots).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					src: "screenshots/stingfit-training.svg",
					type: "image/svg+xml",
					form_factor: "narrow",
				}),
				expect.objectContaining({
					src: "screenshots/stingfit-stats.svg",
					type: "image/svg+xml",
					form_factor: "wide",
				}),
			]),
		);
		expect(
			manifest.icons.some((icon) => icon.purpose?.includes("maskable")),
		).toBe(true);
		for (const screenshot of manifest.screenshots ?? []) {
			expect(existsSync(`public/${screenshot.src}`)).toBe(true);
		}
	});

	test("html and service worker provide mobile install metadata and offline fallback", () => {
		const html = readText("index.html");
		const serviceWorker = readText("public/sw.js");

		expect(html).toContain("apple-mobile-web-app-capable");
		expect(html).toContain("apple-mobile-web-app-title");
		expect(html).toContain("apple-mobile-web-app-status-bar-style");
		expect(existsSync("public/offline.html")).toBe(true);
		expect(existsSync("public/install.html")).toBe(true);
		expect(serviceWorker).toContain('toScopeUrl("offline.html")');
		expect(serviceWorker).toContain('toScopeUrl("install.html")');
		expect(serviceWorker).toContain("cache.match(OFFLINE_FALLBACK)");
	});

	test("keeps install navigation from replacing the cached app shell", async () => {
		const cacheName = "stingfit-v2-github-pages";
		const appIndexUrl = "https://example.test/stingfit/index.html";
		const installUrl = "https://example.test/stingfit/install.html";
		const { cacheStores, listeners } = createServiceWorkerHarness(
			async () => new ServiceWorkerResponse("INSTALL_PAGE"),
		);
		cacheStores.set(
			cacheName,
			new Map([[appIndexUrl, new ServiceWorkerResponse("APP_INDEX")]]),
		);

		const onlineResponse = await dispatchNavigation(listeners, installUrl);
		expect(await onlineResponse?.text()).toBe("INSTALL_PAGE");
		await Promise.resolve();
		await Promise.resolve();

		expect(await cacheStores.get(cacheName)?.get(appIndexUrl)?.text()).toBe(
			"APP_INDEX",
		);
	});

	test("serves the cached install guide for install navigations while offline", async () => {
		const cacheName = "stingfit-v2-github-pages";
		const appIndexUrl = "https://example.test/stingfit/index.html";
		const installUrl = "https://example.test/stingfit/install.html";
		const { cacheStores, listeners } = createServiceWorkerHarness(async () => {
			throw new Error("Network unavailable");
		});
		cacheStores.set(
			cacheName,
			new Map([
				[appIndexUrl, new ServiceWorkerResponse("APP_INDEX")],
				[installUrl, new ServiceWorkerResponse("INSTALL_GUIDE")],
			]),
		);

		const offlineResponse = await dispatchNavigation(listeners, installUrl);

		expect(await offlineResponse?.text()).toBe("INSTALL_GUIDE");
	});

	test("documents the install funnel for iOS, Android, desktop, and local preview QA", () => {
		const installDocs = readText("docs/install.md");
		const installPage = readText("public/install.html");

		expect(installDocs.split("\n").slice(0, 5).join("\n")).toContain(
			"Status: Active",
		);
		expect(installDocs).toContain("iOS Safari");
		expect(installDocs).toContain("Android Chrome");
		expect(installDocs).toContain("desktop Chrome/Edge");
		expect(installDocs).toContain("npm run mobile:pwa:start");
		expect(installDocs).toContain("Bez účtu, cloudu a telemetrie");
		expect(installPage).toContain("Nainštaluj StingFit");
		expect(installPage).toContain("Add to Home Screen");
		expect(installPage).toContain("./#/training");
	});

	test("public PWA assets do not keep old LocalFlow preview names", () => {
		const publicFiles = readdirSync("public");

		expect(
			publicFiles.some((file) =>
				file.toLocaleLowerCase("en-US").includes("localflow"),
			),
		).toBe(false);
	});

	test("offline fallback is product-facing and privacy-safe", () => {
		const offline = readText("public/offline.html");

		expect(offline).toContain("StingFit funguje aj offline");
		expect(offline).toContain("Tréningové dáta zostávajú v zariadení");
		expect(offline).toContain("./#/training");
		expect(offline).not.toContain("LocalFlow");
	});
});
