import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getCampaignMatchesOptions } from "~/api/matches";
import { campaignWarbandsQueryOptions } from "~/api/warbands";
import { Header } from "~/components/header";

export const Route = createFileRoute("/$campaignId")({
	component: RouteComponent,
	params: {
		parse: (params) => {
			const parsed = Number(params.campaignId);

			// Reject non-numeric campaign IDs (like dev tool files)
			if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
				throw new Error(`Invalid campaign ID: ${params.campaignId}`);
			}

			return {
				campaignId: parsed,
			};
		},
		stringify: (params) => ({
			campaignId: String(params.campaignId),
		}),
	},
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				campaignWarbandsQueryOptions(params.campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignMatchesOptions(params.campaignId),
			),
		]);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	return (
		<div className="min-h-screen bg-background">
			<Header campaignId={campaignId} />
			<div className="container mx-auto mt-18">
				<Outlet />
			</div>
		</div>
	);
}
