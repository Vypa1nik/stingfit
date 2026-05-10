export type ProfileKind = "solo" | "coach" | "client";

export interface ProfileRecord {
	id: string;
	name: string;
	kind: ProfileKind;
	createdAt: string;
	archivedAt: string | null;
	isActive: boolean;
}

export interface CreateProfileInput {
	name: string;
	kind: ProfileKind;
}
