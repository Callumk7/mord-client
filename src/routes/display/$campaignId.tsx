import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type {
	getMostInjuriesFromEvents,
	getMostInjuriesInflictedFromEvents,
	getMostKillsFromEvents,
} from "~/api/campaign";
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
import type { ChartConfig } from "~/components/ui/chart";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import type { Campaign } from "~/db/schema";
import {
	buildPerMatchWarbandPoints,
	buildProgressChartData,
	getWarbandsFromPoints,
} from "~/lib/campaign-history";

type WarriorKillsRow = Awaited<
	ReturnType<typeof getMostKillsFromEvents>
>[number];

type WarriorInjuriesTakenRow = Awaited<
	ReturnType<typeof getMostInjuriesFromEvents>
>[number];

type WarriorInjuriesInflictedRow = Awaited<
	ReturnType<typeof getMostInjuriesInflictedFromEvents>
>[number];

interface BroadcastStat {
	type: "stat";
	id: string;
	title: string;
	value: string;
	statLine: string;
	description: string;
	gradient: string;
	footnote?: string;
}

interface BroadcastChart {
	type: "chart";
	id: string;
	gradient: string;
	content: React.ReactNode;
}

interface MatchHighlight {
	id: number;
	name: string;
	date: Date | string;
	matchType: string;
	status: string;
	winners: {
		id: number;
		name: string;
		icon: string | null;
		color: string | null;
	}[];
	participants: {
		id: number;
		name: string;
		icon: string | null;
		color: string | null;
	}[];
	kills: number;
	injuries: number;
	totalMoments: number;
}

interface MatchCenterMatch {
	id: number;
	name: string;
	date: Date | string;
	matchType: string;
	status: "active" | "ended" | "scheduled" | "resolved";
	participants: {
		id: number;
		warbandId: number;
		name: string;
		icon: string | null;
		color: string | null;
	}[];
	events: {
		id: number;
		death: boolean;
		injury: boolean;
		warrior?: { warbandId: number } | null;
		defender?: { warbandId: number } | null;
	}[];
}

interface WarbandSpotlightData {
	name: string;
	faction: string;
	icon: string | null;
	color: string | null;
	wins: number;
	treasury: number;
	warriorsAlive: number;
	eventsInflicted: number;
	eventsSuffered: number;
}

