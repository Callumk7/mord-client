import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMatchDetailsOptions } from "~/api/matches";
import { increaseExpereienceMutation } from "~/api/warbands";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import type { Warband } from "~/db/schema";
import { useId, useState } from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

interface PostMatchExperienceResolutionProps {
	matchId: number;
	campaignId: number;
}

export function PostMatchExperienceResolution({
	matchId,
}: PostMatchExperienceResolutionProps) {
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

	const participants = match.participants.map((p) => p.warband);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Post-Match Experience Resolution</CardTitle>
				<CardDescription>
					Handle updating experience from the match
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{participants.map((warband) => (
						<ExperienceCard
							key={warband.id}
							warband={warband}
							matchId={matchId}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface ExperienceCardProps {
	warband: Warband;
	matchId: number;
}
function ExperienceCard({ warband, matchId }: ExperienceCardProps) {
	const queryClient = useQueryClient();
	const experienceMutation = useMutation(increaseExpereienceMutation);

	const [experienceValue, setExperienceValue] = useState("");
	const [error, setError] = useState<string | null>(null);

	const id = useId();

	const handleUpdateExperience = (warbandId: number, experience: number) => {
		experienceMutation.mutate(
			{
				warbandId,
				experience,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: getMatchDetailsOptions(matchId).queryKey,
					});
					setExperienceValue("");
					setError(null);
				},
			},
		);
	};

	const handleAddClick = () => {
		const parsed = parseNumber(experienceValue);
		if (parsed === null) {
			setError("Invalid experience value");
		} else {
			setError(null);
			handleUpdateExperience(warband.id, parsed);
		}
	};

	return (
		<Card>
			<CardContent>
				<div className="flex items-center justify-between">
					<p className="text-lg font-bold">{warband.name}</p>
					<p>
						<strong>Current Exp:</strong> {warband.experience}
					</p>
					<div className="flex flex-col gap-2">
						<div className="space-y-1">
							<Label htmlFor={id}>Experience Gain</Label>
							<Input
								id={id}
								value={experienceValue}
								onChange={(e) => setExperienceValue(e.currentTarget.value)}
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

function parseNumber(value: string) {
	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return null;
	}
	const number = Number(trimmedValue);
	if (Number.isNaN(number)) {
		return null;
	}
	return number;
}
