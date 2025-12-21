import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	CalendarIcon,
	CopyIcon,
	DownloadIcon,
	MoreHorizontalIcon,
	PencilIcon,
	SearchIcon,
	SettingsIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { getCampaignOptions } from "~/api/campaign";
import { getCampaignHistoryOptions } from "~/api/campaign-history";
import { campaignEventsQueryOptions } from "~/api/events";
import { getCampaignMatchesOptions } from "~/api/matches";
import { getCampaignWarbandsWithWarriorsOptions } from "~/api/warbands";
import { getWarriorsByCampaignOptions } from "~/api/warriors";
import { Badge } from "~/components/ui/badge";
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import { Separator } from "~/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";

export const Route = createFileRoute("/$campaignId/admin")({
	loader: async ({ params, context }) => {
		const { campaignId } = params;
		await Promise.all([
			context.queryClient.ensureQueryData(getCampaignOptions(campaignId)),
			context.queryClient.ensureQueryData(
				getCampaignWarbandsWithWarriorsOptions(campaignId),
			),
			context.queryClient.ensureQueryData(
				getWarriorsByCampaignOptions(campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignMatchesOptions(campaignId),
			),
			context.queryClient.ensureQueryData(
				campaignEventsQueryOptions(campaignId),
			),
			context.queryClient.ensureQueryData(
				getCampaignHistoryOptions(campaignId),
			),
		]);
	},
	component: RouteComponent,
});

type EditIntent =
	| { kind: "campaign" }
	| { kind: "warband"; warbandId: number }
	| { kind: "warrior"; warriorId: number }
	| { kind: "match"; matchId: number }
	| { kind: "event"; eventId: number };

function RouteComponent() {
	const { campaignId } = Route.useParams();

	const { data: campaign } = useSuspenseQuery(getCampaignOptions(campaignId));
	const { data: warbands } = useSuspenseQuery(
		getCampaignWarbandsWithWarriorsOptions(campaignId),
	);
	const { data: warriors } = useSuspenseQuery(
		getWarriorsByCampaignOptions(campaignId),
	);
	const { data: matches } = useSuspenseQuery(
		getCampaignMatchesOptions(campaignId),
	);
	const { data: events } = useSuspenseQuery(
		campaignEventsQueryOptions(campaignId),
	);
	const { data: history } = useSuspenseQuery(
		getCampaignHistoryOptions(campaignId),
	);

	const sectionIdBase = useId();
	const dialogSummaryId = useId();
	const dialogFieldId = useId();
	const dialogReasonId = useId();
	const dialogNotesId = useId();

	const sectionIds = useMemo(
		() => ({
			warbands: `${sectionIdBase}-warbands`,
			warriors: `${sectionIdBase}-warriors`,
			matches: `${sectionIdBase}-matches`,
			events: `${sectionIdBase}-events`,
			history: `${sectionIdBase}-history`,
		}),
		[sectionIdBase],
	);

	const [warbandFilter, setWarbandFilter] = useState("");
	const [warriorFilter, setWarriorFilter] = useState("");
	const [matchFilter, setMatchFilter] = useState("");
	const [eventFilter, setEventFilter] = useState("");

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editIntent, setEditIntent] = useState<EditIntent | null>(null);

	const openEdit = (intent: EditIntent) => {
		setEditIntent(intent);
		setEditDialogOpen(true);
	};

	const closeEdit = () => {
		setEditDialogOpen(false);
		setTimeout(() => setEditIntent(null), 200);
	};

	const formatDate = (date: Date) =>
		new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	const formatDateTime = (date: Date) => new Date(date).toLocaleString();

	const campaignSummary = useMemo(() => {
		const aliveWarriors = warriors.filter((w) => w.isAlive).length;
		const deadWarriors = warriors.length - aliveWarriors;

		const matchCounts = matches.reduce(
			(acc, match) => {
				acc.total += 1;
				acc[match.status] = (acc[match.status] ?? 0) + 1;
				return acc;
			},
			{
				total: 0,
				active: 0,
				ended: 0,
				scheduled: 0,
				resolved: 0,
			} satisfies Record<
				"total" | "active" | "ended" | "scheduled" | "resolved",
				number
			>,
		);

		const unresolvedEvents = events.filter((e) => !e.resolved).length;

		return {
			warbands: warbands.length,
			warriors: warriors.length,
			aliveWarriors,
			deadWarriors,
			matches: matchCounts,
			events: events.length,
			unresolvedEvents,
			stateChanges: history.length,
		};
	}, [events, history, matches, warbands.length, warriors]);

	const filteredWarbands = useMemo(() => {
		const q = warbandFilter.trim().toLowerCase();
		if (!q) return warbands;
		return warbands.filter((w) => {
			return (
				w.name.toLowerCase().includes(q) ||
				w.faction.toLowerCase().includes(q) ||
				(w.notes ?? "").toLowerCase().includes(q)
			);
		});
	}, [warbandFilter, warbands]);

	const filteredWarriors = useMemo(() => {
		const q = warriorFilter.trim().toLowerCase();
		if (!q) return warriors;
		return warriors.filter((w) => {
			return (
				w.name.toLowerCase().includes(q) ||
				w.type.toLowerCase().includes(q) ||
				(w.warband?.name ?? "").toLowerCase().includes(q)
			);
		});
	}, [warriorFilter, warriors]);

	const filteredMatches = useMemo(() => {
		const q = matchFilter.trim().toLowerCase();
		if (!q) return matches;
		return matches.filter((m) => {
			return (
				m.name.toLowerCase().includes(q) ||
				m.status.toLowerCase().includes(q)
			);
		});
	}, [matchFilter, matches]);

	const filteredEvents = useMemo(() => {
		const q = eventFilter.trim().toLowerCase();
		if (!q) return events;
		return events.filter((e) => {
			return (
				e.type.toLowerCase().includes(q) ||
				(e.description ?? "").toLowerCase().includes(q) ||
				(e.warrior?.name ?? "").toLowerCase().includes(q) ||
				(e.defender?.name ?? "").toLowerCase().includes(q) ||
				(e.match?.name ?? "").toLowerCase().includes(q)
			);
		});
	}, [eventFilter, events]);

	const recentStateChanges = useMemo(() => {
		const sorted = [...history].sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
		return sorted.slice(0, 12);
	}, [history]);

	const copyCampaignJson = async () => {
		try {
			const payload = {
				campaign,
				warbands,
				warriors,
				matches,
				events,
				history,
			};

			if (!("clipboard" in navigator)) {
				toast.error("Clipboard unavailable in this browser");
				return;
			}

			await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
			toast.success("Copied campaign JSON to clipboard");
		} catch {
			toast.error("Failed to copy JSON");
		}
	};

	const placeholderSave = () => {
		toast.message("Placeholder only", {
			description: "This edit UI isn’t wired to mutations yet.",
		});
		closeEdit();
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold text-foreground">Admin</h1>
						<Badge variant="secondary">Campaign {campaignId}</Badge>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						All campaign data at a glance. Editing controls are placeholders for
						now.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Link
						variant="outline"
						to="/$campaignId"
						params={{ campaignId }}
						className="no-underline"
					>
						View Leaderboard
					</Link>
					<Link
						variant="outline"
						to="/$campaignId/timeline"
						params={{ campaignId }}
						className="no-underline"
					>
						View Timeline
					</Link>
					<Button variant="outline" onClick={copyCampaignJson}>
						<CopyIcon />
						Copy JSON
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between gap-3">
						<span className="truncate">{campaign?.name ?? "Campaign"}</span>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => openEdit({ kind: "campaign" })}
							>
								<PencilIcon />
								Edit
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() =>
									toast.message("Placeholder only", {
										description: "Campaign settings coming soon.",
									})
								}
							>
								<SettingsIcon />
							</Button>
						</div>
					</CardTitle>
					<CardDescription className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center gap-2">
							<CalendarIcon className="size-4 text-muted-foreground" />
							{campaign ? (
								<>
									{formatDate(campaign.startDate)} →{" "}
									{formatDate(campaign.endDate)}
								</>
							) : (
								"Dates unknown"
							)}
						</span>
						<Separator orientation="vertical" className="h-4" />
						<span className="text-xs">
							Updated {campaign ? formatDateTime(campaign.updatedAt) : "-"}
						</span>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{campaign?.description ? (
						<p className="text-sm text-foreground">{campaign.description}</p>
					) : (
						<p className="text-sm text-muted-foreground italic">
							No campaign description.
						</p>
					)}

					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
						<StatCard label="Warbands" value={campaignSummary.warbands} />
						<StatCard
							label="Warriors"
							value={campaignSummary.warriors}
							subtitle={`${campaignSummary.aliveWarriors} alive · ${campaignSummary.deadWarriors} dead`}
						/>
						<StatCard
							label="Matches"
							value={campaignSummary.matches.total}
							subtitle={`${campaignSummary.matches.ended} ended · ${campaignSummary.matches.active} active`}
						/>
						<StatCard
							label="Events"
							value={campaignSummary.events}
							subtitle={`${campaignSummary.unresolvedEvents} pending`}
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2 text-sm">
						<Badge
							variant={
								campaignSummary.unresolvedEvents > 0 ? "default" : "secondary"
							}
						>
							{campaignSummary.unresolvedEvents} pending events
						</Badge>
						<Badge variant="secondary">
							{campaignSummary.stateChanges} state changes
						</Badge>
						{warbands.length === 0 && (
							<Badge variant="destructive">No warbands yet</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<SectionCard
					id={sectionIds.warbands}
					title="Warbands"
					subtitle="Key stats + placeholder edit actions"
					actions={
						<Link
							variant="outline"
							to="/$campaignId/warbands"
							params={{ campaignId }}
							className="no-underline"
						>
							Open Warbands
						</Link>
					}
					filterValue={warbandFilter}
					onFilterChange={setWarbandFilter}
					filterPlaceholder="Filter by name, faction, or notes…"
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Warband</TableHead>
								<TableHead>Faction</TableHead>
								<TableHead className="text-right">Warriors</TableHead>
								<TableHead className="text-right">Rating</TableHead>
								<TableHead className="text-right">XP</TableHead>
								<TableHead className="text-right">Gold</TableHead>
								<TableHead className="w-[60px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredWarbands.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-muted-foreground">
										No warbands match this filter.
									</TableCell>
								</TableRow>
							) : (
								filteredWarbands.map((warband) => {
									const total = warband.warriors.length;
									const alive = warband.warriors.filter(
										(w) => w.isAlive,
									).length;
									return (
										<TableRow key={warband.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													{warband.icon ? (
														<span
															aria-hidden
															style={{ color: warband.color || undefined }}
														>
															{warband.icon}
														</span>
													) : null}
													<Link
														to="/$campaignId/warbands/$warbandId"
														params={{ campaignId, warbandId: warband.id }}
														variant="link"
														className="h-auto p-0"
													>
														{warband.name}
													</Link>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{warband.faction}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												<span className="text-foreground">{alive}</span>
												<span className="text-muted-foreground">/{total}</span>
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{warband.rating}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{warband.experience}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{warband.treasury}
											</TableCell>
											<TableCell className="text-right">
												<RowActions
													onEdit={() =>
														openEdit({ kind: "warband", warbandId: warband.id })
													}
													onSecondary={() =>
														toast.message("Placeholder only", {
															description: "Warband actions coming soon.",
														})
													}
												/>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</SectionCard>

				<SectionCard
					id={sectionIds.warriors}
					title="Warriors"
					subtitle="Quick roster overview across warbands"
					actions={
						<Link
							variant="outline"
							to="/$campaignId/warriors"
							params={{ campaignId }}
							className="no-underline"
						>
							Open Warriors
						</Link>
					}
					filterValue={warriorFilter}
					onFilterChange={setWarriorFilter}
					filterPlaceholder="Filter by name, warband, or type…"
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Warrior</TableHead>
								<TableHead>Warband</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Type</TableHead>
								<TableHead className="text-right">Games</TableHead>
								<TableHead className="w-[60px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredWarriors.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-muted-foreground">
										No warriors match this filter.
									</TableCell>
								</TableRow>
							) : (
								filteredWarriors.slice(0, 40).map((warrior) => (
									<TableRow key={warrior.id}>
										<TableCell className="font-medium">
											<Link
												to="/$campaignId/warriors/$warriorId"
												params={{ campaignId, warriorId: warrior.id }}
												variant="link"
												className="h-auto p-0"
											>
												{warrior.name}
											</Link>
											{warrior.isLeader ? (
												<Badge variant="secondary" className="ml-2">
													Leader
												</Badge>
											) : null}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{warrior.warband?.name ?? "-"}
										</TableCell>
										<TableCell>
											<Badge
												variant={warrior.isAlive ? "secondary" : "destructive"}
											>
												{warrior.isAlive ? "Alive" : "Dead"}
											</Badge>
										</TableCell>
										<TableCell className="capitalize text-muted-foreground">
											{warrior.type}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{warrior.gamesPlayed}
										</TableCell>
										<TableCell className="text-right">
											<RowActions
												onEdit={() =>
													openEdit({ kind: "warrior", warriorId: warrior.id })
												}
												onSecondary={() =>
													toast.message("Placeholder only", {
														description: "Inline warrior edits coming soon.",
													})
												}
											/>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
					{filteredWarriors.length > 40 ? (
						<p className="mt-3 text-xs text-muted-foreground">
							Showing first 40 results. Refine your filter to see more.
						</p>
					) : null}
				</SectionCard>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<SectionCard
					id={sectionIds.matches}
					title="Matches"
					subtitle="Status + quick navigation"
					actions={
						<div className="flex items-center gap-2">
							<Link
								variant="outline"
								to="/$campaignId/matches/new"
								params={{ campaignId }}
								className="no-underline"
							>
								Log Match
							</Link>
							<Link
								variant="outline"
								to="/$campaignId/matches"
								params={{ campaignId }}
								className="no-underline"
							>
								Open Matches
							</Link>
						</div>
					}
					filterValue={matchFilter}
					onFilterChange={setMatchFilter}
					filterPlaceholder="Filter by name, status, or type…"
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Match</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Players</TableHead>
								<TableHead className="w-[60px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredMatches.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-muted-foreground">
										No matches match this filter.
									</TableCell>
								</TableRow>
							) : (
								filteredMatches
									.slice()
									.sort(
										(a, b) =>
											new Date(b.date).getTime() - new Date(a.date).getTime(),
									)
									.slice(0, 25)
									.map((match) => (
										<TableRow key={match.id}>
											<TableCell className="font-medium">
												<Link
													to="/$campaignId/matches/$matchId"
													params={{ campaignId, matchId: match.id }}
													variant="link"
													className="h-auto p-0"
												>
													{match.name}
												</Link>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{formatDate(match.date)}
											</TableCell>
											<TableCell>
												<Badge
													variant={
														match.status === "active" ? "default" : "secondary"
													}
												>
													{match.status}
												</Badge>
											</TableCell>

											<TableCell className="text-right tabular-nums">
												{match.participants?.length ?? 0}
											</TableCell>
											<TableCell className="text-right">
												<RowActions
													onEdit={() =>
														openEdit({ kind: "match", matchId: match.id })
													}
													onSecondary={() =>
														toast.message("Placeholder only", {
															description: "Match admin actions coming soon.",
														})
													}
												/>
											</TableCell>
										</TableRow>
									))
							)}
						</TableBody>
					</Table>
				</SectionCard>

				<SectionCard
					id={sectionIds.events}
					title="Events"
					subtitle="Pending resolution + audit"
					actions={
						<Link
							variant="outline"
							to="/$campaignId/events"
							params={{ campaignId }}
							className="no-underline"
						>
							Open Events
						</Link>
					}
					filterValue={eventFilter}
					onFilterChange={setEventFilter}
					filterPlaceholder="Filter by type, warrior, match, or text…"
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Status</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Warrior</TableHead>
								<TableHead>Defender</TableHead>
								<TableHead>Match</TableHead>
								<TableHead className="w-[60px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredEvents.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-muted-foreground">
										No events match this filter.
									</TableCell>
								</TableRow>
							) : (
								filteredEvents
									.slice()
									.sort(
										(a, b) =>
											new Date(b.timestamp).getTime() -
											new Date(a.timestamp).getTime(),
									)
									.slice(0, 25)
									.map((event) => (
										<TableRow key={event.id}>
											<TableCell>
												<Badge
													variant={event.resolved ? "secondary" : "default"}
												>
													{event.resolved ? "Resolved" : "Pending"}
												</Badge>
											</TableCell>
											<TableCell className="capitalize text-muted-foreground">
												{event.type.replaceAll("_", " ")}
											</TableCell>
											<TableCell>{event.warrior?.name ?? "-"}</TableCell>
											<TableCell className="text-muted-foreground">
												{event.defender?.name ?? "-"}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{event.match?.name ?? `Match ${event.matchId}`}
											</TableCell>
											<TableCell className="text-right">
												<RowActions
													onEdit={() =>
														openEdit({ kind: "event", eventId: event.id })
													}
													onSecondary={() =>
														toast.message("Placeholder only", {
															description: "Event edit actions coming soon.",
														})
													}
												/>
											</TableCell>
										</TableRow>
									))
							)}
						</TableBody>
					</Table>
				</SectionCard>
			</div>

			<Card id={sectionIds.history}>
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-3">
						<span>State changes (recent)</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								toast.message("Placeholder only", {
									description: "Export/import tooling coming soon.",
								})
							}
						>
							<DownloadIcon />
							Export
						</Button>
					</CardTitle>
					<CardDescription>
						Audit trail for warband rating/XP/gold adjustments.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>When</TableHead>
								<TableHead>Warband</TableHead>
								<TableHead>Match</TableHead>
								<TableHead className="text-right">Δ Gold</TableHead>
								<TableHead className="text-right">Δ XP</TableHead>
								<TableHead className="text-right">Δ Rating</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentStateChanges.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-muted-foreground">
										No state changes recorded yet.
									</TableCell>
								</TableRow>
							) : (
								recentStateChanges.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="text-muted-foreground">
											{formatDateTime(row.timestamp)}
										</TableCell>
										<TableCell className="font-medium">
											{row.warbandIcon ? (
												<span
													aria-hidden
													className="mr-2"
													style={{ color: row.warbandColor || undefined }}
												>
													{row.warbandIcon}
												</span>
											) : null}
											{row.warbandName ?? `Warband ${row.warbandId}`}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{row.matchName ??
												(row.matchId ? `Match ${row.matchId}` : "-")}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatDelta(row.treasuryDelta)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatDelta(row.experienceDelta)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatDelta(row.ratingDelta)}
										</TableCell>
										<TableCell className="truncate text-muted-foreground max-w-[30ch]">
											{row.description ?? "-"}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{getEditTitle(editIntent)}</DialogTitle>
						<DialogDescription>
							This is a placeholder for inline editing. It does not save yet.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<label
								className="text-sm font-medium text-foreground"
								htmlFor={dialogSummaryId}
							>
								Summary
							</label>
							<Input
								id={dialogSummaryId}
								readOnly
								value={getEditSummary(editIntent)}
							/>
						</div>

						<div className="grid gap-3 md:grid-cols-2">
							<div className="space-y-2">
								<label
									className="text-sm font-medium text-foreground"
									htmlFor={dialogFieldId}
								>
									Field (placeholder)
								</label>
								<Input
									id={dialogFieldId}
									defaultValue=""
									placeholder="Type a new value…"
								/>
							</div>
							<div className="space-y-2">
								<label
									className="text-sm font-medium text-foreground"
									htmlFor={dialogReasonId}
								>
									Reason / note
								</label>
								<Input
									id={dialogReasonId}
									defaultValue=""
									placeholder="Optional…"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label
								className="text-sm font-medium text-foreground"
								htmlFor={dialogNotesId}
							>
								Long-form notes
							</label>
							<Textarea
								id={dialogNotesId}
								placeholder="Add context for future-you…"
							/>
						</div>

						<div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<SettingsIcon className="size-4" />
								<span>
									When wired up, this dialog will run a mutation and invalidate
									the relevant queries.
								</span>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={closeEdit}>
							Cancel
						</Button>
						<Button onClick={placeholderSave}>
							<PencilIcon />
							Save (placeholder)
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function formatDelta(n: number | null) {
	if (n == null) return "-";
	if (n === 0) return "0";
	return n > 0 ? `+${n}` : `${n}`;
}

function getEditTitle(intent: EditIntent | null) {
	if (!intent) return "Edit";
	switch (intent.kind) {
		case "campaign":
			return "Edit campaign";
		case "warband":
			return `Edit warband #${intent.warbandId}`;
		case "warrior":
			return `Edit warrior #${intent.warriorId}`;
		case "match":
			return `Edit match #${intent.matchId}`;
		case "event":
			return `Edit event #${intent.eventId}`;
	}
}

function getEditSummary(intent: EditIntent | null) {
	if (!intent) return "-";
	switch (intent.kind) {
		case "campaign":
			return "Campaign metadata (name, dates, description)";
		case "warband":
			return "Warband fields (name, faction, rating, treasury, notes)";
		case "warrior":
			return "Warrior fields (alive/dead, leader, equipment, skills)";
		case "match":
			return "Match fields (name, scenario, status, participants)";
		case "event":
			return "Event fields (description, resolved, injury/death)";
	}
}

function StatCard({
	label,
	value,
	subtitle,
}: {
	label: string;
	value: number;
	subtitle?: string;
}) {
	return (
		<div className="rounded-lg border bg-card p-4 shadow-sm">
			<div className="text-sm text-muted-foreground">{label}</div>
			<div className="mt-1 text-2xl font-bold text-foreground tabular-nums">
				{value}
			</div>
			{subtitle ? (
				<div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
			) : null}
		</div>
	);
}

function SectionCard({
	id,
	title,
	subtitle,
	actions,
	filterValue,
	onFilterChange,
	filterPlaceholder,
	children,
}: {
	id: string;
	title: string;
	subtitle: string;
	actions?: React.ReactNode;
	filterValue: string;
	onFilterChange: (value: string) => void;
	filterPlaceholder: string;
	children: React.ReactNode;
}) {
	return (
		<Card id={id}>
			<CardHeader className="gap-2">
				<div className="flex items-start justify-between gap-3">
					<div>
						<CardTitle>{title}</CardTitle>
						<CardDescription>{subtitle}</CardDescription>
					</div>
					{actions ? <div className="shrink-0">{actions}</div> : null}
				</div>
				<div className="relative">
					<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={filterValue}
						onChange={(e) => onFilterChange(e.target.value)}
						placeholder={filterPlaceholder}
						className="pl-9"
					/>
				</div>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function RowActions({
	onEdit,
	onSecondary,
}: {
	onEdit: () => void;
	onSecondary: () => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon-sm" aria-label="Row actions" />
				}
			>
				<MoreHorizontalIcon />
			</DropdownMenuTrigger>
			<DropdownMenuPositioner side="bottom" align="end">
				<DropdownMenuContent>
					<DropdownMenuItem onClick={onEdit}>
						<PencilIcon />
						Edit (placeholder)
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onSecondary}>
						<SettingsIcon />
						More actions (placeholder)
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() =>
							toast.message("Placeholder only", {
								description: "Bulk tools coming soon.",
							})
						}
					>
						<DownloadIcon />
						Bulk tools…
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
		</DropdownMenu>
	);
}
