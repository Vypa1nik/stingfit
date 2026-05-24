import { Command, Dumbbell, Menu, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ProfileSwitcher } from "@/features/profiles/ProfileSwitcher";
import { sk } from "@/i18n/sk";
import { useUiStore } from "@/lib/uiStore";

const topBarCopy = sk.fitness.nav.topBar;

export function TopBar() {
	const navigate = useNavigate();
	const setCommandPaletteOpen = useUiStore(
		(state) => state.setCommandPaletteOpen,
	);
	const setMobileSidebarOpen = useUiStore(
		(state) => state.setMobileSidebarOpen,
	);

	return (
		<header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-fitness-yellow/15 bg-black/90 px-3 py-3 text-fitness-warm backdrop-blur sm:gap-3 sm:px-6 md:flex-nowrap">
			<div className="flex min-w-0 flex-1 items-center gap-2 sm:hidden">
				<button
					type="button"
					aria-label={topBarCopy.openMenu}
					className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-fitness-yellow/25 bg-fitness-yellow/10 text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black md:hidden"
					onClick={() => setMobileSidebarOpen(true)}
				>
					<Menu className="size-5" />
				</button>
				<div className="min-w-0">
					<p className="text-xs font-black uppercase tracking-[0.16em] text-fitness-yellow/70">
						{topBarCopy.brandKicker}
					</p>
					<p className="truncate text-sm font-black text-white">
						{topBarCopy.pillarSummary}
					</p>
				</div>
			</div>

			<button
				type="button"
				aria-label={topBarCopy.openMenu}
				className="hidden size-10 items-center justify-center rounded-2xl border border-fitness-yellow/25 bg-fitness-yellow/10 text-fitness-yellow transition-colors hover:bg-fitness-yellow hover:text-black md:hidden sm:inline-flex"
				onClick={() => setMobileSidebarOpen(true)}
			>
				<Menu className="size-5" />
			</button>

			<button
				type="button"
				className="order-3 flex min-h-11 w-full min-w-0 items-center gap-3 rounded-2xl border border-fitness-yellow/20 bg-black/65 px-4 py-2 text-left text-sm text-fitness-warm/70 transition-colors hover:border-fitness-yellow/45 hover:text-fitness-yellow sm:order-none sm:flex-1 sm:rounded-xl md:min-w-[240px]"
				aria-label={topBarCopy.searchAria}
				onClick={() => {
					navigate("/progress/history");
				}}
			>
				<Search className="size-4 shrink-0" />
				<span className="flex-1 truncate">{topBarCopy.searchPlaceholder}</span>
				<span className="hidden items-center gap-1 rounded border border-fitness-yellow/25 px-2 py-1 text-2xs uppercase tracking-[0.18em] text-fitness-yellow/80 sm:inline-flex">
					<Command className="size-3" />K
				</span>
			</button>

			<div className="ml-auto flex items-center gap-2">
				<ProfileSwitcher />
				<Button
					variant="secondary"
					className="hidden border-fitness-yellow/25 bg-black/65 text-fitness-warm hover:bg-fitness-yellow/10 sm:inline-flex"
					leadingIcon={<Sparkles className="size-4" />}
					onClick={() => setCommandPaletteOpen(true)}
				>
					{topBarCopy.commandsButton}
				</Button>
				<Button
					className="fitness-action shrink-0"
					leadingIcon={<Dumbbell className="size-4" />}
					onClick={() => navigate("/train")}
				>
					<span className="sm:hidden">{topBarCopy.mobileStartButton}</span>
					<span className="hidden sm:inline">{topBarCopy.desktopStartButton}</span>
				</Button>
			</div>
		</header>
	);
}
