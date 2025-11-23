import { mutationOptions } from "@tanstack/react-query";
import { deleteWarbandFn } from "~/routes/$campaignId/warbands";

export const deleteWarbandMutation = mutationOptions({
	mutationFn: (warbandId: number) => deleteWarbandFn({ data: { warbandId } }),
});
