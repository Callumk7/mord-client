import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { warbands } from "~/db/schema";
import { campaignWarbandQueryOptions } from "~/query/options";

export const getCampaignWarbandsFn = createServerFn({ method: "GET" })
	.inputValidator((data: { campaignId: number }) => data)
	.handler(async ({ data }) => {
		const campaignId = data.campaignId;
		return await db.query.warbands.findMany({
			where: eq(warbands.campaignId, campaignId),
		});
	});

export const Route = createFileRoute("/$campaign/warbands/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			campaignWarbandQueryOptions(Number(params.campaign)),
		);
	},
});

function RouteComponent() {
	const { campaign } = Route.useParams();
	const { data: warbands } = useSuspenseQuery(
		campaignWarbandQueryOptions(Number(campaign)),
	);

	return (
		<div className="mb-6">
			<h2 className="mb-4 text-2xl font-bold text-white">Warbands</h2>

			{warbands.length === 0 ? (
				<div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-8 text-center">
					<p className="text-gray-400">No warbands in this campaign yet.</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{warbands.map((warband) => (
						<Link
							key={warband.id}
							to="/$campaign/warbands/$warband"
							params={{
								campaign: campaign,
								warband: warband.id.toString(),
							}}
							className="block rounded-lg border border-zinc-700 bg-zinc-800/50 p-5 shadow-lg transition-all hover:border-zinc-600 hover:shadow-xl cursor-pointer"
						>
							{/* Warband Header */}
							<div className="mb-3 flex items-start justify-between">
								<div>
									<h3 className="text-xl font-bold text-white">
										{warband.name}
									</h3>
									<p className="text-sm text-gray-400">{warband.faction}</p>
								</div>
								{warband.icon && <div className="text-2xl">{warband.icon}</div>}
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
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
