import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import type { EventWithParticipants } from "~/db/schema";
import { CreateEventForm } from "../create-event-form";
import { useRef } from "react";

interface EventsListProps {
	events: EventWithParticipants[];
	campaignId: number;
	matchId: number;
}

export function EventsList({ events, campaignId, matchId }: EventsListProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Notable Events</CardTitle>
						<CardDescription>
							Memorable moments and knock downs during the match
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
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
					{events.length > 0 ? (
						<div className="space-y-2">
							{events.map((event) => (
								<EventListItem key={event.id} event={event} />
							))}
						</div>
					) : (
						<div className="p-8 text-center text-muted-foreground">
							<p>No events recorded yet.</p>
							<p className="text-sm mt-2">
								Click "Add Event" to record knock downs or memorable moments!
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface EventListItemProps {
	event: EventWithParticipants;
}

function EventListItem({ event }: EventListItemProps) {
	return (
		<div
			key={event.id}
			className="p-3 bg-muted rounded-lg border-l-4 border-primary"
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<p className="text-sm font-medium capitalize">
							{event.type.replace("_", " ")}
						</p>
						{event.warrior && (
							<span className="text-xs text-muted-foreground">
								by {event.warrior.name}
							</span>
						)}
						{event.defender && (
							<span className="text-xs text-muted-foreground">
								→ {event.defender.name}
							</span>
						)}
					</div>
					{event.description && (
						<p className="text-sm text-muted-foreground mt-1">
							{event.description}
						</p>
					)}
				</div>
				<div className="flex justify-end items-end flex-col gap-1">
					<p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
						{new Date(event.timestamp).toLocaleTimeString()}
					</p>
					{event.resolved ? (
						<Badge variant={"success"}>Resolved</Badge>
					) : (
						<Badge variant={"outline"}>Unresolved</Badge>
					)}
				</div>
			</div>
		</div>
	);
}
