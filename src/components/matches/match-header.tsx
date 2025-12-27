import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getMatchDetailsOptions, updateMatchFn } from "~/api/matches";
import { formatDate, getMatchTypeLabel } from "~/lib/utils";
import { Button } from "../ui/button";
import { Link } from "../ui/link";

const getStatusBadge = (status: string) => {
	const styles = {
		scheduled: "bg-chart-2/10 text-chart-2",
		active: "bg-chart-1/10 text-chart-1",
		ended: "bg-muted text-muted-foreground",
	};
	return styles[status as keyof typeof styles] || styles.scheduled;
};

// Main Component definition
interface MatchHeaderProps {
	campaignId: number;
	matchId: number;
	matchName: string;
	matchDate: Date;
	participantCount: number;
	matchStatus: string;
}

export function MatchHeader({
	campaignId,
	matchId,
	matchName,
	matchDate,
	participantCount,
	matchStatus,
}: MatchHeaderProps) {
	const queryClient = useQueryClient();
	const updateMatchMutation = useMutation({
		mutationFn: updateMatchFn,
	});

	const handleMatchStatusChange = (
		newStatus: "active" | "ended" | "scheduled",
	) => {
		updateMatchMutation.mutate(
			{
				data: {
					matchId,
					status: newStatus,
				},
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: getMatchDetailsOptions(matchId).queryKey,
					});
				},
			},
		);
	};

	const setMatchAsActive = () => {
		handleMatchStatusChange("active");
	};
	const setMatchAsEnded = () => {
		handleMatchStatusChange("ended");
	};
	return (
		<div className="flex items-center gap-4">
			<Link to="/$campaignId/matches" params={{ campaignId }}>
				<ArrowLeft className="h-4 w-4" />
			</Link>
			<div className="flex-1">
				<h2 className="text-2xl font-bold text-foreground">{matchName}</h2>
				<p className="text-sm text-muted-foreground">{formatDate(matchDate)}</p>
			</div>
			<Button
				onClick={matchStatus === "active" ? setMatchAsEnded : setMatchAsActive}
			>
				{matchStatus === "scheduled"
					? "Start"
					: matchStatus === "active"
						? "End"
						: undefined}
			</Button>
			<div className="flex items-center gap-2">
				<span className="text-sm px-3 py-1 bg-primary/20 text-primary rounded">
					{getMatchTypeLabel(participantCount)}
				</span>
				<span
					className={`text-sm px-3 py-1 rounded ${getStatusBadge(matchStatus)}`}
				>
					{matchStatus}
				</span>
			</div>
		</div>
	);
}
