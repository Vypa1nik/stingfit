import { type ChangeEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCoachModeEnabled } from "@/features/coach/coachModeRepository";
import { exportPlanPack } from "@/features/coach/planPack/io";
import {
	importRecapPack,
	type RecapPackPreview,
} from "@/features/coach/recapPack/io";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import type { FitnessPlanRecord } from "@/features/fitness/fitnessTypes";
import { listProfiles } from "@/features/profiles/profileRepository";
import type { ProfileRecord } from "@/features/profiles/profileTypes";
import { useSpaNavigate } from "@/hooks/useSpaNavigate";
import { sk } from "@/i18n/sk";
import { downloadBlob } from "@/lib/download";
import { cn } from "@/lib/utils";

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
	const navigate = useSpaNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [isEnabled, setIsEnabled] = useState(false);
	const [isSectionLoading, setIsSectionLoading] = useState(false);
	const [clients, setClients] = useState<ProfileRecord[]>([]);
	const [plans, setPlans] = useState<FitnessPlanRecord[]>([]);
	const [recapPreview, setRecapPreview] = useState<RecapPackPreview | null>(
		null,
	);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

	const loadSection = useCallback(async () => {
		if (!isEnabled) return;

		setIsSectionLoading(true);
		setErrorMessage(null);
		try {
			if (section === "clients") {
				const profiles = await listProfiles();
				setClients(profiles.filter((profile) => profile.kind === "client"));
			}
			if (section === "plans") {
				setPlans(await fitnessRepository.listPersonalPlans());
			}
		} catch (cause) {
			setErrorMessage(
				cause instanceof Error
					? cause.message
					: "Nepodarilo sa načítať Coach Mode.",
			);
		} finally {
			setIsSectionLoading(false);
		}
	}, [isEnabled, section]);

	useEffect(() => {
		void loadSection();
	}, [loadSection]);

	const exportCoachPlan = async (plan: FitnessPlanRecord) => {
		setStatusMessage(null);
		setErrorMessage(null);
		try {
			const blob = await exportPlanPack(plan.id);
			downloadBlob(blob, `${toSafeFilename(plan.name)}.stfplan`);
			setStatusMessage(`${sk.fitness.coachMode.planPackSuccess}: ${plan.name}`);
		} catch (cause) {
			setErrorMessage(
				cause instanceof Error
					? cause.message
					: sk.fitness.coachMode.planPackError,
			);
		}
	};

	const previewRecap = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0];
		if (!file) return;

		setStatusMessage(null);
		setErrorMessage(null);
		setRecapPreview(null);
		try {
			const imported = await importRecapPack(file);
			setRecapPreview(imported.preview);
			setStatusMessage(sk.fitness.coachMode.recapsLoadedTitle);
		} catch (cause) {
			setErrorMessage(
				cause instanceof Error
					? cause.message
					: sk.fitness.coachMode.recapsImportError,
			);
		}
	};

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

			{statusMessage ? (
				<CoachStatus tone="success" message={statusMessage} />
			) : null}
			{errorMessage ? (
				<CoachStatus tone="error" message={errorMessage} />
			) : null}
			{isSectionLoading ? (
				<CoachStatus tone="info" message="Načítavam lokálne coach dáta…" />
			) : null}

			{section === "clients" ? <CoachClientsSection clients={clients} /> : null}
			{section === "plans" ? (
				<CoachPlansSection
					plans={plans}
					onEditPlans={() => navigate("/plans")}
					onExportPlan={(plan) => void exportCoachPlan(plan)}
				/>
			) : null}
			{section === "templates" ? <CoachTemplatesSection /> : null}
			{section === "recaps" ? (
				<CoachRecapsSection
					preview={recapPreview}
					onPreviewRecap={previewRecap}
				/>
			) : null}
		</div>
	);
}

function CoachClientsSection({ clients }: { clients: ProfileRecord[] }) {
	return (
		<Card
			title={sk.fitness.coachMode.clientsTitle}
			description={sk.fitness.coachMode.clientsPrivacyNote}
		>
			{clients.length === 0 ? (
				<CoachEmptyState
					title={sk.fitness.coachMode.clientsEmptyTitle}
					description={sk.fitness.coachMode.clientsEmptyDescription}
				/>
			) : (
				<div className="grid gap-3 md:grid-cols-2">
					{clients.map((client) => (
						<div
							key={client.id}
							className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm"
						>
							<p className="text-base font-black text-white">{client.name}</p>
							<p className="mt-1 text-sm text-fitness-warm/65">
								{sk.fitness.coachMode.clientsNoRecap}
							</p>
							<p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-fitness-yellow">
								{sk.fitness.coachMode.clientsPrivacyNote}
							</p>
						</div>
					))}
				</div>
			)}
		</Card>
	);
}

