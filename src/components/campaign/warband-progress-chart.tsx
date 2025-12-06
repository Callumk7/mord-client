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
import type { WarbandGroup } from "~/lib/campaign-history";
import { formatChartTimestamp, formatTooltipTimestamp } from "~/lib/campaign-history";

interface WarbandProgressChartProps {
	title: string;
	data: Array<{
		timestamp: Date;
		rating?: number;
		treasury?: number;
		experience?: number;
	}>;
	warbandGroups: Record<number, WarbandGroup>;
	dataKey: "rating" | "treasury" | "experience";
	yAxisLabel: string;
	defaultColor?: string;
}

export function WarbandProgressChart({
	title,
	data,
	warbandGroups,
	dataKey,
	yAxisLabel,
	defaultColor = "#8884d8",
}: WarbandProgressChartProps) {
	return (
		<div className="rounded-lg border bg-card p-6 shadow-lg">
			<h2 className="mb-4 text-xl font-bold">{title}</h2>
			<ResponsiveContainer width="100%" height={400}>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
					<XAxis
						dataKey="timestamp"
						tickFormatter={(value) => formatChartTimestamp(value)}
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
						labelFormatter={(value) => formatTooltipTimestamp(value)}
						contentStyle={{
							backgroundColor: "hsl(var(--card))",
							border: "1px solid hsl(var(--border))",
							borderRadius: "0.5rem",
						}}
					/>
					<Legend />
					{Object.values(warbandGroups).map((warband) => (
						<Line
							key={warband.warbandId}
							type="monotone"
							dataKey={dataKey}
							data={warband.dataPoints}
							name={warband.warbandName}
							stroke={warband.warbandColor || defaultColor}
							strokeWidth={2}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
