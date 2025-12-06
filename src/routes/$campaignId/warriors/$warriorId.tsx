import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Calendar,
	Heart,
	Package,
	Shield,
	Skull,
	Star,
	Swords,
	User,
} from "lucide-react";
import type * as React from "react";
import { getWarriorByIdOptions } from "~/api/warriors";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const Route = createFileRoute("/$campaignId/warriors/$warriorId")({
	component: RouteComponent,
	params: {
		parse: (params) => ({
			warriorId: Number(params.warriorId),
		}),
		stringify: (params) => ({
			warriorId: String(params.warriorId),
		}),
	},
	loader: async ({ params, context }) => {
		context.queryClient.ensureQueryData(
			getWarriorByIdOptions(params.warriorId),
		);
	},
});

function RouteComponent() {
	const { warriorId } = Route.useParams();
	const { data: warrior } = useQuery(getWarriorByIdOptions(warriorId));

	if (!warrior) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-muted-foreground">Warrior not found</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold">{warrior.name}</h1>
						{!warrior.isAlive && (
							<span className="inline-flex items-center gap-1 text-destructive">
								<Skull className="w-5 h-5" />
								<span className="text-sm font-medium">Deceased</span>
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Shield className="w-4 h-4" />
						<span>{warrior.warband?.name}</span>
						<span className="text-muted-foreground/50">•</span>
						<span className="capitalize">{warrior.type}</span>
						{warrior.isLeader && (
							<>
								<span className="text-muted-foreground/50">•</span>
								<span className="flex items-center gap-1">
									<User className="w-4 h-4" />
									Leader
								</span>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Games Played"
					value={warrior.gamesPlayed}
					icon={<Swords className="w-5 h-5" />}
				/>
				<StatCard
					title="Status"
					value={warrior.isAlive ? "Alive" : "Dead"}
					icon={
						warrior.isAlive ? (
							<Heart className="w-5 h-5" />
						) : (
							<Skull className="w-5 h-5" />
						)
					}
					variant={warrior.isAlive ? "success" : "destructive"}
				/>
				{warrior.deathDate && (
					<StatCard
						title="Death Date"
						value={new Date(warrior.deathDate).toLocaleDateString()}
						icon={<Calendar className="w-5 h-5" />}
						variant="destructive"
					/>
				)}
			</div>

			{/* Equipment Section */}
			{warrior.equipment && warrior.equipment.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="w-5 h-5" />
							Equipment
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{warrior.equipment.map((item) => (
								<Badge key={item} variant="secondary">
									{item}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Skills Section */}
			{warrior.skills && warrior.skills.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="w-5 h-5" />
							Skills
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{warrior.skills.map((skill) => (
								<Badge key={skill} variant="default">
									{skill}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{(!warrior.equipment || warrior.equipment.length === 0) &&
				(!warrior.skills || warrior.skills.length === 0) && (
					<Card>
						<CardContent className="py-12">
							<div className="text-center text-muted-foreground">
								<p>No equipment or skills recorded yet.</p>
								<p className="text-sm mt-1">
									Equipment and skills will be displayed here as they are added
									to this warrior.
								</p>
							</div>
						</CardContent>
					</Card>
				)}
		</div>
	);
}

function StatCard({
	title,
	value,
	icon,
	variant = "default",
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	variant?: "default" | "success" | "destructive";
}) {
	const variantStyles = {
		default: "border-border",
		success: "border-success/20 bg-success/5",
		destructive: "border-destructive/20 bg-destructive/5",
	};

	return (
		<Card className={variantStyles[variant]}>
			<CardContent className="py-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold">{value}</p>
					</div>
					<div className="text-muted-foreground">{icon}</div>
				</div>
			</CardContent>
		</Card>
	);
}
