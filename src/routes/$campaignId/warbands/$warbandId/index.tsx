import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { UpdateWarbandForm } from "~/components/warbands/update-warband-form";
import { CreateWarriorForm } from "~/components/warriors/create-warrior-form";
import { WarriorCard } from "~/components/warriors/warrior-card";
import { getWarriorsByWarbandFn } from "~/lib/api/warriors";
import { getWarbandByIdFn } from "~/routes/$campaignId/warbands";

export const Route = createFileRoute("/$campaignId/warbands/$warbandId/")({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			warbandId: Number(params.warbandId),
		}),
	},
	loader: async ({ context, params }) => {
		const { warbandId } = params;

		await Promise.all([
			context.queryClient.ensureQueryData({
				queryFn: () => getWarriorsByWarbandFn({ data: { warbandId } }),
				queryKey: ["warriors", warbandId],
			}),
			context.queryClient.ensureQueryData({
				queryFn: () => getWarbandByIdFn({ data: { warbandId } }),
				queryKey: ["warband", warbandId, "details"],
			}),
		]);
	},
});

function RouteComponent() {
	const { warbandId, campaignId } = Route.useParams();
	const queryClient = useQueryClient();
	const [isWarriorDialogOpen, setIsWarriorDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Fetch warband details
	const { data: warband } = useQuery({
		queryKey: ["warband", warbandId, "details"],
		queryFn: () => getWarbandByIdFn({ data: { warbandId } }),
	});

	// Fetch warriors for this warband
	const { data: warriors, isLoading } = useQuery({
		queryKey: ["warriors", warbandId],
		queryFn: () => getWarriorsByWarbandFn({ data: { warbandId } }),
	});

	const handleWarriorCreated = () => {
		setIsWarriorDialogOpen(false);
	};

	const handleWarbandUpdated = () => {
		queryClient.invalidateQueries({
			queryKey: ["warband", warbandId, "details"],
		});
		setIsEditDialogOpen(false);
	};

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">
					{warband ? warband.name : "Warband Warriors"}
				</h1>
				<div className="flex items-center gap-2">
					{warband && (
						<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
							<DialogTrigger render={<Button variant="outline" />}>
								<Edit className="mr-2 h-4 w-4" />
								Edit Warband
							</DialogTrigger>
							<DialogContent className="max-w-2xl">
								<DialogHeader>
									<DialogTitle>Edit Warband</DialogTitle>
									<DialogDescription>
										Update the details of your warband.
									</DialogDescription>
								</DialogHeader>
								<UpdateWarbandForm
									warband={warband}
									onSuccess={handleWarbandUpdated}
								/>
							</DialogContent>
						</Dialog>
					)}
					<Dialog
						open={isWarriorDialogOpen}
						onOpenChange={setIsWarriorDialogOpen}
					>
						<DialogTrigger render={<Button />}>Add Warrior</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Create New Warrior</DialogTitle>
								<DialogDescription>
									Add a new warrior to your warband. Heroes can gain experience
									and skills, while henchmen are basic troops.
								</DialogDescription>
							</DialogHeader>
							<CreateWarriorForm
								campaignId={campaignId}
								warbandId={warbandId}
								onSuccess={handleWarriorCreated}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Separator />

			{/* Notes Section */}
			{warband && (
				<Card>
					<CardHeader>
						<CardTitle>Notes</CardTitle>
					</CardHeader>
					<CardContent>
						{warband.notes ? (
							<p className="text-sm whitespace-pre-wrap">{warband.notes}</p>
						) : (
							<p className="text-sm text-muted-foreground">
								No notes added yet. Click "Edit Warband" to add notes.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{isLoading ? (
				<Card>
					<CardContent className="py-8">
						<p className="text-center text-muted-foreground">
							Loading warriors...
						</p>
					</CardContent>
				</Card>
			) : warriors && warriors.length > 0 ? (
				<div className="grid gap-6 md:grid-cols-2">
					{/* Active Warriors */}
					<Card>
						<CardHeader>
							<CardTitle>Active Warriors</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead className="text-right">XP</TableHead>
										<TableHead className="text-right">Kills</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{warriors
										.filter((w) => w.isAlive)
										.map((warrior) => (
											<TableRow key={warrior.id}>
												<TableCell className="font-medium">
													{warrior.name}
												</TableCell>
												<TableCell className="capitalize">
													{warrior.type}
												</TableCell>
												<TableCell className="text-right">
													{warrior.experience}
												</TableCell>
												<TableCell className="text-right">
													{warrior.kills}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					{/* Warrior Stats Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Warband Statistics</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Warriors:</span>
								<span className="font-semibold">
									{warriors.filter((w) => w.isAlive).length}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Heroes:</span>
								<span className="font-semibold">
									{
										warriors.filter((w) => w.isAlive && w.type === "hero")
											.length
									}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Henchmen:</span>
								<span className="font-semibold">
									{
										warriors.filter((w) => w.isAlive && w.type === "henchman")
											.length
									}
								</span>
							</div>
							<Separator />
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Kills:</span>
								<span className="font-semibold">
									{warriors.reduce((sum, w) => sum + w.kills, 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Experience:</span>
								<span className="font-semibold">
									{warriors.reduce((sum, w) => sum + w.experience, 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Casualties:</span>
								<span className="font-semibold text-destructive">
									{warriors.filter((w) => !w.isAlive).length}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				<Card>
					<CardContent className="py-12">
						<div className="text-center space-y-4">
							<p className="text-muted-foreground">
								No warriors in this warband yet.
							</p>
							<p className="text-sm text-muted-foreground">
								Click "Add Warrior" to create your first warrior.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Fallen Warriors Section */}
			{warriors && warriors.filter((w) => !w.isAlive).length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-destructive">Fallen Warriors</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">XP</TableHead>
									<TableHead className="text-right">Kills</TableHead>
									<TableHead>Cause of Death</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{warriors
									.filter((w) => !w.isAlive)
									.map((warrior) => (
										<TableRow key={warrior.id}>
											<TableCell className="font-medium line-through text-muted-foreground">
												{warrior.name}
											</TableCell>
											<TableCell className="capitalize text-muted-foreground">
												{warrior.type}
											</TableCell>
											<TableCell className="text-right text-muted-foreground">
												{warrior.experience}
											</TableCell>
											<TableCell className="text-right text-muted-foreground">
												{warrior.kills}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{warrior.deathDescription || "Unknown"}
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
			{warriors && (
				<Card>
					<CardContent>
						{warriors.map((warrior) => (
							<WarriorCard
								campaignId={campaignId}
								key={warrior.id}
								warrior={warrior}
							/>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