// Carousel gradients: keep everything in the same "Sky Mord" dark broadcast palette.
const gradients = [
	"from-slate-950 via-red-700/35 to-blue-700/35",
	"from-slate-950 via-blue-700/35 to-indigo-700/35",
	"from-slate-950 via-amber-600/30 to-red-700/30",
	"from-slate-950 via-cyan-600/25 to-blue-700/35",
	"from-slate-950 via-emerald-600/25 to-lime-600/25",
];

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

	const breakingHeadline = useMemo(() => {
		const latest = [...events].sort(
			(a, b) =>
				new Date(b.timestamp ?? b.createdAt).getTime() -
				new Date(a.timestamp ?? a.createdAt).getTime(),
		)[0];

		if (latest) {
			const icon = latest.death ? "☠️" : latest.injury ? "🩸" : "⚔️";
			const attacker = latest.warrior?.name ?? "Unknown warrior";
			const defender = latest.defender?.name;
			const detail =
				latest.description ??
				(defender
					? `${attacker} overwhelmed ${defender}`
					: `${attacker} seized the spotlight`);
			const label = latest.match?.name ?? campaign?.name ?? "Campaign feed";
			return `${icon} BREAKING: ${label} — ${detail}`;
		}

		const leaderName = gamesWon[0]?.warband.name;
		return leaderName
			? `📣 BREAKING: ${leaderName} set the pace in the ruins`
			: "📣 BREAKING: The broadcast desk is ready — waiting for the first clash.";
	}, [events, campaign, gamesWon]);

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

	const matchCenterMatches = useMemo<MatchCenterMatch[]>(() => {
		return matches.map((match) => ({
			id: match.id,
			name: match.name,
			date: match.date,
			status: match.status,
			matchType: match.matchType,
			participants: match.participants.map((participant) => ({
				id: participant.id,
				warbandId: participant.warbandId,
				name: participant.warband.name,
				icon: participant.warband.icon,
				color: participant.warband.color,
			})),
			events: match.events.map((event) => ({
				id: event.id,
				death: event.death,
				injury: event.injury,
				warrior: event.warrior ? { warbandId: event.warrior.warbandId } : null,
				defender: event.defender
					? { warbandId: event.defender.warbandId }
					: null,
			})),
		}));
	}, [matches]);

	const recentMatchHighlights = useMemo<MatchHighlight[]>(() => {
		return [...matches]
			.filter(
				(match) => match.status === "ended" || match.status === "resolved",
			)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 3)
			.map((match) => ({
				id: match.id,
				name: match.name,
				date: match.date,
				status: match.status,
				matchType: match.matchType,
				winners: (match.winners ?? []).map((winner) => ({
					id: winner.warbandId,
					name: winner.warband.name,
					icon: winner.warband.icon,
					color: winner.warband.color,
				})),
				participants: match.participants.map((participant) => ({
					id: participant.warbandId,
					name: participant.warband.name,
					icon: participant.warband.icon,
					color: participant.warband.color,
				})),
				kills: match.events.filter((event) => event.death).length,
				injuries: match.events.filter((event) => event.injury && !event.death)
					.length,
				totalMoments: match.events.length,
			}));
	}, [matches]);

	const warbandSpotlight = useMemo<WarbandSpotlightData | null>(() => {
		if (!leader) {
			return null;
		}

		const roster = warbands.find((w) => w.id === leader.warbandId);
		if (!roster) {
			return null;
		}

		const inflicted = events.filter(
			(event) => event.warrior?.warbandId === leader.warbandId,
		).length;
		const suffered = events.filter(
			(event) => event.defender?.warbandId === leader.warbandId,
		).length;

		const treasuryEntry =
			treasury.find((row) => row.warbandId === leader.warbandId)?.treasury ??
			roster.treasury;

		return {
			name: roster.name,
			faction: roster.faction,
			icon: roster.icon,
			color: roster.color,
			wins: leader.wins,
			treasury: treasuryEntry,
			warriorsAlive: roster.warriors.filter((warrior) => warrior.isAlive)
				.length,
			eventsInflicted: inflicted,
			eventsSuffered: suffered,
		};
	}, [leader, warbands, events, treasury]);

	const newsItems = useMemo(() => {
		const lore = [
			"🕯️ WHISPERS: Witch Hunters report ‘unlicensed miracles’ in the Merchant Quarter.",
			"🧟 RUMOUR MILL: A necromancer was seen ‘shopping’ for fresh recruits. Allegedly.",
			"🪙 MARKET WATCH: Warpstone prices volatile. Traders advised to ‘stop licking it’.",
			"🏴 TAVERN TALK: The Pit Fighter’s Guild offers ‘reasonable’ rates for brawls.",
			"🛡️ CITY WATCH: Curfew extended. Torches recommended. (Pitchforks optional.)",
			"🐀 UNDERFOOT: Skaven sightings denied by officials. Confirmed by everyone else.",
			"📜 NOTICE: Anyone returning a missing sword may keep the sword.",
		];

		const liveCount = matches.filter((m) => m.status === "active").length;
		const scheduledCount = matches.filter(
			(m) => m.status === "scheduled",
		).length;
		const resolvedCount = matches.filter(
			(m) => m.status === "ended" || m.status === "resolved",
		).length;

		const lastFinished = [...matches]
			.filter((m) => m.status === "ended" || m.status === "resolved")
			.sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
			)[0];

		const warpstoneIndex = totalMatches
			? Math.round(((casualtyCount + injuryCount) / totalMatches) * 10) / 10
			: 0;

		const deskStats: string[] = [
			breakingHeadline,
			`📺 DESK: ${pluralize(liveCount, "live game", "live games")} • ${pluralize(scheduledCount, "fixture", "fixtures")} • ${pluralize(resolvedCount, "final", "finals")}`,
			`🏆 TABLE: ${leader?.warband.name ?? "No leader yet"} • ${leader ? pluralize(leader.wins, "win") : "play a match to crown a champion"}`,
			`💰 TREASURY: ${richest?.warband.name ?? "No ledger"} • ${richest ? `${richest.treasury} gc` : "0 gc"}`,
			`⚔️ TOP KILLS: ${fiercestWarrior?.warrior.name ?? "No standout yet"} • ${fiercestWarrior ? pluralize(fiercestWarrior.kills, "kill") : "waiting for carnage"}`,
			`☠️ BLOODWATCH: ${pluralize(casualtyCount, "fatality")} • ${pluralize(injuryCount, "injury")} • Warpstone Index ${warpstoneIndex}`,
			lastFinished
				? `⏱️ FULL TIME: ${lastFinished.name} • ${lastFinished.matchType.toUpperCase()} • ${formatShortDate(lastFinished.date)}`
				: "⏱️ FULL TIME: No finished matches yet.",
		];

		const eventLines = [...events]
			.sort(
				(a, b) =>
					new Date(b.timestamp ?? b.createdAt).getTime() -
					new Date(a.timestamp ?? a.createdAt).getTime(),
			)
			.slice(0, 10)
			.map((event) => {
				const icon = event.death ? "☠️" : event.injury ? "🩸" : "⚔️";
				const attacker = event.warrior?.name ?? "Unknown warrior";
				const defender = event.defender?.name;
				const label = event.match?.name ?? "Match";

				const detail =
					event.description ??
					(defender
						? `${attacker} overwhelmed ${defender}`
						: `${attacker} seized the spotlight`);

				return truncate(`${icon} ${label}: ${detail}`, 110);
			});

		// Curate, de-dupe, and keep it punchy.
		const all = [...deskStats, ...eventLines, ...lore]
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => truncate(line, 120));

		const seen = new Set<string>();
		const unique: string[] = [];
		for (const line of all) {
			if (seen.has(line)) continue;
			seen.add(line);
			unique.push(line);
		}

		return unique.slice(0, 22);
	}, [
		events,
		matches,
		leader,
		richest,
		fiercestWarrior,
		casualtyCount,
		injuryCount,
		totalMatches,
		breakingHeadline,
	]);

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
							<h3 className="text-lg font-black uppercase tracking-wider text-foreground">
								Warband Standings
							</h3>
							<p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
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
							<h3 className="text-lg font-black uppercase tracking-wider text-foreground">
								Rating Progression
							</h3>
							<p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
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
							<h3 className="text-lg font-black uppercase tracking-wider text-foreground">
								Treasury Progression
							</h3>
							<p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
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
							<h3 className="text-lg font-black uppercase tracking-wider text-foreground">
								Experience Progression
							</h3>
							<p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
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

