import { existsSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

function readText(path: string) {
	return readFileSync(path, "utf8");
}

interface PackageJson {
	version: string;
	scripts: Record<string, string>;
}

interface TauriConfig {
	productName: string;
	version: string;
	identifier: string;
	build: {
		frontendDist: string;
		devUrl: string;
		beforeBuildCommand: string;
		beforeDevCommand: string;
	};
	app: {
		windows: Array<{
			title: string;
			width: number;
			height: number;
			minWidth: number;
			minHeight: number;
		}>;
	};
	bundle: {
		active: boolean;
		targets: string;
		icon: string[];
	};
}

describe("StingFit Tauri desktop build readiness", () => {
	test("keeps the desktop wrapper aligned with the Vite PWA shell", () => {
		const packageJson = JSON.parse(readText("package.json")) as PackageJson;
		const tauriConfig = JSON.parse(
			readText("src-tauri/tauri.conf.json"),
		) as TauriConfig;
		const appSource = readText("src/App.tsx");
		const cargoToml = readText("src-tauri/Cargo.toml");

		expect(packageJson.scripts.tauri).toBe("tauri");
		expect(packageJson.scripts["tauri:dev"]).toBe("tauri dev");
		expect(packageJson.scripts["tauri:build"]).toBe("tauri build");
		expect(tauriConfig.productName).toBe("StingFit");
		expect(tauriConfig.version).toBe(packageJson.version);
		expect(tauriConfig.identifier).toBe("com.stingfit.app");
		expect(tauriConfig.build.frontendDist).toBe("../dist");
		expect(tauriConfig.build.beforeBuildCommand).toBe("npm run build");
		expect(tauriConfig.build.beforeDevCommand).toBe("npm run dev");
		expect(tauriConfig.build.devUrl).toBe("http://localhost:5173");
		expect(tauriConfig.app.windows[0]).toEqual(
			expect.objectContaining({
				title: "StingFit",
				width: 1280,
				height: 800,
				minWidth: 900,
				minHeight: 600,
			}),
		);
		expect(tauriConfig.bundle.active).toBe(true);
		expect(tauriConfig.bundle.targets).toBe("all");
		for (const icon of tauriConfig.bundle.icon) {
			expect(existsSync(`src-tauri/${icon}`), icon).toBe(true);
		}
		expect(appSource).toContain("HashRouter");
		expect(cargoToml).toContain('description = "StingFit desktop wrapper"');
	});

	test("documents the native toolchain blocker before desktop artifacts are promised", () => {
		const reportPath = "reports/stingfit-tauri-desktop-builds.md";
		expect(existsSync(reportPath)).toBe(true);
		const report = readText(reportPath);
		const plan = readText("STINGFIT_V2_PLAN.md");
		const changelog = readText("CHANGELOG.md");

		expect(report.split("\n").slice(0, 5).join("\n")).toContain(
			"Status: BLOCKED",
		);
		expect(report).toContain("WebView2: 147.0.3912.98");
		expect(report).toContain("rustc: not installed");
		expect(report).toContain("Cargo: not installed");
		expect(report).toContain("rustup: not installed");
		expect(report).toContain("Visual Studio or VS Build Tools");
		expect(report).toContain("MSVC and SDK components");
		expect(report).toContain("npm run tauri -- info");
		expect(report).toContain("npm run tauri:build");
		expect(report).toContain("PWA-only release");
		expect(plan).toContain("Tauri desktop builds (BLOCKED 2026-05-10)");
		expect(changelog).toContain(
			"Desktop installer verification remains blocked by missing Rust, Cargo, rustup, and MSVC/Windows SDK tooling",
		);
	});
});
