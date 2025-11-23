import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "~/db";
import { matches } from "~/db/schema";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const formSchema = z.object({
	name: z.string().min(1, "Match name is required"),
	matchType: z.enum(["1v1", "2v2", "2v1", "3v3", "battle_royale"]),
	resultType: z.enum(["standard", "team", "placement"]),
	scenarioId: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export const createMatchFn = createServerFn({ method: "POST" })
	.inputValidator(formSchema.extend({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		const [newMatch] = await db
			.insert(matches)
			.values({
				name: data.name,
				date: new Date(),
				matchType: data.matchType,
				resultType: data.resultType,
				scenarioId: data.scenarioId,
				status: "scheduled",
				campaignId: data.campaignId,
			})
			.returning();

		return newMatch;
	});

const { useAppForm } = createFormHook();

interface CreateMatchFormProps {
	campaignId: number;
	onSuccess?: (match: typeof matches.$inferSelect) => void;
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
				queryKey: ["matches", campaignId],
			});
			onSuccess?.(data);
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			matchType: "1v1" as FormValues["matchType"],
			resultType: "standard" as FormValues["resultType"],
			scenarioId: 1,
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					name: value.name,
					matchType: value.matchType,
					resultType: value.resultType,
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

				<form.AppField name="matchType">
					{(field) => (
						<form.Item>
							<field.Label>Match Type</field.Label>
							<field.Control>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
									itemToStringLabel={(item) =>
										item === "battle_royale"
											? "Battle Royale"
											: (item as string)
									}
								>
									<SelectTrigger className="min-w-sm">
										<SelectValue placeholder="Select a match type" />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value={"1v1"}>1v1</SelectItem>
											<SelectItem value={"2v2"}>2v2</SelectItem>
											<SelectItem value={"2v1"}>2v1</SelectItem>
											<SelectItem value={"3v3"}>3v3</SelectItem>
											<SelectItem value={"battle_royale"}>
												Battle Royale
											</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
							<field.Description>Type of match format</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="resultType">
					{(field) => (
						<form.Item>
							<field.Label>Result Type</field.Label>
							<field.Control>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger className="min-w-sm">
										<SelectValue placeholder="Select a result type" />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value={"standard"}>Standard</SelectItem>
											<SelectItem value={"team"}>Team</SelectItem>
											<SelectItem value={"placement"}>Placement</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
							<field.Description>How results are recorded</field.Description>
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
