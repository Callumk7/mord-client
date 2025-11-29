import { useMemo } from "react";
import type { Warband } from "~/db/schema";
import { TimelineMatchGroup } from "./timeline-match-group";

interface EventWithParticipants {
	id: number;
	type: string;
	description: string | null;
	warriorId: number;
	defenderId: number | null;
	resolved: boolean;
	injuryType: string | null;
	death: boolean;
	injury: boolean;
	timestamp: Date;
	matchId: number;
	warrior: {
		id: number;
		name: string;
		warbandId: number;
	};
	defender: {
		id: number;
		name: string;
		warbandId: number;
	} | null;
}

interface CampaignMatch {
	id: number;
	name: string;
	date: Date;
	participants: Array<{
		warband: {
			id: number;
			name: string;
		};
	}>;
}

interface TimelineViewProps {
	events: EventWithParticipants[];
	matches: CampaignMatch[];
	warbands: Warband[];
	campaignId: number;
}

export function TimelineView({ events, matches, warbands }: TimelineViewProps) {
	// Group events by matchId
	const eventsByMatch = useMemo(() => {
		return events.reduce(
			(acc, event) => {
				if (!acc[event.matchId]) acc[event.matchId] = [];
				acc[event.matchId].push(event);
				return acc;
			},
			{} as Record<number, EventWithParticipants[]>,
		);
	}, [events]);

	// Create warband lookup
	const warbandMap = useMemo(() => {
		return new Map(warbands.map((wb) => [wb.id, wb]));
	}, [warbands]);

	// Sort matches by date (newest first)
	const sortedMatches = useMemo(() => {
		return [...matches].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	}, [matches]);

	// For each match, sort its events by timestamp (newest first)
	const sortedEventsByMatch = useMemo(() => {
		return Object.entries(eventsByMatch).reduce(
			(acc, [matchId, matchEvents]) => {
				acc[Number(matchId)] = [...matchEvents].sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				);
				return acc;
			},
			{} as Record<number, EventWithParticipants[]>,
		);
	}, [eventsByMatch]);

	// Empty state
	if (matches.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					No matches found for this campaign.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{sortedMatches.map((match) => (
				<TimelineMatchGroup
					key={match.id}
					match={match}
					events={sortedEventsByMatch[match.id] || []}
					warbandMap={warbandMap}
				/>
			))}
		</div>
	);
}
