import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/db";
import type { Warband } from "~/db/schema";
import { warbands } from "~/db/schema";
import { campaignWarbandQueryOptions } from "~/query/options";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
	name: z.string().min(1, "Warband name is required"),
	faction: z.string().min(1, "Warband faction is required"),
	treasury: z.number().int().min(0, "Treasury must be 0 or greater"),
	color: z.string().optional(),
	icon: z.string().optional(),
	notes: z.string().optional(),
});

export const updateWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(formSchema.extend({ warbandId: z.number() }))
	.handler(async ({ data }) => {
		const [updatedWarband] = await db
			.update(warbands)
			.set({
				name: data.name,
				faction: data.faction,
				treasury: data.treasury,
				color: data.color || null,
				icon: data.icon || null,
				notes: data.notes || null,
				updatedAt: new Date(),
			})
			.where(eq(warbands.id, data.warbandId))
			.returning();

		if (!updatedWarband) {
			throw new Error(`Failed to update warband with id ${data.warbandId}`);
		}

		return updatedWarband;
	});

const { useAppForm } = createFormHook();

interface UpdateWarbandFormProps {
	warband: Warband;
	onSuccess?: () => void;
}

export function UpdateWarbandForm({
	warband,
	onSuccess,
}: UpdateWarbandFormProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateWarbandFn,
		onSuccess: () => {
			// Invalidate warbands query to refetch the list
			queryClient.invalidateQueries(
				campaignWarbandQueryOptions(warband.campaignId),
			);
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: warband.name,
			faction: warband.faction,
			treasury: warband.treasury,
			color: warband.color || "#000000",
			icon: warband.icon || "",
			notes: warband.notes || "",
		},
		validators: {
			onChange: formSchema,
		},
				onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					name: value.name,
					faction: value.faction,
					treasury: value.treasury,
					color: value.color || undefined,
					icon: value.icon || undefined,
					notes: value.notes || undefined,
					warbandId: warband.id,
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
									placeholder="Orcs"
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

				<form.AppField name="treasury">
					{(field) => (
						<form.Item>
							<field.Label>Treasury (gc)</field.Label>
							<field.Control>
								<Input
									type="number"
									min="0"
									step="1"
									placeholder="0"
									name={field.name}
									value={field.state.value.toString()}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(Number.parseInt(e.target.value, 10) || 0)
									}
								/>
							</field.Control>
							<field.Description>
								The warband's treasury in gold crowns
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="color">
					{(field) => (
						<form.Item>
							<field.Label>Color (Optional)</field.Label>
							<field.Control>
								<Input
									type="color"
									name={field.name}
									value={field.state.value || "#000000"}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>
								Color theme for this warband
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="icon">
					{(field) => (
						<form.Item>
							<field.Label>Icon (Optional)</field.Label>
							<field.Control>
								<Input
									placeholder="⚔️"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>
								Emoji or icon to represent this warband
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="notes">
					{(field) => (
						<form.Item>
							<field.Label>Notes (Optional)</field.Label>
							<field.Control>
								<Textarea
									placeholder="Additional notes about this warband..."
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={3}
								/>
							</field.Control>
							<field.Description>
								Additional notes or information about this warband
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? "Updating..." : "Update Warband"}
					</Button>
				</div>

				{mutation.isError && (
					<div className="text-sm text-destructive">
						Error updating warband. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}