function CoachPlansSection({
	plans,
	onEditPlans,
	onExportPlan,
}: {
	plans: FitnessPlanRecord[];
	onEditPlans: () => void;
	onExportPlan: (plan: FitnessPlanRecord) => void;
}) {
	return (
		<Card
			title={sk.fitness.coachMode.plansTitle}
			description={sk.fitness.coachMode.plansDescription}
			action={
				<Button type="button" variant="secondary" onClick={onEditPlans}>
					{sk.fitness.coachMode.plansEditButton}
				</Button>
			}
		>
			{plans.length === 0 ? (
				<CoachEmptyState
					title={sk.fitness.coachMode.plansEmptyTitle}
					description={sk.fitness.coachMode.plansEmptyDescription}
				/>
			) : (
				<div className="grid gap-3 md:grid-cols-2">
					{plans.map((plan) => (
						<div
							key={plan.id}
							className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm"
						>
							<p className="text-base font-black text-white">{plan.name}</p>
							<p className="mt-1 text-sm text-fitness-warm/65">{plan.goal}</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<Button
									type="button"
									className="fitness-action"
									onClick={() => onExportPlan(plan)}
								>
									{sk.fitness.coachMode.plansExportButton}
								</Button>
								<Button type="button" variant="secondary" onClick={onEditPlans}>
									{sk.fitness.coachMode.plansEditButton}
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</Card>
	);
}

function CoachTemplatesSection() {
	return (
		<Card
			title={sk.fitness.coachMode.templatesEmptyTitle}
			description={sk.fitness.coachMode.templatesPrivacyNote}
		>
			<CoachEmptyState
				title={sk.fitness.coachMode.templatesEmptyTitle}
				description={sk.fitness.coachMode.templatesEmptyDescription}
			/>
		</Card>
	);
}

function CoachRecapsSection({
	preview,
	onPreviewRecap,
}: {
	preview: RecapPackPreview | null;
	onPreviewRecap: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<Card
			title={sk.fitness.coachMode.recapsTitle}
			description={sk.fitness.coachMode.recapsUploadDescription}
		>
			<label className="block rounded-2xl border border-dashed border-fitness-yellow/40 bg-black px-4 py-5 text-sm text-fitness-warm">
				<span className="text-sm font-black text-fitness-yellow">
					{sk.fitness.coachMode.recapsUploadLabel}
				</span>
				<input
					className="mt-3 block w-full text-sm text-fitness-warm/75 file:mr-4 file:rounded-md file:border-0 file:bg-fitness-yellow file:px-3 file:py-2 file:text-sm file:font-bold file:text-black"
					type="file"
					accept=".stfrecap,application/vnd.stingfit.recap+json,application/json"
					aria-label={sk.fitness.coachMode.recapsUploadLabel}
					onChange={onPreviewRecap}
				/>
			</label>

			{preview ? (
				<div className="mt-4 rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
					<p className="text-base font-black text-white">
						{sk.fitness.coachMode.recapsLoadedTitle}
					</p>
					<p className="mt-2 text-sm text-fitness-warm/70">
						{preview.traineeName} ·{" "}
						{sk.fitness.coachMode.formatSessionCount(preview.sessionCount)} ·{" "}
						{sk.fitness.coachMode.formatCompletedSetCount(
							preview.completedSetCount,
						)}
					</p>
					<p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-fitness-yellow">
						{sk.fitness.coachMode.recapsReadOnlyNote}
					</p>
				</div>
			) : (
				<div className="mt-4">
					<CoachEmptyState
						title={sk.fitness.coachMode.recapsEmptyTitle}
						description={sk.fitness.coachMode.recapsEmptyDescription}
					/>
				</div>
			)}
		</Card>
	);
}

function CoachEmptyState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-fitness-warm">
			<p className="text-sm font-black text-fitness-yellow">{title}</p>
			<p className="mt-2 text-sm leading-6 text-fitness-warm/70">
				{description}
			</p>
		</div>
	);
}

function CoachStatus({
	tone,
	message,
}: {
	tone: "success" | "error" | "info";
	message: string;
}) {
	return (
		<div
			className={cn(
				"rounded-2xl border px-4 py-3 text-sm font-semibold",
				tone === "success"
					? "border-fitness-yellow/40 bg-fitness-yellow/10 text-fitness-yellow"
					: tone === "error"
						? "border-rose-500/30 bg-rose-500/10 text-rose-200"
						: "border-fitness-yellow/20 bg-black text-fitness-warm/70",
			)}
		>
			{message}
		</div>
	);
}

function toSafeFilename(value: string) {
	return (
		value
			.trim()
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "") || "stingfit-plan-pack"
	);
}
