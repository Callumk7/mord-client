import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { db } from "~/db";
import { matches, warbandStateChanges, warbands } from "~/db/schema";

// Query Key Factory
export const campaignHistoryKeys = {
	all: ["campaign-history"] as const,
	campaign: (campaignId: number) =>
		[...campaignHistoryKeys.all, campaignId] as const,
	warband: (warbandId: number) =>
		[...campaignHistoryKeys.all, "warband", warbandId] as const,
};

// Get timeline of all state changes for a campaign
export const getCampaignHistoryFn = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const history = await db
			.select({
				id: warbandStateChanges.id,
				warbandId: warbandStateChanges.warbandId,
				warbandName: warbands.name,
				warbandColor: warbands.color,
				warbandIcon: warbands.icon,
				matchId: warbandStateChanges.matchId,
				matchName: matches.name,
				matchDate: matches.date,
				treasuryDelta: warbandStateChanges.treasuryDelta,
				experienceDelta: warbandStateChanges.experienceDelta,
				ratingDelta: warbandStateChanges.ratingDelta,
				treasuryAfter: warbandStateChanges.treasuryAfter,
				experienceAfter: warbandStateChanges.experienceAfter,
				ratingAfter: warbandStateChanges.ratingAfter,
				changeType: warbandStateChanges.changeType,
				description: warbandStateChanges.description,
				timestamp: warbandStateChanges.timestamp,
			})
			.from(warbandStateChanges)
			.leftJoin(warbands, eq(warbandStateChanges.warbandId, warbands.id))
			.leftJoin(matches, eq(warbandStateChanges.matchId, matches.id))
			.where(eq(warbands.campaignId, data.campaignId))
			.orderBy(asc(warbandStateChanges.timestamp));

		return history;
	});

export const getCampaignHistoryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: campaignHistoryKeys.campaign(campaignId),
		queryFn: () => getCampaignHistoryFn({ data: { campaignId } }),
	});

// Get progression for specific warband
export const getWarbandProgressionFn = createServerFn({ method: "GET" })
	.inputValidator((data: { warbandId: number }) => data)
	.handler(async ({ data }) => {
		const progression = await db
			.select()
			.from(warbandStateChanges)
			.where(eq(warbandStateChanges.warbandId, data.warbandId))
			.orderBy(asc(warbandStateChanges.timestamp));

		return progression;
	});

export const getWarbandProgressionOptions = (warbandId: number) =>
	queryOptions({
		queryKey: campaignHistoryKeys.warband(warbandId),
		queryFn: () => getWarbandProgressionFn({ data: { warbandId } }),
	});
