import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { campaignEventsQueryOptions } from "~/api/events";
import { EditEventSheet } from "~/components/events/edit-event-sheet";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export const Route = createFileRoute("/$campaignId/events/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		context.queryClient.ensureQueryData(
			campaignEventsQueryOptions(params.campaignId),
		);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const { data, isLoading } = useQuery(campaignEventsQueryOptions(campaignId));
	const [editingEvent, setEditingEvent] = useState<
		NonNullable<typeof data>[number] | null
	>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const handleEditClick = (event: NonNullable<typeof data>[number]) => {
		setEditingEvent(event);
		setIsSheetOpen(true);
	};

	const handleSheetClose = () => {
		setIsSheetOpen(false);
		setTimeout(() => setEditingEvent(null), 300); // Wait for animation
	};

	if (isLoading) {
		return <div className="p-6">Loading events...</div>;
	}

	if (!data || data.length === 0) {
		return (
			<div className="p-6">
				<p className="text-muted-foreground">
					No events found for this campaign.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Campaign Events</h1>
			<Card>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Type</TableHead>
								<TableHead>Warrior</TableHead>
								<TableHead>Defender</TableHead>
								<TableHead>Match</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Injury Type</TableHead>
								<TableHead>Death</TableHead>
								<TableHead>Injury</TableHead>
								<TableHead>Timestamp</TableHead>
								<TableHead className="w-[50px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((event) => (
								<TableRow key={event.id}>
									<TableCell className="capitalize">
										{event.type.replace("_", " ")}
									</TableCell>
									<TableCell>{event.warrior?.name || "Unknown"}</TableCell>
									<TableCell>{event.defender?.name || "-"}</TableCell>
									<TableCell>
										{event.match?.name || `Match ${event.matchId}`}
									</TableCell>
									<TableCell>{event.description || "-"}</TableCell>
									<TableCell>
										{event.resolved ? (
											<span className="text-green-600">Resolved</span>
										) : (
											<span className="text-yellow-600">Pending</span>
										)}
									</TableCell>
									<TableCell className="capitalize">
										{event.injuryType?.replace(/_/g, " ") || "-"}
									</TableCell>
									<TableCell>{event.death ? "Yes" : "-"}</TableCell>
									<TableCell>{event.injury ? "Yes" : "-"}</TableCell>
									<TableCell>
										{new Date(event.timestamp).toLocaleString()}
									</TableCell>
									<TableCell>
										<Button
											size="icon-sm"
											variant="ghost"
											onClick={() => handleEditClick(event)}
										>
											<PencilIcon />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<EditEventSheet
				event={editingEvent}
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				onSuccess={handleSheetClose}
			/>
		</div>
	);
}
