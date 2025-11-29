import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { campaignEventsQueryOptions } from "~/api/events";
import { getCampaignMatchesOptions } from "~/api/matches";
import { campaignWarbandsQueryOptions } from "~/api/warbands";
import { TimelineView } from "~/components/events/display/timeline-view";

export const Route = createFileRoute("/$campaignId/timeline/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		// Parallel data loading for performance
		await Promise.all([
			context.queryClient.ensureQueryData(
				campaignEventsQueryOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignMatchesOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				campaignWarbandsQueryOptions(params.campaignId),
			),
		]);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	const { data: events, isLoading: eventsLoading } = useQuery(
		campaignEventsQueryOptions(campaignId),
	);
	const { data: matches, isLoading: matchesLoading } = useQuery(
		getCampaignMatchesOptions(campaignId),
	);
	const { data: warbands, isLoading: warbandsLoading } = useQuery(
		campaignWarbandsQueryOptions(campaignId),
	);

	const isLoading = eventsLoading || matchesLoading || warbandsLoading;

	if (isLoading) {
		return <div className="p-6">Loading timeline...</div>;
	}

	if (!events || !matches || !warbands) {
		return (
			<div className="p-6">
				<p className="text-muted-foreground">Failed to load timeline data.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Campaign Timeline</h1>
			<TimelineView
				events={events}
				matches={matches}
				warbands={warbands}
				campaignId={campaignId}
			/>
		</div>
	);
}
