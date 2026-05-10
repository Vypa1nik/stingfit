function canonicalJson(value: unknown, label: string): string {
	if (
		value === null ||
		typeof value === "string" ||
		typeof value === "boolean"
	) {
		return JSON.stringify(value);
	}

	if (typeof value === "number") {
		if (!Number.isFinite(value)) {
			throw new Error(`${label} contains a non-finite number.`);
		}

		return JSON.stringify(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map((item) => canonicalJson(item, label)).join(",")}]`;
	}

	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>)
			.filter((entry): entry is [string, unknown] => entry[1] !== undefined)
			.sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey));

		return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item, label)}`).join(",")}}`;
	}

	throw new Error(`${label} contains an unsupported value.`);
}

export async function signCanonicalJsonPayload(
	payload: unknown,
	signatureKey: string,
	label: string,
) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(signatureKey),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(canonicalJson(payload, label)),
	);

	return Array.from(new Uint8Array(signature))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}
