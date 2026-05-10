import { ArrowRight, Dumbbell, Zap } from "lucide-react";

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

export function SimpleStartBuilder({
	isMutating,
	onSelectPlan,
	onQuickSession,
}: SimpleStartBuilderProps) {
	return (
		<section className="fitness-hero-panel p-5 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-4xl">
				<div className="flex flex-wrap items-center gap-3">
					<span className="fitness-badge">{sk.fitness.simpleStart.badge}</span>
					<span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
						{sk.fitness.simpleStart.noSetupBadge}
					</span>
				</div>
				<h1 className="mt-4 text-3xl font-black tracking-[-0.055em] text-white sm:text-5xl">
					{sk.fitness.simpleStart.title}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
					{sk.fitness.simpleStart.description}
				</p>

				<div className="mt-6 grid gap-3 md:grid-cols-2">
					{FITNESS_SIMPLE_START_CHOICES.map((choice) => (
						<button
							key={choice.id}
							type="button"
							className={cn(
								"group rounded-3xl border bg-black/70 p-4 text-left transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
								choice.recommended
									? "border-fitness-yellow shadow-[0_0_30px_rgba(255,255,0,0.12)]"
									: "border-fitness-yellow/25 hover:border-fitness-yellow/70",
							)}
							onClick={() => onSelectPlan(choice)}
							disabled={isMutating}
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">
										{choice.badge}
									</p>
									<h2 className="mt-2 text-xl font-black text-white">
										{choice.label}
									</h2>
								</div>
								<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-fitness-yellow text-black transition-transform group-hover:scale-105">
									<Dumbbell className="size-5" />
								</span>
							</div>
							<p className="mt-3 text-sm font-black text-fitness-yellow">
								{choice.title}
							</p>
							<p className="mt-2 text-sm leading-6 text-fitness-warm/70">
								{choice.description}
							</p>
							<p className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fitness-yellow">
								{sk.fitness.simpleStart.preparePlan}{" "}
								<ArrowRight className="size-3" />
							</p>
						</button>
					))}
				</div>

				<div className="mt-5 rounded-3xl border border-fitness-yellow/20 bg-black/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
					<div>
						<p className="text-sm font-black text-fitness-yellow">
							{sk.fitness.simpleStart.quickTitle}
						</p>
						<p className="mt-1 text-sm text-fitness-warm/65">
							{sk.fitness.simpleStart.quickDescription}
						</p>
					</div>
					<Button
						className="fitness-action mt-4 w-full sm:mt-0 sm:w-auto"
						leadingIcon={<Zap className="size-4" />}
						onClick={onQuickSession}
						disabled={isMutating}
					>
						{sk.fitness.simpleStart.quickButton}
					</Button>
				</div>
			</div>
		</section>
	);
}
