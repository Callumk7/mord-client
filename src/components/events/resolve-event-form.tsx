import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys, updateEventFn } from "~/api/events";
import { matchKeys } from "~/api/matches";
import type { Event } from "~/db/schema";
import type { InjuryType } from "~/types/injuries";
import { getInjuryOptions } from "~/types/injuries";
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

	// Get injury options from centralized helper
	const injuryOptions = getInjuryOptions();

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
