import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	eventKeys,
	resolveEventFn,
	resolveHenchmanEventFn,
} from "~/api/events";
import { matchKeys } from "~/api/matches";

interface UseResolveEventOptions {
	matchId: number;
	campaignId: number;
	eventId: number;
	onSuccess?: () => void;
}

export function useResolveEvent({
	matchId,
	campaignId,
	eventId,
	onSuccess,
}: UseResolveEventOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resolveEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: matchKeys.detail(matchId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.listByCampaign(campaignId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.detail(eventId),
			});
			onSuccess?.();
		},
	});
}

export function useResolveHenchmanEvent({
	matchId,
	campaignId,
	eventId,
	onSuccess,
}: UseResolveEventOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resolveHenchmanEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: matchKeys.detail(matchId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.listByCampaign(campaignId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.detail(eventId),
			});
			onSuccess?.();
		},
	});
}
