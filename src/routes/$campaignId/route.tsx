import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "~/components/header";

export const Route = createFileRoute("/$campaignId")({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			campaignId: Number(params.campaignId),
		}),
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
