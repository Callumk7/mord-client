import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type {
	ProgressChartRow,
	ProgressMetric,
	WarbandMeta,
} from "~/lib/campaign-history";
import { formatTooltipTimestamp, seriesKeyFor } from "~/lib/campaign-history";

interface WarbandProgressChartProps {
	title: string;
	chartData: ProgressChartRow[];
	warbands: WarbandMeta[];
	metric: ProgressMetric;
	yAxisLabel: string;
	defaultColor?: string;
	height?: number;
	showLegend?: boolean;
	variant?: "card" | "embedded";
}

function WarbandProgressTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{
		name?: string;
		value?: unknown;
		color?: string;
		payload?: ProgressChartRow;
	}>;
	label?: number;
}) {
	if (!active || !payload || payload.length === 0) return null;

	const first = payload[0]?.payload;
	if (!first) return null;

	const entries = payload
		.map((p) => ({
			name: p.name ?? "",
			value: p.value,
			color: p.color,
		}))
		.filter(
			(p): p is { name: string; value: number; color: string | undefined } =>
				typeof p.value === "number" && Number.isFinite(p.value),
		);

	if (entries.length === 0) return null;

	// Use the tooltip label (match index) when provided by Recharts.
	const matchIndex = typeof label === "number" ? label : first.x;

	return (
		<div className="rounded-lg border bg-card p-3 text-sm text-foreground shadow-lg">
			<div className="mb-2 font-medium">
				Match {matchIndex}
				{" • "}
				{formatTooltipTimestamp(first.matchDate)}
				{" • "}
				{first.matchName}
			</div>
			<div className="space-y-1">
				{entries.map((entry) => (
					<div
						key={entry.name}
						className="flex items-center justify-between gap-4"
					>
						<span style={{ color: entry.color }}>{entry.name}</span>
						<span className="tabular-nums">{entry.value}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function WarbandProgressChart({
	title,
	chartData,
	warbands,
	metric,
	yAxisLabel,
	defaultColor = "#8884d8",
	height = 400,
	showLegend = true,
	variant = "card",
}: WarbandProgressChartProps) {
	const maxStep = Math.max(1, chartData.length);

	const containerClassName =
		variant === "embedded"
			? "w-full h-full flex flex-col"
			: "rounded-lg border bg-card p-6 shadow-lg";

	const chartHeight = variant === "embedded" ? "100%" : height;

	return (
		<div className={containerClassName}>
			{title ? <h2 className="mb-4 text-xl font-bold">{title}</h2> : null}
			<ResponsiveContainer width="100%" height={chartHeight}>
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
					<XAxis
						dataKey="x"
						type="number"
						allowDecimals={false}
						domain={[1, maxStep]}
						tickFormatter={(value) => `M${value}`}
						className="text-xs"
					/>
					<YAxis
						label={{
							value: yAxisLabel,
							angle: -90,
							position: "insideLeft",
							className: "fill-foreground",
						}}
						className="text-xs"
					/>
					<Tooltip
						content={<WarbandProgressTooltip />}
						labelFormatter={(value) => `Match ${String(value)}`}
					/>
					{showLegend ? <Legend /> : null}
					{warbands.map((warband) => (
						<Line
							key={warband.warbandId}
							type="monotone"
							dataKey={seriesKeyFor(warband.warbandId, metric)}
							name={warband.warbandName}
							stroke={warband.warbandColor || defaultColor}
							strokeWidth={2}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
							connectNulls={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
