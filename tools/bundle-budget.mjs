import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const DEFAULT_DIST_DIR = "dist";
const DEFAULT_MAIN_BUDGET_KB = 250;
const DEFAULT_LARGE_ASSET_THRESHOLD_KB = 200;

function parseArgs(argv) {
	const parsed = {
		distDir: DEFAULT_DIST_DIR,
		mainBudgetKb: DEFAULT_MAIN_BUDGET_KB,
		largeAssetThresholdKb: DEFAULT_LARGE_ASSET_THRESHOLD_KB,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		const value = argv[index + 1];

		if (token === "--dist" && value) {
			parsed.distDir = value;
			index += 1;
			continue;
		}

		if (token === "--main-budget-kb" && value) {
			parsed.mainBudgetKb = Number(value);
			index += 1;
			continue;
		}

		if (token === "--large-asset-threshold-kb" && value) {
			parsed.largeAssetThresholdKb = Number(value);
			index += 1;
		}
	}

	return parsed;
}

function assertFinitePositiveNumber(value, label) {
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} must be a positive number.`);
	}
}

function toGzipSize(source) {
	const buffer = typeof source === "string" ? Buffer.from(source) : source;
	return gzipSync(buffer).byteLength;
}

function toKb(bytes) {
	return Number((bytes / 1000).toFixed(2));
}

function normalizeAssetPath(src) {
	const cleanSrc = src.split("?")[0]?.split("#")[0] ?? src;
	const localPath = cleanSrc.replace(/^\//, "");
	const assetPrefixIndex = localPath.lastIndexOf("assets/");
	return assetPrefixIndex >= 0 ? localPath.slice(assetPrefixIndex) : localPath;
}

function findMainEntryPath(indexHtml) {
	const scriptPattern = /<script\b[^>]*>/gi;
	const srcPattern = /\bsrc=["']([^"']+)["']/i;
	const typePattern = /\btype=["']module["']/i;
	const candidates = [];

	for (const match of indexHtml.matchAll(scriptPattern)) {
		const tag = match[0];
		const src = tag.match(srcPattern)?.[1];

		if (src && typePattern.test(tag)) {
			candidates.push(src);
		}
	}

	const mainEntry =
		candidates.find((src) =>
			/(?:^|\/)assets\/index-[^/]+\.js(?:[?#].*)?$/.test(src),
		) ?? candidates[0];

	if (!mainEntry) {
		throw new Error(
			"Could not find the Vite module script in dist/index.html.",
		);
	}

	if (/^https?:\/\//i.test(mainEntry)) {
		throw new Error(
			`Main entry script must be a local dist asset, received ${mainEntry}.`,
		);
	}

	return normalizeAssetPath(mainEntry);
}

async function listFilesRecursive(rootDir) {
	const entries = await fs.readdir(rootDir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const absolutePath = path.join(rootDir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await listFilesRecursive(absolutePath)));
			continue;
		}

		if (entry.isFile()) {
			files.push(absolutePath);
		}
	}

	return files;
}

async function collectLargeAssets(distDir, thresholdKb) {
	const assetsDir = path.join(distDir, "assets");
	let files;

	try {
		files = await listFilesRecursive(assetsDir);
	} catch (error) {
		if (error && error.code === "ENOENT") {
			return [];
		}
		throw error;
	}

	const largeAssets = [];

	for (const filePath of files) {
		const source = await fs.readFile(filePath);
		const gzipBytes = toGzipSize(source);
		const gzipKb = toKb(gzipBytes);

		if (gzipKb > thresholdKb) {
			largeAssets.push({
				file: path.relative(distDir, filePath).replaceAll(path.sep, "/"),
				gzipBytes,
				gzipKb,
			});
		}
	}

	return largeAssets.sort((left, right) => right.gzipBytes - left.gzipBytes);
}

export async function auditBundleBudget(options = {}) {
	const distDir = path.resolve(
		process.cwd(),
		options.distDir ?? DEFAULT_DIST_DIR,
	);
	const mainBudgetKb = options.mainBudgetKb ?? DEFAULT_MAIN_BUDGET_KB;
	const largeAssetThresholdKb =
		options.largeAssetThresholdKb ?? DEFAULT_LARGE_ASSET_THRESHOLD_KB;

	assertFinitePositiveNumber(mainBudgetKb, "mainBudgetKb");
	assertFinitePositiveNumber(largeAssetThresholdKb, "largeAssetThresholdKb");

	const indexHtml = await fs.readFile(path.join(distDir, "index.html"), "utf8");
	const mainEntryPath = findMainEntryPath(indexHtml);
	const mainEntrySource = await fs.readFile(path.join(distDir, mainEntryPath));
	const mainEntryGzipBytes = toGzipSize(mainEntrySource);
	const mainEntry = {
		file: mainEntryPath,
		gzipBytes: mainEntryGzipBytes,
		gzipKb: toKb(mainEntryGzipBytes),
		budgetKb: mainBudgetKb,
	};
	const largeAssets = await collectLargeAssets(distDir, largeAssetThresholdKb);

	if (mainEntry.gzipKb > mainBudgetKb) {
		throw new Error(
			`main entry chunk exceeds ${mainBudgetKb} KB gzipped: ${mainEntry.file} is ${mainEntry.gzipKb} KB gzipped.`,
		);
	}

	return {
		mainEntry,
		largeAssets,
		largeAssetThresholdKb,
	};
}

function formatAsset(asset) {
	return `${asset.file}: ${asset.gzipKb} KB gzip`;
}

async function main() {
	const result = await auditBundleBudget(parseArgs(process.argv.slice(2)));

	console.log(
		`Main entry within budget: ${formatAsset(result.mainEntry)} / ${result.mainEntry.budgetKb} KB`,
	);

	if (result.largeAssets.length > 0) {
		console.log(`Assets over ${result.largeAssetThresholdKb} KB gzip:`);
		for (const asset of result.largeAssets) {
			console.log(`- ${formatAsset(asset)}`);
		}
	} else {
		console.log(`No assets over ${result.largeAssetThresholdKb} KB gzip.`);
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	});
}
