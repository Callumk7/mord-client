import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getMatchDetailsOptions, setMatchWinnersFn } from "~/api/matches";
import { Button } from "~/components/ui/button";
import { Card, CardFooter } from "~/components/ui/card";
import type { Warband } from "~/db/schema";
import { Link } from "../ui/link";

interface MatchEndedCardProps {
	campaignId: number;
	matchId: number;
	participants: {
		id: number;
		warband: Warband;
	}[];
	winners: {
		id: number;
		warband: Warband;
	}[];
}

export function MatchEndedCard({
	campaignId,
	matchId,
	participants,
	winners,
}: MatchEndedCardProps) {
	const queryClient = useQueryClient();
	const [selectedWinners, setSelectedWinners] = useState<number[]>(
		winners.map((w) => w.warband.id),
	);

	const setWinnersMutation = useMutation({
		mutationFn: setMatchWinnersFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getMatchDetailsOptions(matchId).queryKey,
			});
		},
	});

	const toggleWinner = (warbandId: number) => {
		setSelectedWinners((prev) => {
			if (prev.includes(warbandId)) {
				return prev.filter((id) => id !== warbandId);
			}
			return [...prev, warbandId];
		});
	};

	const handleSave = () => {
		if (selectedWinners.length === 0) {
			return;
		}

		setWinnersMutation.mutate({
			data: {
				matchId,
				warbandIds: selectedWinners,
			},
		});
	};

	const hasChanges =
		JSON.stringify([...selectedWinners].sort()) !==
		JSON.stringify([...winners.map((w) => w.warband.id)].sort());

	return (
		<Card className="p-6">
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold text-foreground">
						Match Results
					</h3>
					<p className="text-sm text-muted-foreground">
						Select the winning warband(s)
					</p>
				</div>

				<div className="grid gap-2">
					{participants.map((participant) => {
						const isSelected = selectedWinners.includes(participant.warband.id);
						return (
							<button
								key={participant.id}
								type="button"
								onClick={() => toggleWinner(participant.warband.id)}
								className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
									isSelected
										? "bg-primary/10 border-primary text-primary"
										: "bg-card border-border hover:bg-muted"
								}`}
							>
								<span className="font-medium">{participant.warband.name}</span>
								{isSelected && (
									<span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded">
										Winner
									</span>
								)}
							</button>
						);
					})}
				</div>

				{hasChanges && (
					<div className="flex gap-2">
						<Button
							onClick={handleSave}
							disabled={
								selectedWinners.length === 0 || setWinnersMutation.isPending
							}
						>
							{setWinnersMutation.isPending ? "Saving..." : "Save Winners"}
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								setSelectedWinners(winners.map((w) => w.warband.id))
							}
						>
							Cancel
						</Button>
					</div>
				)}
			</div>
			<CardFooter>
				<Link
					variant="secondary"
					to="/$campaignId/matches/$matchId/post"
					params={{ campaignId, matchId }}
				>
					Post Match
				</Link>
			</CardFooter>
		</Card>
	);
}
