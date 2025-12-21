import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	getCampaignOptions,
	getMostGamesWonOptions,
	getMostInjuriesFromEventsOptions,
	getMostInjuriesInflictedFromEventsOptions,
	getMostKillsFromEventsOptions,
	getMostRatingOptions,
	getMostTreasuryOptions,
} from "~/api/campaign";
import { getCampaignHistoryOptions } from "~/api/campaign-history";
import { campaignEventsQueryOptions } from "~/api/events";
import { getCampaignMatchesOptions } from "~/api/matches";
import { getCampaignWarbandsWithWarriorsOptions } from "~/api/warbands";
import { WarbandProgressChart } from "~/components/campaign/warband-progress-chart";
import { BroadcastHeader } from "~/components/events/display/broadcast-header";
import { CasualtyReport } from "~/components/events/display/casualty-report";
import { MatchCenter } from "~/components/events/display/match-center";
import { NewsTicker } from "~/components/events/display/news-ticker";
import { RecentResultsSlide } from "~/components/events/display/recent-results-slide";
import { StatCarousel } from "~/components/events/display/stat-carousel";
import { WarbandSpotlight } from "~/components/events/display/warband-spotlight";
import type { ChartConfig } from "~/components/ui/chart";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import {
	useBreakingHeadline,
	useMatchCenterMatches,
	useNewsItems,
	useRecentMatchHighlights,
	useWarbandSpotlight,
} from "~/hooks/use-broadcast-data";
import {
	buildPerMatchWarbandPoints,
	buildProgressChartData,
	getWarbandsFromPoints,
} from "~/lib/campaign-history";
import { gradients, pluralize } from "~/lib/display-utils";
import type { BroadcastChart, BroadcastStat } from "~/types/display";

