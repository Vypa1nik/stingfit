import { useEffect, useState } from "react";

import { Calculator } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PlateLoadPanel } from "@/features/fitness/PlateLoadPanel";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import { getDefaultBarWeight } from "@/features/fitness/plateCalculator";
import type { FitnessDisplayUnit } from "@/features/fitness/fitnessUnits";
import { sk } from "@/i18n/sk";

export function FitnessPlateCalculatorPage() {
	const [displayUnit, setDisplayUnit] = useState<FitnessDisplayUnit>("kg");
	const [targetWeight, setTargetWeight] = useState("100");
	const [barWeight, setBarWeight] = useState("20");
	const [loadError, setLoadError] = useState<string | null>(null);
	const parsedTargetWeight = Number(targetWeight);

	useEffect(() => {
		let isMounted = true;

		fitnessRepository
			.getSettings()
			.then((settings) => {
				if (!isMounted) {
					return;
				}

				setDisplayUnit(settings.displayUnit);
				setTargetWeight(settings.displayUnit === "lb" ? "135" : "100");
				setBarWeight(String(getDefaultBarWeight(settings.displayUnit)));
				setLoadError(null);
			})
			.catch((cause: unknown) => {
				if (!isMounted) {
					return;
				}

				setLoadError(
					cause instanceof Error
						? cause.message
						: sk.fitness.plates.loadUnitError,
				);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div className="space-y-6">
			<section className="fitness-hero-panel relative p-5 sm:p-6 lg:p-8">
				<div className="wasp-stripes absolute inset-0 opacity-40" />
				<div className="relative">
					<Badge className="fitness-badge">{sk.fitness.plates.badge}</Badge>
					<h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.055em] text-white sm:text-5xl">
						{sk.fitness.plates.heroTitle}
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-fitness-warm/75">
						{sk.fitness.plates.heroDescription}
					</p>
				</div>
			</section>

			{loadError ? (
				<div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
					{loadError}
				</div>
			) : null}

			<Card
				title={sk.fitness.plates.quickCardTitle}
				description={sk.fitness.plates.quickCardDescription}
			>
				<div className="space-y-4">
					<label className="block rounded-2xl border border-fitness-yellow/20 bg-fitness-surface p-4">
						<span className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
							{sk.fitness.plates.targetWeightLabel(displayUnit)}
						</span>
						<input
							aria-label={sk.fitness.plates.targetWeightLabel(displayUnit)}
							className="mt-2 w-full bg-transparent text-3xl font-black text-fitness-yellow outline-none"
							inputMode="decimal"
							value={targetWeight}
							onInput={(event) => setTargetWeight(event.currentTarget.value)}
						/>
					</label>

					<PlateLoadPanel
						unit={displayUnit}
						targetWeight={
							Number.isFinite(parsedTargetWeight) ? parsedTargetWeight : 0
						}
						barWeight={barWeight}
						onBarWeightChange={setBarWeight}
						description={sk.fitness.plateLoad.standaloneDescription}
					/>
				</div>
			</Card>

			<Card title={sk.fitness.plates.howToReadTitle}>
				<div className="grid gap-3 text-sm font-semibold text-fitness-warm/75 sm:grid-cols-3">
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black/70 p-4">
						<Calculator className="mb-2 size-5 text-fitness-yellow" />
						{sk.fitness.plates.perSideExplanation}
					</div>
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black/70 p-4">
						{sk.fitness.plates.closestLowerExplanation}
					</div>
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black/70 p-4">
						{sk.fitness.plates.localUnitExplanation}
					</div>
				</div>
			</Card>
		</div>
	);
}
