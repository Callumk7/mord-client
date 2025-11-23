import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "~/db";
import { warbands } from "~/db/schema";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import { Input } from "../ui/input";

const formSchema = z.object({
	name: z.string().min(1, "Warband name is required"),
	faction: z.string().min(1, "Warband faction is required"),
});

export const createWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(formSchema.extend({ campaignId: z.number() }))
	.handler(async ({ data }) => {
		const [newWarband] = await db
			.insert(warbands)
			.values({
				name: data.name,
				faction: data.faction,
				rating: 0,
				treasury: 0,
				campaignId: data.campaignId,
			})
			.returning();

		return newWarband;
	});

const { useAppForm } = createFormHook();

interface CreateWarbandFormProps {
	campaignId: number;
}
export function CreateWarbandForm({ campaignId }: CreateWarbandFormProps) {
	const mutation = useMutation({
		mutationFn: createWarbandFn,
		onSuccess: (data) => {
			console.log("Warband created successfully:", data);
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			faction: "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					name: value.name,
					faction: value.faction,
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
							<field.Label>Warband Name</field.Label>
							<field.Control>
								<Input
									placeholder="Grogz Boyz"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>The name of your warband</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="faction">
					{(field) => (
						<form.Item>
							<field.Label>Warband Faction</field.Label>
							<field.Control>
								<Input
									placeholder="Grogz Boyz"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>The faction of your warband</field.Description>
						</form.Item>
					)}
				</form.AppField>
				<Button type="submit">Create Warband</Button>
			</form>
		</form.AppForm>
	);
}
