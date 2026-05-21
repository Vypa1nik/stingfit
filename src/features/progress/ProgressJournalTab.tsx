import { useEffect, useMemo, useState } from "react";

import { BookOpen, Plus, Save, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Input";
import { progressRepository } from "@/features/progress/progressRepository";
import type {
	JournalEntryInput,
	JournalEntryRecord,
} from "@/features/progress/progressTypes";
import { useUiStore } from "@/lib/uiStore";

function todayIso() {
	return new Date().toISOString().slice(0, 10);
}

function emptyDraft(): JournalEntryInput {
	return {
		entryDate: todayIso(),
		sessionId: null,
		body: "",
		mood: null,
		sleepHours: null,
		energy: null,
	};
}

const QUICK_PROMPTS: Array<{ label: string; line: string }> = [
	{ label: "Ako som sa cítil", line: "**Ako som sa cítil:** " },
	{ label: "Spánok", line: "**Spánok:** " },
	{ label: "Energia", line: "**Energia:** " },
	{ label: "Strava pred tréningom", line: "**Pre-workout jedlo:** " },
];

export function ProgressJournalTab() {
	const pushToast = useUiStore((state) => state.pushToast);
	const [entries, setEntries] = useState<JournalEntryRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [draft, setDraft] = useState<JournalEntryInput>(emptyDraft());
	const [draftId, setDraftId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		progressRepository
			.listJournalEntries()
			.then((rows) => {
				if (!cancelled) {
					setEntries(rows);
					setIsLoading(false);
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					setIsLoading(false);
					pushToast({
						tone: "error",
						title: "Zápisník sa nepodarilo načítať",
						description:
							error instanceof Error ? error.message : "Neznáma chyba.",
					});
				}
			});
		return () => {
			cancelled = true;
		};
	}, [pushToast]);

	const filteredEntries = useMemo(() => {
		if (!searchQuery.trim()) return entries;
		const needle = searchQuery.trim().toLowerCase();
		return entries.filter(
			(entry) =>
				entry.body.toLowerCase().includes(needle) ||
				entry.entryDate.includes(needle),
		);
	}, [entries, searchQuery]);

	function appendPrompt(line: string) {
		setDraft((current) => ({
			...current,
			body: current.body
				? `${current.body.trimEnd()}\n${line}`
				: line,
		}));
	}

	function resetDraft() {
		setDraft(emptyDraft());
		setDraftId(null);
	}

	function startEditing(entry: JournalEntryRecord) {
		setDraft({
			entryDate: entry.entryDate,
			sessionId: entry.sessionId,
			body: entry.body,
			mood: entry.mood,
			sleepHours: entry.sleepHours,
			energy: entry.energy,
		});
		setDraftId(entry.id);
	}

	async function handleSave() {
		if (!draft.body.trim()) {
			pushToast({
				tone: "error",
				title: "Zápisník nemôže byť prázdny",
				description: "Napíš aspoň jednu vetu k dnešnému dňu.",
			});
			return;
		}
		try {
			setIsSaving(true);
			const saved = await progressRepository.upsertJournalEntry({
				...draft,
				id: draftId ?? undefined,
			});
			setEntries((current) => {
				const without = current.filter((entry) => entry.id !== saved.id);
				return [...without, saved].sort(
					(a, b) =>
						new Date(`${b.entryDate}T00:00:00`).getTime() -
						new Date(`${a.entryDate}T00:00:00`).getTime(),
				);
			});
			resetDraft();
			pushToast({ tone: "success", title: "Zápis uložený" });
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
			await progressRepository.deleteJournalEntry(id);
			setEntries((current) => current.filter((entry) => entry.id !== id));
			if (draftId === id) resetDraft();
			pushToast({ tone: "success", title: "Zápis zmazaný" });
		} catch (error) {
			pushToast({
				tone: "error",
				title: "Zmazanie zlyhalo",
				description:
					error instanceof Error ? error.message : "Neznáma chyba.",
			});
		}
	}

	return (
		<div className="space-y-6">
			<Card
				title={draftId ? "Upraviť zápis" : "Nový zápis"}
				description="Píš vlastnými slovami. Tagy ako #pump alebo #zlespanok sa dajú vyhľadať."
				action={
					draftId ? (
						<Button variant="ghost" size="sm" onClick={resetDraft}>
							Zrušiť úpravu
						</Button>
					) : null
				}
			>
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
								Dátum
							</label>
							<Input
								type="date"
								value={draft.entryDate}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										entryDate: event.target.value,
									}))
								}
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
								Spánok (h)
							</label>
							<Input
								type="number"
								inputMode="decimal"
								step="0.5"
								value={draft.sleepHours === null ? "" : String(draft.sleepHours)}
								onChange={(event) => {
									const value = event.target.value;
									setDraft((current) => ({
										...current,
										sleepHours: value === "" ? null : Number(value),
									}));
								}}
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
								Energia (1–5)
							</label>
							<Input
								type="number"
								min={1}
								max={5}
								step={1}
								value={draft.energy === null ? "" : String(draft.energy)}
								onChange={(event) => {
									const value = event.target.value;
									setDraft((current) => ({
										...current,
										energy: value === "" ? null : Number(value),
									}));
								}}
							/>
						</div>
					</div>
					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fitness-warm/75">
							Poznámka
						</label>
						<TextArea
							value={draft.body}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									body: event.target.value,
								}))
							}
							placeholder="Aký bol dnešok? Ako sa cítili kolená? Bol pump dobrý?"
						/>
						<div className="mt-2 flex flex-wrap gap-2">
							{QUICK_PROMPTS.map((prompt) => (
								<button
									key={prompt.label}
									type="button"
									onClick={() => appendPrompt(prompt.line)}
									className="rounded-full border border-fitness-yellow/30 bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wider text-fitness-warm/75 hover:border-fitness-yellow/60 hover:text-fitness-yellow"
								>
									+ {prompt.label}
								</button>
							))}
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							leadingIcon={draftId ? <Save className="size-4" /> : <Plus className="size-4" />}
							onClick={handleSave}
							disabled={isSaving}
						>
							{draftId ? "Uložiť zmeny" : "Pridať zápis"}
						</Button>
					</div>
				</div>
			</Card>

			<Card title="Vyhľadávanie" description="Hľadaj v poznámkach a tagoch.">
				<div className="flex items-center gap-2">
					<Search className="size-4 shrink-0 text-fitness-yellow" />
					<Input
						placeholder="napr. pump, kolená, #zlespanok…"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
					/>
				</div>
			</Card>

			<Card title="Zápisník" description="Najnovšie zápisy hore.">
				{isLoading ? (
					<div className="rounded-2xl border border-fitness-yellow/20 bg-black px-4 py-4 text-sm text-fitness-warm/70">
						Načítavam zápisy…
					</div>
				) : filteredEntries.length === 0 ? (
					<div className="flex items-center gap-3 rounded-2xl border border-fitness-yellow/20 bg-black/40 px-4 py-4 text-sm text-fitness-warm/75">
						<BookOpen className="size-5 text-fitness-yellow" />
						{searchQuery.trim()
							? "Žiadne zápisy nezodpovedajú vyhľadávaniu."
							: "Zatiaľ žiadne zápisy. Pridaj prvý vyššie."}
					</div>
				) : (
					<ul className="divide-y divide-fitness-yellow/10">
						{filteredEntries.map((entry) => (
							<li key={entry.id} className="space-y-2 py-3">
								<div className="flex items-start justify-between gap-3">
									<button
										type="button"
										onClick={() => startEditing(entry)}
										className="flex-1 text-left"
									>
										<p className="text-sm font-semibold text-white">
											{entry.entryDate}
										</p>
										<p className="mt-1 whitespace-pre-wrap text-sm text-fitness-warm/85">
											{entry.body}
										</p>
										{entry.sleepHours !== null || entry.energy !== null ? (
											<p className="mt-1 text-xs text-fitness-warm/55">
												{entry.sleepHours !== null
													? `Spánok ${entry.sleepHours}h`
													: ""}
												{entry.sleepHours !== null && entry.energy !== null
													? " · "
													: ""}
												{entry.energy !== null
													? `Energia ${entry.energy}/5`
													: ""}
											</p>
										) : null}
									</button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDelete(entry.id)}
										leadingIcon={<Trash2 className="size-3" />}
									>
										Zmazať
									</Button>
								</div>
							</li>
						))}
					</ul>
				)}
			</Card>
		</div>
	);
}
