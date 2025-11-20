import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

const matches = [
	{
		id: 1,
		date: "Nov 14, 2025",
		warband1: "Skaven Vermin",
		warband2: "House Escher",
		scenario: "Ambush",
		victor: "Skaven Vermin",
		exp1: 1450,
		exp2: 890,
	},
	{
		id: 2,
		date: "Nov 12, 2025",
		warband1: "The Golden Boys",
		warband2: "Undead Horde",
		scenario: "Breakthrough",
		victor: "The Golden Boys",
		exp1: 2100,
		exp2: 650,
	},
	{
		id: 3,
		date: "Nov 10, 2025",
		warband1: "Skaven Vermin",
		warband2: "The Golden Boys",
		scenario: "Occupy the Territory",
		victor: "The Golden Boys",
		exp1: 1200,
		exp2: 1800,
	},
];

export const Route = createFileRoute("/$campaign/matches/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-foreground">Match Log</h2>
				<Button>Log Match</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Campaign Battles</CardTitle>
					<CardDescription>All matches from this campaign</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{matches.map((match) => (
							<div
								key={match.id}
								className="p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors"
							>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<p className="text-xs text-muted-foreground mb-1">
											Date & Scenario
										</p>
										<p className="font-medium text-foreground text-sm">
											{match.date}
										</p>
										<p className="text-xs text-accent">{match.scenario}</p>
									</div>

									<div>
										<p className="text-xs text-muted-foreground mb-2">
											Match Result
										</p>
										<div className="flex items-center justify-between gap-2">
											<div className="flex-1">
												<p
													className={`font-medium text-sm ${match.victor === match.warband1 ? "text-green-500" : "text-red-500"}`}
												>
													{match.warband1}
												</p>
												<p className="text-xs text-muted-foreground">
													{match.exp1} exp
												</p>
											</div>
											<div className="px-2 py-1 bg-primary rounded text-xs font-bold text-primary-foreground">
												vs
											</div>
											<div className="flex-1 text-right">
												<p
													className={`font-medium text-sm ${match.victor === match.warband2 ? "text-green-500" : "text-red-500"}`}
												>
													{match.warband2}
												</p>
												<p className="text-xs text-muted-foreground">
													{match.exp2} exp
												</p>
											</div>
										</div>
									</div>

									<div className="flex items-center justify-end">
										<Button
											variant="ghost"
											className="text-muted-foreground hover:text-foreground hover:bg-background/50"
										>
											View Details
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
