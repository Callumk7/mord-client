import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/$campaignId/warbands/$warbandId/warriors/$warriorId",
)({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			warbandId: Number(params.warbandId),
			warriorId: Number(params.warriorId),
		}),
		stringify: (params) => ({
			warbandId: String(params.warbandId),
			warriorId: String(params.warriorId),
		}),
	},
});

function RouteComponent() {
	return (
		<div>Hello "/$campaignId/warbands/$warbandId/warriors/$warriorId"!</div>
	);
}
