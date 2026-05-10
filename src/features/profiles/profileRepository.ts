import { execute, query, settingsApi } from "@/lib/database";
import type {
	CreateProfileInput,
	ProfileKind,
	ProfileRecord,
} from "./profileTypes";

const DEFAULT_PROFILE_ID = "solo";
const PROFILE_KINDS: ProfileKind[] = ["solo", "coach", "client"];

interface ProfileRow {
	id: string;
	name: string;
	kind: string;
	created_at: string;
	archived_at: string | null;
}

function normalizeProfileKind(kind: string): ProfileKind {
	if (PROFILE_KINDS.includes(kind as ProfileKind)) {
		return kind as ProfileKind;
	}

	return "solo";
}

function toProfileRecord(
	row: ProfileRow,
	activeProfileId: string | null,
): ProfileRecord {
	return {
		id: row.id,
		name: row.name,
		kind: normalizeProfileKind(row.kind),
		createdAt: row.created_at,
		archivedAt: row.archived_at,
		isActive: row.id === activeProfileId,
	};
}

function createProfileId(kind: ProfileKind) {
	const randomId =
		typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
			? crypto.randomUUID()
			: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

	return `profile-${kind}-${randomId}`;
}

function validateProfileName(name: string) {
	const trimmedName = name.trim();
	if (!trimmedName) {
		throw new Error("Názov profilu je povinný.");
	}

	return trimmedName;
}

function validateProfileKind(kind: ProfileKind) {
	if (!PROFILE_KINDS.includes(kind)) {
		throw new Error("Neplatný typ profilu.");
	}

	return kind;
}

async function getActiveProfileId() {
	return settingsApi.get("active_profile_id");
}

export async function listProfiles(): Promise<ProfileRecord[]> {
	const rows = await query<ProfileRow>(
		`SELECT id, name, kind, created_at, archived_at
     FROM profiles
     WHERE archived_at IS NULL
     ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, created_at ASC, name ASC`,
		[DEFAULT_PROFILE_ID],
	);
	const activeProfileId = await getActiveProfileId();
	const fallbackActiveProfileId = rows.some((row) => row.id === activeProfileId)
		? activeProfileId
		: (rows[0]?.id ?? null);

	return rows.map((row) => toProfileRecord(row, fallbackActiveProfileId));
}

export async function getActiveProfile(): Promise<ProfileRecord> {
	const profiles = await listProfiles();
	const activeProfile =
		profiles.find((profile) => profile.isActive) ?? profiles[0];

	if (!activeProfile) {
		throw new Error("Nie je dostupný žiadny profil.");
	}

	return activeProfile;
}

export async function createProfile(
	input: CreateProfileInput,
): Promise<ProfileRecord> {
	const id = createProfileId(validateProfileKind(input.kind));
	const name = validateProfileName(input.name);
	const timestamp = new Date().toISOString();

	await execute(
		`INSERT INTO profiles(id, name, kind, created_at, archived_at)
     VALUES (?, ?, ?, ?, NULL)`,
		[id, name, input.kind, timestamp],
	);

	const activeProfileId = await getActiveProfileId();
	return {
		id,
		name,
		kind: input.kind,
		createdAt: timestamp,
		archivedAt: null,
		isActive: id === activeProfileId,
	};
}

export async function setActiveProfile(
	profileId: string,
): Promise<ProfileRecord> {
	const [row] = await query<ProfileRow>(
		`SELECT id, name, kind, created_at, archived_at
     FROM profiles
     WHERE id = ? AND archived_at IS NULL`,
		[profileId],
	);

	if (!row) {
		throw new Error("Profil nie je dostupný.");
	}

	await settingsApi.set("active_profile_id", row.id);
	return toProfileRecord(row, row.id);
}
