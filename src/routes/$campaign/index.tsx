import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
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
	notFoundComponent: () => (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold text-white">
					Campaign Not Found
				</h1>
				<p className="text-gray-400">
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
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-6">
			<div className="mx-auto max-w-6xl">
				{/* Campaign Header */}
				<div className="mb-8 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6 shadow-xl backdrop-blur-sm">
					<h1 className="mb-2 text-4xl font-bold text-white">
						{campaign.name}
					</h1>
					{campaign.description && (
						<p className="mb-4 text-lg text-gray-300">{campaign.description}</p>
					)}
					<div className="flex gap-6 text-sm text-gray-400">
						<div>
							<span className="font-semibold text-gray-300">Start:</span>{" "}
							{formatDate(campaign.startDate)}
						</div>
						<div>
							<span className="font-semibold text-gray-300">End:</span>{" "}
							{formatDate(campaign.endDate)}
						</div>
						<div>
							<span className="font-semibold text-gray-300">Warbands:</span>{" "}
							{campaign.warbands.length}
						</div>
					</div>
				</div>

				{/* Warbands Section */}
				<div className="mb-6">
					<h2 className="mb-4 text-2xl font-bold text-white">Warbands</h2>

					{campaign.warbands.length === 0 ? (
						<div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-8 text-center">
							<p className="text-gray-400">No warbands in this campaign yet.</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{campaign.warbands.map((warband) => (
								<div
									key={warband.id}
									className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-5 shadow-lg transition-all hover:border-zinc-600 hover:shadow-xl"
								>
									{/* Warband Header */}
									<div className="mb-3 flex items-start justify-between">
										<div>
											<h3 className="text-xl font-bold text-white">
												{warband.name}
											</h3>
											<p className="text-sm text-gray-400">{warband.faction}</p>
										</div>
										{warband.icon && (
											<div className="text-2xl">{warband.icon}</div>
										)}
									</div>

									{/* Warband Stats */}
									<div className="grid grid-cols-2 gap-3 border-t border-zinc-700 pt-3">
										<div>
											<div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
												Rating
											</div>
											<div className="text-2xl font-bold text-white">
												{warband.rating}
											</div>
										</div>
										<div>
											<div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
												Treasury
											</div>
											<div className="text-2xl font-bold text-yellow-500">
												{warband.treasury} gc
											</div>
										</div>
									</div>

									{/* Warband Notes */}
									{warband.notes && (
										<div className="mt-3 border-t border-zinc-700 pt-3">
											<p className="text-sm text-gray-300">{warband.notes}</p>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
