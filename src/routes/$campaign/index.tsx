import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ScenarioCard } from "~/components/ScenarioCard";
import { ScenarioCreateForm } from "~/components/ScenarioCreateForm";
import { Separator } from "~/components/ui/separator";
import { WarbandCard } from "~/components/WarbandCard";
import { WarbandCreateForm } from "~/components/WarbandCreateForm";
import { getScenarios } from "~/data/scenarios";
import { getWarbands } from "~/data/warbands";

export const Route = createFileRoute("/$campaign/")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const campaignId = Number(params.campaign);

		// Prefetch both warbands and scenarios
		const [warbands, scenarios] = await Promise.all([
			getWarbands({ data: { campaignId } }),
			getScenarios({ data: { campaignId } }),
		]);

		return { warbands, scenarios, campaignId };
	},
});

function RouteComponent() {
	const { campaign } = Route.useParams();
	const loaderData = Route.useLoaderData();
	const campaignId = Number(campaign);

	// Use TanStack Query with the prefetched data
	const {
		data: warbands,
		isLoading: warbandsLoading,
		refetch: refetchWarbands,
	} = useSuspenseQuery({
		queryKey: ["warbands", campaignId],
		queryFn: () => getWarbands({ data: { campaignId } }),
		initialData: loaderData.warbands,
	});

	const {
		data: scenarios,
		isLoading: scenariosLoading,
		refetch: refetchScenarios,
	} = useSuspenseQuery({
		queryKey: ["scenarios", campaignId],
		queryFn: () => getScenarios({ data: { campaignId } }),
		initialData: loaderData.scenarios,
	});

	return (
		<div className="container mx-auto p-4 md:p-6 space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Campaign Overview</h1>
				<p className="text-muted-foreground">
					Manage your warbands and scenarios for Campaign {campaign}
				</p>
			</div>

			<Separator />

			{/* Warbands Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-semibold">Warbands</h2>
						<p className="text-sm text-muted-foreground">
							{warbands.length} {warbands.length === 1 ? "warband" : "warbands"}{" "}
							in this campaign
						</p>
					</div>
					<WarbandCreateForm
						campaignId={campaignId}
						onSuccess={() => refetchWarbands()}
					/>
				</div>

				{warbandsLoading ? (
					<div className="text-center py-12 text-muted-foreground">
						Loading warbands...
					</div>
				) : warbands.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed rounded-lg">
						<p className="text-muted-foreground mb-4">
							No warbands yet. Create your first warband to get started!
						</p>
						<WarbandCreateForm
							campaignId={campaignId}
							onSuccess={() => refetchWarbands()}
						/>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{warbands.map((warband) => (
							<WarbandCard
								key={warband.id}
								warband={warband}
								campaignId={campaign}
								warriorCount={0} // TODO: Add warrior count from query
							/>
						))}
					</div>
				)}
			</section>

			<Separator />

			{/* Scenarios Section */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-semibold">Scenarios</h2>
						<p className="text-sm text-muted-foreground">
							{scenarios.length}{" "}
							{scenarios.length === 1 ? "scenario" : "scenarios"} available
						</p>
					</div>
					<ScenarioCreateForm
						campaignId={campaignId}
						onSuccess={() => refetchScenarios()}
					/>
				</div>

				{scenariosLoading ? (
					<div className="text-center py-12 text-muted-foreground">
						Loading scenarios...
					</div>
				) : scenarios.length === 0 ? (
					<div className="text-center py-12 border-2 border-dashed rounded-lg">
						<p className="text-muted-foreground mb-4">
							No scenarios yet. Create your first scenario!
						</p>
						<ScenarioCreateForm
							campaignId={campaignId}
							onSuccess={() => refetchScenarios()}
						/>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{scenarios.map((scenario) => (
							<ScenarioCard
								key={scenario.id}
								scenario={scenario}
								matchCount={0} // TODO: Add match count from query
								isPlayed={false} // TODO: Determine if scenario has been played
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
