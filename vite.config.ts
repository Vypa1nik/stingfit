import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function normalizeBasePath(basePath: string | undefined) {
	if (!basePath) {
		return "/";
	}

	return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

export default defineConfig({
	base: normalizeBasePath(process.env.VITE_BASE_PATH),
	plugins: [react(), tailwindcss()],
	server: {
		allowedHosts: [".trycloudflare.com", ".loca.lt"],
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
