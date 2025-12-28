import type { Event } from "~/db/schema";
import { useResolveHenchmanEvent } from "~/hooks/mutations/events";
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

interface ResolveHenchmanEventFormProps {
	event: Event;
	onSuccess?: () => void;
}

export function ResolveHenchmanEventForm({
	event,
	onSuccess,
}: ResolveHenchmanEventFormProps) {
	const mutation = useResolveHenchmanEvent({
		matchId: event.matchId,
		campaignId: event.campaignId,
		eventId: event.id,
		onSuccess,
	});

	const form = useAppForm({
		defaultValues: {
			outcome: event.death ? "dead" : event.resolved ? "survived" : undefined,
		},
		onSubmit: ({ value }) => {
			if (!value.outcome) {
				return;
			}

			mutation.mutate({
				data: {
					eventId: event.id,
					death: value.outcome === "dead",
				},
			});
		},
	});

	const outcomeOptions = [
		{ value: "survived", label: "Survived (3-6)" },
		{ value: "dead", label: "Dead (1-2)" },
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
				<form.AppField name="outcome">
					{(field) => {
						const currentValue = field.state.value || "";
						return (
							<form.Item>
								<field.Label>Outcome</field.Label>
								<field.Control>
									<Select
										value={currentValue}
										onValueChange={(value) => {
											field.handleChange(value);
										}}
										items={outcomeOptions}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select outcome" />
										</SelectTrigger>
										<SelectPositioner>
											<SelectContent>
												{outcomeOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</SelectPositioner>
									</Select>
								</field.Control>
								<field.Description>
									Select whether the henchman survived or died
								</field.Description>
								<field.Message />
							</form.Item>
						);
					}}
				</form.AppField>

				<form.Subscribe selector={(state) => state.values.outcome}>
					{(outcome) => (
						<div className="flex justify-end gap-2">
							<Button type="submit" disabled={mutation.isPending || !outcome}>
								{mutation.isPending ? "Resolving..." : "Resolve Event"}
							</Button>
						</div>
					)}
				</form.Subscribe>

				{mutation.isError && (
					<div className="text-sm text-red-500">
						Error resolving event. Please try again.
					</div>
				)}
			</form>
		</form.AppForm>
	);
}
