import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { updateWarriorFn, warriorKeys } from "~/api/warriors";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Warrior } from "~/db/schema";

interface WarriorDeathManagerProps {
	warriors: Warrior[];
	matchId: number;
	campaignId: number;
}

export function WarriorDeathManager({ warriors }: WarriorDeathManagerProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Warrior Deaths & Injuries</CardTitle>
				<CardDescription>
					Mark warriors as deceased and add death descriptions
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{warriors.map((warrior) => (
						<WarriorDeathForm key={warrior.id} warrior={warrior} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

interface WarriorDeathFormProps {
	warrior: Warrior;
}

function WarriorDeathForm({ warrior }: WarriorDeathFormProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isDead, setIsDead] = useState(!warrior.isAlive);
	const [deathDescription, setDeathDescription] = useState(
		warrior.deathDescription || "",
	);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateWarriorFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: warriorKeys.detail(warrior.id),
			});
			queryClient.invalidateQueries({
				queryKey: warriorKeys.listByCampaign(warrior.campaignId),
			});
			setIsExpanded(false);
		},
	});

	const hasChanges =
		isDead !== !warrior.isAlive ||
		deathDescription !== (warrior.deathDescription || "");

	const handleSubmit = () => {
		const updateData: {
			isAlive: boolean;
			deathDescription?: string;
			deathDate?: Date;
		} = {
			isAlive: !isDead,
		};

		if (isDead) {
			updateData.deathDescription = deathDescription;
			// Only set death date if warrior wasn't already dead
			if (warrior.isAlive) {
				updateData.deathDate = new Date();
			}
		} else {
			// If marking as alive, clear death info
			updateData.deathDescription = "";
			updateData.deathDate = undefined;
		}

		mutation.mutate({
			data: {
				warriorId: warrior.id,
				...updateData,
			},
		});
	};

	const handleReset = () => {
		setIsDead(!warrior.isAlive);
		setDeathDescription(warrior.deathDescription || "");
		setIsExpanded(false);
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
						<p className="text-sm text-muted-foreground">{warrior.type}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{warrior.isAlive ? (
						<Badge variant="success">Alive</Badge>
					) : (
						<Badge variant="destructive">Deceased</Badge>
					)}
					{hasChanges && <Badge variant="secondary">Modified</Badge>}
					<span className="text-sm text-muted-foreground">
						{isExpanded ? "Collapse" : "Expand"}
					</span>
				</div>
			</button>

			{isExpanded && (
				<div className="p-4 pt-0 space-y-4 border-t">
					{/* Status Toggle */}
					<div className="space-y-2">
						<Label>Warrior Status</Label>
						<div className="flex items-center gap-4">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name={`status-${warrior.id}`}
									checked={!isDead}
									onChange={() => setIsDead(false)}
									className="h-4 w-4"
								/>
								<span className="text-sm">Alive</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name={`status-${warrior.id}`}
									checked={isDead}
									onChange={() => setIsDead(true)}
									className="h-4 w-4"
								/>
								<span className="text-sm">Deceased</span>
							</label>
						</div>
					</div>

					{/* Death Description */}
					{isDead && (
						<div className="space-y-2">
							<Label htmlFor={`death-desc-${warrior.id}`}>
								Death Description
							</Label>
							<Textarea
								id={`death-desc-${warrior.id}`}
								placeholder="Describe how the warrior met their end..."
								value={deathDescription}
								onChange={(e) => setDeathDescription(e.target.value)}
								rows={3}
							/>
							<p className="text-xs text-muted-foreground">
								{warrior.isAlive
									? "Death date will be set to current date/time when saved"
									: warrior.deathDate
										? `Original death date: ${new Date(warrior.deathDate).toLocaleString()}`
										: "No death date recorded"}
							</p>
						</div>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleReset}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={!hasChanges || mutation.isPending}
							size="sm"
						>
							{mutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>

					{mutation.isError && (
						<div className="text-sm text-destructive">
							Error updating warrior. Please try again.
						</div>
					)}

					{mutation.isSuccess && (
						<div className="text-sm text-green-600">
							Warrior updated successfully!
						</div>
					)}
				</div>
			)}
		</div>
	);
}
