import { ArrowRight, CheckCircle2, Dumbbell, Zap } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
	FITNESS_SIMPLE_START_CHOICES,
	type FitnessSimpleStartChoice,
} from "@/features/fitness/fitnessSimpleStart";
import { sk } from "@/i18n/sk";
import { cn } from "@/lib/utils";

interface SimpleStartBuilderProps {
	isMutating: boolean;
	onSelectPlan: (choice: FitnessSimpleStartChoice) => void;
	onQuickSession: () => void;
	variant?: "standalone" | "embedded";
}

const simpleStartCopy = sk.fitness.simpleStart;

export function SimpleStartBuilder({
	isMutating,
	onSelectPlan,
	onQuickSession,
	variant = "standalone",
}: SimpleStartBuilderProps) {
	const recommendedChoice =
		FITNESS_SIMPLE_START_CHOICES.find((choice) => choice.recommended) ??
		FITNESS_SIMPLE_START_CHOICES[0];
	const alternateChoices = FITNESS_SIMPLE_START_CHOICES.filter(
		(choice) => choice.id !== recommendedChoice.id,
	);
	const isEmbedded = variant === "embedded";

	return (
		<section
			data-simple-start-variant={variant}
			className={cn(
				"fitness-hero-panel relative",
				isEmbedded ? "p-3 sm:p-4 lg:p-6" : "p-3 sm:p-6 lg:p-8",
			)}
		>
			<div
				className={cn(
					"wasp-stripes absolute inset-0",
					isEmbedded ? "opacity-15" : "opacity-25",
				)}
			/>
			<div className="relative mx-auto max-w-5xl">
				<div className="flex flex-wrap items-center gap-2 sm:gap-3">
					<span className="fitness-badge px-2.5 py-1 text-[10px] sm:px-3 sm:text-xs">
						{simpleStartCopy.badge}
					</span>
					<span className="rounded-full border border-fitness-yellow/30 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-fitness-yellow/80 sm:px-3 sm:text-xs sm:tracking-[0.14em]">
						{simpleStartCopy.noSetupBadge}
					</span>
				</div>

				{isEmbedded ? (
					<EmbeddedSimpleStartLayout
						recommendedChoice={recommendedChoice}
						alternateChoices={alternateChoices}
						isMutating={isMutating}
						onSelectPlan={onSelectPlan}
						onQuickSession={onQuickSession}
					/>
				) : (
					<StandaloneSimpleStartLayout
						recommendedChoice={recommendedChoice}
						alternateChoices={alternateChoices}
						isMutating={isMutating}
						onSelectPlan={onSelectPlan}
						onQuickSession={onQuickSession}
					/>
				)}
			</div>
		</section>
	);
}

function StandaloneSimpleStartLayout({
	recommendedChoice,
	alternateChoices,
	isMutating,
	onSelectPlan,
	onQuickSession,
}: {
	recommendedChoice: FitnessSimpleStartChoice;
	alternateChoices: FitnessSimpleStartChoice[];
	isMutating: boolean;
	onSelectPlan: (choice: FitnessSimpleStartChoice) => void;
	onQuickSession: () => void;
}) {
	return (
		<>
			<div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
				<div className="flex min-w-0 flex-col justify-between rounded-[1.75rem] border border-fitness-yellow/20 bg-black/75 p-4 sm:rounded-[2rem] sm:p-6">
					<div>
						<p className="text-[11px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70 sm:text-xs sm:tracking-[0.2em]">
							{simpleStartCopy.recommendedKicker}
						</p>
						<h1 className="mt-2 max-w-2xl text-3xl font-black leading-[0.96] tracking-[-0.055em] text-white sm:mt-3 sm:text-6xl">
							{simpleStartCopy.title}
						</h1>
						<p className="mt-3 max-w-xl text-sm leading-5 text-fitness-warm/75 sm:mt-4 sm:text-base sm:leading-6">
							{simpleStartCopy.description}
						</p>
					</div>

					<SimpleStartSteps className="mt-5 hidden sm:grid" />
				</div>

				<div className="grid gap-3">
					<RecommendedChoiceButton
						choice={recommendedChoice}
						isMutating={isMutating}
						onSelectPlan={onSelectPlan}
					/>
					<QuickSessionCard
						isMutating={isMutating}
						onQuickSession={onQuickSession}
					/>
				</div>
			</div>

			<SimpleStartSteps className="mt-3 grid sm:hidden" compact />
			<AlternateChoicesGrid
				choices={alternateChoices}
				isMutating={isMutating}
				onSelectPlan={onSelectPlan}
			/>
		</>
	);
}

