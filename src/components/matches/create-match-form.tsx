import { useMutation, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { createMatchFn, createMatchFormSchema, matchKeys } from "~/api/matches";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import { Input } from "../ui/input";

type FormValues = z.infer<typeof createMatchFormSchema>;

const { useAppForm } = createFormHook();

interface CreateMatchFormProps {
	campaignId: number;
	onSuccess?: (match: Awaited<ReturnType<typeof createMatchFn>>) => void;
}
export function CreateMatchForm({
	campaignId,
	onSuccess,
}: CreateMatchFormProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createMatchFn,
		onSuccess: (data) => {
			// Invalidate matches query to refetch the list
			queryClient.invalidateQueries({
				queryKey: matchKeys.list(campaignId),
			});
			onSuccess?.(data);
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			scenarioId: 1,
		},
		validators: {
			onChange: createMatchFormSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					name: value.name,
					scenarioId: value.scenarioId,
					campaignId: campaignId,
				},
			});
		},
	});

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="name">
					{(field) => (
						<form.Item>
							<field.Label>Match Name</field.Label>
							<field.Control>
								<Input
									type="text"
									placeholder="Match 1"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>The name of the match</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="scenarioId">
					{(field) => (
						<form.Item>
							<field.Label>Scenario ID</field.Label>
							<field.Control>
								<Input
									type="number"
									placeholder="1"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(Number(e.target.value))}
								/>
							</field.Control>
							<field.Description>The scenario being played</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? "Creating..." : "Create Match"}
					</Button>
				</div>

				{mutation.isError && (
					<div className="text-sm text-red-500">
						Error creating match. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}