export const Route = createFileRoute("/display/$campaignId")({
	params: {
		parse: (params) => {
			const parsed = Number(params.campaignId);
			if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
				throw new Error(`Invalid campaign ID: ${params.campaignId}`);
			}
			return { campaignId: parsed };
		},
		stringify: (params) => ({
			campaignId: String(params.campaignId),
		}),
	},
	loader: async ({ params, context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				getCampaignOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getMostGamesWonOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getMostTreasuryOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getMostRatingOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getMostKillsFromEventsOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getMostInjuriesFromEventsOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getMostInjuriesInflictedFromEventsOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignMatchesOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				campaignEventsQueryOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignWarbandsWithWarriorsOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignHistoryOptions(params.campaignId),
			),
		]);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	const { data: campaign } = useSuspenseQuery(getCampaignOptions(campaignId));
	const { data: gamesWon } = useSuspenseQuery(
		getMostGamesWonOptions(campaignId),
	);
	const { data: treasury } = useSuspenseQuery(
		getMostTreasuryOptions(campaignId),
	);
	const { data: killsFromEvents } = useSuspenseQuery(
		getMostKillsFromEventsOptions(campaignId),
	);
	const { data: injuriesFromEvents } = useSuspenseQuery(
		getMostInjuriesFromEventsOptions(campaignId),
	);
	const { data: injuriesInflictedFromEvents } = useSuspenseQuery(
		getMostInjuriesInflictedFromEventsOptions(campaignId),
	);
	const { data: matches } = useSuspenseQuery(
		getCampaignMatchesOptions(campaignId),
	);
	const { data: events } = useSuspenseQuery(
		campaignEventsQueryOptions(campaignId),
	);
	const { data: warbands } = useSuspenseQuery(
		getCampaignWarbandsWithWarriorsOptions(campaignId),
	);
	const { data: history } = useSuspenseQuery(
		getCampaignHistoryOptions(campaignId),
	);
	const { data: rating } = useSuspenseQuery(getMostRatingOptions(campaignId));

	const leader = gamesWon[0];
	const richest = treasury[0];
	const fiercestWarrior = killsFromEvents[0];

	const totalMatches = matches.length;
	const casualtyCount = events.filter((event) => event.death).length;
	const injuryCount = events.filter(
		(event) => event.injury && !event.death,
	).length;
	const activeWarbands = warbands.length;
	const activeWarriors = warbands.reduce((sum, warband) => {
		const alive = warband.warriors.filter((warrior) => warrior.isAlive).length;
		return sum + alive;
	}, 0);

	const breakingHeadline = useBreakingHeadline(events, campaign, gamesWon);

	const stats = useMemo<BroadcastStat[]>(() => {
		const warpstoneIndex = totalMatches
			? Math.round(((casualtyCount + injuryCount) / totalMatches) * 10) / 10
			: 0;

		const result: BroadcastStat[] = [
			{
				type: "stat",
				id: "leader",
				title: "Campaign Leader",
				value: leader?.warband.name ?? "Awaiting champion",
				statLine: leader
					? `${leader.wins} ${leader.wins === 1 ? "win" : "wins"}`
					: "No recorded victories",
				description: leader?.warband.faction ?? "Play games to claim the top",
				gradient: gradients[0],
				footnote: leader?.warband.icon ?? undefined,
			},
			{
				type: "stat",
				id: "treasury",
				title: "Treasure Hoard",
				value: richest ? `${richest.warband.name}` : "No ledger data",
				statLine: richest ? `${richest.treasury} gc banked` : "0 gc",
				description:
					richest?.warband.faction ?? "Riches decide the spoils this season",
				gradient: gradients[1],
				footnote: "Economy Watch",
			},
			{
				type: "stat",
				id: "fiercest",
				title: "Fiercest Warrior",
				value: fiercestWarrior?.warrior.name ?? "Unknown fighter",
				statLine: fiercestWarrior
					? `${fiercestWarrior.kills} confirmed ${pluralize(fiercestWarrior.kills, "kill")}`
					: "Waiting for carnage",
				description:
					fiercestWarrior?.warbandName ?? "No standout warrior just yet",
				gradient: gradients[2],
			},
			{
				type: "stat",
				id: "casualties",
				title: "Casualty Watch",
				value: `${casualtyCount}`,
				statLine: `${pluralize(casualtyCount, "fatality")}`,
				description: `${injuryCount} additional injuries recorded`,
				gradient: gradients[3],
				footnote: "Event feed",
			},
			{
				type: "stat",
				id: "forces",
				title: "Active Forces",
				value: `${activeWarbands} warbands`,
				statLine: `${activeWarriors} warriors ready`,
				description: `${totalMatches} matches logged`,
				gradient: gradients[4],
			},
			{
				type: "stat",
				id: "warpstone-index",
				title: "Warpstone Index",
				value: `${warpstoneIndex}`,
				statLine: `${pluralize(casualtyCount + injuryCount, "incident")} / ${pluralize(totalMatches, "match")}`,
				description: "Higher is worse. Probably. (The desk cannot confirm.)",
				gradient: "from-slate-950 via-emerald-700/25 to-lime-600/25",
				footnote: "Mord Markets",
			},
		];

		return result;
	}, [
		leader,
		richest,
		fiercestWarrior,
		casualtyCount,
		injuryCount,
		activeWarbands,
		activeWarriors,
		totalMatches,
	]);

	const matchCenterMatches = useMatchCenterMatches(matches);
	const recentMatchHighlights = useRecentMatchHighlights(matches);
	const warbandSpotlight = useWarbandSpotlight(
		leader,
		warbands,
		events,
		treasury,
	);

	const newsItems = useNewsItems(
		events,
		matches,
		leader,
		richest,
		fiercestWarrior,
		casualtyCount,
		injuryCount,
		totalMatches,
		breakingHeadline,
	);

	// Progress chart data
	const progressData = useMemo(() => {
		const points = buildPerMatchWarbandPoints(history);
		const warbandsMeta = getWarbandsFromPoints(points);

		return {
			ratingData: buildProgressChartData(points, "rating"),
			treasuryData: buildProgressChartData(points, "treasury"),
			experienceData: buildProgressChartData(points, "experience"),
			warbands: warbandsMeta,
		};
	}, [history]);

	// Grouped bar chart data (treasury, rating, wins)
	const warbandWealthAndRatingData = useMemo(() => {
		const byId = new Map<
			number,
			{
				warbandId: number;
				name: string;
				icon: string | null;
				color: string | null;
				treasury: number;
				rating: number;
				wins: number;
			}
		>();

		for (const entry of treasury) {
			const existing = byId.get(entry.warbandId);
			byId.set(entry.warbandId, {
				warbandId: entry.warbandId,
				name: entry.warband.name,
				icon: entry.warband.icon,
				color: entry.warband.color,
				treasury: entry.treasury ?? 0,
				rating: existing?.rating ?? 0,
				wins: existing?.wins ?? 0,
			});
		}

		for (const entry of rating) {
			const existing = byId.get(entry.warbandId);
			byId.set(entry.warbandId, {
				warbandId: entry.warbandId,
				name: entry.warband.name,
				icon: entry.warband.icon,
				color: entry.warband.color,
				treasury: existing?.treasury ?? 0,
				rating: entry.rating ?? 0,
				wins: existing?.wins ?? 0,
			});
		}

		for (const entry of gamesWon) {
			const existing = byId.get(entry.warbandId);
			byId.set(entry.warbandId, {
				warbandId: entry.warbandId,
				name: entry.warband.name,
				icon: entry.warband.icon,
				color: entry.warband.color,
				treasury: existing?.treasury ?? 0,
				rating: existing?.rating ?? 0,
				wins: entry.wins ?? 0,
			});
		}

		return Array.from(byId.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, [treasury, rating, gamesWon]);

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

	// Combine stats and charts into carousel items
	const carouselItems = useMemo<(BroadcastStat | BroadcastChart)[]>(() => {
		const items: (BroadcastStat | BroadcastChart)[] = [...stats];

		// Add recent results as a broadcast slide (prevents vertical cut-off).
		if (recentMatchHighlights.length > 0) {
			items.push({
				type: "chart",
				id: "recent-results-slide",
				gradient: "from-slate-950 to-slate-800",
				content: (
					<div className="h-full w-full p-4">
						<RecentResultsSlide highlights={recentMatchHighlights} />
					</div>
				),
			});
		}

		// Add grouped bar chart if data exists
		if (warbandWealthAndRatingData.length > 0) {
			items.push({
				type: "chart",
				id: "warband-stats-chart",
				gradient: "from-slate-950 via-blue-700/30 to-red-700/30",
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
								data={warbandWealthAndRatingData}
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
			});
		}

		// Add progress charts if data exists
		if (progressData.warbands.length > 0) {
			items.push({
				type: "chart",
				id: "rating-progression",
				gradient: "from-slate-950 via-blue-700/30 to-cyan-600/25",
				content: (
					<div className="flex h-full w-full min-h-0 flex-col p-4">
						<div className="mb-3">
							<h3 className="text-lg font-black tracking-wider text-foreground">
								Rating Progression
							</h3>
							<p className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">
								Match-by-match
							</p>
						</div>
						<div className="min-h-0 flex-1">
							<WarbandProgressChart
								title=""
								chartData={progressData.ratingData}
								warbands={progressData.warbands}
								metric="rating"
								yAxisLabel="Rating"
								defaultColor="#8884d8"
								height={320}
								showLegend={false}
								variant="embedded"
							/>
						</div>
					</div>
				),
			});

			items.push({
				type: "chart",
				id: "treasury-progression",
				gradient: "from-slate-950 via-emerald-700/25 to-teal-600/25",
				content: (
					<div className="flex h-full w-full min-h-0 flex-col p-4">
						<div className="mb-3">
							<h3 className="text-lg font-black tracking-wider text-foreground">
								Treasury Progression
							</h3>
							<p className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">
								Gold Crowns
							</p>
						</div>
						<div className="min-h-0 flex-1">
							<WarbandProgressChart
								title=""
								chartData={progressData.treasuryData}
								warbands={progressData.warbands}
								metric="treasury"
								yAxisLabel="Gold Crowns"
								defaultColor="#82ca9d"
								height={320}
								showLegend={false}
								variant="embedded"
							/>
						</div>
					</div>
				),
			});

			items.push({
				type: "chart",
				id: "experience-progression",
				gradient: "from-slate-950 via-amber-600/25 to-red-700/20",
				content: (
					<div className="flex h-full w-full min-h-0 flex-col p-4">
						<div className="mb-3">
							<h3 className="text-lg font-black tracking-wider text-foreground">
								Experience Progression
							</h3>
							<p className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">
								Experience Points
							</p>
						</div>
						<div className="min-h-0 flex-1">
							<WarbandProgressChart
								title=""
								chartData={progressData.experienceData}
								warbands={progressData.warbands}
								metric="experience"
								yAxisLabel="Experience"
								defaultColor="#ffc658"
								height={320}
								showLegend={false}
								variant="embedded"
							/>
						</div>
					</div>
				),
			});
		}

		return items;
	}, [
		stats,
		recentMatchHighlights,
		warbandWealthAndRatingData,
		progressData,
		warbandWealthAndRatingConfig,
	]);

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
			<style>{`
				@keyframes mordScan {
					from { background-position: 0 0; }
					to { background-position: 0 32px; }
				}
				@keyframes mordGlow {
					0%, 100% { opacity: .10; }
					50% { opacity: .18; }
				}
			`}</style>
			<div className="pointer-events-none absolute inset-0">
				<div
					className="absolute inset-0 bg-linear-to-br from-red-500 via-blue-500 to-amber-400"
					style={{
						opacity: 0.08,
						animation: "mordGlow 6s ease-in-out infinite",
					}}
				/>
				<div
					className="absolute inset-0 mix-blend-overlay"
					style={{
						opacity: 0.06,
						backgroundImage:
							"repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, rgba(255,255,255,0) 2px, rgba(255,255,255,0) 4px)",
						animation: "mordScan 2.2s linear infinite",
					}}
				/>
			</div>
			<BroadcastHeader
				campaign={campaign}
				topWarbandName={leader?.warband.name}
				totalMatches={totalMatches}
				casualtyCount={casualtyCount}
				activeWarbands={activeWarbands}
				breaking={breakingHeadline}
			/>
			<div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
				<div className="flex min-h-0 flex-1 flex-col gap-4">
					{/* Give the carousel more room than Match Center */}
					<div className="flex min-h-0 flex-[1.7] flex-col">
						<StatCarousel items={carouselItems} headline={breakingHeadline} />
					</div>
					<div className="flex min-h-0 flex-1 flex-col">
						<MatchCenter matches={matchCenterMatches} />
					</div>
				</div>
				<aside className="flex w-full flex-col gap-4 lg:w-80">
					<WarbandSpotlight data={warbandSpotlight} />
					<CasualtyReport
						kills={killsFromEvents.slice(0, 3)}
						injuriesTaken={injuriesFromEvents.slice(0, 3)}
						injuriesInflicted={injuriesInflictedFromEvents.slice(0, 3)}
					/>
				</aside>
			</div>
			<NewsTicker items={newsItems} label="Breaking" />
		</div>
	);
}
