import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "~/db";
import { campaigns, matches, warbands, warriors } from "~/db/schema";

// Server function to fetch campaign leaderboard data
export const getCampaignLeaderboards = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		// Fetch campaign
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId),
		});

		if (!campaign) {
			throw notFound();
		}

		// The Tyrant: Most games won
		const tyrantLeaderboard = await db
			.select({
				warbandId: warbands.id,
				name: warbands.name,
				faction: warbands.faction,
				icon: warbands.icon,
				color: warbands.color,
				wins: count(matches.id),
			})
			.from(warbands)
			.leftJoin(matches, eq(matches.winnerId, warbands.id))
			.where(eq(warbands.campaignId, campaignId))
			.groupBy(warbands.id)
			.orderBy(desc(count(matches.id)))
			.limit(5);

		// The Survivor: Most experience (sum of all warriors in warband)
		const survivorLeaderboard = await db
			.select({
				warbandId: warbands.id,
				name: warbands.name,
				faction: warbands.faction,
				icon: warbands.icon,
				color: warbands.color,
				totalExperience: sql<number>`COALESCE(SUM(${warriors.experience}), 0)`,
			})
			.from(warbands)
			.leftJoin(warriors, eq(warriors.warbandId, warbands.id))
			.where(eq(warbands.campaignId, campaignId))
			.groupBy(warbands.id)
			.orderBy(desc(sql`COALESCE(SUM(${warriors.experience}), 0)`))
			.limit(5);

		// The Opportunist: Highest gold
		const opportunistLeaderboard = await db
			.select({
				warbandId: warbands.id,
				name: warbands.name,
				faction: warbands.faction,
				icon: warbands.icon,
				color: warbands.color,
				treasury: warbands.treasury,
			})
			.from(warbands)
			.where(eq(warbands.campaignId, campaignId))
			.orderBy(desc(warbands.treasury))
			.limit(5);

		// Most Kills (individual warriors)
		const killsLeaderboard = await db
			.select({
				warriorId: warriors.id,
				name: warriors.name,
				warbandName: warbands.name,
				warbandIcon: warbands.icon,
				warbandColor: warbands.color,
				kills: warriors.kills,
			})
			.from(warriors)
			.innerJoin(warbands, eq(warriors.warbandId, warbands.id))
			.where(eq(warriors.campaignId, campaignId))
			.orderBy(desc(warriors.kills))
			.limit(5);

		// Most Injuries Taken (individual warriors)
		const injuriesLeaderboard = await db
			.select({
				warriorId: warriors.id,
				name: warriors.name,
				warbandName: warbands.name,
				warbandIcon: warbands.icon,
				warbandColor: warbands.color,
				injuriesReceived: warriors.injuriesReceived,
			})
			.from(warriors)
			.innerJoin(warbands, eq(warriors.warbandId, warbands.id))
			.where(eq(warriors.campaignId, campaignId))
			.orderBy(desc(warriors.injuriesReceived))
			.limit(5);

		return {
			campaign,
			tyrantLeaderboard,
			survivorLeaderboard,
			opportunistLeaderboard,
			killsLeaderboard,
			injuriesLeaderboard,
		};
	});

export const Route = createFileRoute("/$campaignId/")({
	loader: async ({ params }) => {
		const campaignId = Number.parseInt(params.campaignId, 10);

		if (Number.isNaN(campaignId)) {
			throw notFound();
		}

		return getCampaignLeaderboards({ data: { campaignId } });
	},
	component: RouteComponent,
	notFoundComponent: () => (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold text-foreground">
					Campaign Not Found
				</h1>
				<p className="text-muted-foreground">
					The campaign you're looking for doesn't exist.
				</p>
			</div>
		</div>
	),
});

function RouteComponent() {
	const data = Route.useLoaderData();

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div className="mx-auto max-w-7xl">
			{/* Campaign Header */}
			<div className="mb-8 rounded-lg border bg-card p-6 shadow-xl">
				<h1 className="mb-2 text-4xl font-bold text-foreground">
					{data.campaign.name}
				</h1>
				{data.campaign.description && (
					<p className="mb-4 text-lg text-foreground">
						{data.campaign.description}
					</p>
				)}
				<div className="flex gap-6 text-sm text-muted-foreground">
					<div>
						<span className="font-semibold text-foreground">Start:</span>{" "}
						{formatDate(data.campaign.startDate)}
					</div>
					<div>
						<span className="font-semibold text-foreground">End:</span>{" "}
						{formatDate(data.campaign.endDate)}
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
					<div className="grid gap-6 md:grid-cols-3">
						{/* The Tyrant */}
						<LeaderboardCard
							title="The Tyrant"
							subtitle="Most Games Won"
							icon="👑"
							entries={data.tyrantLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.faction,
								value: entry.wins,
								suffix: entry.wins === 1 ? "win" : "wins",
								icon: entry.icon,
								color: entry.color,
							}))}
						/>

						{/* The Survivor */}
						<LeaderboardCard
							title="The Survivor"
							subtitle="Most Experience"
							icon="⚔"
							entries={data.survivorLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.faction,
								value: Number(entry.totalExperience),
								suffix: "XP",
								icon: entry.icon,
								color: entry.color,
							}))}
						/>

						{/* The Opportunist */}
						<LeaderboardCard
							title="The Opportunist"
							subtitle="Richest Warband"
							icon="💰"
							entries={data.opportunistLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.faction,
								value: entry.treasury,
								suffix: "gc",
								icon: entry.icon,
								color: entry.color,
							}))}
						/>
					</div>
				</div>

				{/* Individual Warrior Leaderboards */}
				<div>
					<h2 className="mb-4 text-3xl font-bold text-foreground">
						Warrior Leaderboards
					</h2>
					<div className="grid gap-6 md:grid-cols-2">
						{/* Most Kills */}
						<LeaderboardCard
							title="Most Kills"
							subtitle="Deadliest Warriors"
							icon="💀"
							entries={data.killsLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.warbandName,
								value: entry.kills,
								suffix: entry.kills === 1 ? "kill" : "kills",
								icon: entry.warbandIcon,
								color: entry.warbandColor,
							}))}
						/>

						{/* Most Injuries Taken */}
						<LeaderboardCard
							title="Most Injuries Taken"
							subtitle="Toughest Warriors"
							icon="🩹"
							entries={data.injuriesLeaderboard.map((entry) => ({
								rank: 0,
								name: entry.name,
								subtitle: entry.warbandName,
								value: entry.injuriesReceived,
								suffix: entry.injuriesReceived === 1 ? "injury" : "injuries",
								icon: entry.warbandIcon,
								color: entry.warbandColor,
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
						{entries.map((entry, index) => (
							<div
								key={`${entry.name}-${entry.value}-${index}`}
								className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
							>
								{/* Rank */}
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground">
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
								<div className="flex-shrink-0 text-right">
									<div className="text-lg font-bold text-foreground">
										{entry.value}
									</div>
									<div className="text-xs text-muted-foreground">
										{entry.suffix}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
