import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addParticipantsFn, matchKeys } from "~/api/matches";
import { campaignWarbandsQueryOptions } from "~/api/warbands";
import { Button } from "../ui/button";

interface AddParticipantsFormProps {
	matchId: number;
	campaignId: number;
	onSuccess?: () => void;
	onBack?: () => void;
}

export function AddParticipantsForm({
	matchId,
	campaignId,
	onSuccess,
	onBack,
}: AddParticipantsFormProps) {
	const [selectedWarbandIds, setSelectedWarbandIds] = useState<number[]>([]);
	const queryClient = useQueryClient();

	const { data: warbandsData, isLoading } = useQuery(
		campaignWarbandsQueryOptions(campaignId),
	);

	const mutation = useMutation({
		mutationFn: addParticipantsFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: matchKeys.list(campaignId),
			});
			onSuccess?.();
		},
	});

	const toggleWarband = (warbandId: number) => {
		setSelectedWarbandIds((prev) => {
			if (prev.includes(warbandId)) {
				return prev.filter((id) => id !== warbandId);
			}
			return [...prev, warbandId];
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (selectedWarbandIds.length < 2) {
			alert("Please select at least 2 participants");
			return;
		}

		mutation.mutate({
			data: {
				matchId,
				warbandIds: selectedWarbandIds,
			},
		});
	};

	if (isLoading) {
		return <div className="p-4 text-center">Loading warbands...</div>;
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<p className="text-sm text-muted-foreground mb-4">
					Select warbands that participated in this match.
				</p>

				<div className="space-y-2">
					{warbandsData?.map((warband) => (
						<label
							key={warband.id}
							className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
							style={{
								backgroundColor: selectedWarbandIds.includes(warband.id)
									? "hsl(var(--accent))"
									: undefined,
							}}
						>
							<input
								type="checkbox"
								checked={selectedWarbandIds.includes(warband.id)}
								onChange={() => toggleWarband(warband.id)}
								className="h-4 w-4"
							/>
							<div className="flex-1">
								<p className="font-medium">{warband.name}</p>
								<p className="text-xs text-muted-foreground">
									{warband.faction}
								</p>
							</div>
						</label>
					))}
				</div>

				{selectedWarbandIds.length > 0 && (
					<p className="text-sm text-muted-foreground mt-3">
						Selected: {selectedWarbandIds.length} warband(s)
					</p>
				)}
			</div>

			{mutation.isError && (
				<div className="text-sm text-red-500">
					Error adding participants. Please try again.
				</div>
			)}

			<div className="flex justify-between gap-2">
				{onBack && (
					<Button type="button" variant="outline" onClick={onBack}>
						Back
					</Button>
				)}
				<div className="flex gap-2 ml-auto">
					<Button
						type="submit"
						disabled={mutation.isPending || selectedWarbandIds.length < 2}
					>
						{mutation.isPending ? "Adding..." : "Add Participants"}
					</Button>
				</div>
			</div>
		</form>
	);
}
