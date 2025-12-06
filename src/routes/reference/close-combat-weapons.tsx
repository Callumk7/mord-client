import { createFileRoute } from "@tanstack/react-router";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { closeCombatWeapons } from "~/data/close-combat-weapons";
import { Badge } from "~/components/ui/badge";

export const Route = createFileRoute("/reference/close-combat-weapons")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto max-w-7xl p-4">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Close Combat Weapons Reference</h1>
				<p className="mt-2 text-muted-foreground">
					Complete reference of all close combat weapons available in Mordheim.
				</p>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Cost</TableHead>
						<TableHead>Availability</TableHead>
						<TableHead>Range</TableHead>
						<TableHead>Strength</TableHead>
						<TableHead>Special Rules</TableHead>
						<TableHead>Restrictions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{closeCombatWeapons.map((weapon) => (
						<TableRow key={weapon.name}>
							<TableCell className="font-medium">{weapon.name}</TableCell>
							<TableCell>{weapon.cost}</TableCell>
							<TableCell>{weapon.availability}</TableCell>
							<TableCell>{weapon.range}</TableCell>
							<TableCell>{weapon.strength}</TableCell>
							<TableCell>
								<div className="flex flex-col gap-2 max-w-md">
									{weapon.specialRules?.map((rule) => (
										<div key={rule.name} className="space-y-1">
											<Badge variant="outline" className="font-semibold">
												{rule.name}
											</Badge>
											<p className="text-xs text-muted-foreground whitespace-normal">
												{rule.description}
											</p>
										</div>
									))}
								</div>
							</TableCell>
							<TableCell>
								{weapon.restrictions ? (
									<span className="text-xs text-muted-foreground">
										{weapon.restrictions}
									</span>
								) : (
									<span className="text-xs text-muted-foreground italic">
										None
									</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
