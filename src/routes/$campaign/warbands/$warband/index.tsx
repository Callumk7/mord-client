import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import { CreateWarriorForm } from "~/components/warriors/create-warrior-form";
import { WarriorCard } from "~/components/warriors/warrior-card";
import { getWarriorsByWarbandFn } from "~/lib/api/warriors";

export const Route = createFileRoute("/$campaign/warbands/$warband/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		// Parse warband ID from URL
		const parsedWarbandId = Number.parseInt(params.warband, 10);

		await context.queryClient.ensureQueryData({
			queryFn: () =>
				getWarriorsByWarbandFn({ data: { warbandId: parsedWarbandId } }),
			queryKey: ["warband", parsedWarbandId],
		});
	},
});

function RouteComponent() {
	const { warband: warbandId, campaign: campaignId } = Route.useParams();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Parse warband ID from URL
	const parsedWarbandId = Number.parseInt(warbandId, 10);

	// Fetch warriors for this warband
	const { data: warriors, isLoading } = useQuery({
		queryKey: ["warriors", parsedWarbandId],
		queryFn: () =>
			getWarriorsByWarbandFn({ data: { warbandId: parsedWarbandId } }),
		enabled: !Number.isNaN(parsedWarbandId),
	});

	const handleWarriorCreated = () => {
		setIsDialogOpen(false);
	};

	if (Number.isNaN(parsedWarbandId)) {
		return <div>Invalid warband ID</div>;
	}

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Warband Warriors</h1>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
							warbandId={parsedWarbandId}
							onSuccess={handleWarriorCreated}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<Separator />

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
								<span className="font-semibold text-red-600">
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
						<CardTitle className="text-red-600">Fallen Warriors</CardTitle>
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
