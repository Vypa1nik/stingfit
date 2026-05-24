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
}

const simpleStartCopy = sk.fitness.simpleStart;

export function SimpleStartBuilder({
	isMutating,
	onSelectPlan,
	onQuickSession,
}: SimpleStartBuilderProps) {
	const recommendedChoice =
		FITNESS_SIMPLE_START_CHOICES.find((choice) => choice.recommended) ??
		FITNESS_SIMPLE_START_CHOICES[0];
	const alternateChoices = FITNESS_SIMPLE_START_CHOICES.filter(
		(choice) => choice.id !== recommendedChoice.id,
	);

	return (
		<section className="fitness-hero-panel relative p-4 sm:p-6 lg:p-8">
			<div className="wasp-stripes absolute inset-0 opacity-25" />
			<div className="relative mx-auto max-w-5xl">
				<div className="flex flex-wrap items-center gap-3">
					<span className="fitness-badge">{simpleStartCopy.badge}</span>
					<span className="rounded-full border border-fitness-yellow/30 bg-black/55 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow/80">
						{simpleStartCopy.noSetupBadge}
					</span>
				</div>

				<div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
					<div className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-fitness-yellow/20 bg-black/75 p-5 sm:p-6">
						<div>
							<p className="text-xs font-black uppercase tracking-[0.2em] text-fitness-yellow/70">
								{simpleStartCopy.recommendedKicker}
							</p>
							<h1 className="mt-3 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl">
								{simpleStartCopy.title}
							</h1>
							<p className="mt-4 max-w-xl text-sm leading-6 text-fitness-warm/75 sm:text-base">
								{simpleStartCopy.description}
							</p>
						</div>

						<div className="mt-6 grid gap-2 sm:grid-cols-3">
							{simpleStartCopy.steps.map((step, index) => (
								<div
									key={step.title}
									className="rounded-2xl border border-fitness-yellow/20 bg-fitness-yellow/10 p-3"
								>
									<p className="text-xs font-black uppercase text-fitness-yellow/70">
										0{index + 1}
									</p>
									<p className="mt-1 text-sm font-black text-white">
										{step.title}
									</p>
									<p className="mt-1 text-xs leading-5 text-fitness-warm/60">
										{step.description}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="grid gap-3">
						<button
							type="button"
							className="group rounded-[2rem] border border-fitness-yellow bg-fitness-yellow p-5 text-left text-black shadow-xl transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
							onClick={() => onSelectPlan(recommendedChoice)}
							disabled={isMutating}
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-xs font-black uppercase tracking-[0.16em] text-black/70">
										{recommendedChoice.badge}
									</p>
									<h2 className="mt-2 text-3xl font-black leading-9 sm:text-4xl">
										{recommendedChoice.label}
									</h2>
								</div>
								<span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-black text-fitness-yellow transition-transform group-hover:scale-105">
									<Dumbbell className="size-6" />
								</span>
							</div>
							<p className="mt-4 text-base font-black">
								{recommendedChoice.title}
							</p>
							<p className="mt-2 text-sm leading-6 text-black/75">
								{recommendedChoice.description}
							</p>
							<p className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
								{simpleStartCopy.preparePlan} <ArrowRight className="size-3" />
							</p>
						</button>

						<div className="rounded-[1.75rem] border border-fitness-yellow/25 bg-black/80 p-4">
							<div className="flex items-start gap-3">
								<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-fitness-yellow/15 text-fitness-yellow">
									<Zap className="size-5" />
								</span>
								<div>
									<p className="text-sm font-black text-fitness-yellow">
										{simpleStartCopy.quickTitle}
									</p>
									<p className="mt-1 text-sm leading-6 text-fitness-warm/70">
										{simpleStartCopy.quickDescription}
									</p>
								</div>
							</div>
							<Button
								className="fitness-action mt-4 w-full"
								leadingIcon={<Zap className="size-4" />}
								onClick={onQuickSession}
								disabled={isMutating}
							>
								{sk.fitness.simpleStart.quickButton}
							</Button>
						</div>
					</div>
				</div>

				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					{alternateChoices.map((choice) => (
						<button
							key={choice.id}
							type="button"
							className={cn(
								"group min-w-0 rounded-2xl border border-fitness-yellow/25 bg-black/75 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-fitness-yellow/70 disabled:cursor-not-allowed disabled:opacity-60",
							)}
							onClick={() => onSelectPlan(choice)}
							disabled={isMutating}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<p className="text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow/75">
										{choice.badge}
									</p>
									<h3 className="mt-2 text-xl font-black leading-7 text-white">
										{choice.label}
									</h3>
								</div>
								<CheckCircle2 className="size-5 shrink-0 text-fitness-yellow/80" />
							</div>
							<p className="mt-3 text-sm font-black text-fitness-yellow">
								{choice.title}
							</p>
							<p className="mt-2 text-sm leading-6 text-fitness-warm/65">
								{choice.description}
							</p>
							<p className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-fitness-yellow">
								{simpleStartCopy.preparePlan} <ArrowRight className="size-3" />
							</p>
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
