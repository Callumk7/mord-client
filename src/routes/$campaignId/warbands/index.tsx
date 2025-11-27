import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
	campaignWarbandsQueryOptions,
	getCampaignWarbandsWithWarriorsOptions,
} from "~/api/warbands";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { CreateWarbandForm } from "~/components/warbands/create-warband-form";
import { WarbandCard } from "~/components/warbands/warband-card";

export const Route = createFileRoute("/$campaignId/warbands/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getCampaignWarbandsWithWarriorsOptions(params.campaignId),
		);
	},
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const { data: warbands } = useSuspenseQuery(
		getCampaignWarbandsWithWarriorsOptions(campaignId),
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleWarbandCreated = () => {
		// Close the dialog
		setIsDialogOpen(false);
		// Invalidate and refetch warbands
		queryClient.invalidateQueries({
			queryKey: campaignWarbandsQueryOptions(campaignId).queryKey,
		});
	};

	return (
		<div className="mb-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-2xl font-bold text-foreground">Warbands</h2>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger render={<Button />}>
						<PlusIcon />
						Create Warband
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Warband</DialogTitle>
							<DialogDescription>
								Add a new warband to your campaign. Enter the warband's name and
								faction.
							</DialogDescription>
						</DialogHeader>
						<CreateWarbandForm
							campaignId={campaignId}
							onSuccess={handleWarbandCreated}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{warbands.length === 0 ? (
				<div className="rounded-lg border bg-muted p-8 text-center">
					<p className="mb-4 text-muted-foreground">
						No warbands in this campaign yet.
					</p>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger render={<Button />}>
							<PlusIcon />
							Create Your First Warband
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Warband</DialogTitle>
								<DialogDescription>
									Add a new warband to your campaign. Enter the warband's name
									and faction.
								</DialogDescription>
							</DialogHeader>
							<CreateWarbandForm
								campaignId={campaignId}
								onSuccess={handleWarbandCreated}
							/>
						</DialogContent>
					</Dialog>
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
