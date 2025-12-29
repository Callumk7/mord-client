import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCampaignMatchesOptions } from "~/api/matches";
import { RecentResultsSlide } from "~/components/events/display/recent-results-slide";
import { useRecentMatchHighlights } from "~/hooks/use-broadcast-data";

export const Route = createFileRoute("/display/$campaignId/results")({
	loader: async ({ context, params }) => {
		const { campaignId } = params;
		await context.queryClient.ensureQueryData(
			getCampaignMatchesOptions(campaignId),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const { data: matches } = useSuspenseQuery(
		getCampaignMatchesOptions(campaignId),
	);
	const highlights = useRecentMatchHighlights(matches);

	return (
		<div className="flex h-screen w-full items-center justify-center bg-background p-8">
			<div className="h-full w-full max-w-6xl">
				<RecentResultsSlide highlights={highlights} />
			</div>
		</div>
	);
}
