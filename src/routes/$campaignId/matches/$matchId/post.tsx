import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { getMatchDetailsOptions, getMatchWarbandsOptions } from "~/api/matches";
import { PostMatchEventResolution } from "~/components/matches/post-match-event-resolution";
import { Button } from "~/components/ui/button";
import { Link } from "~/components/ui/link";
import { Spinner } from "~/components/ui/spinner";

export const Route = createFileRoute("/$campaignId/matches/$matchId/post")({
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
		await Promise.all([
			context.queryClient.ensureQueryData(getMatchDetailsOptions(matchId)),
			context.queryClient.ensureQueryData(getMatchWarbandsOptions(matchId)),
		]);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const campaignId = params.campaignId;
	const matchId = params.matchId;

	const [step, _setStep] = useState(0);

	const { data: match, isLoading: isLoadingMatch } = useQuery(
		getMatchDetailsOptions(matchId),
	);
	const { data: warbands, isLoading: isLoadingWarbands } = useQuery(
		getMatchWarbandsOptions(matchId),
	);

	const isLoading = isLoadingMatch || isLoadingWarbands;

	if (isLoading) {
		return <LoadingPostMatch campaignId={campaignId} matchId={matchId} />;
	}

	if (!match || !warbands) {
		return <NotFoundPostMatch campaignId={campaignId} matchId={matchId} />;
	}

	return (
		<div className="space-y-6">
			{step === 0 ? (
				<PostMatchEventResolution
					events={match.events}
					matchId={match.id}
					campaignId={campaignId}
				/>
			) : (
				<div>Done</div>
			)}
		</div>
	);
}

interface StatusProps {
	campaignId: number;
	matchId: number;
}
function LoadingPostMatch({ campaignId, matchId }: StatusProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<Link
					to="/$campaignId/matches/$matchId"
					params={{ campaignId, matchId }}
				>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<h1 className="text-3xl font-bold">Post-Match Processing</h1>
			</div>
			<div className="flex items-center justify-center p-12">
				<Spinner />
			</div>
		</div>
	);
}

function NotFoundPostMatch({ campaignId, matchId }: StatusProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<Link
					to="/$campaignId/matches/$matchId"
					params={{ campaignId, matchId }}
				>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<h1 className="text-3xl font-bold">Match Not Found</h1>
			</div>
		</div>
	);
}
