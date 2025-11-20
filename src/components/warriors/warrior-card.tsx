import { Link } from "@tanstack/react-router";
import type { Warrior } from "~/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WarriorCardProps {
	campaignId: string;
	warrior: Warrior;
}

export function WarriorCard({ campaignId, warrior }: WarriorCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Link
						to="/$campaign/warbands/$warband/warriors/$warrior"
						params={{
							campaign: campaignId,
							warband: warrior.warbandId.toString(),
							warrior: warrior.id.toString(),
						}}
					>
						{warrior.name}
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div>
					<h4>Equipment</h4>
					<p>{warrior.equipment?.join(", ")}</p>
				</div>
				<div>
					<h4>Skills</h4>
					<p>{warrior.skills?.join(", ")}</p>
				</div>
			</CardContent>
		</Card>
	);
}
