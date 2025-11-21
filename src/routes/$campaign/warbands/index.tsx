import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { WarbandCard } from "~/components/warbands/warband-card";
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

export const deleteWarbandFn = createServerFn({ method: "POST" })
	.inputValidator((data: { warbandId: number }) => data)
	.handler(async ({ data }) => {
		const warbandId = data.warbandId;
		try {
			await db.delete(warbands).where(eq(warbands.id, warbandId));
		} catch {
			throw new Error(`Failed to delete warband with id ${warbandId}`);
		}
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
			<h2 className="mb-4 text-2xl font-bold text-foreground">Warbands</h2>

			{warbands.length === 0 ? (
				<div className="rounded-lg border bg-muted p-8 text-center">
					<p className="text-muted-foreground">
						No warbands in this campaign yet.
					</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{warbands.map((warband) => (
						<WarbandCard warband={warband} key={warband.id} />
					))}
				</div>
			)}
		</div>
	);
}
