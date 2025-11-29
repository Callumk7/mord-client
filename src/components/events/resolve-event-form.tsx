import type { Event } from "~/db/schema";
import { useResolveEvent } from "~/hooks/mutations/events";
import type { InjuryType } from "~/types/injuries";
import {
	getInjuryInfo,
	getInjuryOptions,
	seriousInjuries,
} from "~/types/injuries";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
	const mutation = useResolveEvent({
		matchId: event.matchId,
		campaignId: event.campaignId,
		eventId: event.id,
		onSuccess,
	});

	const form = useAppForm({
		defaultValues: {
			injuryType: (event.injuryType as InjuryType | undefined) || undefined,
		},
		onSubmit: ({ value }) => {
			if (!value.injuryType) {
				return;
			}

			mutation.mutate({
				data: {
					eventId: event.id,
					injuryType: value.injuryType,
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
										items={injuryOptions}
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

				<form.Subscribe selector={(state) => state.values.injuryType}>
					{(injuryType) => {
						const injuryInfo = injuryType
							? getInjuryInfo(injuryType as InjuryType)
							: null;
						const fullInjury = injuryType
							? seriousInjuries.find(
									(i) => i.enumValue === (injuryType as InjuryType),
								)
							: null;

						return (
							<>
								{injuryInfo && (
									<Card>
										<CardHeader>
											<CardTitle>{injuryInfo.name}</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex items-center gap-4 text-sm">
												<div>
													<span className="font-medium">Roll: </span>
													{Array.isArray(injuryInfo.roll)
														? `${injuryInfo.roll[0]}–${injuryInfo.roll[1]}`
														: injuryInfo.roll}
												</div>
												{injuryInfo.statEffect && (
													<div>
														<span className="font-medium">Stat Effect: </span>
														{injuryInfo.statEffect}
													</div>
												)}
											</div>
											<div className="text-sm">
												<div className="font-medium mb-1">Description:</div>
												<div className="whitespace-pre-wrap text-muted-foreground">
													{injuryInfo.description}
												</div>
											</div>
											{fullInjury?.subRoll && (
												<div className="text-sm border-t pt-3">
													<div className="font-medium mb-2">
														Additional Roll ({fullInjury.subRoll.dice}):
													</div>
													{fullInjury.subRoll.description && (
														<div className="text-muted-foreground mb-2">
															{fullInjury.subRoll.description}
														</div>
													)}
													<ul className="list-disc list-inside space-y-1 text-muted-foreground">
														{fullInjury.subRoll.outcomes.map((outcome) => {
															const rollKey = Array.isArray(outcome.roll)
																? `${outcome.roll[0]}-${outcome.roll[1]}`
																: outcome.roll.toString();
															return (
																<li key={rollKey}>
																	<span className="font-medium">
																		{Array.isArray(outcome.roll)
																			? `${outcome.roll[0]}–${outcome.roll[1]}`
																			: outcome.roll}
																		:{" "}
																	</span>
																	{outcome.effect}
																</li>
															);
														})}
													</ul>
												</div>
											)}
										</CardContent>
									</Card>
								)}

								<div className="flex justify-end gap-2">
									<Button
										type="submit"
										disabled={mutation.isPending || !injuryType}
									>
										{mutation.isPending ? "Resolving..." : "Resolve Event"}
									</Button>
								</div>
							</>
						);
					}}
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
