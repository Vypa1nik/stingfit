import { useEffect, useRef } from "react";

import {
	Calculator,
	History,
	Settings,
	Users,
	X,
	Zap,
	type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { sk } from "@/i18n/sk";
import { cn } from "@/lib/utils";

interface MoreSheetItem {
	label: string;
	description: string;
	path: string;
	icon: LucideIcon;
}

const moreSheetCopy = sk.fitness.nav.moreSheet;

/**
 * The "Viac" mobile bottom sheet that holds destinations which don't
 * deserve a top-level mobile tile (calculators, coach mode, settings,
 * quick-link to history). Keep the list short — anything frequent
 * belongs in the bottom-nav itself.
 */
const MORE_SHEET_ITEMS: MoreSheetItem[] = [
	{
		label: moreSheetCopy.items.quick.label,
		description: moreSheetCopy.items.quick.description,
		path: "/train/quick",
		icon: Zap,
	},
	{
		label: moreSheetCopy.items.plates.label,
		description: moreSheetCopy.items.plates.description,
		path: "/tools/plates",
		icon: Calculator,
	},
	{
		label: moreSheetCopy.items.history.label,
		description: moreSheetCopy.items.history.description,
		path: "/progress/history",
		icon: History,
	},
	{
		label: moreSheetCopy.items.coach.label,
		description: moreSheetCopy.items.coach.description,
		path: "/plans/coach/clients",
		icon: Users,
	},
	{
		label: moreSheetCopy.items.settings.label,
		description: moreSheetCopy.items.settings.description,
		path: "/settings",
		icon: Settings,
	},
];

export interface MoreSheetProps {
	open: boolean;
	onClose: () => void;
}

export function MoreSheet({ open, onClose }: MoreSheetProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
			}
		};
		window.addEventListener("keydown", onKeydown);

		const frame = window.requestAnimationFrame(() => {
			dialogRef.current?.focus();
		});

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeydown);
			window.cancelAnimationFrame(frame);
		};
	}, [open, onClose]);

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
			<button
				type="button"
				aria-label={moreSheetCopy.closeOverlay}
				className="mobile-more-overlay-enter absolute inset-0 bg-black/55 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div
				ref={dialogRef}
				role="dialog"
				data-testid="more-sheet-panel"
				aria-modal="true"
				aria-label={moreSheetCopy.ariaLabel}
				tabIndex={-1}
				className={cn(
					"mobile-more-sheet-enter relative w-full rounded-t-3xl border-t border-fitness-yellow/25 bg-black px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4",
					"shadow-[0_-24px_60px_rgba(0,0,0,0.6)]",
				)}
			>
				<div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/15" aria-hidden />
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-semibold uppercase tracking-[0.22em] text-fitness-yellow/80">
						{moreSheetCopy.title}
					</p>
					<button
						type="button"
						aria-label={moreSheetCopy.closeButton}
						className="inline-flex size-9 items-center justify-center rounded-lg text-fitness-warm/70 hover:bg-white/5 hover:text-fitness-yellow"
						onClick={onClose}
					>
						<X className="size-4" />
					</button>
				</div>
				<ul className="mt-3 flex flex-col divide-y divide-white/5">
					{MORE_SHEET_ITEMS.map((item) => {
						const Icon = item.icon;
						return (
							<li key={item.path}>
								<NavLink
									to={item.path}
									onClick={onClose}
									className="flex items-start gap-3 py-3 text-left"
								>
									<span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl border border-fitness-yellow/25 bg-fitness-yellow/10 text-fitness-yellow">
										<Icon className="size-4" />
									</span>
									<span className="flex flex-col">
										<span className="text-sm font-semibold text-white">
											{item.label}
										</span>
										<span className="text-xs text-fitness-warm/65">
											{item.description}
										</span>
									</span>
								</NavLink>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
