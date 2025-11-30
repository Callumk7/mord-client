import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useId, useState } from "react";
import { z } from "zod";
import { campaignKeys, getCampaignsOptions } from "~/api/campaign";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { db } from "~/db";
import { campaigns } from "~/db/schema";

// Zod schema for campaign creation
const createCampaignSchema = z.object({
	name: z.string().min(1, "Campaign name is required"),
	description: z.string().optional(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

// Server function to create a new campaign
export const createCampaign = createServerFn({ method: "POST" })
	.inputValidator(createCampaignSchema)
	.handler(async ({ data }) => {
		const [newCampaign] = await db
			.insert(campaigns)
			.values({
				name: data.name,
				description: data.description,
				startDate: data.startDate,
				endDate: data.endDate,
			})
			.returning();

		return newCampaign;
	});

// Server function to fetch all campaigns
export const getCampaigns = createServerFn({ method: "GET" }).handler(
	async () => {
		const allCampaigns = await db.select().from(campaigns);
		return allCampaigns;
	},
);

export const Route = createFileRoute("/")({
	// Ensure campaigns data is loaded before rendering
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getCampaignsOptions),
	component: App,
});

function App() {
	const nameId = useId();
	const descriptionId = useId();
	const startDateId = useId();
	const endDateId = useId();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		startDate: "",
		endDate: "",
	});

	// Fetch campaigns from cache and subscribe to updates
	const { data: campaignsList } = useSuspenseQuery(getCampaignsOptions);

	const mutation = useMutation({
		mutationFn: createCampaign,
		onSuccess: (data) => {
			console.log("Campaign created successfully:", data);
			// Reset form
			setFormData({
				name: "",
				description: "",
				startDate: "",
				endDate: "",
			});
			// Invalidate campaigns query to refetch
			queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
		},
		onError: (error) => {
			console.error("Error creating campaign:", error);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutation.mutate({
			data: {
				name: formData.name,
				description: formData.description,
				startDate: new Date(formData.startDate),
				endDate: new Date(formData.endDate),
			},
		});
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-zinc-800 to-black p-4">
			<div className="mx-auto max-w-4xl pt-8">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-4xl font-bold text-white">Mord Stats</h1>
					<p className="text-gray-400">
						Track your Mordheim campaign statistics
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{/* Create Campaign Form */}
					<Card className="p-6">
						<h2 className="mb-4 text-xl font-semibold">Create New Campaign</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							<Field>
								<FieldLabel htmlFor={nameId}>Campaign Name</FieldLabel>
								<FieldContent>
									<Input
										id={nameId}
										type="text"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Weekend Warband Campaign"
										required
									/>
									<FieldDescription>
										The name of your Mordheim campaign
									</FieldDescription>
									{mutation.error && (
										<FieldError>
											{mutation.error instanceof Error
												? mutation.error.message
												: "An error occurred"}
										</FieldError>
									)}
								</FieldContent>
							</Field>

							<Field>
								<FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
								<FieldContent>
									<Input
										id={descriptionId}
										type="text"
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="A thrilling weekend of Mordheim battles"
									/>
									<FieldDescription>
										Optional description of the campaign
									</FieldDescription>
								</FieldContent>
							</Field>

							<Field>
								<FieldLabel htmlFor={startDateId}>Start Date</FieldLabel>
								<FieldContent>
									<Input
										id={startDateId}
										type="date"
										value={formData.startDate}
										onChange={(e) =>
											setFormData({ ...formData, startDate: e.target.value })
										}
										required
									/>
									<FieldDescription>
										When does the campaign start?
									</FieldDescription>
								</FieldContent>
							</Field>

							<Field>
								<FieldLabel htmlFor={endDateId}>End Date</FieldLabel>
								<FieldContent>
									<Input
										id={endDateId}
										type="date"
										value={formData.endDate}
										onChange={(e) =>
											setFormData({ ...formData, endDate: e.target.value })
										}
										required
									/>
									<FieldDescription>
										When does the campaign end?
									</FieldDescription>
								</FieldContent>
							</Field>

							<div className="flex gap-2 pt-4">
								<Button
									type="submit"
									disabled={mutation.isPending}
									className="flex-1"
								>
									{mutation.isPending ? "Creating..." : "Create Campaign"}
								</Button>

								{mutation.isSuccess && (
									<div className="flex flex-1 items-center justify-center rounded-md bg-green-500/10 text-green-500">
										Campaign created successfully!
									</div>
								)}
							</div>
						</form>
					</Card>

					{/* Campaigns List */}
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-white">Your Campaigns</h2>

						{!campaignsList || campaignsList.length === 0 ? (
							<Card className="p-6">
								<p className="text-center text-gray-400">
									No campaigns yet. Create one to get started!
								</p>
							</Card>
						) : (
							<div className="space-y-4">
								{campaignsList.map((campaign) => (
									<Link
										key={campaign.id}
										to="/$campaignId"
										params={{ campaignId: campaign.id }}
										className="block"
									>
										<Card className="p-4 transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
											<h3 className="mb-2 text-lg font-semibold text-white">
												{campaign.name}
											</h3>
											{campaign.description && (
												<p className="mb-2 text-sm text-gray-400">
													{campaign.description}
												</p>
											)}
											<div className="flex gap-4 text-xs text-gray-500">
												<span>
													Start:{" "}
													{new Date(campaign.startDate).toLocaleDateString()}
												</span>
												<span>
													End: {new Date(campaign.endDate).toLocaleDateString()}
												</span>
											</div>
										</Card>
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
