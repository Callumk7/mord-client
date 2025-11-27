import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCampaignMatchesOptions } from "~/api/matches";
import { MatchCard } from "~/components/matches/match-card";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/$campaignId/matches/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { campaignId } = params;
		context.queryClient.ensureQueryData(getCampaignMatchesOptions(campaignId));
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	const { data: matches, isLoading } = useQuery(
		getCampaignMatchesOptions(campaignId),
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-foreground">Match Log</h2>
				<Link to="/$campaignId/matches/new" params={{ campaignId }}>
					Log Match
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Campaign Battles</CardTitle>
					<CardDescription>All matches from this campaign</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="p-4 text-center text-muted-foreground">
							Loading matches...
						</div>
					) : matches && matches.length > 0 ? (
						<div className="space-y-3">
							{matches.map((match) => (
								<MatchCard key={match.id} match={match} />
							))}
						</div>
					) : (
						<div className="p-8 text-center text-muted-foreground">
							<p>No matches recorded yet.</p>
							<p className="text-sm mt-2">
								Click "Log Match" to create your first match!
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
