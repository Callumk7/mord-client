import { createFileRoute } from "@tanstack/react-router";
import { getMostGamesWon } from "~/api/campaign";

export const Route = createFileRoute("/$campaignId/admin")({
	component: RouteComponent,
	loader: async ({ params }) => {
		return getMostGamesWon({ data: { campaignId: Number(params.campaignId) } });
	},
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Campaign Admin</h1>

			<div className="bg-card rounded-lg border p-6">
				<h2 className="text-2xl font-semibold mb-4">
					Leaderboard - Most Games Won
				</h2>

				{data.length === 0 ? (
					<p className="text-muted-foreground">No match data available yet.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left p-3 font-semibold">Rank</th>
									<th className="text-left p-3 font-semibold">Warband</th>
									<th className="text-left p-3 font-semibold">Faction</th>
									<th className="text-right p-3 font-semibold">Wins</th>
									<th className="text-right p-3 font-semibold">Rating</th>
								</tr>
							</thead>
							<tbody>
								{data.map((entry, index) => (
									<tr
										key={entry.warbandId}
										className="border-b last:border-b-0 hover:bg-muted/50"
									>
										<td className="p-3 font-medium">{index + 1}</td>
										<td className="p-3">{entry.warband.name}</td>
										<td className="p-3 text-muted-foreground">
											{entry.warband.faction}
										</td>
										<td className="p-3 text-right font-semibold">
											{entry.wins}
										</td>
										<td className="p-3 text-right">{entry.warband.rating}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
