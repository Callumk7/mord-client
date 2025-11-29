import { Link, useParams } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import type { CampaignMatch } from "~/db/schema";

interface MatchCardProps {
	match: CampaignMatch;
}

export function MatchCard({ match }: MatchCardProps) {
	const { campaignId } = useParams({ strict: false }) as { campaignId: number };

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
						params={{ campaignId, matchId: match.id }}
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

			{match.events && match.events.length > 0 && (
				<div className="mt-4 pt-4 border-t border-border">
					<p className="text-xs text-muted-foreground mb-2">Match Events</p>
					<div className="space-y-2">
						{match.events.map((event) => (
							<div
								key={event.id}
								className="flex items-start gap-2 text-xs bg-background/50 p-2 rounded"
							>
								<span className="text-muted-foreground">•</span>
								<div className="flex-1">
									{event.type === "knock_down" && (
										<p>
											<span className="font-medium">{event.warrior?.name}</span>
											{event.defender && (
												<>
													{" "}
													knocked down{" "}
													<span className="font-medium">
														{event.defender.name}
													</span>
												</>
											)}
											{event.injury && (
												<span className="text-chart-3"> (Injury)</span>
											)}
											{event.death && (
												<span className="text-chart-5"> (Death)</span>
											)}
										</p>
									)}
									{event.type === "moment" && event.description && (
										<p className="italic">{event.description}</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
