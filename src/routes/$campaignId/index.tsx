import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	getCampaignOptions,
	getMostGamesWonOptions,
	getMostInjuriesFromEventsOptions,
	getMostInjuriesInflictedFromEventsOptions,
	getMostKillsFromEventsOptions,
	getMostRatingOptions,
	getMostTreasuryOptions,
} from "~/api/campaign";
import type { ChartConfig } from "~/components/ui/chart";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";

export const Route = createFileRoute("/$campaignId/")({
	loader: async ({ params, context }) => {
		const campaignId = params.campaignId;

		context.queryClient.ensureQueryData(getCampaignOptions(campaignId));
		context.queryClient.ensureQueryData(getMostGamesWonOptions(campaignId));
		context.queryClient.ensureQueryData(getMostTreasuryOptions(campaignId));
		context.queryClient.ensureQueryData(getMostRatingOptions(campaignId));
		context.queryClient.ensureQueryData(
			getMostKillsFromEventsOptions(campaignId),
		);
		context.queryClient.ensureQueryData(
			getMostInjuriesFromEventsOptions(campaignId),
		);
		context.queryClient.ensureQueryData(
			getMostInjuriesInflictedFromEventsOptions(campaignId),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();

	// Fetch all data with React Query
	const { data: campaign } = useSuspenseQuery(getCampaignOptions(campaignId));
	const { data: gamesWon } = useSuspenseQuery(
		getMostGamesWonOptions(campaignId),
	);
	const { data: treasury } = useSuspenseQuery(
		getMostTreasuryOptions(campaignId),
	);
	const { data: rating } = useSuspenseQuery(getMostRatingOptions(campaignId));
	const { data: killsFromEvents } = useSuspenseQuery(
		getMostKillsFromEventsOptions(campaignId),
	);
	const { data: injuriesFromEvents } = useSuspenseQuery(
		getMostInjuriesFromEventsOptions(campaignId),
	);
	const { data: injuriesInflictedFromEvents } = useSuspenseQuery(
		getMostInjuriesInflictedFromEventsOptions(campaignId),
	);

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	// Transform and limit data to match component expectations
	const tyrantLeaderboard = gamesWon.slice(0, 5).map((entry) => ({
		warbandId: entry.warbandId,
		name: entry.warband.name,
		faction: entry.warband.faction,
		icon: entry.warband.icon,
		color: entry.warband.color,
		wins: entry.wins,
		linkTo: `/${campaignId}/warbands/${entry.warbandId}`,
	}));

	const opportunistLeaderboard = treasury.slice(0, 5).map((entry) => ({
		warbandId: entry.warbandId,
		name: entry.warband.name,
		faction: entry.warband.faction,
		icon: entry.warband.icon,
		color: entry.warband.color,
		treasury: entry.treasury,
		linkTo: `/${campaignId}/warbands/${entry.warbandId}`,
	}));

	const survivorLeaderboard = rating.slice(0, 5).map((entry) => ({
		warbandId: entry.warbandId,
		name: entry.warband.name,
		faction: entry.warband.faction,
		icon: entry.warband.icon,
		color: entry.warband.color,
		rating: entry.rating,
		linkTo: `/${campaignId}/warbands/${entry.warbandId}`,
	}));

	const killsFromEventsLeaderboard = killsFromEvents
		.slice(0, 5)
		.map((entry) => ({
			warriorId: entry.warriorId,
			name: entry.warrior.name,
			warbandName: entry.warbandName,
			warbandIcon: entry.warbandIcon,
			warbandColor: entry.warbandColor,
			kills: entry.kills,
			linkTo: `/${campaignId}/warriors/${entry.warriorId}`,
		}));

	const injuriesFromEventsLeaderboard = injuriesFromEvents
		.slice(0, 5)
		.map((entry) => ({
			warriorId: entry.warriorId,
			name: entry.warrior.name,
			warbandName: entry.warbandName,
			warbandIcon: entry.warbandIcon,
			warbandColor: entry.warbandColor,
			injuriesReceived: entry.injuriesReceived,
			linkTo: `/${campaignId}/warriors/${entry.warriorId}`,
		}));

	const injuriesInflictedLeaderboard = injuriesInflictedFromEvents
		.slice(0, 5)
		.map((entry) => ({
			warriorId: entry.warriorId,
			name: entry.warrior.name,
			warbandName: entry.warbandName,
			warbandIcon: entry.warbandIcon,
			warbandColor: entry.warbandColor,
			injuriesInflicted: entry.injuriesInflicted,
			linkTo: `/${campaignId}/warriors/${entry.warriorId}`,
		}));

	const warbandWealthAndRatingConfig = {
		treasury: {
			label: "Treasury (gc)",
			color: "var(--chart-1)",
		},
		rating: {
			label: "Rating",
			color: "var(--chart-2)",
		},
		wins: {
			label: "Wins",
			color: "var(--chart-3)",
		},
	} satisfies ChartConfig;

	const warbandWealthAndRatingData = (() => {
		const byId = new Map<
			number,
			{
				warbandId: number;
				name: string;
				icon: string | null;
				color: string | null;
				treasury: number;
				rating: number;
				wins: number;
			}
		>();

		for (const entry of treasury) {
			const existing = byId.get(entry.warbandId);
			byId.set(entry.warbandId, {
				warbandId: entry.warbandId,
				name: entry.warband.name,
				icon: entry.warband.icon,
				color: entry.warband.color,
				treasury: entry.treasury ?? 0,
				rating: existing?.rating ?? 0,
				wins: existing?.wins ?? 0,
			});
		}

		for (const entry of rating) {
			const existing = byId.get(entry.warbandId);
			byId.set(entry.warbandId, {
				warbandId: entry.warbandId,
				name: entry.warband.name,
				icon: entry.warband.icon,
				color: entry.warband.color,
				treasury: existing?.treasury ?? 0,
				rating: entry.rating ?? 0,
				wins: existing?.wins ?? 0,
			});
		}

		for (const entry of gamesWon) {
			const existing = byId.get(entry.warbandId);
			byId.set(entry.warbandId, {
				warbandId: entry.warbandId,
				name: entry.warband.name,
				icon: entry.warband.icon,
				color: entry.warband.color,
				treasury: existing?.treasury ?? 0,
				rating: existing?.rating ?? 0,
				wins: entry.wins ?? 0,
			});
		}

		return Array.from(byId.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	})();

	return (
		<div className="mx-auto max-w-7xl">
			{/* Campaign Header */}
			<div className="mb-8 rounded-lg border bg-card p-6 shadow-xl">
				<h1 className="mb-2 text-4xl font-bold text-foreground">
					{campaign?.name}
				</h1>
				{campaign?.description && (
					<p className="mb-4 text-lg text-foreground">{campaign.description}</p>
				)}
				<div className="flex gap-6 text-sm text-muted-foreground">
					<div>
						<span className="font-semibold text-foreground">Start:</span>{" "}
						{campaign && formatDate(campaign.startDate)}
					</div>
					<div>
						<span className="font-semibold text-foreground">End:</span>{" "}
						{campaign && formatDate(campaign.endDate)}
					</div>
				</div>
			</div>

			{/* Leaderboards */}
			<div className="space-y-8">
				{/* Warband Leaderboards */}
				<div>
					<h2 className="mb-4 text-3xl font-bold text-foreground">
						Warband Leaderboards
					</h2>

					{/* Warband Treasury + Rating chart */}
					<div className="mb-6 rounded-lg border bg-card p-6 shadow-lg">
						<div className="mb-4">
							<h3 className="text-xl font-bold text-foreground">
								Treasury & Rating
							</h3>
							<p className="text-sm text-muted-foreground">
								Side-by-side bars for each warband.
							</p>
						</div>

						{warbandWealthAndRatingData.length === 0 ? (
							<p className="py-10 text-center text-sm text-muted-foreground">
								No warband data yet
							</p>
						) : (
							<ChartContainer
								config={warbandWealthAndRatingConfig}
								className="aspect-auto h-[360px] w-full"
							>
								<BarChart
									data={warbandWealthAndRatingData}
									margin={{ left: 12, right: 12, bottom: 36 }}
								>
									<CartesianGrid
										vertical={false}
										className="stroke-border/50"
									/>
									<XAxis
										dataKey="name"
										tickLine={false}
										axisLine={false}
										interval={0}
										height={60}
										angle={-30}
										textAnchor="end"
									/>
									<YAxis
										yAxisId="treasury"
										tickLine={false}
										axisLine={false}
										width={48}
									/>
									<YAxis
										yAxisId="rating"
										orientation="right"
										tickLine={false}
										axisLine={false}
										width={48}
									/>
									<YAxis yAxisId="wins" hide />
									<ChartTooltip
										content={
											<ChartTooltipContent
												indicator="dot"
												labelClassName="font-semibold"
											/>
										}
									/>
									<ChartLegend content={<ChartLegendContent />} />
									<Bar
										yAxisId="treasury"
										dataKey="treasury"
										fill="var(--color-treasury)"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										yAxisId="rating"
										dataKey="rating"
										fill="var(--color-rating)"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										yAxisId="wins"
										dataKey="wins"
										fill="var(--color-wins)"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ChartContainer>
						)}
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{/* The Tyrant */}
						<LeaderboardCard
							title="The Tyrant"
							subtitle="Most Games Won"
							icon="👑"
							entries={tyrantLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.faction,
								value: entry.wins,
								suffix: entry.wins === 1 ? "win" : "wins",
								icon: entry.icon,
								color: entry.color,
								linkTo: entry.linkTo,
							}))}
						/>

						{/* The Opportunist */}
						<LeaderboardCard
							title="The Opportunist"
							subtitle="Richest Warband"
							icon="💰"
							entries={opportunistLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.faction,
								value: entry.treasury,
								suffix: "gc",
								icon: entry.icon,
								color: entry.color,
								linkTo: entry.linkTo,
							}))}
						/>

						{/* The Survivor */}
						<LeaderboardCard
							title="The Survivor"
							subtitle="Most Rating"
							icon="👑"
							entries={survivorLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.faction,
								value: entry.rating,
								suffix: "rating",
								icon: entry.icon,
								color: entry.color,
								linkTo: entry.linkTo,
							}))}
						/>
					</div>
				</div>

				{/* Individual Warrior Leaderboards */}
				<div>
					<h2 className="mb-4 text-3xl font-bold text-foreground">
						Warrior Leaderboards
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						{/* Most Kills from Events */}
						<LeaderboardCard
							title="Most Kills from Events"
							subtitle="Event Warriors"
							icon="⚡"
							entries={killsFromEventsLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.warbandName,
								value: entry.kills,
								suffix: entry.kills === 1 ? "kill" : "kills",
								icon: entry.warbandIcon,
								color: entry.warbandColor,
								linkTo: entry.linkTo,
							}))}
						/>

						{/* Most Injuries Inflicted from Events */}
						<LeaderboardCard
							title="Most Injuries Inflicted from Events"
							subtitle="Event Casualties"
							icon="🔥"
							entries={injuriesInflictedLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.warbandName,
								value: entry.injuriesInflicted,
								suffix: entry.injuriesInflicted === 1 ? "injury" : "injuries",
								icon: entry.warbandIcon,
								color: entry.warbandColor,
								linkTo: entry.linkTo,
							}))}
						/>

						{/* Most Injuries from Events */}
						<LeaderboardCard
							title="Most Injuries Taken"
							subtitle="Toughest Warriors"
							icon="🩹"
							entries={injuriesFromEventsLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.warbandName,
								value: entry.injuriesReceived,
								suffix: entry.injuriesReceived === 1 ? "injury" : "injuries",
								icon: entry.warbandIcon,
								color: entry.warbandColor,
								linkTo: entry.linkTo,
							}))}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

