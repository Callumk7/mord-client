import { Link } from "@tanstack/react-router";
import { Award, Shield, Skull, Sword, Target } from "lucide-react";
import type { Warrior } from "~/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WarriorCardProps {
	campaignId: number;
	warrior: Warrior;
}

export function WarriorCard({ campaignId, warrior }: WarriorCardProps) {
	const isAlive = warrior.isAlive;
	const typeLabel = warrior.type === "hero" ? "Hero" : "Henchman";

	return (
		<Card
			className={`transition-all hover:shadow-md ${
				!isAlive ? "opacity-75 border-destructive/30" : ""
			}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<CardTitle className="text-lg">
						<Link
							to="/$campaignId/warbands/$warbandId/warriors/$warriorId"
							params={{
								campaignId,
								warbandId: warrior.warbandId,
								warriorId: warrior.id,
							}}
							className={`hover:underline ${
								!isAlive ? "line-through text-muted-foreground" : ""
							}`}
						>
							{warrior.name}
						</Link>
					</CardTitle>
					<div className="flex items-center gap-2 shrink-0">
						{!isAlive && (
							<Skull
								className="w-4 h-4 text-destructive"
								aria-label="Deceased"
							/>
						)}
						<span
							className={`text-xs px-2 py-1 rounded font-medium ${
								warrior.type === "hero"
									? "bg-primary/20 text-primary"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{typeLabel}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center gap-2">
						<Award className="w-4 h-4 text-muted-foreground" />
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">Experience</p>
							<p className="font-semibold text-sm">{warrior.experience}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Sword className="w-4 h-4 text-muted-foreground" />
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">Kills</p>
							<p className="font-semibold text-sm">{warrior.kills}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Target className="w-4 h-4 text-muted-foreground" />
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">Injuries Caused</p>
							<p className="font-semibold text-sm">{warrior.injuriesCaused}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Shield className="w-4 h-4 text-muted-foreground" />
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">Injuries Received</p>
							<p className="font-semibold text-sm">
								{warrior.injuriesReceived}
							</p>
						</div>
					</div>
				</div>

				{/* Equipment */}
				{warrior.equipment && warrior.equipment.length > 0 && (
					<div>
						<h4 className="text-xs font-semibold text-muted-foreground mb-2">
							Equipment
						</h4>
						<div className="flex flex-wrap gap-1.5">
							{warrior.equipment.map((item) => (
								<span
									key={item}
									className="text-xs px-2 py-1 bg-muted rounded border border-border"
								>
									{item}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Skills */}
				{warrior.skills && warrior.skills.length > 0 && (
					<div>
						<h4 className="text-xs font-semibold text-muted-foreground mb-2">
							Skills
						</h4>
						<div className="flex flex-wrap gap-1.5">
							{warrior.skills.map((skill) => (
								<span
									key={skill}
									className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20"
								>
									{skill}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Death Info */}
				{!isAlive && warrior.deathDescription && (
					<div className="pt-2 border-t border-destructive/20">
						<p className="text-xs text-muted-foreground mb-1">Cause of Death</p>
						<p className="text-sm text-destructive italic">
							{warrior.deathDescription}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
