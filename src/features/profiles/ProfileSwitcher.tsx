import { useEffect, useState } from "react";

import { sk } from "@/i18n/sk";
import { cn } from "@/lib/utils";
import { listProfiles, setActiveProfile } from "./profileRepository";
import type { ProfileRecord } from "./profileTypes";

export function ProfileSwitcher() {
	const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const activeProfileId =
		profiles.find((profile) => profile.isActive)?.id ?? profiles[0]?.id ?? "";

	useEffect(() => {
		let isMounted = true;

		async function loadProfiles() {
			try {
				const loadedProfiles = await listProfiles();
				if (isMounted) {
					setProfiles(loadedProfiles);
					setError(null);
				}
			} catch (cause) {
				if (isMounted) {
					setError(
						cause instanceof Error
							? cause.message
							: sk.fitness.profiles.switchError,
					);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadProfiles();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleProfileChange = async (profileId: string) => {
		try {
			const activeProfile = await setActiveProfile(profileId);
			setProfiles((currentProfiles) =>
				currentProfiles.map((profile) => ({
					...profile,
					isActive: profile.id === activeProfile.id,
				})),
			);
			setError(null);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: sk.fitness.profiles.switchError,
			);
		}
	};

	if (isLoading || profiles.length <= 1) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<select
				aria-label={sk.fitness.profiles.activeProfileLabel}
				value={activeProfileId}
				onChange={(event) => void handleProfileChange(event.target.value)}
				title={error ?? sk.fitness.profiles.activeProfileLabel}
				className={cn(
					"h-10 max-w-[9rem] rounded-xl border bg-white px-3 text-sm font-semibold text-text-primary shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fitness-yellow sm:max-w-none dark:bg-surface-dark dark:text-text-primary-dark",
					error
						? "border-red-400 dark:border-red-400"
						: "border-border dark:border-border-dark",
				)}
			>
				{profiles.map((profile) => (
					<option key={profile.id} value={profile.id}>
						{profile.name}
					</option>
				))}
			</select>
		</div>
	);
}
