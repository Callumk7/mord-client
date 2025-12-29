import { useMemo } from "react";
import type { Campaign, WarbandWithWarriors } from "~/db/schema";
import { formatShortDate, pluralize, truncate } from "~/lib/display-utils";
import type {
	MatchCenterMatch,
	MatchHighlight,
	WarbandSpotlightData,
	WarriorKillsRow,
} from "~/types/display";

type BroadcastEvent = {
	timestamp?: Date | string | null;
	createdAt?: Date | string | null;
	death?: boolean;
	injury?: boolean;
	description?: string | null;
	warrior?: { warbandId: number; name: string | null } | null;
	defender?: { warbandId: number; name: string | null } | null;
	match?: { name: string | null } | null;
};

type GamesWonRow = {
	warbandId: number;
	wins: number;
	warband: { name: string };
};

type TreasuryRow = {
	warbandId: number;
	treasury?: number | null;
};

type BroadcastMatchParticipant = {
	id: number;
	warbandId: number;
	warband: {
		name: string;
		icon: string | null;
		color: string | null;
		rating?: number | null;
		experience?: number | null;
	};
};

type BroadcastMatchWinner = {
	warbandId: number;
	warband: {
		name: string;
		icon: string | null;
		color: string | null;
	};
};

type BroadcastMatch = {
	id: number;
	name: string;
	date: Date | string;
	status: "active" | "ended" | "scheduled" | "resolved";
	participants: BroadcastMatchParticipant[];
	winners?: BroadcastMatchWinner[];
	events: (BroadcastEvent & {
		id: number;
		match?: { name: string | null } | null;
	})[];
};

/**
 * Hook to generate the breaking headline from events and games won
 */
export function useBreakingHeadline(
	events: BroadcastEvent[],
	campaign: Campaign | null | undefined,
	gamesWon: GamesWonRow[],
) {
	return useMemo(() => {
		const latest = [...events].sort(
			(a, b) =>
				new Date(b.timestamp ?? b.createdAt ?? 0).getTime() -
				new Date(a.timestamp ?? a.createdAt ?? 0).getTime(),
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
}

/**
 * Hook to transform matches into MatchCenterMatch format
 */
export function useMatchCenterMatches(
	matches: BroadcastMatch[],
): MatchCenterMatch[] {
	return useMemo(() => {
		return matches.map((match) => ({
			id: match.id,
			name: match.name,
			date: match.date,
			status: match.status,
			participants: match.participants.map((participant) => ({
				id: participant.id,
				warbandId: participant.warbandId,
				name: participant.warband.name,
				icon: participant.warband.icon,
				color: participant.warband.color,
				rating: participant.warband.rating ?? 0,
			})),
			events: match.events.map((event) => ({
				id: event.id,
				death: Boolean(event.death),
				injury: Boolean(event.injury),
				description: event.description ?? null,
				timestamp: event.timestamp ?? event.createdAt ?? null,
				warrior: event.warrior
					? {
							warbandId: event.warrior.warbandId,
							name: event.warrior.name ?? "Unknown",
						}
					: null,
				defender: event.defender
					? {
							warbandId: event.defender.warbandId,
							name: event.defender.name ?? "Unknown",
						}
					: null,
			})),
		}));
	}, [matches]);
}

/**
 * Hook to generate recent match highlights
 */
export function useRecentMatchHighlights(
	matches: BroadcastMatch[],
): MatchHighlight[] {
	return useMemo(() => {
		const winsByWarbandId = new Map<number, number>();
		for (const match of matches) {
			if (match.status !== "ended" && match.status !== "resolved") continue;
			for (const winner of match.winners ?? []) {
				const id = Number(winner.warbandId);
				winsByWarbandId.set(id, (winsByWarbandId.get(id) ?? 0) + 1);
			}
		}

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
					wins: winsByWarbandId.get(Number(participant.warbandId)) ?? 0,
					experience: participant.warband.experience ?? 0,
				})),
				kills: match.events.filter((event) => event.death).length,
				injuries: match.events.filter((event) => event.injury && !event.death)
					.length,
				totalMoments: match.events.length,
			}));
	}, [matches]);
}

