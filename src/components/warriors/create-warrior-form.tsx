import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { db } from "~/db";
import { warriors } from "~/db/schema";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import { Input } from "../ui/input";

const formSchema = z.object({
	name: z.string().min(1, "Warrior name is required"),
	type: z.enum(["hero", "henchman"]),
	equipment: z.string(),
	skills: z.string(),
});

export const createWarriorFn = createServerFn({ method: "POST" })
	.inputValidator(
		formSchema.extend({ warbandId: z.number(), campaignId: z.number() }),
	)
	.handler(async ({ data }) => {
		// Parse comma-separated equipment and skills strings into arrays
		const equipment = data.equipment
			? data.equipment.split(",").map((item) => item.trim())
			: [];
		const skills = data.skills
			? data.skills.split(",").map((skill) => skill.trim())
			: [];

		const [newWarrior] = await db
			.insert(warriors)
			.values({
				name: data.name,
				warbandId: data.warbandId,
				campaignId: data.campaignId,
				type: data.type,
				experience: 0,
				kills: 0,
				injuriesCaused: 0,
				injuriesReceived: 0,
				gamesPlayed: 0,
				isAlive: true,
				equipment: equipment.length > 0 ? equipment : null,
				skills: skills.length > 0 ? skills : null,
			})
			.returning();

		return newWarrior;
	});

const { useAppForm } = createFormHook();

interface CreateWarriorFormProps {
	campaignId: number;
	warbandId: number;
	onSuccess?: () => void;
}

export function CreateWarriorForm({
	campaignId,
	warbandId,
	onSuccess,
}: CreateWarriorFormProps) {
	const queryClient = useQueryClient();
	const [_warriorType, setWarriorType] = useState<"hero" | "henchman">("hero");

	const mutation = useMutation({
		mutationFn: createWarriorFn,
		onSuccess: () => {
			// Invalidate warriors query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["warriors", warbandId],
			});
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			type: "hero" as "hero" | "henchman",
			equipment: "",
			skills: "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					name: value.name,
					type: value.type,
					equipment: value.equipment,
					skills: value.skills,
					warbandId: warbandId,
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
							<field.Label>Warrior Name</field.Label>
							<field.Control>
								<Input
									placeholder="Grimgor the Brave"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>The name of your warrior</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="type">
					{(field) => (
						<form.Item>
							<field.Label>Warrior Type</field.Label>
							<field.Control>
								<div className="flex gap-2">
									<Button
										type="button"
										variant={
											field.state.value === "hero" ? "default" : "outline"
										}
										onClick={() => {
											field.handleChange("hero");
											setWarriorType("hero");
										}}
									>
										Hero
									</Button>
									<Button
										type="button"
										variant={
											field.state.value === "henchman" ? "default" : "outline"
										}
										onClick={() => {
											field.handleChange("henchman");
											setWarriorType("henchman");
										}}
									>
										Henchman
									</Button>
								</div>
							</field.Control>
							<field.Description>
								Heroes gain experience and skills; Henchmen are basic troops
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="equipment">
					{(field) => (
						<form.Item>
							<field.Label>Equipment (Optional)</field.Label>
							<field.Control>
								<Input
									placeholder="Sword, Shield, Light Armor"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>
								Comma-separated list of equipment
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="skills">
					{(field) => (
						<form.Item>
							<field.Label>Skills (Optional)</field.Label>
							<field.Control>
								<Input
									placeholder="Combat Master, Resilient"
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>
								Comma-separated list of skills
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? "Creating..." : "Create Warrior"}
					</Button>
				</div>

				{mutation.isError && (
					<div className="text-sm text-red-500">
						Error creating warrior. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}
