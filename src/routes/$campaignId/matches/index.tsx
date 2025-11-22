import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CreateMatchWorkflow } from "~/components/matches/create-match-workflow";
import { MatchCard } from "~/components/matches/match-card";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { campaignMatchesQueryOptions } from "~/query/options";

export const Route = createFileRoute("/$campaignId/matches/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	const { data: matches, isLoading } = useQuery(
		campaignMatchesQueryOptions(campaignId),
	);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-foreground">Match Log</h2>
				<CreateMatchWorkflow campaignId={Number(campaignId)} />
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
