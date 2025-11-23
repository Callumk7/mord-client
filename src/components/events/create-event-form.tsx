import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { db } from "~/db";
import { events } from "~/db/schema";
import { getWarriorsByCampaignFn } from "~/lib/queries/warriors";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
	type: z.enum(["knock_down", "moment"]),
	description: z.string(),
	warriorId: z.string().min(1, "Warrior is required"),
	defenderId: z.string(),
});

const serverSchema = z.object({
	type: z.enum(["knock_down", "moment"]),
	description: z.string(),
	warriorId: z.string().min(1, "Warrior is required"),
	defenderId: z.string().optional(),
	matchId: z.number(),
	campaignId: z.number(),
});

export const createEventFn = createServerFn({ method: "POST" })
	.inputValidator(serverSchema)
	.handler(async ({ data }) => {
		const values = {
			matchId: data.matchId,
			campaignId: data.campaignId,
			type: data.type,
			description: data.description || null,
			warriorId: Number.parseInt(data.warriorId, 10),
			defenderId: data.defenderId
				? Number.parseInt(data.defenderId, 10)
				: null,
			timestamp: new Date(),
		};

		const [newEvent] = await db
			.insert(events)
			.values(values)
			.returning();

		return newEvent;
	});

const { useAppForm } = createFormHook();

interface CreateEventFormProps {
	campaignId: number;
	matchId: number;
	onSuccess?: () => void;
}

export function CreateEventForm({
	campaignId,
	matchId,
	onSuccess,
}: CreateEventFormProps) {
	const queryClient = useQueryClient();
	const [eventType, setEventType] = useState<"knock_down" | "moment">(
		"knock_down",
	);

	const { data: warriors, isLoading: loadingWarriors } = useQuery({
		queryKey: ["warriors", campaignId],
		queryFn: () => getWarriorsByCampaignFn({ data: { campaignId } }),
	});

	const mutation = useMutation({
		mutationFn: createEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["match", matchId],
			});
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			type: "knock_down" as "knock_down" | "moment",
			description: "",
			warriorId: "",
			defenderId: "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			mutation.mutate({
				data: {
					type: value.type,
					description: value.description,
					warriorId: value.warriorId,
					defenderId: value.defenderId || undefined,
					matchId,
					campaignId,
				},
			});
		},
	});

	if (loadingWarriors) {
		return <div className="text-sm text-muted-foreground">Loading...</div>;
	}

	const aliveWarriors = warriors?.filter((w) => w.isAlive) || [];

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="type">
					{(field) => (
						<form.Item>
							<field.Label>Event Type</field.Label>
							<field.Control>
								<div className="flex gap-2">
									<Button
										type="button"
										variant={
											field.state.value === "knock_down" ? "default" : "outline"
										}
										onClick={() => {
											field.handleChange("knock_down");
											setEventType("knock_down");
										}}
									>
										Knock Down
									</Button>
									<Button
										type="button"
										variant={
											field.state.value === "moment" ? "default" : "outline"
										}
										onClick={() => {
											field.handleChange("moment");
											setEventType("moment");
										}}
									>
										Memorable Moment
									</Button>
								</div>
							</field.Control>
							<field.Description>
								{eventType === "knock_down"
									? "Record a warrior being knocked down"
									: "Record a memorable moment in the battle"}
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="warriorId">
					{(field) => (
						<form.Item>
							<field.Label>
								{eventType === "knock_down" ? "Attacker" : "Warrior"}
							</field.Label>
							<field.Control>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a warrior" />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											{aliveWarriors.map((warrior) => (
												<SelectItem key={warrior.id} value={String(warrior.id)}>
													{warrior.name}
												</SelectItem>
											))}
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
							<field.Description>
								{eventType === "knock_down"
									? "The warrior who knocked down the opponent"
									: "The warrior involved in this moment"}
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				{eventType === "knock_down" && (
					<form.AppField name="defenderId">
						{(field) => (
							<form.Item>
								<field.Label>Defender (Optional)</field.Label>
								<field.Control>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a defender" />
										</SelectTrigger>
										<SelectPositioner>
											<SelectContent>
												<SelectItem value="">None</SelectItem>
												{aliveWarriors.map((warrior) => (
													<SelectItem
														key={warrior.id}
														value={String(warrior.id)}
													>
														{warrior.name}
													</SelectItem>
												))}
											</SelectContent>
										</SelectPositioner>
									</Select>
								</field.Control>
								<field.Description>
									The warrior who was knocked down
								</field.Description>
							</form.Item>
						)}
					</form.AppField>
				)}

				<form.AppField name="description">
					{(field) => (
						<form.Item>
							<field.Label>Description</field.Label>
							<field.Control>
								<Textarea
									placeholder={
										eventType === "knock_down"
											? "Describe what happened..."
											: "Describe this memorable moment..."
									}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={3}
								/>
							</field.Control>
							<field.Description>
								Add details about this event (optional)
							</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? "Adding..." : "Add Event"}
					</Button>
				</div>

				{mutation.isError && (
					<div className="text-sm text-red-500">
						Error adding event. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}
