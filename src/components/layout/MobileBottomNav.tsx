import { useState } from "react";

import {
	Activity,
	ClipboardList,
	Dumbbell,
	MoreHorizontal,
	PlusCircle,
	type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { MoreSheet } from "@/components/layout/MoreSheet";
import { sk } from "@/i18n/sk";
import { cn } from "@/lib/utils";

type MobileNavTile =
	| {
			kind: "link";
			label: string;
			path: string;
			icon: LucideIcon;
			primary?: boolean;
	  }
	| {
			kind: "more";
			label: string;
			icon: LucideIcon;
	  };

const mobileNavCopy = sk.fitness.nav.mobile;

/**
 * Five mobile tiles. The middle "+ Tréning" is the primary CTA (start /
 * resume the day's session). "Viac" opens a bottom sheet with the
 * less-frequent destinations (calculators, coach mode, settings).
 *
 * Keep this list at five entries. Anything sixth belongs in the More
 * sheet.
 */
const MOBILE_NAV_TILES: MobileNavTile[] = [
	{ kind: "link", label: mobileNavCopy.training, path: "/train", icon: Dumbbell },
	{ kind: "link", label: mobileNavCopy.progress, path: "/progress", icon: Activity },
	{
		kind: "link",
		label: mobileNavCopy.startTraining,
		path: "/train",
		icon: PlusCircle,
		primary: true,
	},
	{ kind: "link", label: mobileNavCopy.plans, path: "/plans", icon: ClipboardList },
	{ kind: "more", label: mobileNavCopy.more, icon: MoreHorizontal },
];

export function MobileBottomNav() {
	const [moreOpen, setMoreOpen] = useState(false);

	return (
		<>
			<nav
				aria-label={mobileNavCopy.ariaLabel}
				data-testid="mobile-bottom-nav"
				className="fixed inset-x-0 bottom-0 z-40 border-t border-fitness-yellow/25 bg-black/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2 shadow-[0_-18px_40px_rgba(0,0,0,0.45)] backdrop-blur md:hidden"
			>
				<div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-1">
					{MOBILE_NAV_TILES.map((tile) => {
						const Icon = tile.icon;

						if (tile.kind === "more") {
							return (
								<button
									key="more"
									type="button"
									aria-haspopup="dialog"
									aria-expanded={moreOpen}
									onClick={() => setMoreOpen((value) => !value)}
									className={cn(
										"flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black transition-all duration-150 ease-out",
										moreOpen
											? "bg-fitness-yellow/15 text-fitness-yellow"
											: "text-fitness-warm/65 hover:bg-fitness-yellow/10 hover:text-fitness-yellow",
									)}
								>
									<Icon className="size-4 shrink-0" />
									<span className="leading-none">{tile.label}</span>
								</button>
							);
						}

						return (
							<NavLink
								key={tile.label}
								to={tile.path}
								end={tile.path === "/train" && !tile.primary}
								className={({ isActive }) =>
									cn(
										"flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black transition-all duration-150 ease-out",
										tile.primary
											? "mobile-fab-lift -mt-5 min-h-16 rounded-3xl border border-fitness-yellow bg-fitness-yellow text-black shadow-[0_0_28px_rgba(255,255,0,0.28)]"
											: "",
										!tile.primary && isActive
											? "bg-fitness-yellow/15 text-fitness-yellow"
											: "",
										!tile.primary && !isActive
											? "text-fitness-warm/65 hover:bg-fitness-yellow/10 hover:text-fitness-yellow"
											: "",
										tile.primary && isActive ? "ring-2 ring-white/60" : "",
									)
								}
							>
								<Icon
									className={cn(
										"shrink-0",
										tile.primary ? "size-5" : "size-4",
									)}
								/>
								<span className="leading-none">{tile.label}</span>
							</NavLink>
						);
					})}
				</div>
			</nav>
			<MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
		</>
	);
}
