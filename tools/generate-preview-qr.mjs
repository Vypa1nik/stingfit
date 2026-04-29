import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import QRCode from "qrcode";

const ANSI_PATTERN = /\u001b\[[0-9;]*m/g;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--url" && argv[index + 1]) {
      parsed.url = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--out" && argv[index + 1]) {
      parsed.out = argv[index + 1];
      index += 1;
      continue;
    }
  }

  return parsed;
}

function sanitizeLogValue(raw) {
  return raw.replace(ANSI_PATTERN, "").trim();
}

function findLatestPreviewUrl(logText) {
  const cleanLog = sanitizeLogValue(logText);
  const urlMatches = cleanLog.match(/https?:\/\/[^\s"']+/gi);

  if (!urlMatches || urlMatches.length === 0) {
    return undefined;
  }

  return urlMatches[urlMatches.length - 1];
}

function findFirstLocalIpv4() {
  const networkMap = os.networkInterfaces();
  const candidates = [];

  for (const adapters of Object.values(networkMap)) {
    if (!adapters) {
      continue;
    }

    for (const adapter of adapters) {
      if (
        adapter.family === "IPv4" &&
        !adapter.internal &&
        !adapter.address.startsWith("169.254.")
      ) {
        candidates.push(adapter.address);
      }
    }
  }

  if (candidates.length === 0) {
    return undefined;
  }

  const rank = (ip) => {
    if (ip.startsWith("192.168.")) {
      return 4;
    }
    if (ip.startsWith("10.")) {
      return 3;
    }
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) {
      return 2;
    }
    if (/^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./.test(ip)) {
      return 1;
    }
    return 0;
  };

  return candidates.sort((a, b) => rank(b) - rank(a))[0];
}

async function resolvePreviewUrl(cliUrl) {
  if (cliUrl) {
    return cliUrl;
  }

  const logPath = path.resolve(process.cwd(), ".tmp-stingfit-dev.log");
  try {
    const content = await fs.readFile(logPath, "utf8");
    return findLatestPreviewUrl(content);
  } catch {
    return undefined;
  }
}

function normalizeUrl(input) {
  if (!input) {
    return undefined;
  }

  const value = /^https?:\/\//i.test(input) ? input : `http://${input}`;
  const parsed = new URL(value);

  if (LOOPBACK_HOSTS.has(parsed.hostname)) {
    const localIp = findFirstLocalIpv4();
    if (localIp) {
      parsed.hostname = localIp;
    }
  }

  return parsed.toString();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rawUrl = await resolvePreviewUrl(args.url);
  const previewUrl = normalizeUrl(rawUrl);

  if (!previewUrl) {
    throw new Error(
      "Preview URL not found. Pass one with --url, for example: npm run qr:preview -- --url http://192.168.1.10:4173/"
    );
  }

  const outputPath = path.resolve(
    process.cwd(),
    args.out ?? "public/stingfit-preview-qr.svg"
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await QRCode.toFile(outputPath, previewUrl, {
    type: "svg",
    width: 512,
    errorCorrectionLevel: "M",
    margin: 1,
  });

  const relativeOut = path.relative(process.cwd(), outputPath);
  console.log(`Generated QR for ${previewUrl}`);
  console.log(`Saved: ${relativeOut}`);
}

main().catch((error) => {
  console.error(`QR generation failed: ${error.message}`);
  process.exitCode = 1;
});