function EmbeddedSimpleStartLayout({
	recommendedChoice,
	alternateChoices,
	isMutating,
	onSelectPlan,
	onQuickSession,
}: {
	recommendedChoice: FitnessSimpleStartChoice;
	alternateChoices: FitnessSimpleStartChoice[];
	isMutating: boolean;
	onSelectPlan: (choice: FitnessSimpleStartChoice) => void;
	onQuickSession: () => void;
}) {
	return (
		<>
			<div className="mt-3 grid gap-3 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
				<div className="rounded-[1.5rem] border border-fitness-yellow/20 bg-black/75 p-3 sm:p-4">
					<p className="text-[11px] font-black uppercase tracking-[0.16em] text-fitness-yellow/70 sm:text-xs">
						{simpleStartCopy.recommendedKicker}
					</p>
					<h1 className="mt-2 max-w-2xl text-2xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-4xl">
						{simpleStartCopy.title}
					</h1>
					<p className="mt-2 hidden max-w-xl text-sm leading-6 text-fitness-warm/75 sm:block">
						{simpleStartCopy.description}
					</p>
				</div>

				<div className="grid gap-3">
					<RecommendedChoiceButton
						choice={recommendedChoice}
						isMutating={isMutating}
						onSelectPlan={onSelectPlan}
						compact
					/>
					<QuickSessionCard
						isMutating={isMutating}
						onQuickSession={onQuickSession}
						compact
					/>
				</div>
			</div>

			<details className="mt-3 rounded-2xl border border-fitness-yellow/20 bg-black/65 p-3 text-fitness-warm sm:hidden">
				<summary className="cursor-pointer text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow">
					{simpleStartCopy.howItWorksSummary}
				</summary>
				<SimpleStartSteps className="mt-3 grid" compact />
			</details>

			<AlternateChoicesGrid
				choices={alternateChoices}
				isMutating={isMutating}
				onSelectPlan={onSelectPlan}
				compact
			/>
		</>
	);
}

function RecommendedChoiceButton({
	choice,
	isMutating,
	onSelectPlan,
	compact = false,
}: {
	choice: FitnessSimpleStartChoice;
	isMutating: boolean;
	onSelectPlan: (choice: FitnessSimpleStartChoice) => void;
	compact?: boolean;
}) {
	return (
		<button
			type="button"
			className={cn(
				"group rounded-[1.75rem] border border-fitness-yellow bg-fitness-yellow text-left text-black shadow-xl transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-[2rem]",
				compact ? "p-4" : "p-4 sm:p-5",
			)}
			onClick={() => onSelectPlan(choice)}
			disabled={isMutating}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-black/70 sm:text-xs sm:tracking-[0.16em]">
						{choice.badge}
					</p>
					<h2
						className={cn(
							"mt-1 font-black leading-tight",
							compact ? "text-2xl sm:text-3xl" : "text-2xl sm:text-4xl",
						)}
					>
						{choice.label}
					</h2>
				</div>
				<span
					className={cn(
						"flex shrink-0 items-center justify-center rounded-2xl bg-black text-fitness-yellow transition-transform group-hover:scale-105",
						compact ? "size-10" : "size-11 sm:size-12",
					)}
				>
					<Dumbbell className={compact ? "size-5" : "size-5 sm:size-6"} />
				</span>
			</div>
			<p className="mt-3 text-sm font-black sm:text-base">{choice.title}</p>
			<p
				className={cn(
					"mt-2 hidden text-sm text-black/75 sm:block",
					compact ? "leading-5" : "leading-5 sm:leading-6",
				)}
			>
				{choice.description}
			</p>
			<p className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] sm:mt-5">
				{simpleStartCopy.preparePlan} <ArrowRight className="size-3" />
			</p>
		</button>
	);
}

