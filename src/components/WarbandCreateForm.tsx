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
import { createWarband } from "~/data/warbands";

const createWarbandSchema = z.object({
	name: z.string().min(1, "Warband name required"),
	faction: z.string().min(1, "Faction required"),
	playerName: z.string().optional(),
});

type CreateWarbandInput = z.infer<typeof createWarbandSchema>;

interface WarbandCreateFormProps {
	campaignId: number;
	onSuccess?: () => void;
}

// Common Mordheim factions
const FACTIONS = [
	"Mercenaries",
	"Middenheimers",
	"Marienburgers",
	"Reiklanders",
	"Averlanders",
	"Undead",
	"Witch Hunters",
	"Sisters of Sigmar",
	"Possessed",
	"Skaven",
	"Cult of the Possessed",
	"The Damned",
	"Orcs & Goblins",
	"Dwarfs",
	"Kislevites",
	"Ostlanders",
	"Other",
];

export function WarbandCreateForm({
	campaignId,
	onSuccess,
}: WarbandCreateFormProps) {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<CreateWarbandInput>({
		name: "",
		faction: "",
		playerName: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setIsSubmitting(true);

		try {
			// Validate form data
			const validatedData = createWarbandSchema.parse(formData);

			// Create warband using server function
			await createWarband({
				data: {
					...validatedData,
					campaignId,
				},
			});

			toast.success("Warband created successfully!");
			setOpen(false);
			setFormData({ name: "", faction: "", playerName: "" });
			onSuccess?.();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {};
				for (const issue of error.issues) {
					fieldErrors[issue.path[0]] = issue.message;
				}
				setErrors(fieldErrors);
			} else {
				toast.error("Failed to create warband");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Warband</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Warband</DialogTitle>
					<DialogDescription>
						Add a new warband to this campaign. Default rating starts at 500 GC.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Warband Name *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="Enter warband name"
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="faction">Faction *</Label>
						<Select
							value={formData.faction}
							onValueChange={(value) =>
								setFormData({ ...formData, faction: value })
							}
						>
							<SelectTrigger id="faction">
								<SelectValue placeholder="Select faction" />
							</SelectTrigger>
							<SelectContent>
								{FACTIONS.map((faction) => (
									<SelectItem key={faction} value={faction}>
										{faction}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.faction && (
							<p className="text-sm text-destructive">{errors.faction}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="playerName">Player Name (Optional)</Label>
						<Input
							id="playerName"
							value={formData.playerName}
							onChange={(e) =>
								setFormData({ ...formData, playerName: e.target.value })
							}
							placeholder="Enter player name"
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
							{isSubmitting ? "Creating..." : "Create Warband"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
