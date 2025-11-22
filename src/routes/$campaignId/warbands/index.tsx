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

export const getWarbandByIdFn = createServerFn({ method: "GET" })
	.inputValidator((data: { warbandId: number }) => data)
	.handler(async ({ data }) => {
		const warband = await db.query.warbands.findFirst({
			where: eq(warbands.id, data.warbandId),
		});
		if (!warband) {
			throw new Error(`Warband with id ${data.warbandId} not found`);
		}
		return warband;
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

export const Route = createFileRoute("/$campaignId/warbands/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			campaignWarbandQueryOptions(Number(params.campaignId)),
		);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const { data: warbands } = useSuspenseQuery(
		campaignWarbandQueryOptions(Number(campaignId)),
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
