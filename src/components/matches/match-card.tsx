import { Link, useParams } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import type { MatchWithParticipants } from "~/lib/queries/matches";

interface MatchCardProps {
	match: MatchWithParticipants;
}

export function MatchCard({ match }: MatchCardProps) {
	const { campaignId } = useParams({ strict: false });

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getMatchTypeLabel = (matchType: string) => {
		if (matchType === "battle_royale") {
			return "Battle Royale";
		}
		return matchType.toUpperCase();
	};

	const getStatusBadge = (status: string) => {
		const styles = {
			scheduled: "bg-chart-2/10 text-chart-2",
			active: "bg-chart-1/10 text-chart-1",
			ended: "bg-muted text-muted-foreground",
		};
		return styles[status as keyof typeof styles] || styles.scheduled;
	};

	return (
		<div className="p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<p className="text-xs text-muted-foreground mb-1">Match Details</p>
					<p className="font-medium text-foreground text-sm">{match.name}</p>
					<p className="text-xs text-muted-foreground">
						{formatDate(match.date)}
					</p>
					<div className="flex gap-2 mt-2">
						<span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
							{getMatchTypeLabel(match.matchType)}
						</span>
						<span
							className={`text-xs px-2 py-1 rounded ${getStatusBadge(match.status)}`}
						>
							{match.status}
						</span>
					</div>
				</div>

				<div>
					<p className="text-xs text-muted-foreground mb-2">Participants</p>
					<div className="space-y-1">
						{match.participants.length > 0 ? (
							match.participants.map((participant) => (
								<div key={participant.id} className="flex items-center gap-2">
									<div
										className="w-2 h-2 rounded-full bg-primary"
										style={{
											backgroundColor: participant.warband?.color || undefined,
										}}
									/>
									<p className="text-sm font-medium">
										{participant.warband?.name || "Unknown Warband"}
									</p>
								</div>
							))
						) : (
							<p className="text-xs text-muted-foreground italic">
								No participants added yet
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center justify-end">
					<Link
						to="/$campaignId/matches/$matchId"
						params={{ campaignId: campaignId || "", matchId: String(match.id) }}
					>
						<Button
							variant="ghost"
							className="text-muted-foreground hover:text-foreground hover:bg-background/50"
						>
							View Details
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
