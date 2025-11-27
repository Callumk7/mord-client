import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateEventFn } from "~/api/events";
import type { Event } from "~/db/schema";
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
	resolved: z.boolean(),
	injuryType: z.string(),
	death: z.boolean(),
	injury: z.boolean(),
	description: z.string(),
});

const { useAppForm } = createFormHook();

interface EditEventFormProps {
	event: Event & {
		warrior?: { name: string } | null;
		defender?: { name: string } | null;
		match?: { name: string } | null;
	};
	onSuccess?: () => void;
}

export function EditEventForm({ event, onSuccess }: EditEventFormProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			resolved: event.resolved,
			injuryType: (event.injuryType as string) || "",
			death: event.death,
			injury: event.injury,
			description: event.description || "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			const injuryType =
				value.injuryType && value.injuryType !== ""
					? (value.injuryType as
							| "dead"
							| "multiple"
							| "leg_wound"
							| "arm_wound"
							| "madness"
							| "smashed_leg"
							| "chest_wound"
							| "blinded_in_one_eye"
							| "old_battle_wound"
							| "nervous"
							| "hand_injury"
							| "deep_wound"
							| "robbed"
							| "full_recovery"
							| "bitter_emnity"
							| "captured"
							| "hardened"
							| "horrible_scars"
							| "sold_to_pits"
							| "survive_against_odds")
					: undefined;

			mutation.mutate({
				data: {
					eventId: event.id,
					resolved: value.resolved,
					injuryType,
					death: value.death,
					injury: value.injury,
					description: value.description,
				},
			});
		},
	});

	const injuryTypes = [
		{ value: "", label: "None" },
		{ value: "dead", label: "Dead" },
		{ value: "multiple", label: "Multiple Injuries" },
		{ value: "leg_wound", label: "Leg Wound" },
		{ value: "arm_wound", label: "Arm Wound" },
		{ value: "madness", label: "Madness" },
		{ value: "smashed_leg", label: "Smashed Leg" },
		{ value: "chest_wound", label: "Chest Wound" },
		{ value: "blinded_in_one_eye", label: "Blinded In One Eye" },
		{ value: "old_battle_wound", label: "Old Battle Wound" },
		{ value: "nervous", label: "Nervous" },
		{ value: "hand_injury", label: "Hand Injury" },
		{ value: "deep_wound", label: "Deep Wound" },
		{ value: "robbed", label: "Robbed" },
		{ value: "full_recovery", label: "Full Recovery" },
		{ value: "bitter_emnity", label: "Bitter Emnity" },
		{ value: "captured", label: "Captured" },
		{ value: "hardened", label: "Hardened" },
		{ value: "horrible_scars", label: "Horrible Scars" },
		{ value: "sold_to_pits", label: "Sold To Pits" },
		{ value: "survive_against_odds", label: "Survive Against Odds" },
	];

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div className="space-y-2">
					<div className="text-sm">
						<span className="text-muted-foreground">Event Type:</span>{" "}
						<span className="capitalize">{event.type.replace("_", " ")}</span>
					</div>
					<div className="text-sm">
						<span className="text-muted-foreground">Warrior:</span>{" "}
						{event.warrior?.name || "Unknown"}
					</div>
					{event.defender && (
						<div className="text-sm">
							<span className="text-muted-foreground">Defender:</span>{" "}
							{event.defender.name}
						</div>
					)}
					<div className="text-sm">
						<span className="text-muted-foreground">Match:</span>{" "}
						{event.match?.name || `Match ${event.matchId}`}
					</div>
				</div>

				<form.AppField name="description">
					{(field) => (
						<form.Item>
							<field.Label>Description</field.Label>
							<field.Control>
								<Textarea
									placeholder="Describe what happened..."
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={3}
								/>
							</field.Control>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="resolved">
					{(field) => (
						<form.Item>
							<field.Label>Status</field.Label>
							<field.Control>
								<Select
									value={field.state.value ? "true" : "false"}
									onValueChange={(value) =>
										field.handleChange(value === "true")
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value="false">Pending</SelectItem>
											<SelectItem value="true">Resolved</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="injury">
					{(field) => (
						<form.Item>
							<field.Label>Has Injury</field.Label>
							<field.Control>
								<Select
									value={field.state.value ? "true" : "false"}
									onValueChange={(value) =>
										field.handleChange(value === "true")
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value="false">No</SelectItem>
											<SelectItem value="true">Yes</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="injuryType">
					{(field) => (
						<form.Item>
							<field.Label>Injury Type</field.Label>
							<field.Control>
								<Select
									value={field.state.value || ""}
									onValueChange={field.handleChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select injury type" />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											{injuryTypes.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													{type.label}
												</SelectItem>
											))}
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="death">
					{(field) => (
						<form.Item>
							<field.Label>Resulted in Death</field.Label>
							<field.Control>
								<Select
									value={field.state.value ? "true" : "false"}
									onValueChange={(value) =>
										field.handleChange(value === "true")
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value="false">No</SelectItem>
											<SelectItem value="true">Yes</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</field.Control>
						</form.Item>
					)}
				</form.AppField>

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>

				{mutation.isError && (
					<div className="text-sm text-red-500">
						Error updating event. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}
