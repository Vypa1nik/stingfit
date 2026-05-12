const CACHE_VERSION = "stingfit-v2-github-pages";

function toScopeUrl(path) {
	return new URL(path, self.registration.scope).toString();
}

const APP_ROOT = toScopeUrl("");
const APP_INDEX = toScopeUrl("index.html");
const OFFLINE_FALLBACK = toScopeUrl("offline.html");
const APP_SHELL = [
	APP_ROOT,
	APP_INDEX,
	OFFLINE_FALLBACK,
	toScopeUrl("install.html"),
	toScopeUrl("manifest.webmanifest"),
	toScopeUrl("favicon.svg"),
	toScopeUrl("stingfit-icon.svg"),
	toScopeUrl("icon-192.png"),
	toScopeUrl("icon-512.png"),
	toScopeUrl("screenshots/stingfit-training.svg"),
	toScopeUrl("screenshots/stingfit-stats.svg"),
];

function isAppIndexNavigation(url) {
	return url.href === APP_ROOT || url.href === APP_INDEX;
}

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_VERSION)
						.map((key) => caches.delete(key)),
				),
			),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return;
	}

	const requestUrl = new URL(event.request.url);
	const isNavigation = event.request.mode === "navigate";
	const isSameOrigin = requestUrl.origin === self.location.origin;

	if (isNavigation) {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					if (response.ok && isSameOrigin) {
						const clone = response.clone();
						caches
							.open(CACHE_VERSION)
							.then((cache) =>
								cache.put(
									isAppIndexNavigation(requestUrl) ? APP_INDEX : event.request,
									clone,
								),
							);
					}
					return response;
				})
				.catch(async () => {
					const cache = await caches.open(CACHE_VERSION);
					return (
						cache.match(event.request) ||
						cache.match(APP_INDEX) ||
						cache.match(OFFLINE_FALLBACK) ||
						cache.match(APP_ROOT)
					);
				}),
		);
		return;
	}

	if (!isSameOrigin) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return fetch(event.request).then((response) => {
				if (!response.ok) {
					return response;
				}

				const clone = response.clone();
				caches
					.open(CACHE_VERSION)
					.then((cache) => cache.put(event.request, clone));
				return response;
			});
		}),
	);
});
