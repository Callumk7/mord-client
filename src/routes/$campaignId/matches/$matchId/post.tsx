import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getMatchDetailsOptions, getMatchWarbandsOptions } from "~/api/matches";
import { PostMatchEventResolution } from "~/components/matches/post-match-event-resolution";
import { WarriorDeathManager } from "~/components/matches/warrior-death-manager";
import { WarriorExperienceManager } from "~/components/matches/warrior-experience-manager";
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

	// Collect all warriors from participating warbands
	const allWarriors = warbands.flatMap((warband) => warband.warriors);

	// Get winning warband IDs
	const winningWarbandIds = match.winners.map((winner) => winner.warbandId);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link
					to="/$campaignId/matches/$matchId"
					params={{ campaignId, matchId }}
				>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold">Post-Match Processing</h1>
					<p className="text-muted-foreground">{match.name}</p>
				</div>
			</div>

			{/* Section 1: Event Resolution */}
			<PostMatchEventResolution
				events={match.events}
				matchId={matchId}
				campaignId={campaignId}
			/>

			{/* Section 2: Warrior Deaths & Injuries */}
			<WarriorDeathManager
				warriors={allWarriors}
				matchId={matchId}
				campaignId={campaignId}
			/>

			{/* Section 3: Experience Accumulation */}
			<WarriorExperienceManager
				warriors={allWarriors}
				events={match.events}
				winningWarbandIds={winningWarbandIds}
				matchId={matchId}
				campaignId={campaignId}
			/>
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
