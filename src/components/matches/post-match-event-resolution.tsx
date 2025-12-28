import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys, updateEventFn } from "~/api/events";
import { matchKeys } from "~/api/matches";
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
import { ResolveEventForm } from "../events/resolve-event-form";
import { ResolveHenchmanEventForm } from "../events/resolve-henchman-event-form";

interface PostMatchEventResolutionProps {
	events: EventWithParticipants[];
	matchId: number;
	campaignId: number;
}

export function PostMatchEventResolution({
	events,
	matchId,
	campaignId,
}: PostMatchEventResolutionProps) {
	const unresolvedCount = events.filter((e) => !e.resolved).length;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Event Resolution</CardTitle>
						<CardDescription>
							Resolve knock downs and mark moments as complete
						</CardDescription>
					</div>
					{unresolvedCount > 0 && (
						<Badge variant="destructive">{unresolvedCount} Unresolved</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{events.length > 0 ? (
					<div className="space-y-2">
						{events.map((event) => (
							<EventResolutionItem
								key={event.id}
								event={event}
								matchId={matchId}
								campaignId={campaignId}
							/>
						))}
					</div>
				) : (
					<div className="p-8 text-center text-muted-foreground">
						<p>No events recorded for this match.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

interface EventResolutionItemProps {
	event: EventWithParticipants;
	matchId: number;
	campaignId: number;
}

function EventResolutionItem({
	event,
	matchId,
	campaignId,
}: EventResolutionItemProps) {
	const queryClient = useQueryClient();

	const markResolvedMutation = useMutation({
		mutationFn: updateEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: matchKeys.detail(matchId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.listByCampaign(campaignId),
			});
		},
	});

	const handleMarkMomentResolved = () => {
		markResolvedMutation.mutate({
			data: {
				eventId: event.id,
				resolved: true,
			},
		});
	};

	const isKnockDown = event.type === "knock_down";
	const isMoment = event.type === "moment";
	const isHenchman = event.defender?.type === "henchman";

	return (
		<div
			key={event.id}
			className="p-3 bg-muted rounded-lg border-l-4 border-primary"
		>
			<div className="flex items-start justify-between gap-4">
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
						{isHenchman && (
							<Badge variant="outline" className="text-xs">
								Henchman
							</Badge>
						)}
					</div>
					{event.description && (
						<p className="text-sm text-muted-foreground mt-1">
							{event.description}
						</p>
					)}
					{event.resolved && event.injuryType && (
						<div className="mt-2">
							<Badge variant="outline" className="capitalize">
								{event.injuryType.replace(/_/g, " ")}
							</Badge>
						</div>
					)}
					{event.resolved && isHenchman && (
						<div className="mt-2">
							<Badge variant={event.death ? "destructive" : "outline"}>
								{event.death ? "Dead" : "Survived"}
							</Badge>
						</div>
					)}
				</div>
				<div className="flex justify-end items-end flex-col gap-1">
					<p className="text-xs text-muted-foreground whitespace-nowrap">
						{new Date(event.timestamp).toLocaleTimeString()}
					</p>
					{event.resolved ? (
						<Badge variant="success">Resolved</Badge>
					) : isKnockDown ? (
						<Dialog>
							<DialogTrigger render={<Button size="sm" variant="outline" />}>
								{isHenchman ? "Resolve" : "Resolve Injury"}
							</DialogTrigger>
							<DialogContent>
								{isHenchman ? (
									<ResolveHenchmanEventForm event={event} />
								) : (
									<ResolveEventForm event={event} />
								)}
							</DialogContent>
						</Dialog>
					) : isMoment ? (
						<Button
							size="sm"
							variant="outline"
							onClick={handleMarkMomentResolved}
							disabled={markResolvedMutation.isPending}
						>
							{markResolvedMutation.isPending ? "Marking..." : "Mark Resolved"}
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}
