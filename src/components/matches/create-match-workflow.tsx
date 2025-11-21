import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import type { Match } from "~/db/schema";
import { AddParticipantsForm } from "./add-participants-form";
import { CreateMatchForm } from "./create-match-form";

interface CreateMatchWorkflowProps {
	campaignId: number;
}

export function CreateMatchWorkflow({ campaignId }: CreateMatchWorkflowProps) {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<1 | 2>(1);
	const [createdMatch, setCreatedMatch] = useState<Match | null>(null);

	const handleMatchCreated = (match: Match) => {
		setCreatedMatch(match);
		setStep(2);
	};

	const handleParticipantsAdded = () => {
		// Close the dialog and reset
		setOpen(false);
		setStep(1);
		setCreatedMatch(null);
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		// Reset state when closing
		if (!newOpen) {
			setStep(1);
			setCreatedMatch(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger render={<Button />}>Log Match</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{step === 1 ? "Create Match" : "Add Participants"}
					</DialogTitle>
					<DialogDescription>
						{step === 1
							? "Step 1 of 2: Enter match details"
							: "Step 2 of 2: Select which warbands participated"}
					</DialogDescription>
				</DialogHeader>

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
							matchType={createdMatch.matchType}
							onSuccess={handleParticipantsAdded}
							onBack={() => setStep(1)}
						/>
					)
				)}
			</DialogContent>
		</Dialog>
	);
}
