import { Calculator } from "lucide-react";

import {
	calculatePlateLoad,
	formatPlateLoadSummary,
	formatPlateNumber,
} from "@/features/fitness/plateCalculator";
import type { FitnessDisplayUnit } from "@/features/fitness/fitnessUnits";
import { sk } from "@/i18n/sk";
import { cn } from "@/lib/utils";

interface PlateLoadPanelProps {
	unit: FitnessDisplayUnit;
	targetWeight: number;
	barWeight: string;
	onBarWeightChange: (value: string) => void;
	className?: string;
	description?: string;
}

export function PlateLoadPanel({
	unit,
	targetWeight,
	barWeight,
	onBarWeightChange,
	className,
	description = sk.fitness.plateLoad.setLoggerDescription,
}: PlateLoadPanelProps) {
	const parsedBarWeight = Number(barWeight);
	const plateLoad = calculatePlateLoad({
		targetWeight: Number.isFinite(targetWeight) ? targetWeight : 0,
		barWeight: Number.isFinite(parsedBarWeight) ? parsedBarWeight : 0,
		unit,
	});
	const toneClass = plateLoad.isExact
		? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
		: "border-fitness-yellow/25 bg-fitness-yellow/10 text-fitness-warm";

	return (
		<div
			data-testid="plate-calculator-panel"
			className={cn(
				"rounded-2xl border border-fitness-yellow/25 bg-black/70 p-4",
				className,
			)}
		>
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-fitness-yellow text-black">
					<Calculator className="size-5" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow">
						{sk.fitness.plateLoad.title}
					</p>
					<p className="mt-1 text-xs text-fitness-warm/65">{description}</p>
				</div>
			</div>

			<label className="mt-4 block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
				{sk.fitness.plateLoad.barWeightLabel}
				<input
					aria-label={sk.fitness.plateLoad.barWeightAria(unit)}
					className="mt-2 w-full rounded-2xl border border-fitness-yellow/20 bg-fitness-surface px-3 py-3 text-sm font-black text-fitness-yellow outline-none focus:border-fitness-yellow"
					inputMode="decimal"
					value={barWeight}
					onInput={(event) => onBarWeightChange(event.currentTarget.value)}
				/>
			</label>

			<div
				className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-black ${toneClass}`}
			>
				{formatPlateLoadSummary(plateLoad)}
			</div>

			{!plateLoad.isUnderBar && plateLoad.plates.length > 0 ? (
				<div className="mt-3 flex flex-wrap gap-2">
					{plateLoad.plates.map((plate) => (
						<span
							key={plate.weight}
							className="rounded-full border border-fitness-yellow/20 bg-fitness-surface px-3 py-1 text-xs font-black text-fitness-yellow"
						>
							{formatPlateNumber(plate.weight)} {unit} × {plate.count}
						</span>
					))}
				</div>
			) : null}
		</div>
	);
}
