/**
 * V3 — Progress / Journal types.
 *
 * Body measurements and journal entries are the only **new** stored
 * data in V3. Everything else on the Progress hub (lift charts, PR
 * timeline) is derived from existing `FitnessLiveSession` data and
 * lives in `features/fitness/fitnessProgress.ts`.
 */

export interface BodyMeasurementRecord {
	id: string;
	recordedOn: string; // YYYY-MM-DD
	bodyweightKg: number | null;
	waistCm: number | null;
	chestCm: number | null;
	bicepsLeftCm: number | null;
	bicepsRightCm: number | null;
	thighLeftCm: number | null;
	thighRightCm: number | null;
	calfLeftCm: number | null;
	calfRightCm: number | null;
	note: string;
	photoUri: string | null;
	createdAt: string;
	updatedAt: string;
}

export type BodyMeasurementInput = Omit<
	BodyMeasurementRecord,
	"id" | "createdAt" | "updatedAt"
>;

export interface JournalEntryRecord {
	id: string;
	entryDate: string; // YYYY-MM-DD
	sessionId: string | null;
	body: string;
	mood: number | null; // 1..5
	sleepHours: number | null;
	energy: number | null; // 1..5
	createdAt: string;
	updatedAt: string;
}

export type JournalEntryInput = Omit<
	JournalEntryRecord,
	"id" | "createdAt" | "updatedAt"
>;