interface BroadcastHeaderProps {
	campaign: Campaign | null | undefined;
	topWarbandName?: string;
	totalMatches: number;
	casualtyCount: number;
	activeWarbands: number;
	breaking?: string;
}

function BroadcastHeader({
	campaign,
	topWarbandName,
	totalMatches,
	casualtyCount,
	activeWarbands,
	breaking,
}: BroadcastHeaderProps) {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1_000);
		return () => clearInterval(interval);
	}, []);

	const timeframe = campaign
		? `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
		: "Schedule pending";

	return (
		<header className="relative border-b border-border/60 bg-background/70 text-foreground backdrop-blur">
			<div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
				<div className="flex items-center gap-4">
					<div className="flex items-stretch overflow-hidden rounded-md border bg-card shadow-sm">
						<div className="bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
							SKY
						</div>
						<div className="bg-blue-700 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
							MORD
						</div>
						<div className="px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
							SPORTS NEWS
						</div>
					</div>
					<div className="hidden h-10 w-px bg-border md:block" />
					<div className="min-w-0">
						<h1 className="truncate text-xl font-black uppercase tracking-wider md:text-2xl">
							{campaign?.name ?? "Mordheim Campaign Report"}
						</h1>
						<div className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
							{timeframe}
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
						<span className="rounded bg-red-600 px-2 py-1 text-xs font-black uppercase tracking-[0.25em] text-white">
							LIVE
						</span>
						<span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
							{now.toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})}
						</span>
					</div>

					<div className="flex flex-wrap gap-2 text-[11px] font-semibold">
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							Top warband:{" "}
							<span className="font-black text-foreground">
								{topWarbandName ?? "TBD"}
							</span>
						</span>
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							<span className="font-black text-foreground">
								{pluralize(totalMatches, "match")}
							</span>{" "}
							reported
						</span>
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							<span className="font-black text-foreground">
								{pluralize(casualtyCount, "casualty")}
							</span>{" "}
							logged
						</span>
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							<span className="font-black text-foreground">
								{activeWarbands}
							</span>{" "}
							warbands
						</span>
					</div>
				</div>
			</div>

			<div className="border-t bg-linear-to-r from-red-600/20 via-blue-600/10 to-amber-500/20 px-4 py-2 md:px-6">
				<div className="flex items-center gap-3">
					<span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
						Breaking
					</span>
					<div className="min-w-0 truncate text-sm font-semibold">
						{breaking ?? "The desk is live — feed the ruins with events."}
					</div>
					<div className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground md:block">
						SMSN • Live feed
					</div>
				</div>
			</div>
		</header>
	);
}

interface StatCarouselProps {
	items: (BroadcastStat | BroadcastChart)[];
	headline: string;
}

function StatCarousel({ items, headline }: StatCarouselProps) {
	const [current, setCurrent] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [progress, setProgress] = useState(0);
	const durationMs = 7_000;
	const slideStartRef = useRef(0);

	useEffect(() => {
		if (items.length <= 1 || isPaused) return;

		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % items.length);
		}, durationMs);

		return () => clearInterval(interval);
	}, [items.length, isPaused]);

	useEffect(() => {
		// Reset progress when slide changes; also clamp for dynamic item arrays.
		if (items.length > 0 && current >= items.length) {
			setCurrent(0);
			return;
		}
		slideStartRef.current = performance.now();
		setProgress(0);
	}, [current, items.length]);

	useEffect(() => {
		let animationId = 0;

		const step = (now: number) => {
			if (!isPaused && items.length > 1) {
				const pct = Math.min(1, (now - slideStartRef.current) / durationMs);
				setProgress(pct);
				if (pct >= 1) {
					setProgress(0);
				} else {
					animationId = requestAnimationFrame(step);
				}
			}
		};

		setProgress(0);
		if (!isPaused && items.length > 1) {
			animationId = requestAnimationFrame(step);
		}

		return () => cancelAnimationFrame(animationId);
	}, [items.length, isPaused]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === " " || event.key.toLowerCase() === "p") {
				event.preventDefault();
				setIsPaused((prev) => !prev);
				return;
			}
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				setCurrent((prev) => (prev - 1 + items.length) % items.length);
				return;
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				setCurrent((prev) => (prev + 1) % items.length);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [items.length]);

	const currentItem = items[current];

	return (
		<div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg">
			<div
				className={`absolute inset-0 rounded-lg p-1 transition-all duration-500 bg-linear-to-br ${currentItem?.gradient}`}
			>
				<div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-card">
					{/* ON NOW strip sits inside the card frame (avoids clipping the top border) */}
					<div className="absolute left-0 top-0 z-30 w-full">
						<div className="mx-1 mt-1 overflow-hidden rounded-md border bg-background/70 backdrop-blur">
							<div className="flex items-center justify-between gap-4 px-4 py-2">
								<div className="min-w-0 truncate text-xs font-black uppercase tracking-[0.35em] text-muted-foreground">
									On now • {headline}
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
										onClick={() => setIsPaused((prev) => !prev)}
										className="rounded-full bg-accent p-2 text-accent-foreground transition hover:bg-accent/80"
									>
										{isPaused ? (
											<Play className="h-4 w-4" />
										) : (
											<Pause className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>
							<div className="h-1 w-full bg-muted/40">
								<div
									className="h-full bg-accent transition-[width]"
									style={{ width: `${Math.round(progress * 100)}%` }}
								/>
							</div>
						</div>
					</div>

					<div className="flex min-h-0 flex-1 flex-col pt-16">
						{currentItem?.type === "stat" ? (
							<>
								<div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-accent/10 blur-3xl" />
								<div className="relative z-10 space-y-2 px-8 pb-8 pt-4">
									<div className="text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground">
										{currentItem.title}
									</div>
									<div className="text-5xl font-black text-foreground">
										{currentItem.value}
									</div>
									<div className="text-lg text-foreground/80">
										{currentItem.statLine}
									</div>
									<div className="border-t border-border/50 pt-4 text-sm text-foreground/60">
										{currentItem.description}
									</div>
								</div>
								<div className="relative z-10 flex items-center justify-between p-8 pt-0 text-xs text-foreground/60">
									<span>{currentItem.footnote}</span>
									<span>
										{String(current + 1).padStart(2, "0")} /{" "}
										{String(items.length).padStart(2, "0")}
									</span>
								</div>
							</>
						) : currentItem?.type === "chart" ? (
							<>
								<div className="relative z-10 flex-1 overflow-hidden">
									{currentItem.content}
								</div>
								<div className="relative z-10 flex items-center justify-end p-4 text-xs text-foreground/60">
									<span>
										{String(current + 1).padStart(2, "0")} /{" "}
										{String(items.length).padStart(2, "0")}
									</span>
								</div>
							</>
						) : null}
					</div>
				</div>
			</div>
			{items.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Previous item"
						onClick={() =>
							setCurrent((prev) => (prev - 1 + items.length) % items.length)
						}
						className="absolute left-4 z-20 rounded-full bg-accent p-3 text-accent-foreground transition hover:bg-accent/80"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Next item"
						onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
						className="absolute right-4 z-20 rounded-full bg-accent p-3 text-accent-foreground transition hover:bg-accent/80"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
					<div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
						{items.map((item, index) => (
							<button
								key={item.id}
								type="button"
								aria-label={`Go to item ${index + 1}`}
								onClick={() => setCurrent(index)}
								className={`h-2 rounded-full transition-all ${
									index === current
										? "w-8 bg-accent"
										: "w-2 bg-foreground/30 hover:bg-foreground/60"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

interface MatchSpotlightProps {
	highlights: MatchHighlight[];
}

interface WarbandSpotlightProps {
	data: WarbandSpotlightData | null;
}

function WarbandSpotlight({ data }: WarbandSpotlightProps) {
	if (!data) {
		return (
			<div className="rounded-lg border bg-card p-4 shadow">
				<p className="text-sm text-muted-foreground">
					No warband spotlight yet. Play a match to crown a leader.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card p-5 shadow">
			<div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
				Warband Spotlight
			</div>
			<div className="mt-2 text-2xl font-black text-foreground">
				{data.icon ? `${data.icon} ` : ""}
				{data.name}
			</div>
			<div className="text-sm text-muted-foreground">{data.faction}</div>
			<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">Wins</div>
					<div className="text-xl font-bold">{data.wins}</div>
				</div>
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">
						Treasury
					</div>
					<div className="text-xl font-bold">{data.treasury} gc</div>
				</div>
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">
						Warriors Alive
					</div>
					<div className="text-xl font-bold">{data.warriorsAlive}</div>
				</div>
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">
						Event Impact
					</div>
					<div className="text-xl font-bold">
						{data.eventsInflicted} / {data.eventsSuffered}
					</div>
				</div>
			</div>
		</div>
	);
}

interface CasualtyReportProps {
	kills: WarriorKillsRow[];
	injuriesTaken: WarriorInjuriesTakenRow[];
	injuriesInflicted: WarriorInjuriesInflictedRow[];
}

function CasualtyReport({
	kills,
	injuriesTaken,
	injuriesInflicted,
}: CasualtyReportProps) {
	const sections = [
		{
			title: "Lethal Warriors",
			icon: "⚔️",
			entries: kills.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: pluralize(entry.kills, "kill"),
			})),
		},
		{
			title: "Walking Wounded",
			icon: "🩹",
			entries: injuriesTaken.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: pluralize(entry.injuriesReceived, "hit"),
			})),
		},
		{
			title: "Delivery Squad",
			icon: "🔥",
			entries: injuriesInflicted.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: pluralize(entry.injuriesInflicted, "injury"),
			})),
		},
	];

	return (
		<div className="rounded-lg border bg-card p-5 shadow">
			<div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
				Casualty Desk
			</div>
			<div className="mt-4 space-y-4">
				{sections.map((section) => (
					<div key={section.title}>
						<div className="text-sm font-semibold text-foreground">
							{section.icon} {section.title}
						</div>
						{section.entries.length === 0 ? (
							<p className="text-xs text-muted-foreground">No data yet.</p>
						) : (
							<div className="mt-2 space-y-1 text-sm">
								{section.entries.map((entry) => (
									<div
										key={`${section.title}-${entry.name}`}
										className="flex justify-between text-foreground/90"
									>
										<div className="truncate">
											<span className="font-semibold">{entry.name}</span>{" "}
											<span className="text-muted-foreground">
												({entry.warband})
											</span>
										</div>
										<div className="text-right font-semibold">
											{entry.value}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

interface NewsTickerProps {
	items: string[];
	label?: string;
}

function NewsTicker({ items, label = "Breaking" }: NewsTickerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const lastFrameRef = useRef<number | null>(null);

	useEffect(() => {
		if (!items.length) {
			return;
		}

		const reduceMotion =
			typeof window !== "undefined" &&
			(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
				false);
		if (reduceMotion) {
			return;
		}

		const container = containerRef.current;
		const content = contentRef.current;
		if (!container || !content) {
			return;
		}

		let animationId = 0;
		let offsetPx = 0;
		const pxPerSecond = 36;

		// Reset on item changes
		offsetPx = 0;
		lastFrameRef.current = null;
		content.style.transform = "translateX(0px)";

		const step = (now: number) => {
			const shouldAnimate =
				content.scrollWidth > container.clientWidth &&
				content.scrollWidth / 2 > 0;
			if (!shouldAnimate) {
				content.style.transform = "translateX(0px)";
				animationId = requestAnimationFrame(step);
				return;
			}

			const last = lastFrameRef.current ?? now;
			lastFrameRef.current = now;
			const dt = Math.min(50, now - last);
			const deltaPx = (pxPerSecond * dt) / 1000;

			const halfWidth = content.scrollWidth / 2;
			if (halfWidth <= 0) {
				animationId = requestAnimationFrame(step);
				return;
			}

			offsetPx += deltaPx;
			if (offsetPx >= halfWidth) {
				offsetPx = 0;
			}

			content.style.transform = `translateX(-${offsetPx}px)`;
			animationId = requestAnimationFrame(step);
		};

		animationId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(animationId);
	}, [items]);

	const loopItems = useMemo(() => {
		const primary = items.map((item, index) => ({
			id: `primary-${index}-${item}`,
			text: item,
		}));
		const duplicate = primary.map((entry) => ({
			id: `loop-${entry.id}`,
			text: entry.text,
		}));
		return [...primary, ...duplicate];
	}, [items]);

	return (
		<footer className="relative border-t border-border/60 bg-background/80 px-4 py-3 text-foreground backdrop-blur md:px-6">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-linear-to-r from-red-600/15 via-blue-600/10 to-amber-500/15" />
				<div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/80 to-transparent" />
				<div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/80 to-transparent" />
			</div>

			<div className="relative flex items-center gap-4">
				<div className="shrink-0">
					<div className="flex items-center gap-3">
						<div className="flex items-stretch overflow-hidden rounded border bg-card shadow-sm">
							<div className="bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
								SKY
							</div>
							<div className="bg-blue-700 px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
								MORD
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
							<span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
								{label}
							</span>
						</div>
					</div>
				</div>
				<div
					ref={containerRef}
					className="flex-1 overflow-hidden whitespace-nowrap"
				>
					<div ref={contentRef} className="flex gap-12 will-change-transform">
						{loopItems.map((entry) => (
							<span
								key={entry.id}
								className="text-sm font-semibold text-foreground/90"
							>
								<span className="text-foreground/40">◆</span>{" "}
								<span>{entry.text}</span>
							</span>
						))}
					</div>
				</div>
				<div className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground md:block">
					SMSN • LIVE FEED
				</div>
			</div>
		</footer>
	);
}

interface MatchCenterProps {
	matches: MatchCenterMatch[];
}

function MatchCenter({ matches }: MatchCenterProps) {
	const { live, scheduled } = useMemo(() => {
		const liveMatches = matches
			.filter((match) => match.status === "active")
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		const scheduledMatches = matches
			.filter((match) => match.status === "scheduled")
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		return { live: liveMatches, scheduled: scheduledMatches };
	}, [matches]);

	return (
		<div className="h-full min-h-0">
			<div className="h-full min-h-0 overflow-hidden rounded-lg border bg-card shadow-lg">
				<div className="border-b bg-muted/20 px-4 py-2">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							<div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
								Match Center
							</div>
							<div className="truncate text-base font-black uppercase tracking-wider text-foreground">
								Live &amp; Upcoming
							</div>
						</div>
						<div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
							{live.length} live • {scheduled.length} next
						</div>
					</div>
				</div>

				<div className="grid h-[calc(100%-3rem)] min-h-0 gap-3 p-3 lg:grid-cols-3">
					<div className="min-h-0 overflow-hidden lg:col-span-2">
						<LiveNowGrid matches={live} />
					</div>
					<div className="min-h-0 overflow-hidden lg:col-span-1">
						<UpcomingFixtures matches={scheduled} />
					</div>
				</div>
			</div>
		</div>
	);
}

function RecentResultsSlide({ highlights }: MatchSpotlightProps) {
	if (highlights.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No completed matches to recap yet.
			</div>
		);
	}

	const rows = highlights.slice(0, 3);

	return (
		<div className="flex h-full min-h-0 flex-col">
			{/* Broadcast header strip */}
			<div className="mb-3 overflow-hidden rounded-lg border bg-linear-to-r from-slate-950 via-slate-900 to-slate-950">
				<div className="flex items-center justify-between px-4 py-3">
					<div className="min-w-0">
						<div className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-300">
							Full time
						</div>
						<div className="truncate text-xl font-black uppercase tracking-wider text-slate-50">
							Results Board
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
							FT
						</span>
						<span className="rounded bg-slate-50/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-200">
							Last 3
						</span>
					</div>
				</div>
				<div className="h-1 w-full bg-linear-to-r from-red-600 via-blue-700 to-amber-500" />
			</div>

			{/* Scoreboard rows (fill available height so content isn't clipped) */}
			<div className="flex w-full min-h-0 flex-1 flex-col gap-3">
				{rows.map((match) => {
					const participantNames = match.participants
						.slice(0, 4)
						.map((p) => withIcon(p.icon, p.name));
					const participantsLine =
						participantNames.length === 0
							? "Participants TBD"
							: `${participantNames.join(" • ")}${match.participants.length > 4 ? ` • +${match.participants.length - 4}` : ""}`;

					const winnersNames = match.winners
						.slice(0, 2)
						.map((w) => withIcon(w.icon, w.name));
					const winnersLine =
						winnersNames.length === 0
							? "TBD"
							: `${winnersNames.join(" & ")}${match.winners.length > 2 ? " & +" + String(match.winners.length - 2) : ""}`;

					const incidents = match.kills + match.injuries;

					return (
						<div
							key={match.id}
							className="flex w-full min-h-0 flex-1 overflow-hidden rounded-lg border bg-linear-to-r from-slate-950 via-slate-950 to-slate-900 text-slate-50 shadow"
						>
							<div className="flex h-full w-full items-stretch">
								<div className="flex w-[92px] flex-col items-center justify-center gap-2 border-r border-slate-50/10 bg-linear-to-b from-blue-700/35 via-slate-950 to-red-700/30 px-3">
									<div className="rounded bg-slate-50/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-slate-200">
										{match.matchType.toUpperCase()}
									</div>
									<div className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
										FT
									</div>
								</div>

								<div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-3">
									<div className="flex items-baseline justify-between gap-4">
										<div className="min-w-0 truncate text-base font-black uppercase tracking-wide">
											{match.name}
										</div>
										<div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
											{formatShortDate(match.date)} • {formatTime(match.date)}
										</div>
									</div>

									<div className="mt-1 flex min-w-0 items-center gap-2">
										<span className="shrink-0 rounded bg-amber-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-amber-200">
											WIN
										</span>
										<span className="min-w-0 truncate text-xs font-semibold text-slate-100">
											{winnersLine}
										</span>
									</div>

									<div className="mt-2 min-w-0 truncate text-[11px] font-semibold text-slate-200">
										<span className="text-slate-400">Players:</span>{" "}
										{participantsLine}
									</div>
								</div>

								<div className="flex w-[170px] flex-col items-center justify-center gap-1 border-l border-slate-50/10 bg-slate-50/5 px-3 py-3 text-center">
									<div className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-300">
										Incidents
									</div>
									<div className="text-2xl font-black tabular-nums text-slate-50">
										{incidents}
									</div>
									<div className="flex items-center gap-3 text-[11px] font-semibold text-slate-200">
										<span>
											<span className="text-slate-400">☠️</span>{" "}
											<span className="font-mono">{match.kills}</span>
										</span>
										<span>
											<span className="text-slate-400">🩸</span>{" "}
											<span className="font-mono">{match.injuries}</span>
										</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function LiveNowGrid({ matches }: { matches: MatchCenterMatch[] }) {
	if (matches.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
				<div className="text-sm font-semibold text-muted-foreground">
					No games in progress.
				</div>
				<div className="mt-1 text-xs text-muted-foreground">
					Start a match to light up the broadcast.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground">
					Live Now
				</div>
				<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
					<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
					LIVE
				</div>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{matches.slice(0, 4).map((match) => (
					<LiveScoreCard key={match.id} match={match} />
				))}
			</div>
			{matches.length > 4 && (
				<div className="text-xs text-muted-foreground">
					Showing 4 of {matches.length} live matches.
				</div>
			)}
		</div>
	);
}

function UpcomingFixtures({ matches }: { matches: MatchCenterMatch[] }) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground">
					Upcoming
				</div>
				<div className="text-xs font-semibold text-muted-foreground">
					Next up
				</div>
			</div>
			<div className="space-y-2">
				{matches.length === 0 ? (
					<div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
						No scheduled fixtures yet.
					</div>
				) : (
					matches
						.slice(0, 6)
						.map((match) => <FixtureRow key={match.id} match={match} />)
				)}
			</div>
			{matches.length > 6 && (
				<div className="text-xs text-muted-foreground">
					Showing 6 of {matches.length} scheduled matches.
				</div>
			)}
		</div>
	);
}

function LiveScoreCard({ match }: { match: MatchCenterMatch }) {
	const scoreboard = useMemo(() => {
		const participants = match.participants.map((participant) => {
			const kills = match.events.filter(
				(event) =>
					event.death && event.warrior?.warbandId === participant.warbandId,
			).length;
			const injuries = match.events.filter(
				(event) =>
					event.injury &&
					!event.death &&
					event.warrior?.warbandId === participant.warbandId,
			).length;

			return { ...participant, kills, injuries };
		});

		const ordered = [...participants].sort((a, b) => b.kills - a.kills);
		return { participants, ordered };
	}, [match.events, match.participants]);

	const isHeadToHead = scoreboard.participants.length === 2;
	const left = isHeadToHead ? scoreboard.participants[0] : null;
	const right = isHeadToHead ? scoreboard.participants[1] : null;
	const leader =
		scoreboard.ordered[0] && scoreboard.ordered[0].kills > 0
			? scoreboard.ordered[0]
			: null;

	return (
		<div className="overflow-hidden rounded-lg border bg-linear-to-r from-slate-950 via-slate-950 to-slate-900 text-slate-50 shadow">
			<div className="flex items-center justify-between bg-linear-to-r from-blue-600/60 via-blue-600/30 to-red-600/60 px-3 py-2">
				<div className="truncate text-xs font-bold uppercase tracking-[0.25em]">
					{match.matchType.toUpperCase()} • LIVE
				</div>
				<div className="text-xs font-semibold text-slate-200">
					{formatTime(match.date)}
				</div>
			</div>

			<div className="space-y-3 px-4 py-4">
				<div className="truncate text-sm font-semibold text-slate-200">
					{match.name}
				</div>

				{isHeadToHead && left && right ? (
					<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
						<ScoreSide
							align="right"
							name={left.name}
							icon={left.icon}
							color={left.color}
							kills={left.kills}
							injuries={left.injuries}
						/>
						<div className="flex flex-col items-center">
							<div className="rounded bg-slate-50 px-3 py-1 text-lg font-black text-slate-950">
								{left.kills}–{right.kills}
							</div>
							<div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
								KILLS
							</div>
						</div>
						<ScoreSide
							align="left"
							name={right.name}
							icon={right.icon}
							color={right.color}
							kills={right.kills}
							injuries={right.injuries}
						/>
					</div>
				) : (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.35em] text-slate-300">
							<span>Table</span>
							<span>K / I</span>
						</div>
						<div className="space-y-2">
							{scoreboard.ordered.slice(0, 4).map((participant) => (
								<div
									key={participant.warbandId}
									className="flex items-center justify-between rounded bg-slate-50/5 px-3 py-2"
								>
									<div className="flex min-w-0 items-center gap-2">
										<span
											className="h-2 w-2 shrink-0 rounded-full"
											style={{
												backgroundColor: participant.color ?? "#f4b400",
											}}
										/>
										<div className="min-w-0 truncate text-sm font-semibold">
											{participant.icon ? `${participant.icon} ` : ""}
											{participant.name}
										</div>
										{leader?.warbandId === participant.warbandId && (
											<span className="ml-2 rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-950">
												Lead
											</span>
										)}
									</div>
									<div className="flex items-baseline gap-2 font-mono text-sm font-semibold">
										<span>{participant.kills}</span>
										<span className="text-slate-400">/</span>
										<span className="text-slate-200">
											{participant.injuries}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="flex items-center justify-between border-t border-slate-50/10 pt-3 text-[11px] font-semibold text-slate-300">
					<span>{pluralize(match.events.length, "event")} logged</span>
					<span className="uppercase tracking-[0.25em]">Sky Desk</span>
				</div>
			</div>
		</div>
	);
}

function ScoreSide({
	align,
	name,
	icon,
	color,
	kills,
	injuries,
}: {
	align: "left" | "right";
	name: string;
	icon: string | null;
	color: string | null;
	kills: number;
	injuries: number;
}) {
	return (
		<div
			className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}
		>
			<div className="flex items-center gap-2">
				{align === "left" ? (
					<span
						className="h-3 w-3 shrink-0 rounded-full"
						style={{ backgroundColor: color ?? "#f4b400" }}
					/>
				) : null}
				<div className="min-w-0 flex-1 truncate text-lg font-black uppercase tracking-wide">
					{icon ? `${icon} ` : ""}
					{name}
				</div>
				{align === "right" ? (
					<span
						className="h-3 w-3 shrink-0 rounded-full"
						style={{ backgroundColor: color ?? "#f4b400" }}
					/>
				) : null}
			</div>
			<div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-300">
				<span className="uppercase tracking-[0.25em]">Injuries</span>
				<span className="font-mono">{injuries}</span>
			</div>
			<div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-300">
				<span className="uppercase tracking-[0.25em]">Kills</span>
				<span className="font-mono">{kills}</span>
			</div>
		</div>
	);
}

function FixtureRow({ match }: { match: MatchCenterMatch }) {
	const vsLine = useMemo(() => {
		if (match.participants.length === 0) {
			return "Participants TBD";
		}
		if (match.participants.length === 2) {
			const left = match.participants[0];
			const right = match.participants[1];
			return `${left.name} vs ${right.name}`;
		}
		return `${match.participants.length} warbands scheduled`;
	}, [match.participants]);

	return (
		<div className="rounded-lg border bg-muted/20 px-3 py-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
						{formatShortDate(match.date)} • {formatTime(match.date)}
					</div>
					<div className="truncate text-sm font-bold text-foreground">
						{match.name}
					</div>
					<div className="truncate text-xs text-muted-foreground">{vsLine}</div>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2">
					<div className="rounded bg-chart-2/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-chart-2">
						Scheduled
					</div>
					<div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
						{match.matchType.toUpperCase()}
					</div>
				</div>
			</div>
		</div>
	);
}

function formatDate(date: Date | string | null | undefined) {
	if (!date) {
		return "Unknown date";
	}
	const parsed = new Date(date);
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatShortDate(date: Date | string | null | undefined) {
	if (!date) {
		return "TBD";
	}
	const parsed = new Date(date);
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function formatTime(date: Date | string | null | undefined) {
	if (!date) {
		return "TBD";
	}
	const parsed = new Date(date);
	return parsed.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function pluralize(value: number, singular: string, plural?: string) {
	const suffix = value === 1 ? singular : (plural ?? `${singular}s`);
	return `${value} ${suffix}`;
}

function withIcon(icon: string | null | undefined, label: string) {
	return icon ? `${icon} ${label}` : label;
}

function truncate(value: string, max: number) {
	if (value.length <= max) return value;
	return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
