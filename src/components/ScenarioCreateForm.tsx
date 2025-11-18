import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { createScenario } from "~/data/scenarios";

const createScenarioSchema = z.object({
	name: z.string().min(1, "Scenario name required"),
	playerCount: z.number().min(2).max(4),
	description: z.string().optional(),
	specialRules: z.string().optional(), // We'll split this by newlines
});

type CreateScenarioInput = z.infer<typeof createScenarioSchema>;

interface ScenarioCreateFormProps {
	campaignId: number;
	onSuccess?: () => void;
}

export function ScenarioCreateForm({
	campaignId,
	onSuccess,
}: ScenarioCreateFormProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<CreateScenarioInput>({
		name: "",
		playerCount: 2,
		description: "",
		specialRules: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setIsSubmitting(true);

		try {
			// Validate form data
			const validatedData = createScenarioSchema.parse(formData);

			// Create scenario using server function
			await createScenario({
				data: {
					...validatedData,
					campaignId,
				},
			});

			toast.success("Scenario created successfully!");
			setOpen(false);
			setFormData({
				name: "",
				playerCount: 2,
				description: "",
				specialRules: "",
			});
			onSuccess?.();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {};
				for (const issue of error.issues) {
					fieldErrors[issue.path[0]] = issue.message;
				}
				setErrors(fieldErrors);
			} else {
				toast.error("Failed to create scenario");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Scenario</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Scenario</DialogTitle>
					<DialogDescription>
						Add a new scenario to this campaign.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Scenario Name *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="Enter scenario name"
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="playerCount">Player Count *</Label>
						<Select
							value={String(formData.playerCount)}
							onValueChange={(value) =>
								setFormData({ ...formData, playerCount: Number(value) })
							}
						>
							<SelectTrigger id="playerCount">
								<SelectValue placeholder="Select player count" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="2">2 Players</SelectItem>
								<SelectItem value="3">3 Players</SelectItem>
								<SelectItem value="4">4 Players</SelectItem>
							</SelectContent>
						</Select>
						{errors.playerCount && (
							<p className="text-sm text-destructive">{errors.playerCount}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (Optional)</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Enter scenario description"
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="specialRules">
							Special Rules (Optional, one per line)
						</Label>
						<Textarea
							id="specialRules"
							value={formData.specialRules}
							onChange={(e) =>
								setFormData({ ...formData, specialRules: e.target.value })
							}
							placeholder="Enter special rules, one per line"
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Scenario"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
