import { Skull, Sparkles, UserX } from "lucide-react";
import type { Warband } from "~/db/schema";
import { formatEventTime } from "~/lib/utils";
import { Badge } from "../../ui/badge";

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

interface TimelineEventItemProps {
	event: EventWithParticipants;
	warbandMap: Map<number, Warband>;
}

function getEventIcon(event: EventWithParticipants) {
	if (event.death) return <Skull className="h-4 w-4 text-destructive" />;
	if (event.type === "knock_down") return <UserX className="h-4 w-4" />;
	if (event.type === "moment") return <Sparkles className="h-4 w-4" />;
	return null;
}

function renderStatusBadge(event: EventWithParticipants) {
	if (event.death) {
		return <Badge variant="destructive">Death</Badge>;
	}
	if (event.injury) {
		return <Badge variant="secondary">Injured</Badge>;
	}
	if (event.resolved) {
		return <Badge variant="default">Resolved</Badge>;
	}
	return <Badge variant="outline">Pending</Badge>;
}

function formatInjuryType(injuryType: string) {
	return injuryType.replace(/_/g, " ");
}

export function TimelineEventItem({
	event,
	warbandMap,
}: TimelineEventItemProps) {
	const warriorWarband = warbandMap.get(event.warrior.warbandId);
	const defenderWarband = event.defender
		? warbandMap.get(event.defender.warbandId)
		: null;

	return (
		<div className="group relative">
			{/* Timeline dot/marker */}
			<div className="absolute -left-[1.3rem] top-2 h-3 w-3 rounded-full bg-primary" />

			<div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
				<div className="flex-1 space-y-1">
					{/* Event type with icon */}
					<div className="flex items-center gap-2">
						{getEventIcon(event)}
						<span className="font-medium text-sm capitalize">
							{event.type.replace("_", " ")}
						</span>
					</div>

					{/* Warrior → Defender */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>{event.warrior.name}</span>
						{event.defender && (
							<>
								<span>→</span>
								<span>{event.defender.name}</span>
							</>
						)}
					</div>

					{/* Warband context */}
					<div className="flex items-center gap-2 text-xs">
						{warriorWarband && (
							<Badge variant="outline" className="text-xs">
								{warriorWarband.name}
							</Badge>
						)}
						{event.defender && defenderWarband && (
							<>
								<span className="text-muted-foreground">vs</span>
								<Badge variant="outline" className="text-xs">
									{defenderWarband.name}
								</Badge>
							</>
						)}
					</div>

					{/* Description if present */}
					{event.description && (
						<p className="text-sm text-muted-foreground italic">
							"{event.description}"
						</p>
					)}

					{/* Injury details if resolved */}
					{event.resolved && event.injuryType && (
						<div className="text-xs text-muted-foreground">
							Injury: {formatInjuryType(event.injuryType)}
						</div>
					)}
				</div>

				{/* Right column: time + status */}
				<div className="flex flex-col items-end gap-2">
					<span className="text-xs text-muted-foreground whitespace-nowrap">
						{formatEventTime(event.timestamp)}
					</span>
					{renderStatusBadge(event)}
				</div>
			</div>
		</div>
	);
}
