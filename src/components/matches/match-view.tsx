import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRef } from "react";
import { getMatchDetailsOptions, updateMatchFn } from "~/api/matches";
import { EventsList } from "~/components/events/display/events-list";
import { MatchEndedCard } from "~/components/matches/match-ended-card";
import { Link } from "~/components/ui/link";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { EventWithParticipants, Warband } from "~/db/schema";
import { formatDate } from "~/lib/utils";
import { CreateEventForm } from "../events/create-event-form";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useUpdateMatchMutation } from "~/hooks/mutations/matches";

// Helper Functions
const getMatchTypeLabel = (matchType: string) => {
	if (matchType === "battle_royale") {
		return "Battle Royale";
	}
	return matchType.toUpperCase();
};

interface MatchViewProps {
	campaignId: number;
	matchId: number;
	matchName: string;
	matchDate: Date;
	matchType: "1v1" | "multiplayer";
	matchStatus: string;
	events: EventWithParticipants[];
	participants: {
		id: number;
		warband: Warband;
	}[];
	winners: {
		id: number;
		warband: Warband;
	}[];
}

export function MatchView({
	campaignId,
	matchId,
	matchName,
	matchDate,
	matchType,
	matchStatus,
	events,
	participants,
	winners,
}: MatchViewProps) {
	const updateMatchMutation = useUpdateMatchMutation(matchId);

	const handleStatusChange = (newStatus: string | null) => {
		if (newStatus && newStatus !== matchStatus) {
			updateMatchMutation.mutate({
				data: {
					matchId,
					status: newStatus as "active" | "ended" | "scheduled",
				},
			});
		}
	};

	const dialogRef = useRef<HTMLDivElement>(null);

	return (
		<>
			{/* Match Header */}
			<div className="flex items-center gap-4">
				<Link to="/$campaignId/matches" params={{ campaignId }}>
					<ArrowLeft className="h-4 w-4" />
				</Link>
				<div className="flex-1">
					<h2 className="text-2xl font-bold text-foreground">{matchName}</h2>
					<p className="text-sm text-muted-foreground">
						{formatDate(matchDate)}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm px-3 py-1 bg-primary/20 text-primary rounded">
						{getMatchTypeLabel(matchType)}
					</span>
					<Dialog>
						<DialogTrigger render={<Button size="sm" />}>
							Add Event
						</DialogTrigger>
						<DialogContent ref={dialogRef}>
							<CreateEventForm
								portalContainer={dialogRef}
								campaignId={campaignId}
								matchId={matchId}
							/>
						</DialogContent>
					</Dialog>
					<Select value={matchStatus} onValueChange={handleStatusChange}>
						<SelectTrigger size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectPositioner>
							<SelectContent>
								<SelectItem value="scheduled">Scheduled</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="ended">Ended</SelectItem>
							</SelectContent>
						</SelectPositioner>
					</Select>
				</div>
			</div>

			{/* Events List */}
			<EventsList events={events} />

			{/* Match Results - Only show when match is ended */}
			{matchStatus === "ended" && (
				<MatchEndedCard
					campaignId={campaignId}
					matchId={matchId}
					matchType={matchType}
					participants={participants}
					winners={winners}
				/>
			)}
		</>
	);
}
