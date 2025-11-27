import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatchDetailsOptions, updateMatchFn } from "~/api/matches";

// Currently being used to select the match status
export const useUpdateMatchMutation = (matchId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateMatchFn,
		onMutate: async (variables) => {
			const newStatus = variables.data.status;
			if (!newStatus) return;

			// Cancel any outgoing refetches to avoid overwriting optimistic update
			await queryClient.cancelQueries({
				queryKey: getMatchDetailsOptions(matchId).queryKey,
			});

			// Snapshot the previous value
			const previousMatch = queryClient.getQueryData(
				getMatchDetailsOptions(matchId).queryKey,
			);

			// Optimistically update the cache
			queryClient.setQueryData(
				getMatchDetailsOptions(matchId).queryKey,
				(old) => {
					if (!old) return old;
					return {
						...old,
						status: newStatus,
					};
				},
			);

			// Return context with the snapshot
			return { previousMatch };
		},
		onError: (_error, _variables, context) => {
			// Rollback to previous value on error
			if (context?.previousMatch) {
				queryClient.setQueryData(
					getMatchDetailsOptions(matchId).queryKey,
					context.previousMatch,
				);
			}
		},
		onSettled: () => {
			// Always refetch after error or success to ensure sync with server
			queryClient.invalidateQueries({
				queryKey: getMatchDetailsOptions(matchId).queryKey,
			});
		},
	});
};
