import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { useState } from "react";
import z from "zod";
import { db } from "~/db";
import { matchParticipants, warbands } from "~/db/schema";
import { Button } from "../ui/button";

const addParticipantsSchema = z.object({
	matchId: z.number(),
	warbandIds: z.array(z.number()).min(2, "At least 2 participants required"),
});

export const getWarbandsFn = createServerFn({ method: "GET" })
	.inputValidator(z.object({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		return db
			.select()
			.from(warbands)
			.where(eq(warbands.campaignId, data.campaignId));
	});

export const addParticipantsFn = createServerFn({ method: "POST" })
	.inputValidator(addParticipantsSchema)
	.handler(async ({ data }) => {
		const participants = data.warbandIds.map((warbandId) => ({
			matchId: data.matchId,
			warbandId,
		}));

		await db.insert(matchParticipants).values(participants);

		return { success: true };
	});

interface AddParticipantsFormProps {
	matchId: number;
	campaignId: number;
	matchType: "1v1" | "2v2" | "2v1" | "3v3" | "battle_royale";
	onSuccess?: () => void;
	onBack?: () => void;
}

export function AddParticipantsForm({
	matchId,
	campaignId,
	matchType,
	onSuccess,
	onBack,
}: AddParticipantsFormProps) {
	const [selectedWarbandIds, setSelectedWarbandIds] = useState<number[]>([]);
	const queryClient = useQueryClient();

	const { data: warbandsData, isLoading } = useQuery({
		queryKey: ["warbands", campaignId],
		queryFn: () => getWarbandsFn({ data: { campaignId } }),
	});

	const mutation = useMutation({
		mutationFn: addParticipantsFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["matches", campaignId],
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

	const getExpectedParticipants = () => {
		switch (matchType) {
			case "1v1":
				return 2;
			case "2v2":
				return 4;
			case "2v1":
				return 3;
			case "3v3":
				return 6;
			case "battle_royale":
				return "2+";
			default:
				return "2+";
		}
	};

	if (isLoading) {
		return <div className="p-4 text-center">Loading warbands...</div>;
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<p className="text-sm text-muted-foreground mb-4">
					Select warbands that participated in this match. Expected participants
					for {matchType}: {getExpectedParticipants()}
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
