import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Plus, Swords, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { CreateEventForm } from "~/components/events/create-event-form";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { getMatchDetailsFn } from "~/lib/queries/matches";

export const Route = createFileRoute("/$campaignId/matches/$matchId")({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			matchId: Number(params.matchId),
		}),
	},
});

function RouteComponent() {
	const { campaignId, matchId } = Route.useParams();
	const campaignIdNum = Number(campaignId);
	const matchIdNum = Number(matchId);
	const [eventDialogOpen, setEventDialogOpen] = useState(false);

	const { data: match, isLoading } = useQuery({
		queryKey: ["match", matchIdNum],
		queryFn: () => getMatchDetailsFn({ data: { matchId: matchIdNum } }),
	});

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
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

	const getCasualtyTypeColor = (type: string) => {
		const colors = {
			killed: "text-destructive",
			injured: "text-orange-500",
			stunned: "text-yellow-500",
			escaped: "text-muted-foreground",
		};
		return colors[type as keyof typeof colors] || "text-foreground";
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link to="/$campaignId/matches" params={{ campaignId }}>
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h2 className="text-2xl font-bold text-foreground">Loading...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link to="/$campaignId/matches" params={{ campaignId }}>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div className="flex-1">
					<h2 className="text-2xl font-bold text-foreground">{match.name}</h2>
					<p className="text-sm text-muted-foreground">
						{formatDate(match.date)}
					</p>
				</div>
				<div className="flex gap-2">
					<span className="text-sm px-3 py-1 bg-primary/20 text-primary rounded">
						{getMatchTypeLabel(match.matchType)}
					</span>
					<span
						className={`text-sm px-3 py-1 rounded ${getStatusBadge(match.status)}`}
					>
						{match.status}
					</span>
				</div>
			</div>

			{/* Match Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Participants/Result */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							{match.resultType === "placement"
								? "Final Standings"
								: "Participants"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{match.resultType === "placement" && match.placements.length > 0 ? (
							<div className="space-y-2">
								{match.placements.map((placement) => (
									<div
										key={placement.id}
										className="flex items-center justify-between p-3 bg-muted rounded-lg"
									>
										<div className="flex items-center gap-3">
											<div
												className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
													placement.position === 1
														? "bg-yellow-500/20 text-yellow-500"
														: placement.position === 2
															? "bg-gray-400/20 text-gray-400"
															: placement.position === 3
																? "bg-orange-500/20 text-orange-500"
																: "bg-muted-foreground/20 text-muted-foreground"
												}`}
											>
												{placement.position}
											</div>
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{
														backgroundColor:
															placement.warband?.color || undefined,
													}}
												/>
												<span className="font-medium">
													{placement.warband?.name || "Unknown Warband"}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						) : match.resultType === "team" && match.teams.length > 0 ? (
							<div className="space-y-4">
								{match.teams.map((team) => (
									<div
										key={team.id}
										className={`p-3 rounded-lg border ${
											team.isWinner
												? "border-primary bg-primary/5"
												: "border-border bg-muted"
										}`}
									>
										<div className="flex items-center gap-2 mb-2">
											{team.isWinner && (
												<Trophy className="h-4 w-4 text-primary" />
											)}
											<span className="font-medium">{team.name || "Team"}</span>
										</div>
										<div className="space-y-1 ml-6">
											{team.members.map((member) => (
												<div
													key={member.id}
													className="flex items-center gap-2 text-sm"
												>
													<div
														className="w-2 h-2 rounded-full"
														style={{
															backgroundColor:
																member.warband?.color || undefined,
														}}
													/>
													<span>{member.warband?.name || "Unknown"}</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="space-y-2">
								{match.participants.map((participant) => (
									<div
										key={participant.id}
										className={`flex items-center gap-3 p-3 rounded-lg ${
											participant.warbandId === match.winnerId
												? "bg-primary/5 border border-primary"
												: "bg-muted"
										}`}
									>
										{participant.warbandId === match.winnerId && (
											<Trophy className="h-4 w-4 text-primary" />
										)}
										<div
											className="w-3 h-3 rounded-full"
											style={{
												backgroundColor:
													participant.warband?.color || undefined,
											}}
										/>
										<span className="font-medium">
											{participant.warband?.name || "Unknown Warband"}
										</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Match Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Swords className="h-4 w-4" />
							Match Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-start gap-2">
							<Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Date & Time</p>
								<p className="text-sm text-muted-foreground">
									{formatDate(match.date)}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<Users className="h-4 w-4 mt-1 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Match Type</p>
								<p className="text-sm text-muted-foreground">
									{getMatchTypeLabel(match.matchType)}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<Trophy className="h-4 w-4 mt-1 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Result Type</p>
								<p className="text-sm text-muted-foreground">
									{match.resultType}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Casualties */}
			{match.casualties.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Casualties</CardTitle>
						<CardDescription>
							Warriors injured or killed during the match
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{match.casualties.map((casualty) => (
								<div
									key={casualty.id}
									className="flex items-center justify-between p-3 bg-muted rounded-lg"
								>
									<div className="flex items-center gap-3">
										<div
											className="w-3 h-3 rounded-full"
											style={{
												backgroundColor:
													casualty.victimWarband?.color || undefined,
											}}
										/>
										<div>
											<p className="font-medium">
												{casualty.victimWarrior?.name || "Unknown Warrior"}
											</p>
											<p className="text-xs text-muted-foreground">
												{casualty.victimWarband?.name || "Unknown Warband"}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p
											className={`text-sm font-medium capitalize ${getCasualtyTypeColor(casualty.type)}`}
										>
											{casualty.type}
										</p>
										{casualty.description && (
											<p className="text-xs text-muted-foreground">
												{casualty.description}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Events */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Notable Events</CardTitle>
							<CardDescription>
								Memorable moments and knock downs during the match
							</CardDescription>
						</div>
						<Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
							<DialogTrigger render={<Button size="sm" />}>
								<Plus className="h-4 w-4 mr-2" />
								Add Event
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add Event</DialogTitle>
									<DialogDescription>
										Record a knock down or memorable moment from this match
									</DialogDescription>
								</DialogHeader>
								<CreateEventForm
									campaignId={campaignIdNum}
									matchId={matchIdNum}
									onSuccess={() => setEventDialogOpen(false)}
								/>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					{match.events.length > 0 ? (
						<div className="space-y-2">
							{match.events.map((event) => (
								<div
									key={event.id}
									className="p-3 bg-muted rounded-lg border-l-4 border-primary"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<p className="text-sm font-medium capitalize">
													{event.type.replace("_", " ")}
												</p>
												{event.warrior && (
													<span className="text-xs text-muted-foreground">
														by {event.warrior.name}
													</span>
												)}
												{event.defender && (
													<span className="text-xs text-muted-foreground">
														→ {event.defender.name}
													</span>
												)}
											</div>
											{event.description && (
												<p className="text-sm text-muted-foreground mt-1">
													{event.description}
												</p>
											)}
										</div>
										<p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
											{new Date(event.timestamp).toLocaleTimeString()}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="p-8 text-center text-muted-foreground">
							<p>No events recorded yet.</p>
							<p className="text-sm mt-2">
								Click "Add Event" to record knock downs or memorable moments!
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
