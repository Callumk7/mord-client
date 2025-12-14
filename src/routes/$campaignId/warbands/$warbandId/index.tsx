import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Coins,
	Crown,
	Edit,
	ScrollText,
	Shield,
	Skull,
	Swords,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { getMostGamesWonOptions } from "~/api/campaign";
import { getCampaignHistoryOptions } from "~/api/campaign-history";
import { campaignEventsQueryOptions } from "~/api/events";
import { getCampaignMatchesOptions } from "~/api/matches";
import {
	getWarbandOptions,
	getWarriorsByWarbandOptions,
	warbandKeys,
} from "~/api/warbands";
import { WarbandProgressChart } from "~/components/campaign/warband-progress-chart";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Link } from "~/components/ui/link";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { UpdateWarbandForm } from "~/components/warbands/update-warband-form";
import { CreateWarriorForm } from "~/components/warriors/create-warrior-form";
import {
	buildPerMatchWarbandPoints,
	buildProgressChartData,
	getWarbandsFromPoints,
	type ProgressMetric,
} from "~/lib/campaign-history";
import { calculateRating } from "~/lib/ratings";

export const Route = createFileRoute("/$campaignId/warbands/$warbandId/")({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			warbandId: Number(params.warbandId),
		}),
		stringify: (params) => ({
			warbandId: String(params.warbandId),
		}),
	},
	loader: async ({ context, params }) => {
		const { warbandId } = params;
		const { campaignId } = params;

		context.queryClient.ensureQueryData(getWarriorsByWarbandOptions(warbandId));
		context.queryClient.ensureQueryData(getWarbandOptions(warbandId));

		// Enrichment queries (used for the dashboard sections below)
		context.queryClient.ensureQueryData(campaignEventsQueryOptions(campaignId));
		context.queryClient.ensureQueryData(getCampaignMatchesOptions(campaignId));
		context.queryClient.ensureQueryData(getCampaignHistoryOptions(campaignId));
		context.queryClient.ensureQueryData(getMostGamesWonOptions(campaignId));
	},
});

