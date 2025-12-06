import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import { getCampaignHistoryOptions } from "~/api/campaign-history";
import {
	buildTimeSeriesData,
	formatChartTimestamp,
	formatTooltipTimestamp,
	groupByWarband,
} from "~/lib/campaign-history";

export const Route = createFileRoute("/$campaignId/progress/")({
	loader: async ({ params, context }) => {
		const campaignId = Number(params.campaignId);
		await context.queryClient.ensureQueryData(
			getCampaignHistoryOptions(campaignId),
		);
	},
	component: ProgressPage,
});

function ProgressPage() {
	const { campaignId } = Route.useParams();
	const { data: history } = useSuspenseQuery(
		getCampaignHistoryOptions(Number(campaignId)),
	);

	const timeSeriesData = buildTimeSeriesData(history);
	const warbandGroups = groupByWarband(timeSeriesData);

	// If no data yet, show empty state
	if (timeSeriesData.length === 0) {
		return (
			<div className="mx-auto max-w-7xl">
				<h1 className="mb-8 text-3xl font-bold">Campaign Progress</h1>
				<div className="rounded-lg border bg-card p-12 text-center">
					<p className="text-muted-foreground">
						No progression data yet. Complete some post-match resolutions to see
						charts here.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-8">
			<h1 className="text-3xl font-bold">Campaign Progress</h1>

			{/* Rating Over Time */}
			<div className="rounded-lg border bg-card p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">Rating Progression</h2>
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={timeSeriesData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="timestamp"
							tickFormatter={(value) => formatChartTimestamp(value)}
							className="text-xs"
						/>
						<YAxis
							label={{
								value: "Rating",
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
								dataKey="rating"
								data={warband.dataPoints}
								name={warband.warbandName}
								stroke={warband.warbandColor || "#8884d8"}
								strokeWidth={2}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Treasury Over Time */}
			<div className="rounded-lg border bg-card p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">Treasury Progression</h2>
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={timeSeriesData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="timestamp"
							tickFormatter={(value) => formatChartTimestamp(value)}
							className="text-xs"
						/>
						<YAxis
							label={{
								value: "Gold Crowns",
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
								dataKey="treasury"
								data={warband.dataPoints}
								name={warband.warbandName}
								stroke={warband.warbandColor || "#82ca9d"}
								strokeWidth={2}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Experience Over Time */}
			<div className="rounded-lg border bg-card p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">Experience Progression</h2>
				<ResponsiveContainer width="100%" height={400}>
					<LineChart data={timeSeriesData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="timestamp"
							tickFormatter={(value) => formatChartTimestamp(value)}
							className="text-xs"
						/>
						<YAxis
							label={{
								value: "Experience",
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
								dataKey="experience"
								data={warband.dataPoints}
								name={warband.warbandName}
								stroke={warband.warbandColor || "#ffc658"}
								strokeWidth={2}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
