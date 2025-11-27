import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getMatchDetailsOptions } from "~/api/matches";
import { MatchView } from "~/components/matches/match-view";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/$campaignId/matches/$matchId/")({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			matchId: Number(params.matchId),
		}),
		stringify: (params) => ({
			matchId: String(params.matchId),
		}),
	},
	loader: async ({ context, params }) => {
		const { matchId } = params;
		context.queryClient.ensureQueryData(getMatchDetailsOptions(matchId));
	},
});

function RouteComponent() {
	const { campaignId, matchId } = Route.useParams();

	const { data: match, isLoading } = useQuery(getMatchDetailsOptions(matchId));

	if (isLoading) {
		return <MatchLoading campaignId={campaignId} />;
	}

	if (!match) {
		return <MatchNotFound campaignId={campaignId} />;
	}

	return (
		<MatchView
			campaignId={campaignId}
			matchId={match.id}
			matchName={match.name}
			matchDate={match.date}
			matchType={match.matchType}
			matchStatus={match.status}
			events={match.events}
			participants={match.participants}
			winners={match.winners}
		/>
	);
}

function MatchLoading({ campaignId }: { campaignId: number }) {
	return (
		<div className="flex items-center gap-4">
			<Link to="/$campaignId/matches" params={{ campaignId }}>
				<ArrowLeft className="h-4 w-4" />
			</Link>
			<h2 className="text-2xl font-bold text-foreground">Loading...</h2>
		</div>
	);
}

function MatchNotFound({ campaignId }: { campaignId: number }) {
	return (
		<div className="flex items-center gap-4">
			<Link to="/$campaignId/matches" params={{ campaignId }}>
				<ArrowLeft className="h-4 w-4" />
			</Link>
			<h2 className="text-2xl font-bold text-foreground">Match not found</h2>
		</div>
	);
}
