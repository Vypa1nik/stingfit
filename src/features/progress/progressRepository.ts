import { execute, query } from "@/lib/database";

import type {
	BodyMeasurementInput,
	BodyMeasurementRecord,
	JournalEntryInput,
	JournalEntryRecord,
} from "@/features/progress/progressTypes";

/**
 * V3 — Progress repository.
 *
 * Mirrors the style of `fitnessRepository.ts`. All access goes through
 * the `query`/`execute` helpers from `@/lib/database`, which means
 * persistence + the `PRAGMA foreign_keys = ON` contract are inherited
 * automatically.
 */

interface BodyMeasurementRow {
	id: string;
	recorded_on: string;
	bodyweight_kg: number | null;
	waist_cm: number | null;
	chest_cm: number | null;
	biceps_left_cm: number | null;
	biceps_right_cm: number | null;
	thigh_left_cm: number | null;
	thigh_right_cm: number | null;
	calf_left_cm: number | null;
	calf_right_cm: number | null;
	note: string;
	photo_uri: string | null;
	created_at: string;
	updated_at: string;
}

interface JournalEntryRow {
	id: string;
	entry_date: string;
	session_id: string | null;
	body: string;
	mood: number | null;
	sleep_hours: number | null;
	energy: number | null;
	created_at: string;
	updated_at: string;
}

function nowIso() {
	return new Date().toISOString();
}

function newId(prefix: string) {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return `${prefix}_${crypto.randomUUID()}`;
	}
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapBodyMeasurement(row: BodyMeasurementRow): BodyMeasurementRecord {
	return {
		id: row.id,
		recordedOn: row.recorded_on,
		bodyweightKg: row.bodyweight_kg,
		waistCm: row.waist_cm,
		chestCm: row.chest_cm,
		bicepsLeftCm: row.biceps_left_cm,
		bicepsRightCm: row.biceps_right_cm,
		thighLeftCm: row.thigh_left_cm,
		thighRightCm: row.thigh_right_cm,
		calfLeftCm: row.calf_left_cm,
		calfRightCm: row.calf_right_cm,
		note: row.note,
		photoUri: row.photo_uri,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function mapJournalEntry(row: JournalEntryRow): JournalEntryRecord {
	return {
		id: row.id,
		entryDate: row.entry_date,
		sessionId: row.session_id,
		body: row.body,
		mood: row.mood,
		sleepHours: row.sleep_hours,
		energy: row.energy,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export const progressRepository = {
	/** Body measurements — newest first. */
	async listBodyMeasurements(): Promise<BodyMeasurementRecord[]> {
		const rows = await query<BodyMeasurementRow>(
			`SELECT * FROM fitness_body_measurements
       ORDER BY recorded_on DESC, created_at DESC`,
		);
		return rows.map(mapBodyMeasurement);
	},

	async upsertBodyMeasurement(
		input: BodyMeasurementInput & { id?: string },
	): Promise<BodyMeasurementRecord> {
		const id = input.id ?? newId("bm");
		const timestamp = nowIso();
		await execute(
			`INSERT INTO fitness_body_measurements (
        id, recorded_on, bodyweight_kg, waist_cm, chest_cm,
        biceps_left_cm, biceps_right_cm, thigh_left_cm, thigh_right_cm,
        calf_left_cm, calf_right_cm, note, photo_uri, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        recorded_on = excluded.recorded_on,
        bodyweight_kg = excluded.bodyweight_kg,
        waist_cm = excluded.waist_cm,
        chest_cm = excluded.chest_cm,
        biceps_left_cm = excluded.biceps_left_cm,
        biceps_right_cm = excluded.biceps_right_cm,
        thigh_left_cm = excluded.thigh_left_cm,
        thigh_right_cm = excluded.thigh_right_cm,
        calf_left_cm = excluded.calf_left_cm,
        calf_right_cm = excluded.calf_right_cm,
        note = excluded.note,
        photo_uri = excluded.photo_uri,
        updated_at = excluded.updated_at`,
			[
				id,
				input.recordedOn,
				input.bodyweightKg,
				input.waistCm,
				input.chestCm,
				input.bicepsLeftCm,
				input.bicepsRightCm,
				input.thighLeftCm,
				input.thighRightCm,
				input.calfLeftCm,
				input.calfRightCm,
				input.note,
				input.photoUri,
				timestamp,
				timestamp,
			],
		);
		const rows = await query<BodyMeasurementRow>(
			`SELECT * FROM fitness_body_measurements WHERE id = ?`,
			[id],
		);
		if (rows.length === 0) {
			throw new Error("Body measurement save failed");
		}
		return mapBodyMeasurement(rows[0]);
	},

	async deleteBodyMeasurement(id: string): Promise<void> {
		await execute(`DELETE FROM fitness_body_measurements WHERE id = ?`, [id]);
	},

	/** Journal entries — newest first. */
	async listJournalEntries(): Promise<JournalEntryRecord[]> {
		const rows = await query<JournalEntryRow>(
			`SELECT * FROM fitness_journal_entries
       ORDER BY entry_date DESC, created_at DESC`,
		);
		return rows.map(mapJournalEntry);
	},

	async upsertJournalEntry(
		input: JournalEntryInput & { id?: string },
	): Promise<JournalEntryRecord> {
		const id = input.id ?? newId("j");
		const timestamp = nowIso();
		await execute(
			`INSERT INTO fitness_journal_entries (
        id, entry_date, session_id, body, mood, sleep_hours, energy,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        entry_date = excluded.entry_date,
        session_id = excluded.session_id,
        body = excluded.body,
        mood = excluded.mood,
        sleep_hours = excluded.sleep_hours,
        energy = excluded.energy,
        updated_at = excluded.updated_at`,
			[
				id,
				input.entryDate,
				input.sessionId,
				input.body,
				input.mood,
				input.sleepHours,
				input.energy,
				timestamp,
				timestamp,
			],
		);
		const rows = await query<JournalEntryRow>(
			`SELECT * FROM fitness_journal_entries WHERE id = ?`,
			[id],
		);
		if (rows.length === 0) {
			throw new Error("Journal entry save failed");
		}
		return mapJournalEntry(rows[0]);
	},

	async deleteJournalEntry(id: string): Promise<void> {
		await execute(`DELETE FROM fitness_journal_entries WHERE id = ?`, [id]);
	},
};
