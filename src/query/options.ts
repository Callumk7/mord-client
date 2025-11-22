import { queryOptions } from "@tanstack/react-query";
import { getMatchesFn } from "~/lib/queries/matches";
import { getCampaigns } from "~/routes";
import { getCampaignWarbandsFn } from "~/routes/$campaignId/warbands";

export const campaignsQueryOptions = queryOptions({
	queryKey: ["campaigns"],
	queryFn: () => getCampaigns(),
});

export const campaignWarbandQueryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: ["campaign", campaignId, "warbands"],
		queryFn: () => getCampaignWarbandsFn({ data: { campaignId } }),
	});

export const campaignMatchesQueryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: ["campaign", campaignId, "matches"],
		queryFn: () => getMatchesFn({ data: { campaignId } }),
	});
