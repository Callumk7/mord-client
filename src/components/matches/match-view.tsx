import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, sql } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { EventsList } from "~/components/events/display/events-list";
import { MatchEndedCard } from "~/components/matches/match-ended-card";
import { Link } from "~/components/ui/link";
import { db } from "~/db";
import type { EventWithParticipants, Warband } from "~/db/schema";
import { warriors } from "~/db/schema";
import { useUpdateMatchMutation } from "~/hooks/mutations/matches";
import { formatDate } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const updateMatchCountFn = createServerFn({ method: "POST" })
	.inputValidator((data: { participants: number[] }) => data)
	.handler(async ({ data }) => {
		const { participants } = data;

		// Update games played for all alive warriors in the participating warbands
		await db
			.update(warriors)
			.set({
				gamesPlayed: sql`${warriors.gamesPlayed} + 1`,
				updatedAt: new Date(),
			})
			.where(
				and(
					inArray(warriors.warbandId, participants),
					eq(warriors.isAlive, true),
				),
			);
	});

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
	const updateMatchCountMutation = useMutation({
		mutationFn: updateMatchCountFn,
	});

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

	const handleMatchEnded = () => {
		handleStatusChange("ended");
		updateMatchCountMutation.mutateAsync(
			{
				data: {
					participants: participants.map((p) => p.warband.id),
				},
			},
			{
				onSuccess: () => {
					console.log("Updated matches played count");
				},
			},
		);
	};

	return (
		<div className="space-y-5">
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
					{matchStatus === "scheduled" ? (
						<Button size="sm" onClick={() => handleStatusChange("active")}>
							Start Match
						</Button>
					) : matchStatus === "active" ? (
						<Badge variant="outline">Active</Badge>
					) : (
						<Badge variant="outline">Ended</Badge>
					)}
				</div>
			</div>

			{/* Events List */}
			<EventsList events={events} campaignId={campaignId} matchId={matchId} />

			{matchStatus === "active" && (
				<Button variant={"destructive"} onClick={handleMatchEnded}>
					End Match
				</Button>
			)}

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
		</div>
	);
}