interface LeaderboardEntry {
	rank: number;
	name: string;
	subtitle: string;
	value: number;
	suffix: string;
	icon: string | null;
	color: string | null;
	linkTo?: string;
}

interface LeaderboardCardProps {
	title: string;
	subtitle: string;
	icon: string;
	entries: LeaderboardEntry[];
}

function LeaderboardCard({
	title,
	subtitle,
	icon,
	entries,
}: LeaderboardCardProps) {
	return (
		<div className="rounded-lg border bg-card shadow-lg">
			{/* Card Header */}
			<div className="border-b bg-muted/50 p-4">
				<div className="flex items-center gap-3">
					<span className="text-3xl">{icon}</span>
					<div>
						<h3 className="text-xl font-bold text-foreground">{title}</h3>
						<p className="text-sm text-muted-foreground">{subtitle}</p>
					</div>
				</div>
			</div>

			{/* Leaderboard Entries */}
			<div className="p-4">
				{entries.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No data yet
					</p>
				) : (
					<div className="space-y-3">
						{entries.map((entry, index) => {
							const content = (
								<>
									{/* Rank */}
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground">
										{index + 1}
									</div>

									{/* Icon */}
									{entry.icon && (
										<div
											className="text-xl"
											style={{ color: entry.color || undefined }}
										>
											{entry.icon}
										</div>
									)}

									{/* Name and Subtitle */}
									<div className="min-w-0 flex-1">
										<div className="truncate font-semibold text-foreground">
											{entry.name}
										</div>
										<div className="truncate text-xs text-muted-foreground">
											{entry.subtitle}
										</div>
									</div>

									{/* Value */}
									<div className="shrink-0 text-right">
										<div className="text-lg font-bold text-foreground">
											{entry.value}
										</div>
										<div className="text-xs text-muted-foreground">
											{entry.suffix}
										</div>
									</div>
								</>
							);

							return entry.linkTo ? (
								<Link
									key={`${entry.name}-${entry.value}-${index}`}
									to={entry.linkTo}
									className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
								>
									{content}
								</Link>
							) : (
								<div
									key={`${entry.name}-${entry.value}-${index}`}
									className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
								>
									{content}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
