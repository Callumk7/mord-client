import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { useState } from "react";
import { z } from "zod";
import { createEventFn } from "~/api/events";
import { getMatchWarbandsOptions, matchKeys } from "~/api/matches";
import { Button } from "../ui/button";
import { createFormHook } from "../ui/form-tanstack";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPortal,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
	type: z.enum(["knock_down", "moment"]),
	description: z.string(),
	attackerWarbandId: z.string(),
	warriorId: z.string().min(1, "Warrior is required"),
	defenderWarbandId: z.string(),
	defenderId: z.string(),
});

const { useAppForm } = createFormHook();

interface CreateEventFormProps {
	campaignId: number;
	matchId: number;
	onSuccess?: () => void;
	portalContainer?: RefObject<HTMLElement | null>;
}

export function CreateEventForm({
	campaignId,
	matchId,
	onSuccess,
	portalContainer,
}: CreateEventFormProps) {
	const queryClient = useQueryClient();
	const [eventType, setEventType] = useState<"knock_down" | "moment">(
		"knock_down",
	);

	const { data: warbands, isLoading: loadingWarbands } = useQuery(
		getMatchWarbandsOptions(matchId),
	);

	const mutation = useMutation({
		mutationFn: createEventFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: matchKeys.detail(matchId),
			});
			onSuccess?.();
		},
	});

	const form = useAppForm({
		defaultValues: {
			type: "knock_down" as "knock_down" | "moment",
			description: "",
			attackerWarbandId: "",
			warriorId: "",
			defenderWarbandId: "",
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
					warriorId: Number(value.warriorId),
					defenderId: Number(value.defenderId) || undefined,
					matchId,
					campaignId,
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
				<form.AppField name="type">
					{(field) => {
						const currentType = field.state.value;
						return (
							<form.Item>
								<field.Label>Event Type</field.Label>
								<field.Control>
									<div className="flex gap-2">
										<Button
											type="button"
											variant={
												currentType === "knock_down" ? "default" : "outline"
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
											variant={currentType === "moment" ? "default" : "outline"}
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
									{currentType === "knock_down"
										? "Record a warrior being knocked down"
										: "Record a memorable moment in the battle"}
								</field.Description>
							</form.Item>
						);
					}}
				</form.AppField>

				<form.AppField name="attackerWarbandId">
					{(field) => (
						<form.Item>
							<field.Label>
								{eventType === "knock_down" ? "Attacker's Warband" : "Warband"}
							</field.Label>
							<field.Control>
								<Select
									value={field.state.value}
									onValueChange={(value) => {
										field.handleChange(value);
										form.setFieldValue("warriorId", "");
									}}
									disabled={loadingWarbands}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a warband" />
									</SelectTrigger>
									<SelectPortal container={portalContainer?.current}>
										<SelectPositioner>
											<SelectContent>
												{warbands?.map((warband) => (
													<SelectItem
														key={warband.id}
														value={String(warband.id)}
													>
														{warband.name}
													</SelectItem>
												))}
											</SelectContent>
										</SelectPositioner>
									</SelectPortal>
								</Select>
							</field.Control>
							<field.Description>Select the warband</field.Description>
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="warriorId">
					{(field) => {
						const selectedWarbandId = form.state.values.attackerWarbandId;
						const selectedWarband = warbands?.find(
							(wb) => String(wb.id) === selectedWarbandId,
						);
						const availableWarriors = selectedWarband?.warriors || [];

						return (
							<form.Item>
								<field.Label>
									{eventType === "knock_down" ? "Attacker" : "Warrior"}
								</field.Label>
								<field.Control>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger disabled={!selectedWarbandId}>
											<SelectValue
												placeholder={
													selectedWarbandId
														? "Select a warrior"
														: "Select a warband first"
												}
											/>
										</SelectTrigger>
										<SelectPortal container={portalContainer?.current}>
											<SelectPositioner>
												<SelectContent>
													{availableWarriors.map((warrior) => (
														<SelectItem
															key={warrior.id}
															value={String(warrior.id)}
														>
															{warrior.name}
														</SelectItem>
													))}
												</SelectContent>
											</SelectPositioner>
										</SelectPortal>
									</Select>
								</field.Control>
								<field.Description>
									{eventType === "knock_down"
										? "The warrior who knocked down the opponent"
										: "The warrior involved in this moment"}
								</field.Description>
							</form.Item>
						);
					}}
				</form.AppField>

				{eventType === "knock_down" && (
					<>
						<form.AppField name="defenderWarbandId">
							{(field) => (
								<form.Item>
									<field.Label>Defender's Warband (Optional)</field.Label>
									<field.Control>
										<Select
											value={field.state.value}
											onValueChange={(value) => {
												field.handleChange(value);
												form.setFieldValue("defenderId", "");
											}}
											disabled={loadingWarbands}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a warband" />
											</SelectTrigger>
											<SelectPortal container={portalContainer?.current}>
												<SelectPositioner>
													<SelectContent>
														<SelectItem value="">None</SelectItem>
														{warbands?.map((warband) => (
															<SelectItem
																key={warband.id}
																value={String(warband.id)}
															>
																{warband.name}
															</SelectItem>
														))}
													</SelectContent>
												</SelectPositioner>
											</SelectPortal>
										</Select>
									</field.Control>
									<field.Description>
										Select the defender's warband (optional)
									</field.Description>
								</form.Item>
							)}
						</form.AppField>

						<form.AppField name="defenderId">
							{(field) => {
								const selectedDefenderWarbandId =
									form.state.values.defenderWarbandId;
								const selectedDefenderWarband = warbands?.find(
									(wb) => String(wb.id) === selectedDefenderWarbandId,
								);
								const availableDefenders =
									selectedDefenderWarband?.warriors || [];

								return (
									<form.Item>
										<field.Label>Defender (Optional)</field.Label>
										<field.Control>
											<Select
												value={field.state.value}
												onValueChange={field.handleChange}
												disabled={!selectedDefenderWarbandId}
											>
												<SelectTrigger>
													<SelectValue
														placeholder={
															selectedDefenderWarbandId
																? "Select a defender"
																: "Select a warband first"
														}
													/>
												</SelectTrigger>
												<SelectPortal container={portalContainer?.current}>
													<SelectPositioner>
														<SelectContent>
															<SelectItem value="">None</SelectItem>
															{availableDefenders.map((warrior) => (
																<SelectItem
																	key={warrior.id}
																	value={String(warrior.id)}
																>
																	{warrior.name}
																</SelectItem>
															))}
														</SelectContent>
													</SelectPositioner>
												</SelectPortal>
											</Select>
										</field.Control>
										<field.Description>
											The warrior who was knocked down
										</field.Description>
									</form.Item>
								);
							}}
						</form.AppField>
					</>
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
