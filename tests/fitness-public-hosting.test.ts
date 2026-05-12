import { existsSync, readFileSync } from "node:fs";

import { loadConfigFromFile } from "vite";
import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

interface PwaManifest {
	id: string;
	start_url: string;
	scope: string;
	shortcuts?: Array<{ url: string; icons?: Array<{ src: string }> }>;
	screenshots?: Array<{ src: string }>;
	icons: Array<{ src: string }>;
}

describe("StingFit GitHub Pages public hosting", () => {
	test("adds a tag-driven GitHub Pages workflow for the built PWA", () => {
		const workflowPath = ".github/workflows/deploy-pwa.yml";
		expect(existsSync(workflowPath)).toBe(true);
		const workflow = readText(workflowPath);

		expect(workflow).toContain("name: Deploy StingFit PWA");
		expect(workflow).toContain("tags:");
		expect(workflow).toContain('"v2*"');
		expect(workflow).toContain("VITE_BASE_PATH: /stingfit/");
		expect(workflow).toContain("permissions:");
		expect(workflow).toContain("pages: write");
		expect(workflow).toContain("id-token: write");
		expect(workflow).toContain("actions/configure-pages@v5");
		expect(workflow).toContain("enablement: true");
		expect(workflow).toContain("actions/upload-pages-artifact@v3");
		expect(workflow).toContain("actions/deploy-pages@v4");
		expect(workflow).toContain("npm ci");
		expect(workflow).toContain("npm run lint");
		expect(workflow).toContain("npm run test:run");
		expect(workflow).toContain("npm run build");
		expect(workflow).toContain("node ./tools/bundle-budget.mjs");
	});

	test("keeps Vite, HTML, manifest, and service worker compatible with /stingfit/", () => {
		const viteConfig = readText("vite.config.ts");
		const indexHtml = readText("index.html");
		const mainSource = readText("src/main.tsx");
		const serviceWorker = readText("public/sw.js");
		const installPage = readText("public/install.html");
		const offlinePage = readText("public/offline.html");
		const manifest = JSON.parse(
			readText("public/manifest.webmanifest"),
		) as PwaManifest;

		expect(viteConfig).toContain("VITE_BASE_PATH");
		expect(viteConfig).toContain("base:");
		expect(indexHtml).toContain("%BASE_URL%manifest.webmanifest");
		expect(indexHtml).toContain("%BASE_URL%stingfit-icon.svg");
		expect(indexHtml).toContain("%BASE_URL%icon-192.png");
		expect(mainSource).toContain("import.meta.env.BASE_URL");
		expect(mainSource).toContain("navigator.serviceWorker.register");
		expect(serviceWorker).toContain("self.registration.scope");
		expect(serviceWorker).toContain("new URL(path, self.registration.scope)");
		expect(serviceWorker).not.toContain('cache.put("/index.html"');
		expect(installPage).toContain('href="./#/training"');
		expect(offlinePage).toContain('href="./#/training"');
		expect(manifest.id).toBe("./#/training");
		expect(manifest.start_url).toBe("./#/training");
		expect(manifest.scope).toBe("./");
		for (const icon of manifest.icons) {
			expect(icon.src, icon.src).not.toMatch(/^\//);
			expect(existsSync(`public/${icon.src}`), icon.src).toBe(true);
		}
		for (const screenshot of manifest.screenshots ?? []) {
			expect(screenshot.src, screenshot.src).not.toMatch(/^\//);
			expect(existsSync(`public/${screenshot.src}`), screenshot.src).toBe(true);
		}
		for (const shortcut of manifest.shortcuts ?? []) {
			expect(shortcut.url, shortcut.url).toMatch(/^\.\/#\//);
			for (const icon of shortcut.icons ?? []) {
				expect(icon.src, icon.src).not.toMatch(/^\//);
			}
		}
	});

	test("normalizes the GitHub Pages base path when the trailing slash is omitted", async () => {
		const previousBasePath = process.env.VITE_BASE_PATH;
		try {
			process.env.VITE_BASE_PATH = "/stingfit";
			const loadedConfig = await loadConfigFromFile(
				{ command: "build", mode: "production" },
				"vite.config.ts",
			);

			expect(loadedConfig?.config.base).toBe("/stingfit/");
		} finally {
			if (previousBasePath === undefined) {
				delete process.env.VITE_BASE_PATH;
			} else {
				process.env.VITE_BASE_PATH = previousBasePath;
			}
		}
	});

	test("documents GitHub Pages as the live public host with pending Lighthouse verification", () => {
		const plan = readText("STINGFIT_V2_PLAN.md");
		const changelog = readText("CHANGELOG.md");
		const installDocs = readText("docs/install.md");

		expect(plan).toContain("Public hosting (LIVE 2026-05-12)");
		expect(plan).toContain("Deploy run `25759756360` completed successfully");
		expect(plan).toContain("GitHub Pages project URL");
		expect(plan).toContain("Lighthouse remains pending against the live URL");
		expect(changelog).toContain(
			"GitHub Pages deployment workflow now builds the PWA with the `/stingfit/` base path",
		);
		expect(installDocs).toContain("https://vypa1nik.github.io/stingfit/");
		expect(installDocs).toContain("GitHub Pages");
	});
});
