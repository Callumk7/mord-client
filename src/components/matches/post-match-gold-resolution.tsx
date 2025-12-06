import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { getMatchDetailsOptions } from "~/api/matches";
import { addGoldToWarbandMutation } from "~/api/warbands";
import type { Warband } from "~/db/schema";
import { parseNumber } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PostMatchGoldResolutionProps {
	matchId: number;
}

export function PostMatchGoldResolution({
	matchId,
}: PostMatchGoldResolutionProps) {
	const {
		data: match,
		isPending,
		isError,
	} = useQuery(getMatchDetailsOptions(matchId));

	if (isPending) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error</div>;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Post-Match Gold Resolution</CardTitle>
				<CardDescription>Handle updating gold from the match</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{match.participants.map((p) => (
						<GoldCard
							key={p.warband.id}
							warband={p.warband}
							matchId={matchId}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface GoldCardProps {
	warband: Warband;
	matchId: number;
}
function GoldCard({ warband, matchId }: GoldCardProps) {
	const queryClient = useQueryClient();
	const { data: match } = useQuery(getMatchDetailsOptions(matchId));
	const goldMutation = useMutation(addGoldToWarbandMutation);

	const [goldValue, setGoldValue] = useState("");
	const [error, setError] = useState<string | null>(null);

	const id = useId();

	const handleUpdateGold = (warbandId: number, gold: number) => {
		goldMutation.mutate(
			{
				warbandId,
				matchId,
				gold,
				description: `Gold gained from ${match?.name || matchId}`,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: getMatchDetailsOptions(matchId).queryKey,
					});
					setGoldValue("");
					setError(null);
				},
			},
		);
	};

	const handleAddClick = () => {
		const parsed = parseNumber(goldValue);
		if (parsed === null) {
			setError("Invalid gold value");
		} else {
			setError(null);
			handleUpdateGold(warband.id, parsed);
		}
	};

	return (
		<Card>
			<CardContent>
				<div className="flex items-center justify-between">
					<p className="text-lg font-bold">{warband.name}</p>
					<p>
						<strong>Current Gold:</strong> {warband.treasury}
					</p>
					<div className="flex flex-col gap-2">
						<div className="space-y-1">
							<Label htmlFor={id}>Gold Gain</Label>
							<Input
								id={id}
								value={goldValue}
								onChange={(e) => setGoldValue(e.currentTarget.value)}
							/>
							{error && <Badge variant="destructive">{error}</Badge>}
						</div>
						<Button onClick={handleAddClick}>Add</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
