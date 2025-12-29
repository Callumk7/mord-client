import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/display/$campaignId")({
	params: {
		parse: (params) => {
			const parsed = Number(params.campaignId);
			if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
				throw new Error(`Invalid campaign ID: ${params.campaignId}`);
			}
			return { campaignId: parsed };
		},
		stringify: (params) => ({
			campaignId: String(params.campaignId),
		}),
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
