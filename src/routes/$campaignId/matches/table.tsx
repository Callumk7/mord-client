import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$campaignId/matches/table")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/$campaignId/matches/table"!</div>;
}
