import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AddParticipantsForm } from "~/components/matches/add-participants-form";
import { CreateMatchForm } from "~/components/matches/create-match-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import type { Match } from "~/db/schema";

export const Route = createFileRoute("/$campaignId/matches/new")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	const [step, setStep] = useState<1 | 2>(1);
	const [createdMatch, setCreatedMatch] = useState<Match | null>(null);

	const handleMatchCreated = (match: Match) => {
		setCreatedMatch(match);
		setStep(2);
	};

	const navigate = Route.useNavigate();
	const handleParticipantsAdded = () => {
		if (createdMatch) {
			navigate({
				to: "/$campaignId/matches/$matchId",
				params: { campaignId, matchId: createdMatch.id },
			});
		} else {
			toast.error("Failed to add participants to match");
		}
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Create a new Match</CardTitle>
				<CardDescription>
					Complete these steps to setup a new game in the campaign
				</CardDescription>
			</CardHeader>
			<CardContent>
				{step === 1 ? (
					<CreateMatchForm
						campaignId={campaignId}
						onSuccess={handleMatchCreated}
					/>
				) : (
					createdMatch && (
						<AddParticipantsForm
							matchId={createdMatch.id}
							campaignId={campaignId}
							onSuccess={handleParticipantsAdded}
							onBack={() => setStep(1)}
						/>
					)
				)}
			</CardContent>
		</Card>
	);
}