function QuickSessionCard({
	isMutating,
	onQuickSession,
	compact = false,
}: {
	isMutating: boolean;
	onQuickSession: () => void;
	compact?: boolean;
}) {
	return (
		<div
			className={cn(
				"rounded-[1.5rem] border border-fitness-yellow/25 bg-black/80",
				compact ? "p-3" : "p-3 sm:p-4",
			)}
		>
			<div className="flex items-start gap-3">
				<span
					className={cn(
						"flex shrink-0 items-center justify-center rounded-2xl bg-fitness-yellow/15 text-fitness-yellow",
						compact ? "size-9" : "size-10",
					)}
				>
					<Zap className={compact ? "size-4" : "size-5"} />
				</span>
				<div>
					<p className="text-sm font-black text-fitness-yellow">
						{simpleStartCopy.quickTitle}
					</p>
					<p className="mt-1 hidden text-sm leading-5 text-fitness-warm/70 sm:block sm:leading-6">
						{simpleStartCopy.quickDescription}
					</p>
				</div>
			</div>
			<Button
				className="fitness-action mt-3 w-full sm:mt-4"
				leadingIcon={<Zap className="size-4" />}
				onClick={onQuickSession}
				disabled={isMutating}
			>
				{sk.fitness.simpleStart.quickButton}
			</Button>
		</div>
	);
}

function SimpleStartSteps({
	className,
	compact = false,
}: {
	className?: string;
	compact?: boolean;
}) {
	return (
		<div
			className={cn(
				"gap-2",
				compact ? "grid-cols-1" : "sm:grid-cols-3",
				className,
			)}
		>
			{simpleStartCopy.steps.map((step, index) => (
				<div
					key={step.title}
					className="rounded-2xl border border-fitness-yellow/20 bg-fitness-yellow/10 p-3"
				>
					<p className="text-xs font-black uppercase text-fitness-yellow/70">
						0{index + 1}
					</p>
					<p className="mt-1 text-sm font-black text-white">{step.title}</p>
					<p className="mt-1 text-xs leading-5 text-fitness-warm/60">
						{step.description}
					</p>
				</div>
			))}
		</div>
	);
}

function AlternateChoicesGrid({
	choices,
	isMutating,
	onSelectPlan,
	compact = false,
}: {
	choices: FitnessSimpleStartChoice[];
	isMutating: boolean;
	onSelectPlan: (choice: FitnessSimpleStartChoice) => void;
	compact?: boolean;
}) {
	return (
		<div
			className={cn(
				"mt-3 grid gap-2 sm:grid-cols-3",
				!compact && "sm:mt-4 sm:gap-3",
			)}
		>
			{choices.map((choice) => (
				<button
					key={choice.id}
					type="button"
					className={cn(
						"group min-w-0 rounded-2xl border border-fitness-yellow/25 bg-black/75 text-left transition-all hover:-translate-y-0.5 hover:border-fitness-yellow/70 disabled:cursor-not-allowed disabled:opacity-60",
						compact ? "p-3" : "p-3 sm:p-4",
					)}
					onClick={() => onSelectPlan(choice)}
					disabled={isMutating}
				>
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-[11px] font-black uppercase tracking-[0.12em] text-fitness-yellow/75 sm:text-xs sm:tracking-[0.14em]">
								{choice.badge}
							</p>
							<h3 className="mt-1 text-lg font-black leading-6 text-white sm:mt-2 sm:text-xl sm:leading-7">
								{choice.label}
							</h3>
						</div>
						<CheckCircle2 className="size-5 shrink-0 text-fitness-yellow/80" />
					</div>
					<p className="mt-2 text-sm font-black text-fitness-yellow sm:mt-3">
						{choice.title}
					</p>
					<p className="mt-1 text-sm leading-5 text-fitness-warm/65 sm:mt-2 sm:leading-6">
						{choice.description}
					</p>
					<p className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow sm:mt-4">
						{simpleStartCopy.preparePlan} <ArrowRight className="size-3" />
					</p>
				</button>
			))}
		</div>
	);
}
