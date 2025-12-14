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
}

function WarbandProgressTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{
		name?: string;
		value?: number | string | null;
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
		.filter((p) => typeof p.value === "number" && Number.isFinite(p.value));

	if (entries.length === 0) return null;

	return (
		<div
			className="rounded-lg border p-3 text-sm shadow"
			style={{
				backgroundColor: "hsl(var(--card))",
				borderColor: "hsl(var(--border))",
			}}
		>
			<div className="mb-2 font-medium">
				Match {label ?? first.x}
				{first.matchDate ? ` • ${formatTooltipTimestamp(first.matchDate)}` : ""}
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
}: WarbandProgressChartProps) {
	const maxStep = Math.max(1, chartData.length);
	return (
		<div className="rounded-lg border bg-card p-6 shadow-lg">
			<h2 className="mb-4 text-xl font-bold">{title}</h2>
			<ResponsiveContainer width="100%" height={400}>
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
						labelFormatter={(value) => formatTooltipTimestamp(value)}
					/>
					<Legend />
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
