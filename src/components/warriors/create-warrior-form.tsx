import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import z from "zod";
import { warbandKeys } from "~/api/warbands";
import { createWarriorFn } from "~/api/warriors";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { createFormHook } from "../ui/form-tanstack";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const { useAppForm } = createFormHook();

const formSchema = z.object({
	name: z.string().min(1, "Warrior name is required"),
	type: z.enum(["hero", "henchman"]),
	class: z.string(),
	isLeader: z.boolean(),
});

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
				queryKey: warbandKeys.warriors(warbandId),
			});
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			type: "hero" as "hero" | "henchman",
			class: "",
			isLeader: false,
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					name: value.name,
					type: value.type,
					class: value.class,
					isLeader: value.isLeader,
					warbandId: warbandId,
					campaignId: campaignId,
				},
			});
		},
	});

	const isLeaderId = useId();

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

				<form.AppField name="class">
					{(field) => (
						<form.Item>
							<field.Label>Class (Optional)</field.Label>
							<field.Control>
								<Input
									placeholder="Orc, Human, etc."
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.Control>
							<field.Description>Warrior class</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="isLeader">
					{(field) => (
						<form.Item>
							<field.Control>
								<div className="flex items-center gap-2">
									<Checkbox
										id={isLeaderId}
										name={field.name}
										checked={field.state.value}
										onCheckedChange={field.handleChange}
									/>
									<Label htmlFor={isLeaderId}>Is Leader?</Label>
								</div>
							</field.Control>
							<field.Description>Is this warrior the leader?</field.Description>
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
