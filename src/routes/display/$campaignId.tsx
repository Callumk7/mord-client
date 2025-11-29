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

	const matchHighlights = useMemo<MatchHighlight[]>(() => {
		if (!matches.length) {
			return [];
		}

		return [...matches]
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
					<MatchSpotlight highlights={matchHighlights} />
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
		<div className="border-b-4 border-accent bg-gradient-to-r from-red-300 via-red-500 to-blue-400 px-6 py-4 text-background">
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
				className={`absolute inset-0 rounded-lg p-1 transition-all duration-500 bg-gradient-to-br ${stat?.gradient}`}
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
				No matches recorded for this campaign yet.
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card p-4 shadow-lg">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Match Center</h2>
					<p className="text-sm text-muted-foreground">
						Latest three broadcasts
					</p>
				</div>
				<div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
					Field reports
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
				<div className="flex-shrink-0">
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

function pluralize(value: number, singular: string, plural?: string) {
	const suffix = value === 1 ? singular : (plural ?? `${singular}s`);
	return `${value} ${suffix}`;
}
