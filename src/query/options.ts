import { queryOptions } from "@tanstack/react-query";
import { getCampaigns } from "~/routes";
import { getCampaignWarbandsFn } from "~/routes/$campaign/warbands";

export const campaignsQueryOptions = queryOptions({
	queryKey: ["campaigns"],
	queryFn: () => getCampaigns(),
});

export const campaignWarbandQueryOptions = (campaignId: number) =>
	queryOptions({
		queryKey: ["campaign", campaignId, "warbands"],
		queryFn: () => getCampaignWarbandsFn({ data: { campaignId } }),
	});
