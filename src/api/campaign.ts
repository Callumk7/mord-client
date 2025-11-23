import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "~/db";
import { campaigns, matches, warbands } from "~/db/schema";

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
		queryKey: ["campaign", campaignId],
		queryFn: () => getCampaign({ data: { campaignId } }),
	});

// Leaderboard stuff

async function getWarbandsRankedByWins(campaignId: number) {
	const results = await db
		.select({
			warbandId: warbands.id,
			warband: warbands,
			wins: sql<number>`count(*)::int`.as("wins"),
		})
		.from(warbands)
		.innerJoin(matches, eq(matches.winnerId, warbands.id))
		.where(eq(warbands.campaignId, campaignId))
		.groupBy(matches.winnerId, warbands.id)
		.orderBy(desc(sql`count(*)`));

	return results;
}

export const getMostGamesWon = createServerFn({ method: "GET" })
	.inputValidator((d: { campaignId: number }) => d)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		return await getWarbandsRankedByWins(campaignId);
	});
