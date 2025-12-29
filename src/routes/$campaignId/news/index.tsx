import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createCustomNewsFn,
	createCustomNewsFormSchema,
	customNewsKeys,
} from "~/api/news";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { createFormHook } from "~/components/ui/form-tanstack";
import { Link } from "~/components/ui/link";
import { Textarea } from "~/components/ui/textarea";

const { useAppForm } = createFormHook();

export const Route = createFileRoute("/$campaignId/news/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { campaignId } = Route.useParams();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createCustomNewsFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: customNewsKeys.listByCampaign(campaignId),
			});
			toast.success("Added to the broadcast reel");
		},
		onError: () => {
			toast.error("Failed to add news item");
		},
	});

	const form = useAppForm({
		defaultValues: {
			content: "",
		},
		validators: {
			onChange: createCustomNewsFormSchema.omit({ campaignId: true }),
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					campaignId,
					content: value.content,
				},
			});
			form.reset();
		},
	});

	return (
		<div className="container mx-auto max-w-2xl p-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Add news reel entry</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						This page won’t show the existing entries—keep it a surprise.
					</p>
				</div>
				<Link
					variant="outline"
					to="/$campaignId/news/edit"
					params={{ campaignId }}
					className="no-underline"
				>
					Manage
				</Link>
			</div>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>New item</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.AppField name="content">
								{(field) => (
									<form.Item>
										<field.Label>Content</field.Label>
										<field.Control>
											<Textarea
												placeholder="🗞️ BREAKING: The pit fighter has returned…"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</field.Control>
										<field.Description>
											Short and punchy works best (max 200 chars).
										</field.Description>
										<field.Message />
									</form.Item>
								)}
							</form.AppField>

							<div className="flex justify-end gap-2">
								<Button type="submit" disabled={mutation.isPending}>
									{mutation.isPending ? "Adding..." : "Add to reel"}
								</Button>
							</div>
						</form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	);
}


