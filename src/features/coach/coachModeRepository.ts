import { settingsApi } from "@/lib/database";

const COACH_MODE_SETTING_KEY = "coach_mode_enabled";

export async function getCoachModeEnabled() {
	return (await settingsApi.get(COACH_MODE_SETTING_KEY)) === "true";
}

export async function setCoachModeEnabled(enabled: boolean) {
	await settingsApi.set(COACH_MODE_SETTING_KEY, enabled ? "true" : "false");
	return enabled;
}
