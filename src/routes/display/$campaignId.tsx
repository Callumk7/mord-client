import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
	getMostTreasuryOptions,
} from "~/api/campaign";
import { campaignEventsQueryOptions } from "~/api/events";
import { getCampaignMatchesOptions } from "~/api/matches";
import { getCampaignWarbandsWithWarriorsOptions } from "~/api/warbands";
import type { Campaign } from "~/db/schema";

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
	id: string;
	title: string;
	value: string;
	statLine: string;
	description: string;
	gradient: string;
	footnote?: string;
}

interface MatchHighlight {
	id: number;
	name: string;
	date: Date | string;
	matchType: string;
	status: string;
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

const gradients = [
	"from-rose-600 to-orange-500",
	"from-purple-600 to-fuchsia-500",
	"from-amber-500 to-yellow-400",
	"from-cyan-500 to-blue-600",
	"from-emerald-500 to-lime-500",
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

	const stats = useMemo<BroadcastStat[]>(() => {
		const result: BroadcastStat[] = [
			{
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
				id: "casualties",
				title: "Casualty Watch",
				value: `${casualtyCount}`,
				statLine: `${pluralize(casualtyCount, "fatality")}`,
				description: `${injuryCount} additional injuries recorded`,
				gradient: gradients[3],
				footnote: "Event feed",
			},
			{
				id: "forces",
				title: "Active Forces",
				value: `${activeWarbands} warbands`,
				statLine: `${activeWarriors} warriors ready`,
				description: `${totalMatches} matches logged`,
				gradient: gradients[4],
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
		if (!events.length) {
			return [
				"🕰️ Broadcast desk is ready — waiting for the first recorded clash.",
			];
		}

		return [...events]
			.sort(
				(a, b) =>
					new Date(b.timestamp ?? b.createdAt).getTime() -
					new Date(a.timestamp ?? a.createdAt).getTime(),
			)
			.slice(0, 12)
			.map((event) => {
				const icon = event.death ? "☠️" : event.injury ? "🩸" : "⚔️";
				const attacker = event.warrior?.name ?? "Unknown warrior";
				const defender = event.defender?.name;
				const detail =
					event.description ??
					(defender
						? `${attacker} overwhelmed ${defender}`
						: `${attacker} seized the spotlight`);
				const label = event.match?.name ?? campaign?.name ?? "Campaign feed";
				return `${icon} ${label}: ${detail}`;
			});
	}, [events, campaign]);

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
			<BroadcastHeader
				campaign={campaign}
				topWarbandName={leader?.warband.name}
				totalMatches={totalMatches}
				casualtyCount={casualtyCount}
				activeWarbands={activeWarbands}
			/>
			<div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
				<div className="flex min-h-0 flex-1 flex-col gap-4">
					<StatCarousel stats={stats} />
					<MatchCenter
						matches={matchCenterMatches}
						recent={recentMatchHighlights}
					/>
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
			<NewsTicker items={newsItems} />
		</div>
	);
}

interface BroadcastHeaderProps {
	campaign: Campaign | null | undefined;
	topWarbandName?: string;
	totalMatches: number;
	casualtyCount: number;
	activeWarbands: number;
}

function BroadcastHeader({
	campaign,
	topWarbandName,
	totalMatches,
	casualtyCount,
	activeWarbands,
}: BroadcastHeaderProps) {
	const timeframe = campaign
		? `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
		: "Schedule pending";

	return (
		<div className="border-b-4 border-accent bg-linear-to-r from-red-300 via-red-500 to-blue-400 px-6 py-4 text-background">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div className="text-sm font-bold uppercase tracking-[0.3em] text-accent-foreground/90">
						Live Broadcast
					</div>
					<h1 className="text-3xl font-black uppercase tracking-wider md:text-4xl">
						{campaign?.name ?? "Mordheim Campaign Report"}
					</h1>
					<p className="text-sm text-background/80">{timeframe}</p>
				</div>
				<div className="flex flex-col gap-2 text-right text-background">
					<div className="text-2xl font-black">LIVE</div>
					<div className="text-sm uppercase tracking-[0.3em] text-background/80">
						Top warband: {topWarbandName ?? "TBD"}
					</div>
					<div className="flex gap-4 text-xs font-semibold">
						<span>{pluralize(totalMatches, "match")} reported</span>
						<span>{pluralize(casualtyCount, "casualty")} logged</span>
						<span>{activeWarbands} warbands active</span>
					</div>
				</div>
			</div>
		</div>
	);
}

interface StatCarouselProps {
	stats: BroadcastStat[];
}

function StatCarousel({ stats }: StatCarouselProps) {
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (stats.length <= 1) {
			return;
		}
		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % stats.length);
		}, 7000);
		return () => clearInterval(interval);
	}, [stats.length]);

	const stat = stats[current];

	return (
		<div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg">
			<div
				className={`absolute inset-0 rounded-lg p-1 transition-all duration-500 bg-linear-to-br ${stat?.gradient}`}
			>
				<div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-card p-8">
					<div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-accent/10 blur-3xl" />
					<div className="relative z-10 space-y-2">
						<div className="text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground">
							{stat?.title}
						</div>
						<div className="text-5xl font-black text-foreground">
							{stat?.value}
						</div>
						<div className="text-lg text-foreground/80">{stat?.statLine}</div>
						<div className="border-t border-border/50 pt-4 text-sm text-foreground/60">
							{stat?.description}
						</div>
					</div>
					<div className="relative z-10 flex items-center justify-between text-xs text-foreground/60">
						<span>{stat?.footnote}</span>
						<span>
							{String(current + 1).padStart(2, "0")} /{" "}
							{String(stats.length).padStart(2, "0")}
						</span>
					</div>
				</div>
			</div>
			{stats.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Previous stat"
						onClick={() =>
							setCurrent((prev) => (prev - 1 + stats.length) % stats.length)
						}
						className="absolute left-4 z-20 rounded-full bg-accent p-3 text-accent-foreground transition hover:bg-accent/80"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Next stat"
						onClick={() => setCurrent((prev) => (prev + 1) % stats.length)}
						className="absolute right-4 z-20 rounded-full bg-accent p-3 text-accent-foreground transition hover:bg-accent/80"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
					<div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
						{stats.map((_, index) => (
							<button
								key={_.id}
								type="button"
								aria-label={`Go to stat ${index + 1}`}
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

function MatchSpotlight({ highlights }: MatchSpotlightProps) {
	if (highlights.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No completed matches to recap yet.
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card p-4 shadow-lg">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Recent Results</h2>
					<p className="text-sm text-muted-foreground">
						Last three finished clashes
					</p>
				</div>
				<div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
					Full time
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				{highlights.map((match) => (
					<div
						key={match.id}
						className="flex flex-col rounded-lg border bg-muted/30 p-4"
					>
						<div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
							{match.matchType} • {match.status.toUpperCase()}
						</div>
						<div className="truncate text-lg font-bold text-foreground">
							{match.name}
						</div>
						<div className="text-xs text-muted-foreground">
							{formatDate(match.date)}
						</div>
						<div className="mt-3 space-y-1">
							{match.participants.map((participant) => (
								<div
									key={participant.id}
									className="flex items-center gap-2 text-sm text-foreground"
								>
									<span
										className="h-2 w-2 rounded-full"
										style={{
											backgroundColor: participant.color ?? "#f4b400",
										}}
									/>
									<span className="truncate">
										{participant.icon ? `${participant.icon} ` : ""}
										{participant.name}
									</span>
								</div>
							))}
						</div>
						<div className="mt-4 flex gap-4 text-xs font-semibold text-muted-foreground">
							<span>
								{match.kills} {pluralize(match.kills, "kill")}
							</span>
							<span>
								{match.injuries} {pluralize(match.injuries, "injury")}
							</span>
							<span>{match.totalMoments} events</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
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
				value: `${entry.kills} ${pluralize(entry.kills, "kill")}`,
			})),
		},
		{
			title: "Walking Wounded",
			icon: "🩹",
			entries: injuriesTaken.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: `${entry.injuriesReceived} ${pluralize(entry.injuriesReceived, "hit")}`,
			})),
		},
		{
			title: "Delivery Squad",
			icon: "🔥",
			entries: injuriesInflicted.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: `${entry.injuriesInflicted} ${pluralize(entry.injuriesInflicted, "injury")}`,
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
}

function NewsTicker({ items }: NewsTickerProps) {
	const tickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!items.length) {
			return;
		}

		const container = tickerRef.current;
		if (!container) {
			return;
		}

		let animationId: number;
		let scrollPosition = 0;
		const scrollSpeed = 0.5;

		const step = () => {
			scrollPosition += scrollSpeed;

			if (scrollPosition >= container.scrollWidth / 2) {
				scrollPosition = 0;
			}

			container.scrollLeft = scrollPosition;
			animationId = requestAnimationFrame(step);
		};

		animationId = requestAnimationFrame(step);

		return () => cancelAnimationFrame(animationId);
	}, [items.length]);

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
		<div className="border-t border-accent/30 bg-primary px-4 py-3 text-primary-foreground">
			<div className="flex items-center gap-4">
				<div className="shrink-0">
					<div className="text-xs font-bold uppercase tracking-[0.4em] text-accent">
						Breaking
					</div>
				</div>
				<div
					ref={tickerRef}
					className="flex-1 overflow-hidden whitespace-nowrap"
				>
					<div className="flex gap-12">
						{loopItems.map((entry) => (
							<span key={entry.id} className="text-sm font-medium">
								{entry.text}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

interface MatchCenterProps {
	matches: MatchCenterMatch[];
	recent: MatchHighlight[];
}

function MatchCenter({ matches, recent }: MatchCenterProps) {
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
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="rounded-lg border bg-card shadow-lg">
				<div className="border-b bg-muted/20 px-4 py-3">
					<div className="flex items-baseline justify-between gap-4">
						<div>
							<div className="text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground">
								Match Center
							</div>
							<div className="text-xl font-black uppercase tracking-wider text-foreground">
								Live Now &amp; Upcoming
							</div>
						</div>
						<div className="text-xs font-semibold text-muted-foreground">
							<span className="mr-3">
								{live.length}{" "}
								{pluralize(live.length, "live game", "live games")}
							</span>
							<span>
								{scheduled.length}{" "}
								{pluralize(scheduled.length, "fixture", "fixtures")}
							</span>
						</div>
					</div>
				</div>

				<div className="grid gap-4 p-4 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<LiveNowGrid matches={live} />
					</div>
					<div className="lg:col-span-1">
						<UpcomingFixtures matches={scheduled} />
					</div>
				</div>
			</div>

			<MatchSpotlight highlights={recent} />
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
