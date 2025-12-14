import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "~/db";
import {
	campaigns,
	events,
	matchWinners,
	warbands,
	warriors,
} from "~/db/schema";

// Query Key Factory
export const campaignKeys = {
	all: ["campaigns"] as const,
	lists: () => [...campaignKeys.all] as const,
	details: () => [...campaignKeys.all, "detail"] as const,
	detail: (campaignId: number) =>
		[...campaignKeys.details(), campaignId] as const,
	leaderboards: (campaignId: number) =>
		[...campaignKeys.detail(campaignId), "leaderboards"] as const,
	gamesWon: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "games-won"] as const,
	rating: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "rating"] as const,
	treasury: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "treasury"] as const,
	kills: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "kills"] as const,
	killsFromEvents: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "kills-from-events"] as const,
	injuries: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "injuries"] as const,
	injuriesFromEvents: (campaignId: number) =>
		[...campaignKeys.leaderboards(campaignId), "injuries-from-events"] as const,
	injuriesInflictedFromEvents: (campaignId: number) =>
		[
			...campaignKeys.leaderboards(campaignId),
			"injuries-inflicted-from-events",
		] as const,
};

export const getCampaigns = createServerFn({ method: "GET" }).handler(
	async () => {
		const allCampaigns = await db.select().from(campaigns);
		return allCampaigns;
	},
);
export const getCampaignsOptions = queryOptions({
	queryKey: campaignKeys.lists(),
	queryFn: () => getCampaigns(),
});

// Single Campaign
export const getCampaign = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId),
		});
	});

export const getCampaignOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.detail(campaignId),
		queryFn: () => getCampaign({ data: { campaignId } }),
	});

// Leaderboard stuff

// Warband Leaderboards

// Most Games Won
async function getWarbandsRankedByWins(campaignId: number) {
	const results = await db
		.select({
			warbandId: warbands.id,
			warband: warbands,
			wins: sql<number>`count(*)::int`.as("wins"),
		})
		.from(warbands)
		.innerJoin(matchWinners, eq(matchWinners.warbandId, warbands.id))
		.where(eq(warbands.campaignId, campaignId))
		.groupBy(warbands.id)
		.orderBy(desc(sql`count(*)`));

	return results;
}

export const getMostGamesWon = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarbandsRankedByWins(campaignId);
	});

export const getMostGamesWonOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.gamesWon(campaignId),
		queryFn: () => getMostGamesWon({ data: { campaignId } }),
	});

// Richest Warband
async function getWarbandsRankedByTreasury(campaignId: number) {
	const results = await db
		.select({
			warbandId: warbands.id,
			warband: warbands,
			treasury: warbands.treasury,
		})
		.from(warbands)
		.where(eq(warbands.campaignId, campaignId))
		.orderBy(desc(warbands.treasury));

	return results;
}

export const getMostTreasury = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarbandsRankedByTreasury(campaignId);
	});

export const getMostTreasuryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.treasury(campaignId),
		queryFn: () => getMostTreasury({ data: { campaignId } }),
	});

async function getWarbandsRankedByRating(campaignId: number) {
	const results = await db
		.select({
			warbandId: warbands.id,
			warband: warbands,
			rating: warbands.rating,
		})
		.from(warbands)
		.where(eq(warbands.campaignId, campaignId))
		.groupBy(warbands.id)
		.orderBy(desc(sql`rating`));

	return results;
}

export const getMostRating = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarbandsRankedByRating(campaignId);
	});

export const getMostRatingOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.rating(campaignId),
		queryFn: () => getMostRating({ data: { campaignId } }),
	});

// Warrior Leaderboards
async function getWarriorsRankedByKillsFromEvents(campaignId: number) {
	const results = await db
		.select({
			warriorId: warriors.id,
			warrior: warriors,
			warbandName: warbands.name,
			warbandIcon: warbands.icon,
			warbandColor: warbands.color,
			kills: sql<number>`COUNT(*)::int`.as("kills"),
		})
		.from(events)
		.innerJoin(warriors, eq(events.warriorId, warriors.id))
		.innerJoin(warbands, eq(warriors.warbandId, warbands.id))
		.where(and(eq(events.campaignId, campaignId), eq(events.death, true)))
		.groupBy(warriors.id, warbands.id)
		.orderBy(desc(sql`COUNT(*)`));

	return results;
}

export const getMostKillsFromEvents = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarriorsRankedByKillsFromEvents(campaignId);
	});

export const getMostKillsFromEventsOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.killsFromEvents(campaignId),
		queryFn: () => getMostKillsFromEvents({ data: { campaignId } }),
	});

async function getWarriorsRankedByInjuriesFromEvents(campaignId: number) {
	const results = await db
		.select({
			warriorId: warriors.id,
			warrior: warriors,
			warbandName: warbands.name,
			warbandIcon: warbands.icon,
			warbandColor: warbands.color,
			injuriesReceived: sql<number>`COUNT(*)::int`.as("injuries_received"),
		})
		.from(events)
		.innerJoin(warriors, eq(events.defenderId, warriors.id))
		.innerJoin(warbands, eq(warriors.warbandId, warbands.id))
		.where(and(eq(events.campaignId, campaignId), eq(events.injury, true)))
		.groupBy(warriors.id, warbands.id)
		.orderBy(desc(sql`COUNT(*)`));

	return results;
}

export const getMostInjuriesFromEvents = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarriorsRankedByInjuriesFromEvents(campaignId);
	});

export const getMostInjuriesFromEventsOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.injuriesFromEvents(campaignId),
		queryFn: () => getMostInjuriesFromEvents({ data: { campaignId } }),
	});

async function getWarriorsRankedByInjuriesInflictedFromEvents(
	campaignId: number,
) {
	const results = await db
		.select({
			warriorId: warriors.id,
			warrior: warriors,
			warbandName: warbands.name,
			warbandIcon: warbands.icon,
			warbandColor: warbands.color,
			injuriesInflicted: sql<number>`COUNT(*)::int`.as("injuries_inflicted"),
		})
		.from(events)
		.innerJoin(warriors, eq(events.warriorId, warriors.id))
		.innerJoin(warbands, eq(warriors.warbandId, warbands.id))
		.where(and(eq(events.campaignId, campaignId), eq(events.injury, true)))
		.groupBy(warriors.id, warbands.id)
		.orderBy(desc(sql`COUNT(*)`));

	return results;
}

export const getMostInjuriesInflictedFromEvents = createServerFn({
	method: "GET",
})
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarriorsRankedByInjuriesInflictedFromEvents(campaignId);
	});

export const getMostInjuriesInflictedFromEventsOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignKeys.injuriesInflictedFromEvents(campaignId),
		queryFn: () => getMostInjuriesInflictedFromEvents({ data: { campaignId } }),
	});
