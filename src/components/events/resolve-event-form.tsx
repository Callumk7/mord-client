import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys, updateEventFn } from "~/api/events";
import { matchKeys } from "~/api/matches";
import { seriousInjuries } from "~/data/serious-injuries";
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

type InjuryType =
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
	| "survive_against_odds";

const { useAppForm } = createFormHook();

interface ResolveEventFormProps {
	event: Event;
	onSuccess?: () => void;
}

export function ResolveEventForm({ event, onSuccess }: ResolveEventFormProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: matchKeys.detail(event.matchId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.listByCampaign(event.campaignId),
			});
			queryClient.invalidateQueries({
				queryKey: eventKeys.detail(event.id),
			});
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			injuryType: (event.injuryType as InjuryType | undefined) || undefined,
		},
		onSubmit: ({ value }) => {
			if (!value.injuryType) {
				return;
			}

			const isDeath = value.injuryType === "dead";

			mutation.mutate({
				data: {
					eventId: event.id,
					injuryType: value.injuryType,
					death: isDeath,
					injury: !isDeath,
					resolved: true,
				},
			});
		},
	});

	// Create a map of injury types for better display names
	const injuryOptions = seriousInjuries.map((injury) => {
		// Convert the name to snake_case to match the enum
		const enumValue = injury.name
			.toLowerCase()
			.replace(/\s+/g, "_")
			.replace(/'/g, "");

		return {
			value: enumValue,
			label: injury.name,
			description: injury.description,
		};
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
				<form.AppField name="injuryType">
					{(field) => {
						const currentValue = field.state.value || "";
						return (
							<form.Item>
								<field.Label>Injury Type</field.Label>
								<field.Control>
									<Select
										value={currentValue}
										onValueChange={(value) => {
											field.handleChange(value as InjuryType);
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select an injury type" />
										</SelectTrigger>
										<SelectPositioner>
											<SelectContent>
												{injuryOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</SelectPositioner>
									</Select>
								</field.Control>
								<field.Description>
									Select the injury result from the serious injury table
								</field.Description>
								<field.Message />
							</form.Item>
						);
					}}
				</form.AppField>

				<div className="flex justify-end gap-2">
					<form.Subscribe selector={(state) => state.values.injuryType}>
						{(injuryType) => (
							<Button
								type="submit"
								disabled={mutation.isPending || !injuryType}
							>
								{mutation.isPending ? "Resolving..." : "Resolve Event"}
							</Button>
						)}
					</form.Subscribe>
				</div>

				{mutation.isError && (
					<div className="text-sm text-red-500">
						Error resolving event. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}
