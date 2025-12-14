import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCampaignHistoryOptions } from "~/api/campaign-history";
import { WarbandProgressChart } from "~/components/campaign/warband-progress-chart";
import { buildTimeSeriesData, groupByWarband } from "~/lib/campaign-history";

export const Route = createFileRoute("/$campaignId/progress/")({
	loader: async ({ params, context }) => {
		const campaignId = Number(params.campaignId);
		await context.queryClient.ensureQueryData(
			getCampaignHistoryOptions(campaignId),
		);
	},
	component: ProgressPage,
});

function ProgressPage() {
	const { campaignId } = Route.useParams();
	const { data: history } = useSuspenseQuery(
		getCampaignHistoryOptions(Number(campaignId)),
	);

	const timeSeriesData = buildTimeSeriesData(history);
	const warbandGroups = groupByWarband(timeSeriesData);

	// If no data yet, show empty state
	if (timeSeriesData.length === 0) {
		return (
			<div className="mx-auto max-w-7xl">
				<h1 className="mb-8 text-3xl font-bold">Campaign Progress</h1>
				<div className="rounded-lg border bg-card p-12 text-center">
					<p className="text-muted-foreground">
						No progression data yet. Complete some post-match resolutions to see
						charts here.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-8">
			<h1 className="text-3xl font-bold">Campaign Progress</h1>

			<WarbandProgressChart
				title="Rating Progression"
				data={timeSeriesData}
				warbandGroups={warbandGroups}
				dataKey="rating"
				yAxisLabel="Rating"
				defaultColor="#8884d8"
			/>

			<WarbandProgressChart
				title="Treasury Progression"
				data={timeSeriesData}
				warbandGroups={warbandGroups}
				dataKey="treasury"
				yAxisLabel="Gold Crowns"
				defaultColor="#82ca9d"
			/>

			<WarbandProgressChart
				title="Experience Progression"
				data={timeSeriesData}
				warbandGroups={warbandGroups}
				dataKey="experience"
				yAxisLabel="Experience"
				defaultColor="#ffc658"
			/>
		</div>
	);
}
