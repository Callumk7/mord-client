import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { addExperienceToWarriorFn } from "~/api/warriors";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { EventWithParticipants, Warrior } from "~/db/schema";
import { warriorKeys } from "~/api/warriors";

interface WarriorExperienceManagerProps {
	warriors: Warrior[];
	events: EventWithParticipants[];
	winningWarbandIds: number[];
	matchId: number;
	campaignId: number;
}

export function WarriorExperienceManager({
	warriors,
	events,
	winningWarbandIds,
}: WarriorExperienceManagerProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Experience Accumulation</CardTitle>
				<CardDescription>
					Add experience to warriors based on their performance
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{warriors.map((warrior) => (
						<WarriorExperienceForm
							key={warrior.id}
							warrior={warrior}
							events={events}
							isWinningWarband={winningWarbandIds.includes(warrior.warbandId)}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface CustomXPEntry {
	id: string;
	label: string;
	amount: number;
}

interface WarriorExperienceFormProps {
	warrior: Warrior;
	events: EventWithParticipants[];
	isWinningWarband: boolean;
}

function WarriorExperienceForm({
	warrior,
	events,
	isWinningWarband,
}: WarriorExperienceFormProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isLeader, setIsLeader] = useState(false);
	const [customEntries, setCustomEntries] = useState<CustomXPEntry[]>([]);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: addExperienceToWarriorFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: warriorKeys.detail(warrior.id),
			});
			queryClient.invalidateQueries({
				queryKey: warriorKeys.listByCampaign(warrior.campaignId),
			});
			setIsExpanded(false);
			setIsLeader(false);
			setCustomEntries([]);
		},
	});

	// Calculate XP from different sources
	const survivedXP = warrior.isAlive ? 1 : 0;

	// Count knock downs by this warrior (heroes only)
	const knockDownCount = events.filter(
		(e) => e.type === "knock_down" && e.warriorId === warrior.id,
	).length;
	const knockDownXP = warrior.type === "hero" ? knockDownCount : 0;

	// Leader bonus (only if winning warband and user marks as leader)
	const leaderXP = isWinningWarband && isLeader ? 1 : 0;

	// Custom XP
	const customXP = customEntries.reduce((sum, entry) => sum + entry.amount, 0);

	// Total XP
	const totalXP = survivedXP + knockDownXP + leaderXP + customXP;

	const handleAddCustomEntry = () => {
		setCustomEntries([
			...customEntries,
			{
				id: crypto.randomUUID(),
				label: "",
				amount: 0,
			},
		]);
	};

	const handleRemoveCustomEntry = (id: string) => {
		setCustomEntries(customEntries.filter((entry) => entry.id !== id));
	};

	const handleUpdateCustomEntry = (
		id: string,
		field: "label" | "amount",
		value: string | number,
	) => {
		setCustomEntries(
			customEntries.map((entry) =>
				entry.id === id ? { ...entry, [field]: value } : entry,
			),
		);
	};

	const handleSubmit = () => {
		if (totalXP > 0) {
			mutation.mutate({
				data: {
					warriorId: warrior.id,
					additionalExperience: totalXP,
				},
			});
		}
	};

	return (
		<div className="border rounded-lg">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
			>
				<div className="flex items-center gap-3">
					<div className="text-left">
						<p className="font-medium">{warrior.name}</p>
						<p className="text-sm text-muted-foreground">
							Current XP: {warrior.experience} | {warrior.type}
							{!warrior.isAlive && " | Deceased"}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{!isExpanded && totalXP > 0 && (
						<Badge variant="secondary">+{totalXP} XP</Badge>
					)}
					<span className="text-sm text-muted-foreground">
						{isExpanded ? "Collapse" : "Expand"}
					</span>
				</div>
			</button>

			{isExpanded && (
				<div className="p-4 pt-0 space-y-4 border-t">
					{/* Base XP Breakdown */}
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Survived battle</span>
							<span className="font-medium">+{survivedXP} XP</span>
						</div>

						{warrior.type === "hero" && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Knock downs ({knockDownCount})
								</span>
								<span className="font-medium">+{knockDownXP} XP</span>
							</div>
						)}

						{isWinningWarband && warrior.type === "hero" && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Leader bonus</span>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={isLeader}
										onChange={(e) => setIsLeader(e.target.checked)}
										className="h-4 w-4"
									/>
									<span className="font-medium">+{leaderXP} XP</span>
								</div>
							</div>
						)}
					</div>

					{/* Custom XP Entries */}
					{customEntries.length > 0 && (
						<div className="space-y-2">
							<Label className="text-sm text-muted-foreground">
								Custom Additions
							</Label>
							{customEntries.map((entry) => (
								<div key={entry.id} className="flex gap-2">
									<Input
										type="text"
										placeholder="Reason (e.g., Scenario bonus)"
										value={entry.label}
										onChange={(e) =>
											handleUpdateCustomEntry(entry.id, "label", e.target.value)
										}
										className="flex-1"
									/>
									<Input
										type="number"
										placeholder="XP"
										value={entry.amount || ""}
										onChange={(e) =>
											handleUpdateCustomEntry(
												entry.id,
												"amount",
												Number.parseInt(e.target.value, 10) || 0,
											)
										}
										className="w-20"
									/>
									<Button
										type="button"
										size="icon"
										variant="ghost"
										onClick={() => handleRemoveCustomEntry(entry.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					)}

					{/* Add Custom Entry Button */}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleAddCustomEntry}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Custom XP
					</Button>

					{/* Total and Submit */}
					<div className="flex items-center justify-between pt-4 border-t">
						<div className="text-sm">
							<span className="text-muted-foreground">Total XP to Add: </span>
							<span className="text-lg font-bold">{totalXP}</span>
							<span className="text-muted-foreground ml-2">
								(New Total: {warrior.experience + totalXP})
							</span>
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setIsExpanded(false);
									setIsLeader(false);
									setCustomEntries([]);
								}}
							>
								<X className="h-4 w-4 mr-1" />
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleSubmit}
								disabled={totalXP === 0 || mutation.isPending}
								size="sm"
							>
								{mutation.isPending ? "Applying..." : "Apply XP"}
							</Button>
						</div>
					</div>

					{mutation.isError && (
						<div className="text-sm text-destructive">
							Error applying experience. Please try again.
						</div>
					)}

					{mutation.isSuccess && (
						<div className="text-sm text-green-600">
							Experience applied successfully!
						</div>
					)}
				</div>
			)}
		</div>
	);
}
