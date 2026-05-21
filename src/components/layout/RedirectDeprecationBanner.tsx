import { useMemo, useState } from "react";

import { useLocation } from "react-router-dom";

import { sk } from "@/i18n/sk";
import type { LegacyRedirectInfo } from "@/router";

function isLegacyRedirectInfo(value: unknown): value is LegacyRedirectInfo {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	const candidate = value as Record<string, unknown>;
	return (
		candidate.kind === "v2-deprecation" &&
		typeof candidate.from === "string" &&
		typeof candidate.to === "string"
	);
}

function readLegacyRedirect(state: unknown): LegacyRedirectInfo | null {
	if (!state || typeof state !== "object" || Array.isArray(state)) {
		return null;
	}

	const candidate = (state as Record<string, unknown>).legacyRedirect;
	return isLegacyRedirectInfo(candidate) ? candidate : null;
}

const redirectDestinationLabels: Record<string, string> = {
	"/training": sk.fitness.redirectBanner.destination.train,
	"/quick": sk.fitness.redirectBanner.destination.quick,
	"/stats": sk.fitness.redirectBanner.destination.progress,
	"/history": sk.fitness.redirectBanner.destination.history,
	"/plates": sk.fitness.redirectBanner.destination.plates,
	"/coach/clients": sk.fitness.redirectBanner.destination.coach,
	"/coach/plans": sk.fitness.redirectBanner.destination.coach,
	"/coach/templates": sk.fitness.redirectBanner.destination.coach,
	"/coach/recaps": sk.fitness.redirectBanner.destination.coach,
};

export function RedirectDeprecationBanner() {
	const location = useLocation();
	const redirect = useMemo(
		() => readLegacyRedirect(location.state),
		[location.state],
	);
	const [dismissedKey, setDismissedKey] = useState<string | null>(null);

	if (!redirect) {
		return null;
	}

	const redirectKey = `${redirect.from}->${redirect.to}`;
	if (dismissedKey === redirectKey) {
		return null;
	}

	const destination = redirectDestinationLabels[redirect.from] ?? redirect.to;

	return (
		<section
			role="status"
			className="mb-4 flex flex-col gap-3 rounded-2xl border border-fitness-yellow/35 bg-fitness-yellow/10 px-4 py-3 text-sm text-fitness-warm shadow-[0_16px_35px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:justify-between"
		>
			<p className="leading-6">
				{sk.fitness.redirectBanner.message(redirect.from, destination)}
			</p>
			<button
				type="button"
				className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-fitness-yellow/45 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black"
				onClick={() => setDismissedKey(redirectKey)}
			>
				{sk.fitness.redirectBanner.dismiss}
			</button>
		</section>
	);
}
