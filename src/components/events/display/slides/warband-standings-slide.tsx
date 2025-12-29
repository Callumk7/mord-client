import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "~/components/ui/chart";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import { CAROUSEL_GRADIENTS } from "~/lib/display-utils";
import type { BroadcastChart } from "~/types/display";

interface WarbandStandingsData {
	warbandId: number;
	name: string;
	icon: string | null;
	color: string | null;
	treasury: number;
	rating: number;
	wins: number;
}

const warbandWealthAndRatingConfig = {
	treasury: {
		label: "Treasury (gc)",
		color: "var(--chart-1)",
	},
	rating: {
		label: "Rating",
		color: "var(--chart-2)",
	},
	wins: {
		label: "Wins",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

export function createWarbandStandingsSlide(
	data: WarbandStandingsData[],
): BroadcastChart {
	return {
		type: "chart",
		id: "warband-stats-chart",
		gradient: CAROUSEL_GRADIENTS["blue-to-red"],
		content: (
			<div className="flex h-full w-full min-h-0 flex-col p-4">
				<div className="mb-3">
					<h3 className="text-lg font-black tracking-wider text-foreground">
						Warband Standings
					</h3>
					<p className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">
						Treasury • Rating • Wins
					</p>
				</div>
				<ChartContainer
					config={warbandWealthAndRatingConfig}
					className="min-h-0 flex-1 w-full"
				>
					<BarChart
						data={data}
						margin={{ left: 10, right: 10, bottom: 28, top: 10 }}
					>
						<CartesianGrid vertical={false} className="stroke-border/50" />
						<XAxis
							dataKey="name"
							tickLine={false}
							axisLine={false}
							interval={0}
							height={44}
							angle={-20}
							textAnchor="end"
						/>
						<YAxis
							yAxisId="treasury"
							tickLine={false}
							axisLine={false}
							width={48}
						/>
						<YAxis
							yAxisId="rating"
							orientation="right"
							tickLine={false}
							axisLine={false}
							width={48}
						/>
						<YAxis yAxisId="wins" hide />
						<ChartTooltip
							content={
								<ChartTooltipContent
									indicator="dot"
									labelClassName="font-semibold"
								/>
							}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							yAxisId="treasury"
							dataKey="treasury"
							fill="var(--color-treasury)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							yAxisId="rating"
							dataKey="rating"
							fill="var(--color-rating)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							yAxisId="wins"
							dataKey="wins"
							fill="var(--color-wins)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</div>
		),
	};
}