/**
 * Hook to generate warband spotlight data
 */
export function useWarbandSpotlight(
	leader: GamesWonRow | undefined,
	warbands: WarbandWithWarriors[],
	events: BroadcastEvent[],
	treasury: TreasuryRow[],
): WarbandSpotlightData | null {
	return useMemo(() => {
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
}

/**
 * Hook to generate news ticker items
 */
export function useNewsItems(
	events: BroadcastEvent[],
	matches: BroadcastMatch[],
	leader: GamesWonRow | undefined,
	richest: { warband: { name: string }; treasury: number } | undefined,
	fiercestWarrior: WarriorKillsRow | undefined,
	casualtyCount: number,
	injuryCount: number,
	totalMatches: number,
	breakingHeadline: string,
	customNews: string[],
) {
	return useMemo(() => {
		const breaking = truncate(breakingHeadline.trim(), 120);

		const lore = [
			"🕯️ WHISPERS: Witch Hunters report 'unlicensed miracles' in the Merchant Quarter.",
			"🧟 RUMOUR MILL: A necromancer was seen 'shopping' for fresh recruits. Allegedly.",
			"🪙 MARKET WATCH: Warpstone prices volatile. Traders advised to 'stop licking it'.",
			"🏴 TAVERN TALK: The Pit Fighter's Guild offers 'reasonable' rates for brawls.",
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
			breaking,
			`📺 DESK: ${pluralize(liveCount, "live game", "live games")} • ${pluralize(scheduledCount, "fixture", "fixtures")} • ${pluralize(resolvedCount, "final", "finals")}`,
			`🏆 TABLE: ${leader?.warband.name ?? "No leader yet"} • ${leader ? pluralize(leader.wins, "win") : "play a match to crown a champion"}`,
			`💰 TREASURY: ${richest?.warband.name ?? "No ledger"} • ${richest ? `${richest.treasury} gc` : "0 gc"}`,
			`⚔️ TOP KILLS: ${fiercestWarrior?.warrior.name ?? "No standout yet"} • ${fiercestWarrior ? pluralize(fiercestWarrior.kills, "kill") : "waiting for carnage"}`,
			`☠️ BLOODWATCH: ${pluralize(casualtyCount, "fatality")} • ${pluralize(injuryCount, "injury")} • Warpstone Index ${warpstoneIndex}`,
			lastFinished
				? `⏱️ FULL TIME: ${lastFinished.name} • ${formatShortDate(lastFinished.date)}`
				: "⏱️ FULL TIME: No finished matches yet.",
		];

		const eventLines = [...events]
			.sort(
				(a, b) =>
					new Date(b.timestamp ?? b.createdAt ?? 0).getTime() -
					new Date(a.timestamp ?? a.createdAt ?? 0).getTime(),
			)
			.slice(0, 10)
			.map((event) => {
				const icon = event.death ? "☠️" : event.injury ? "🩸" : "⚔️";
				const attacker = event.warrior?.name ?? "Unknown warrior";
				const defender = event.defender?.name;
				const label = event.match?.name ?? "Match";

				const description =
					typeof event.description === "string" ? event.description.trim() : "";

				const detail = description
					? description
					: event.death
						? "death noted"
						: event.injury
							? "injury noted"
							: defender
								? `${attacker} overwhelmed ${defender}`
								: `${attacker} seized the spotlight`;

				return truncate(`${icon} ${label}: ${detail}`, 110);
			});

		const customLines = customNews
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => truncate(line, 120));

		// Curate, de-dupe, and keep it punchy.
		const all = [...deskStats, ...eventLines, ...lore, ...customLines]
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

		const rest = unique.filter((line) => line !== breaking);

		for (let i = rest.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[rest[i], rest[j]] = [rest[j], rest[i]];
		}

		const ordered = breaking ? [breaking, ...rest] : rest;
		return ordered.slice(0, 22);
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
		customNews,
	]);
}
