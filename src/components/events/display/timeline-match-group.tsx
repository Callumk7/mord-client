import { Swords } from "lucide-react";
import type { Warband } from "~/db/schema";
import { formatTimeAgo } from "~/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../ui/card";
import { TimelineEventItem } from "./timeline-event-item";

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

interface TimelineMatchGroupProps {
	match: CampaignMatch;
	events: EventWithParticipants[];
	warbandMap: Map<number, Warband>;
}

export function TimelineMatchGroup({
	match,
	events,
	warbandMap,
}: TimelineMatchGroupProps) {
	return (
		<Card className="relative">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Swords className="h-5 w-5 text-muted-foreground" />
						<CardTitle>{match.name}</CardTitle>
					</div>
					<span className="text-sm text-muted-foreground">
						{formatTimeAgo(match.date)}
					</span>
				</div>
				<CardDescription>
					{match.participants.map((p, index) => (
						<span key={p.warband.id}>
							{index > 0 && " vs "}
							{p.warband.name}
						</span>
					))}
				</CardDescription>
			</CardHeader>

			<CardContent>
				{events.length > 0 ? (
					<div className="space-y-3 border-l-2 border-muted pl-4 ml-2">
						{events.map((event) => (
							<TimelineEventItem
								key={event.id}
								event={event}
								warbandMap={warbandMap}
							/>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground text-center py-4">
						No events recorded for this match
					</p>
				)}
			</CardContent>
		</Card>
	);
}
