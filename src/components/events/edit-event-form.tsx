import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { eventKeys, updateEventFn } from "~/api/events";
import type { Event } from "~/db/schema";
import type { InjuryType } from "~/types/injuries";
import { getInjuryTypeSelectOptions } from "~/types/injuries";
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
				queryKey: eventKeys.all,
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
					? (value.injuryType as InjuryType)
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

	const injuryTypes = getInjuryTypeSelectOptions(true);

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
