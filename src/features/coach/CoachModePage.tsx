import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { getCoachModeEnabled } from "@/features/coach/coachModeRepository";
import { sk } from "@/i18n/sk";

type CoachModeSection = "clients" | "plans" | "templates" | "recaps";

interface CoachModePageProps {
	section: CoachModeSection;
}

const SECTION_COPY: Record<
	CoachModeSection,
	{ title: string; description: string }
> = {
	clients: {
		title: sk.fitness.coachMode.clientsTitle,
		description: sk.fitness.coachMode.clientsDescription,
	},
	plans: {
		title: sk.fitness.coachMode.plansTitle,
		description: sk.fitness.coachMode.plansDescription,
	},
	templates: {
		title: sk.fitness.coachMode.templatesTitle,
		description: sk.fitness.coachMode.templatesDescription,
	},
	recaps: {
		title: sk.fitness.coachMode.recapsTitle,
		description: sk.fitness.coachMode.recapsDescription,
	},
};

export function CoachModePage({ section }: CoachModePageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [isEnabled, setIsEnabled] = useState(false);
	const copy = SECTION_COPY[section];

	useEffect(() => {
		let isMounted = true;

		async function loadCoachMode() {
			try {
				const enabled = await getCoachModeEnabled();
				if (isMounted) {
					setIsEnabled(enabled);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadCoachMode();

		return () => {
			isMounted = false;
		};
	}, []);

	if (isLoading) {
		return (
			<Card
				title={sk.fitness.coachMode.loadingTitle}
				description={sk.fitness.coachMode.loadingDescription}
			>
				<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
					{sk.fitness.coachMode.loadingBody}
				</div>
			</Card>
		);
	}

	if (!isEnabled) {
		return (
			<Card
				title={sk.fitness.coachMode.disabledTitle}
				description={sk.fitness.coachMode.disabledDescription}
			>
				<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
					{sk.fitness.coachMode.disabledBody}
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<section className="fitness-hero-panel p-6 lg:p-8">
				<p className="fitness-badge">{sk.fitness.coachMode.badge}</p>
				<h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
					{copy.title}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
					{copy.description}
				</p>
			</section>

			<Card
				title={sk.fitness.coachMode.localFirstTitle}
				description={sk.fitness.coachMode.localFirstDescription}
			>
				<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
					{sk.fitness.coachMode.placeholderBody}
				</div>
			</Card>
		</div>
	);
}
