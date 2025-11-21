import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { CreateWarbandForm } from "~/components/warbands/create-warband-form";
import { db } from "~/db";
import { campaigns } from "~/db/schema";

// Server function to fetch campaign with its warbands
export const getCampaignData = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;

		// Fetch campaign
		const campaign = await db.query.campaigns.findFirst({
			where: eq(campaigns.id, campaignId),
			with: {
				warbands: {
					orderBy: (warbands, { desc }) => [desc(warbands.rating)],
				},
			},
		});

		if (!campaign) {
			throw notFound();
		}

		return campaign;
	});

export const Route = createFileRoute("/$campaign/")({
	loader: async ({ params }) => {
		const campaignId = Number.parseInt(params.campaign, 10);

		if (Number.isNaN(campaignId)) {
			throw notFound();
		}

		return getCampaignData({ data: { campaignId } });
	},
	component: RouteComponent,
	// WARN: This doesn't work - the error type must be incorrect
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
	const campaign = Route.useLoaderData();

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div className="mx-auto max-w-6xl">
			{/* Campaign Header */}
			<div className="mb-8 rounded-lg border bg-card p-6 shadow-xl">
				<h1 className="mb-2 text-4xl font-bold text-foreground">
					{campaign.name}
				</h1>
				{campaign.description && (
					<p className="mb-4 text-lg text-foreground">{campaign.description}</p>
				)}
				<div className="flex gap-6 text-sm text-muted-foreground">
					<div>
						<span className="font-semibold text-foreground">Start:</span>{" "}
						{formatDate(campaign.startDate)}
					</div>
					<div>
						<span className="font-semibold text-foreground">End:</span>{" "}
						{formatDate(campaign.endDate)}
					</div>
					<div>
						<span className="font-semibold text-foreground">Warbands:</span>{" "}
						{campaign.warbands.length}
					</div>
				</div>
			</div>

			{/* Warbands Section */}
			<div className="mb-6">
				<h2 className="mb-4 text-2xl font-bold text-foreground">Warbands</h2>

				{campaign.warbands.length === 0 ? (
					<div className="rounded-lg border bg-muted p-8 text-center">
						<p className="text-muted-foreground">
							No warbands in this campaign yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{campaign.warbands.map((warband) => (
							<Link
								key={warband.id}
								to="/$campaign/warbands/$warband"
								params={{
									campaign: campaign.id.toString(),
									warband: warband.id.toString(),
								}}
								className="block rounded-lg border bg-card p-5 shadow-lg transition-all hover:border-primary cursor-pointer"
							>
								{/* Warband Header */}
								<div className="mb-3 flex items-start justify-between">
									<div>
										<h3 className="text-xl font-bold text-foreground">
											{warband.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											{warband.faction}
										</p>
									</div>
									{warband.icon && (
										<div className="text-2xl">{warband.icon}</div>
									)}
								</div>

								{/* Warband Stats */}
								<div className="grid grid-cols-2 gap-3 border-t pt-3">
									<div>
										<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Rating
										</div>
										<div className="text-2xl font-bold text-foreground">
											{warband.rating}
										</div>
									</div>
									<div>
										<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Treasury
										</div>
										<div className="text-2xl font-bold text-chart-1">
											{warband.treasury} gc
										</div>
									</div>
								</div>

								{/* Warband Notes */}
								{warband.notes && (
									<div className="mt-3 border-t pt-3">
										<p className="text-sm text-foreground">{warband.notes}</p>
									</div>
								)}
							</Link>
						))}
					</div>
				)}
			</div>
			<CreateWarbandForm campaignId={campaign.id} />
		</div>
	);
}