function RouteComponent() {
	const { warbandId, campaignId } = Route.useParams();
	const queryClient = useQueryClient();
	const [isWarriorDialogOpen, setIsWarriorDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [progressMetric, setProgressMetric] =
		useState<ProgressMetric>("rating");

	// Fetch warband details
	const { data: warband, isPending: isWarbandPending } = useQuery(
		getWarbandOptions(warbandId),
	);

	// Fetch warriors for this warband
	const { data: warriors, isPending: isWarriorsPending } = useQuery(
		getWarriorsByWarbandOptions(warbandId),
	);

	// Campaign-level data (cached by parent route + loader above)
	const { data: matches } = useQuery(getCampaignMatchesOptions(campaignId));
	const { data: events } = useQuery(campaignEventsQueryOptions(campaignId));
	const { data: campaignHistory } = useQuery(
		getCampaignHistoryOptions(campaignId),
	);
	const { data: winsLeaderboard } = useQuery(
		getMostGamesWonOptions(campaignId),
	);

	const handleWarriorCreated = () => {
		setIsWarriorDialogOpen(false);
	};

	const handleWarbandUpdated = () => {
		queryClient.invalidateQueries({ queryKey: warbandKeys.detail(warbandId) });
		setIsEditDialogOpen(false);
	};

	const roster = warriors ?? [];
	const activeWarriors = roster.filter((w) => w.isAlive);
	const fallenWarriors = roster.filter((w) => !w.isAlive);
	const heroCount = activeWarriors.filter((w) => w.type === "hero").length;
	const henchCount = activeWarriors.filter((w) => w.type === "henchman").length;
	const totalKills = roster.reduce((sum, w) => sum + (w.kills ?? 0), 0);
	const totalGames = roster.reduce((sum, w) => sum + (w.gamesPlayed ?? 0), 0);
	const computedRating = warband
		? calculateRating(activeWarriors.length, warband.experience)
		: null;

	const warbandWins =
		winsLeaderboard?.find((row) => row.warbandId === warbandId)?.wins ?? 0;

	const warbandMatches =
		matches?.filter((match) =>
			match.participants.some((p) => p.warbandId === warbandId),
		) ?? [];
	const recentMatches = [...warbandMatches].sort((a, b) => {
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	const warbandEvents =
		events?.filter((event) => {
			const isByThisWarband = event.warrior?.warbandId === warbandId;
			const isAgainstThisWarband = event.defender?.warbandId === warbandId;
			return isByThisWarband || isAgainstThisWarband;
		}) ?? [];
	const recentEvents = [...warbandEvents].sort((a, b) => {
		return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
	});

	const killsInflicted = warbandEvents.filter(
		(e) => e.death && e.warrior?.warbandId === warbandId,
	).length;
	const deathsSuffered = warbandEvents.filter(
		(e) => e.death && e.defender?.warbandId === warbandId,
	).length;
	const injuriesInflicted = warbandEvents.filter(
		(e) => e.injury && e.warrior?.warbandId === warbandId,
	).length;
	const injuriesSuffered = warbandEvents.filter(
		(e) => e.injury && e.defender?.warbandId === warbandId,
	).length;

	const topKiller =
		roster.length > 0
			? [...roster].sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0))[0]
			: null;

	const historyForWarband =
		campaignHistory?.filter((row) => row.warbandId === warbandId) ?? [];
	const points = buildPerMatchWarbandPoints(historyForWarband);
	const warbandsForChart = getWarbandsFromPoints(points);
	const chartData = buildProgressChartData(points, progressMetric);

	return (
		<div className="mx-auto max-w-6xl space-y-6 py-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Link
							to="/$campaignId/warbands"
							params={{ campaignId }}
							variant="ghost"
							size="icon-sm"
							aria-label="Back to warbands"
						>
							<ArrowLeft />
						</Link>
						{warband?.icon && (
							<div
								className="text-2xl"
								style={{ color: warband.color || undefined }}
							>
								{warband.icon}
							</div>
						)}
						<h1 className="text-3xl font-bold">
							{isWarbandPending
								? "Loading warband…"
								: (warband?.name ?? "Warband")}
						</h1>
					</div>

					<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							<span>{warband?.faction ?? "Unknown faction"}</span>
						</div>
						<span className="text-muted-foreground/50">•</span>
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							<span className="tabular-nums">
								{activeWarriors.length}/{roster.length} active
							</span>
						</div>
						<span className="text-muted-foreground/50">•</span>
						<div className="flex items-center gap-2">
							<Crown className="h-4 w-4" />
							<span className="tabular-nums">
								{warbandWins} {warbandWins === 1 ? "win" : "wins"}
							</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{warband && (
						<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
							<DialogTrigger render={<Button variant="outline" />}>
								<Edit className="h-4 w-4" />
								Edit
							</DialogTrigger>
							<DialogContent className="max-w-2xl">
								<DialogHeader>
									<DialogTitle>Edit Warband</DialogTitle>
									<DialogDescription>
										Update the details of your warband.
									</DialogDescription>
								</DialogHeader>
								<UpdateWarbandForm
									warband={warband}
									onSuccess={handleWarbandUpdated}
								/>
							</DialogContent>
						</Dialog>
					)}

					<Dialog
						open={isWarriorDialogOpen}
						onOpenChange={setIsWarriorDialogOpen}
					>
						<DialogTrigger render={<Button />}>Add Warrior</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Create New Warrior</DialogTitle>
								<DialogDescription>
									Add a new warrior to your warband.
								</DialogDescription>
							</DialogHeader>
							<CreateWarriorForm
								campaignId={campaignId}
								warbandId={warbandId}
								onSuccess={handleWarriorCreated}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Separator />

			{/* Stat grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Rating"
					value={computedRating ?? warband?.rating ?? 0}
					icon={<TrendingUp className="h-5 w-5" />}
				/>
				<StatCard
					title="Treasury"
					value={`${warband?.treasury ?? 0} gc`}
					icon={<Coins className="h-5 w-5" />}
				/>
				<StatCard
					title="Experience"
					value={warband?.experience ?? 0}
					icon={<Zap className="h-5 w-5" />}
				/>
				<StatCard
					title="Kills (events)"
					value={totalKills}
					icon={<Swords className="h-5 w-5" />}
				/>
				<StatCard
					title="Roster"
					value={`${activeWarriors.length} active`}
					icon={<Users className="h-5 w-5" />}
					subtitle={`${heroCount} heroes • ${henchCount} hench`}
				/>
				<StatCard
					title="Fallen"
					value={fallenWarriors.length}
					icon={<Skull className="h-5 w-5" />}
					variant="destructive"
				/>
				<StatCard
					title="Games Played"
					value={totalGames}
					icon={<ScrollText className="h-5 w-5" />}
				/>
				<StatCard
					title="Casualties"
					value={`${deathsSuffered} KIA • ${injuriesSuffered} injured`}
					icon={<Skull className="h-5 w-5" />}
					variant={deathsSuffered > 0 ? "destructive" : "default"}
				/>
			</div>

			{/* Main content */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left: Roster */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-4">
								<CardTitle>Roster</CardTitle>
								{topKiller && (
									<div className="text-sm text-muted-foreground">
										Top killer:{" "}
										<span className="font-medium text-foreground">
											{topKiller.name}
										</span>{" "}
										<span className="tabular-nums">
											({topKiller.kills ?? 0})
										</span>
									</div>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{isWarriorsPending ? (
								<div className="flex items-center justify-center py-10 text-muted-foreground">
									<Spinner className="mr-2" />
									Loading roster…
								</div>
							) : roster.length === 0 ? (
								<div className="py-10 text-center text-muted-foreground">
									<p>No warriors yet.</p>
									<p className="mt-1 text-sm">
										Click <span className="font-medium">Add Warrior</span> to
										create your first warrior.
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Warrior</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Games</TableHead>
											<TableHead className="text-right">Kills</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{[...roster]
											.sort((a, b) => {
												if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
												if (a.isLeader !== b.isLeader)
													return a.isLeader ? -1 : 1;
												return a.name.localeCompare(b.name);
											})
											.map((warrior) => {
												const isDead = !warrior.isAlive;
												return (
													<TableRow
														key={warrior.id}
														className={isDead ? "opacity-70" : ""}
													>
														<TableCell className="font-medium">
															<Link
																to="/$campaignId/warriors/$warriorId"
																params={{ campaignId, warriorId: warrior.id }}
																variant="link"
																className={isDead ? "line-through" : ""}
															>
																{warrior.name}
															</Link>
															{warrior.isLeader && (
																<Badge className="ml-2" variant="secondary">
																	Leader
																</Badge>
															)}
														</TableCell>
														<TableCell className="capitalize">
															{warrior.type === "hero" ? (
																<Badge variant="default">Hero</Badge>
															) : (
																<Badge variant="outline">Henchman</Badge>
															)}
														</TableCell>
														<TableCell>
															{warrior.isAlive ? (
																<Badge variant="success">Alive</Badge>
															) : (
																<Badge variant="destructive">Deceased</Badge>
															)}
														</TableCell>
														<TableCell className="text-right tabular-nums">
															{warrior.gamesPlayed ?? 0}
														</TableCell>
														<TableCell className="text-right tabular-nums">
															{warrior.kills ?? 0}
														</TableCell>
													</TableRow>
												);
											})}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					{/* Notes */}
					<Card>
						<CardHeader>
							<CardTitle>Notes</CardTitle>
						</CardHeader>
						<CardContent>
							{warband?.notes ? (
								<p className="whitespace-pre-wrap text-sm">{warband.notes}</p>
							) : (
								<p className="text-sm text-muted-foreground">
									No notes yet. Use <span className="font-medium">Edit</span> to
									add some flavour, grudges, or running jokes.
								</p>
							)}
						</CardContent>
					</Card>

					{/* Progression */}
					<Card>
						<CardHeader className="pb-3">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<CardTitle>Progression</CardTitle>
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant={
											progressMetric === "rating" ? "default" : "outline"
										}
										size="sm"
										onClick={() => setProgressMetric("rating")}
									>
										Rating
									</Button>
									<Button
										type="button"
										variant={
											progressMetric === "treasury" ? "default" : "outline"
										}
										size="sm"
										onClick={() => setProgressMetric("treasury")}
									>
										Treasury
									</Button>
									<Button
										type="button"
										variant={
											progressMetric === "experience" ? "default" : "outline"
										}
										size="sm"
										onClick={() => setProgressMetric("experience")}
									>
										XP
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{chartData.length === 0 ? (
								<p className="py-10 text-center text-sm text-muted-foreground">
									No progression history yet.
								</p>
							) : (
								<WarbandProgressChart
									title=""
									chartData={chartData}
									warbands={warbandsForChart}
									metric={progressMetric}
									yAxisLabel={
										progressMetric === "rating"
											? "Rating"
											: progressMetric === "treasury"
												? "Gold crowns"
												: "Experience"
									}
									defaultColor={warband?.color || undefined}
								/>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right: Activity */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Battle Stats (from events)</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Kills inflicted</span>
								<span className="tabular-nums font-medium">
									{killsInflicted}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Deaths suffered</span>
								<span className="tabular-nums font-medium text-destructive">
									{deathsSuffered}
								</span>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">
									Injuries inflicted
								</span>
								<span className="tabular-nums font-medium">
									{injuriesInflicted}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Injuries suffered</span>
								<span className="tabular-nums font-medium">
									{injuriesSuffered}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Matches</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{recentMatches.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No matches found for this warband yet.
								</p>
							) : (
								recentMatches.slice(0, 6).map((match) => (
									<Link
										key={match.id}
										to="/$campaignId/matches/$matchId"
										params={{ campaignId, matchId: match.id }}
										variant="ghost"
										className="w-full justify-start border rounded-md"
									>
										<div className="flex w-full items-start justify-between gap-3">
											<div className="min-w-0">
												<div className="truncate font-medium">{match.name}</div>
												<div className="text-xs text-muted-foreground">
													{new Date(match.date).toLocaleString()}
												</div>
											</div>
											<Badge
												variant="secondary"
												className="shrink-0 capitalize"
											>
												{match.status}
											</Badge>
										</div>
									</Link>
								))
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Events</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							{recentEvents.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No events involving this warband yet.
								</p>
							) : (
								recentEvents.slice(0, 10).map((event) => {
									const byThisWarband = event.warrior?.warbandId === warbandId;
									const isDeath = !!event.death;
									const isInjury = !!event.injury;

									const label = isDeath
										? "Death"
										: isInjury
											? "Injury"
											: event.type === "moment"
												? "Moment"
												: "Event";

									return (
										<div
											key={event.id}
											className="rounded-md border bg-background p-3"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<Badge
															variant={
																isDeath
																	? "destructive"
																	: isInjury
																		? "secondary"
																		: "outline"
															}
														>
															{label}
														</Badge>
														<span className="truncate font-medium">
															{event.warrior?.name ?? "Unknown warrior"}
														</span>
														{event.defender?.name && (
															<span className="text-muted-foreground">
																vs {event.defender.name}
															</span>
														)}
													</div>
													{event.description && (
														<p className="mt-1 text-sm text-muted-foreground">
															{event.description}
														</p>
													)}
												</div>
												<div className="shrink-0 text-right">
													<div className="text-xs text-muted-foreground">
														{new Date(event.timestamp).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</div>
													<Badge
														variant={byThisWarband ? "success" : "outline"}
													>
														{byThisWarband ? "For" : "Against"}
													</Badge>
												</div>
											</div>
										</div>
									);
								})
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	icon,
	subtitle,
	variant = "default",
}: {
	title: string;
	value: string | number;
	icon: ReactNode;
	subtitle?: string;
	variant?: "default" | "destructive";
}) {
	const variantStyles = {
		default: "border-border",
		destructive: "border-destructive/20 bg-destructive/5",
	};

	return (
		<Card className={variantStyles[variant]}>
			<CardContent className="py-4">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold tabular-nums">{value}</p>
						{subtitle && (
							<p className="text-xs text-muted-foreground">{subtitle}</p>
						)}
					</div>
					<div className="text-muted-foreground">{icon}</div>
				</div>
			</CardContent>
		</Card>
	);
}
