import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getWarriorsByCampaignOptions } from "~/api/warriors";
import { WarriorTable } from "~/components/warriors/warrior-table";

export const Route = createFileRoute("/$campaignId/warriors/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getWarriorsByCampaignOptions(params.campaignId),
		)
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const {
		data: warriors,
		isPending,
		isError,
	} = useQuery(getWarriorsByCampaignOptions(campaignId));

	if (isPending) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error</div>;
	}

	return <WarriorTable warriors={warriors} />;
}
