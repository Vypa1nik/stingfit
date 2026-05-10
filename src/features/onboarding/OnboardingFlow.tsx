import { useState } from "react";

import { HardDrive, Palette, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SimpleStartBuilder } from "@/features/fitness/SimpleStartBuilder";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import type { FitnessSimpleStartChoice } from "@/features/fitness/fitnessSimpleStart";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTheme } from "@/hooks/useTheme";
import { sk } from "@/i18n/sk";
import { THEME_OPTIONS } from "@/lib/constants";
import { OnboardingStep } from "./OnboardingStep";

export function OnboardingFlow() {
	const navigate = useNavigate();
	const { complete } = useOnboarding();
	const { mode, setMode } = useTheme();
	const [isPreparing, setIsPreparing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const finishAndNavigate = (path: string) => {
		complete();
		navigate(path);
	};

	const prepareSimplePlan = async (choice: FitnessSimpleStartChoice) => {
		setIsPreparing(true);
		setError(null);
		try {
			await fitnessRepository.seedStarterData();
			const starter = (await fitnessRepository.listStarterPlans()).find(
				(plan) => plan.id === choice.starterPlanId,
			);
			if (!starter) {
				throw new Error(sk.fitness.onboarding.starterUnavailable(choice.title));
			}

			await fitnessRepository.createPersonalPlanFromStarter(starter.id, {
				name: choice.personalPlanName,
				goal: choice.goal,
			});

			finishAndNavigate("/training");
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: sk.fitness.onboarding.preparePlanError,
			);
		} finally {
			setIsPreparing(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[70] overflow-y-auto bg-[#05070B] px-4 py-8 text-white">
			<div className="mx-auto max-w-5xl">
				<OnboardingStep
					icon={Zap}
					eyebrow={sk.fitness.onboarding.eyebrow}
					title={sk.fitness.onboarding.title}
					description={sk.fitness.onboarding.description}
				>
					<div className="space-y-5">
						{error ? (
							<div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
								{error}
							</div>
						) : null}

						<SimpleStartBuilder
							isMutating={isPreparing}
							onSelectPlan={(choice) => void prepareSimplePlan(choice)}
							onQuickSession={() => finishAndNavigate("/quick")}
						/>

						<div className="grid gap-3 md:grid-cols-2">
							<section className="rounded-3xl border border-fitness-yellow/20 bg-black/60 p-4 text-sm text-fitness-warm/75">
								<div className="flex items-center gap-3">
									<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-fitness-yellow/15 text-fitness-yellow">
										<HardDrive className="size-5" />
									</span>
									<div>
										<h3 className="font-black text-white">
											{sk.fitness.onboarding.privacyTitle}
										</h3>
										<p className="mt-1 leading-6">
											{sk.fitness.onboarding.privacyDescription}
										</p>
									</div>
								</div>
							</section>

							<section className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
								<div className="flex items-start gap-3">
									<span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-fitness-yellow">
										<Palette className="size-5" />
									</span>
									<div className="min-w-0 flex-1">
										<h3 className="font-black text-white">
											{sk.fitness.onboarding.themeTitle}
										</h3>
										<p className="mt-1 leading-6">
											{sk.fitness.onboarding.themeDescription}
										</p>
										<div className="mt-3 grid gap-2 sm:grid-cols-3">
											{THEME_OPTIONS.map((option) => (
												<button
													key={option.value}
													className={`rounded-2xl border px-3 py-3 text-left text-xs transition-colors ${
														mode === option.value
															? "border-fitness-yellow bg-fitness-yellow/15 text-white"
															: "border-white/10 bg-black/30 text-slate-300 hover:border-fitness-yellow/50"
													}`}
													onClick={() => setMode(option.value)}
												>
													<span className="font-black">{option.label}</span>
												</button>
											))}
										</div>
									</div>
								</div>
							</section>
						</div>
					</div>
				</OnboardingStep>
			</div>
		</div>
	);
}
