import { useMemo } from "react";

import { cn } from "@/lib/utils";

export interface LineChartPoint {
	x: number; // timestamp ms
	y: number; // numeric value
	label?: string;
}

export interface LineChartSeries {
	id: string;
	label: string;
	color: string;
	points: LineChartPoint[];
	emphasize?: boolean;
}

interface MiniLineChartProps {
	series: LineChartSeries[];
	height?: number;
	yLabelFormatter?: (value: number) => string;
	xLabelFormatter?: (timestamp: number) => string;
	emptyMessage?: string;
	className?: string;
}

/**
 * A minimal SVG line chart used across the V3 Progress hub.
 *
 * Deliberately tiny — no axes library, no animations — so we don't add
 * a chart dependency just to render 12–26 points per session per
 * exercise. If we later need stacked / brushed charts, swap this for
 * `recharts`; consumers only depend on the props shape.
 */
export function MiniLineChart({
	series,
	height = 220,
	yLabelFormatter = (value) => value.toFixed(1),
	xLabelFormatter = (timestamp) =>
		new Date(timestamp).toLocaleDateString("sk-SK", {
			month: "short",
			day: "numeric",
		}),
	emptyMessage = "Zatiaľ žiadne dáta",
	className,
}: MiniLineChartProps) {
	const allPoints = series.flatMap((s) => s.points);
	const isEmpty = allPoints.length === 0;

	const bounds = useMemo(() => {
		if (isEmpty) {
			return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
		}
		const xs = allPoints.map((p) => p.x);
		const ys = allPoints.map((p) => p.y);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const rawMinY = Math.min(...ys);
		const rawMaxY = Math.max(...ys);
		const pad = Math.max(1, (rawMaxY - rawMinY) * 0.15);
		return {
			minX,
			maxX: maxX === minX ? minX + 1 : maxX,
			minY: Math.max(0, rawMinY - pad),
			maxY: rawMaxY + pad,
		};
	}, [allPoints, isEmpty]);

	const yTicks = useMemo(() => {
		const ticks: number[] = [];
		for (let i = 0; i <= 4; i += 1) {
			ticks.push(bounds.minY + ((bounds.maxY - bounds.minY) * i) / 4);
		}
		return ticks;
	}, [bounds]);

	if (isEmpty) {
		return (
			<div
				className={cn(
					"flex items-center justify-center rounded-2xl border border-fitness-yellow/15 bg-black/40 px-4 py-10 text-sm text-fitness-warm/65",
					className,
				)}
				style={{ height }}
			>
				{emptyMessage}
			</div>
		);
	}

	const width = 720;
	const paddingX = 32;
	const paddingY = 24;
	const innerWidth = width - paddingX * 2;
	const innerHeight = height - paddingY * 2;

	const xScale = (x: number) =>
		paddingX + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * innerWidth;
	const yScale = (y: number) =>
		paddingY +
		innerHeight -
		((y - bounds.minY) / (bounds.maxY - bounds.minY)) * innerHeight;

	return (
		<div className={cn("w-full overflow-hidden", className)}>
			<svg
				role="img"
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="none"
				className="block h-full w-full"
				aria-label="Lineárny graf progresu"
			>
				{yTicks.map((tick) => (
					<g key={tick}>
						<line
							x1={paddingX}
							x2={width - paddingX}
							y1={yScale(tick)}
							y2={yScale(tick)}
							stroke="rgba(255, 255, 0, 0.08)"
							strokeWidth={1}
						/>
						<text
							x={paddingX - 6}
							y={yScale(tick) + 3}
							textAnchor="end"
							fill="rgba(255, 235, 180, 0.6)"
							fontSize={10}
						>
							{yLabelFormatter(tick)}
						</text>
					</g>
				))}

				{series.map((s) => {
					if (s.points.length === 0) return null;
					const sortedPoints = [...s.points].sort((a, b) => a.x - b.x);
					const path = sortedPoints
						.map((p, idx) => `${idx === 0 ? "M" : "L"} ${xScale(p.x)} ${yScale(p.y)}`)
						.join(" ");
					return (
						<g key={s.id}>
							<path
								d={path}
								fill="none"
								stroke={s.color}
								strokeWidth={s.emphasize ? 2.5 : 1.5}
								strokeLinejoin="round"
								strokeLinecap="round"
							/>
							{sortedPoints.map((p) => (
								<circle
									key={`${s.id}-${p.x}-${p.y}`}
									cx={xScale(p.x)}
									cy={yScale(p.y)}
									r={s.emphasize ? 3.5 : 2.5}
									fill={s.color}
								/>
							))}
						</g>
					);
				})}

				{(() => {
					const allXs = Array.from(
						new Set(allPoints.map((p) => p.x)),
					).sort((a, b) => a - b);
					const samples =
						allXs.length <= 5
							? allXs
							: [
									allXs[0],
									allXs[Math.floor(allXs.length / 4)],
									allXs[Math.floor(allXs.length / 2)],
									allXs[Math.floor((3 * allXs.length) / 4)],
									allXs[allXs.length - 1],
								];
					return samples.map((x) => (
						<text
							key={x}
							x={xScale(x)}
							y={height - 6}
							textAnchor="middle"
							fill="rgba(255, 235, 180, 0.55)"
							fontSize={10}
						>
							{xLabelFormatter(x)}
						</text>
					));
				})()}
			</svg>
			<div className="mt-2 flex flex-wrap items-center gap-3 px-2 text-xs text-fitness-warm/70">
				{series.map((s) => (
					<span key={s.id} className="inline-flex items-center gap-1.5">
						<span
							aria-hidden
							className="inline-block size-2.5 rounded-full"
							style={{ backgroundColor: s.color }}
						/>
						{s.label}
					</span>
				))}
			</div>
		</div>
	);
}
