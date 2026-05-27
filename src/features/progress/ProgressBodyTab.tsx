import { useEffect, useMemo, useState } from "react";

import { Plus, Save, Trash2, Weight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Input";
import { fitnessRepository } from "@/features/fitness/fitnessRepository";
import {
	convertWeightFromKg,
	convertWeightToKg,
	type FitnessDisplayUnit,
} from "@/features/fitness/fitnessUnits";
import { progressRepository } from "@/features/progress/progressRepository";
import type {
	BodyMeasurementInput,
	BodyMeasurementRecord,
} from "@/features/progress/progressTypes";
import {
	MiniLineChart,
	type LineChartSeries,
} from "@/features/progress/MiniLineChart";
import { useUiStore } from "@/lib/uiStore";

function todayIso() {
	const date = new Date();
	return date.toISOString().slice(0, 10);
}

function emptyDraft(): BodyMeasurementInput {
	return {
		recordedOn: todayIso(),
		bodyweightKg: null,
		waistCm: null,
		chestCm: null,
		bicepsLeftCm: null,
		bicepsRightCm: null,
		thighLeftCm: null,
		thighRightCm: null,
		calfLeftCm: null,
		calfRightCm: null,
		note: "",
		photoUri: null,
	};
}

function toNumberOrNull(value: string): number | null {
	if (value.trim() === "") return null;
	const parsed = Number(value.replace(",", "."));
	return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number | null) {
	if (value === null) return "—";
	return value.toFixed(1);
}

const NUMERIC_FIELDS: Array<{
	key: keyof BodyMeasurementInput;
	label: string;
	unit: "bodyweight" | "cm";
}> = [
	{ key: "bodyweightKg", label: "Hmotnosť", unit: "bodyweight" },
	{ key: "waistCm", label: "Pás", unit: "cm" },
	{ key: "chestCm", label: "Hrudník", unit: "cm" },
	{ key: "bicepsLeftCm", label: "Biceps ľavý", unit: "cm" },
	{ key: "bicepsRightCm", label: "Biceps pravý", unit: "cm" },
	{ key: "thighLeftCm", label: "Stehno ľavé", unit: "cm" },
	{ key: "thighRightCm", label: "Stehno pravé", unit: "cm" },
	{ key: "calfLeftCm", label: "Lýtko ľavé", unit: "cm" },
	{ key: "calfRightCm", label: "Lýtko pravé", unit: "cm" },
];

function getFieldUnit(
	field: (typeof NUMERIC_FIELDS)[number],
	displayUnit: FitnessDisplayUnit,
) {
	return field.unit === "bodyweight" ? displayUnit : "cm";
}

function getDisplayMeasurementValue(
	field: (typeof NUMERIC_FIELDS)[number],
	value: number | null,
	displayUnit: FitnessDisplayUnit,
) {
	if (value === null) return null;
	return field.unit === "bodyweight"
		? convertWeightFromKg(value, displayUnit)
		: value;
}

function toStoredMeasurementValue(
	field: (typeof NUMERIC_FIELDS)[number],
	value: number | null,
	displayUnit: FitnessDisplayUnit,
) {
	if (value === null) return null;
	return field.unit === "bodyweight"
		? convertWeightToKg(value, displayUnit)
		: value;
}

export function ProgressBodyTab() {
	const pushToast = useUiStore((state) => state.pushToast);
	const [records, setRecords] = useState<BodyMeasurementRecord[]>([]);
	const [displayUnit, setDisplayUnit] = useState<FitnessDisplayUnit>("kg");
	const [isLoading, setIsLoading] = useState(true);
	const [draft, setDraft] = useState<BodyMeasurementInput>(emptyDraft());
	const [draftId, setDraftId] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		Promise.all([
			progressRepository.listBodyMeasurements(),
			fitnessRepository.getSettings(),
		])
			.then(([rows, settings]) => {
				if (!cancelled) {
					setRecords(rows);
					setDisplayUnit(settings.displayUnit);
					setIsLoading(false);
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					setIsLoading(false);
					pushToast({
						tone: "error",
						title: "Telesné miery sa nepodarili načítať",
						description:
							error instanceof Error ? error.message : "Neznáma chyba.",
					});
				}
			});
		return () => {
			cancelled = true;
		};
	}, [pushToast]);

	const bodyweightSeries = useMemo<LineChartSeries[]>(() => {
		const points = records
			.filter((r) => r.bodyweightKg !== null)
			.map((r) => ({
				x: new Date(`${r.recordedOn}T00:00:00`).getTime(),
				y: convertWeightFromKg(r.bodyweightKg as number, displayUnit),
			}))
			.sort((a, b) => a.x - b.x);
		if (points.length === 0) return [];
		return [
			{
				id: "bodyweight",
				label: `Hmotnosť (${displayUnit})`,
				color: "rgb(250, 204, 21)",
				emphasize: true,
				points,
			},
		];
	}, [displayUnit, records]);

	const waistChestSeries = useMemo<LineChartSeries[]>(() => {
		const sorted = [...records].sort(
			(a, b) =>
				new Date(`${a.recordedOn}T00:00:00`).getTime() -
				new Date(`${b.recordedOn}T00:00:00`).getTime(),
		);
		const waistPoints = sorted
			.filter((r) => r.waistCm !== null)
			.map((r) => ({
				x: new Date(`${r.recordedOn}T00:00:00`).getTime(),
				y: r.waistCm as number,
			}));
		const chestPoints = sorted
			.filter((r) => r.chestCm !== null)
			.map((r) => ({
				x: new Date(`${r.recordedOn}T00:00:00`).getTime(),
				y: r.chestCm as number,
			}));
		const series: LineChartSeries[] = [];
		if (waistPoints.length) {
			series.push({
				id: "waist",
				label: "Pás (cm)",
				color: "rgb(96, 165, 250)",
				points: waistPoints,
			});
		}
		if (chestPoints.length) {
			series.push({
				id: "chest",
				label: "Hrudník (cm)",
				color: "rgb(244, 114, 182)",
				points: chestPoints,
			});
		}
		return series;
	}, [records]);

	function handleNumericChange(
		field: (typeof NUMERIC_FIELDS)[number],
		value: string,
	) {
		setDraft((current) => ({
			...current,
			[field.key]: toStoredMeasurementValue(
				field,
				toNumberOrNull(value),
				displayUnit,
			),
		}));
	}

	function resetDraft() {
		setDraft(emptyDraft());
		setDraftId(null);
	}

	function startEditing(record: BodyMeasurementRecord) {
		setDraft({
			recordedOn: record.recordedOn,
			bodyweightKg: record.bodyweightKg,
			waistCm: record.waistCm,
			chestCm: record.chestCm,
			bicepsLeftCm: record.bicepsLeftCm,
			bicepsRightCm: record.bicepsRightCm,
			thighLeftCm: record.thighLeftCm,
			thighRightCm: record.thighRightCm,
			calfLeftCm: record.calfLeftCm,
			calfRightCm: record.calfRightCm,
			note: record.note,
			photoUri: record.photoUri,
		});
		setDraftId(record.id);
	}

	async function handleSave() {
		try {
			setIsSaving(true);
			const saved = await progressRepository.upsertBodyMeasurement({
				...draft,
				id: draftId ?? undefined,
			});
			setRecords((current) => {
				const without = current.filter((r) => r.id !== saved.id);
				return [...without, saved].sort(
					(a, b) =>
						new Date(`${b.recordedOn}T00:00:00`).getTime() -
						new Date(`${a.recordedOn}T00:00:00`).getTime(),
				);
			});
			resetDraft();
			pushToast({ tone: "success", title: "Miery uložené" });
		} catch (error) {
			pushToast({
				tone: "error",
				title: "Uloženie zlyhalo",
				description:
					error instanceof Error ? error.message : "Neznáma chyba.",
			});
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await progressRepository.deleteBodyMeasurement(id);
			setRecords((current) => current.filter((r) => r.id !== id));
			if (draftId === id) resetDraft();
			pushToast({ tone: "success", title: "Záznam zmazaný" });
		} catch (error) {
			pushToast({
				tone: "error",
				title: "Zmazanie zlyhalo",
				description:
					error instanceof Error ? error.message : "Neznáma chyba.",
			});
		}
	}

	const latest = records[0] ?? null;

	return (
		<div className="space-y-6">
			<Card
				title={draftId ? "Upraviť záznam" : "Pridať nový záznam"}
				description="Všetky polia okrem dátumu sú nepovinné. Vyplň iba to, čo dnes meriaš."
				action={
					draftId ? (
						<Button variant="ghost" size="sm" onClick={resetDraft}>
							Zrušiť úpravu
						</Button>
					) : null
				}
			>
				<div className="space-y-4">
					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
							Dátum
						</label>
						<Input
							type="date"
							value={draft.recordedOn}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									recordedOn: event.target.value,
								}))
							}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{NUMERIC_FIELDS.map((field) => {
							const displayValue = getDisplayMeasurementValue(
								field,
								draft[field.key] as number | null,
								displayUnit,
							);

							return (
								<div key={field.key}>
									<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
										{field.label} ({getFieldUnit(field, displayUnit)})
									</label>
									<Input
										type="number"
										inputMode="decimal"
										step="0.1"
										value={displayValue === null ? "" : String(displayValue)}
										onChange={(event) =>
											handleNumericChange(field, event.target.value)
										}
									/>
								</div>
							);
						})}
					</div>
					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
							Poznámka
						</label>
						<TextArea
							value={draft.note}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									note: event.target.value,
								}))
							}
							placeholder="Ako si sa cítil? Bol si po jedle? Hydratovaný?"
						/>
					</div>
					<div className="flex justify-end">
						<Button
							leadingIcon={draftId ? <Save className="size-4" /> : <Plus className="size-4" />}
							onClick={handleSave}
							disabled={isSaving}
						>
							{draftId ? "Uložiť zmeny" : "Pridať záznam"}
						</Button>
					</div>
				</div>
			</Card>

			{latest ? (
				<Card title="Najnovšie miery" description={`Záznam z ${latest.recordedOn}`}>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{NUMERIC_FIELDS.map((field) => {
							const displayValue = getDisplayMeasurementValue(
								field,
								latest[field.key] as number | null,
								displayUnit,
							);

							return (
								<div
									key={field.key}
									className="rounded-2xl border border-fitness-yellow/20 bg-black/40 px-3 py-3 text-sm"
								>
									<p className="text-[10px] uppercase tracking-wider text-fitness-warm/65">
										{field.label}
									</p>
									<p className="mt-1 text-base font-bold text-fitness-yellow">
										{formatNumber(displayValue)}{" "}
										<span className="text-xs font-medium text-fitness-warm/65">
											{getFieldUnit(field, displayUnit)}
										</span>
									</p>
								</div>
							);
						})}
					</div>
				</Card>
			) : null}

			{bodyweightSeries.length > 0 ? (
				<Card
					title="Telesná hmotnosť"
					description="Krivka denných záznamov telesnej hmotnosti."
				>
					<MiniLineChart
						series={bodyweightSeries}
						yLabelFormatter={(value) => `${value.toFixed(1)} ${displayUnit}`}
					/>
				</Card>
			) : null}

			{waistChestSeries.length > 0 ? (
				<Card title="Pás & hrudník" description="Obvody v čase.">
					<MiniLineChart
						series={waistChestSeries}
						yLabelFormatter={(value) => `${Math.round(value)} cm`}
					/>
				</Card>
			) : null}

			<Card title="Všetky záznamy" description="Klikni na riadok pre úpravu.">
				{isLoading ? (
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
						Načítavam záznamy…
					</div>
				) : records.length === 0 ? (
					<div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/20 bg-black/40 px-4 py-4 text-sm text-fitness-warm/75">
						<Weight className="size-5 text-fitness-yellow" />
						Zatiaľ žiadne záznamy. Pridaj prvý záznam vyššie.
					</div>
				) : (
					<ul className="divide-y divide-fitness-yellow/10">
						{records.map((record) => (
							<li
								key={record.id}
								className="flex items-start justify-between gap-3 py-3"
							>
								<button
									type="button"
									onClick={() => startEditing(record)}
									className="flex-1 text-left"
								>
									<p className="text-sm font-semibold text-white">
										{record.recordedOn}
										{record.bodyweightKg !== null
											? ` — ${formatNumber(convertWeightFromKg(record.bodyweightKg, displayUnit))} ${displayUnit}`
											: ""}
									</p>
									{record.note ? (
										<p className="mt-1 text-xs text-fitness-warm/70">
											{record.note}
										</p>
									) : null}
								</button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDelete(record.id)}
									leadingIcon={<Trash2 className="size-3" />}
								>
									Zmazať
								</Button>
							</li>
						))}
					</ul>
				)}
			</Card>
		</div>
	);
}
