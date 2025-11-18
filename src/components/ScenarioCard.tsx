import { Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface ScenarioCardProps {
	scenario: {
		id: number;
		name: string;
		playerCount: number;
		description?: string | null;
		specialRules?: string[] | null;
	};
	matchCount?: number;
	isPlayed?: boolean;
}

export function ScenarioCard({
	scenario,
	matchCount = 0,
	isPlayed = false,
}: ScenarioCardProps) {
	return (
		<Card className={`transition-all ${isPlayed ? "opacity-75" : ""}`}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-lg">{scenario.name}</CardTitle>
					<div className="flex gap-2">
						<Badge variant="secondary" className="flex items-center gap-1">
							<Users className="h-3 w-3" />
							{scenario.playerCount}
						</Badge>
						{isPlayed && <Badge variant="outline">Played</Badge>}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				{scenario.description && (
					<p className="text-sm text-muted-foreground">
						{scenario.description}
					</p>
				)}
				{scenario.specialRules && scenario.specialRules.length > 0 && (
					<div className="space-y-1">
						<p className="text-xs font-semibold text-muted-foreground">
							Special Rules:
						</p>
						<div className="flex flex-wrap gap-1">
							{scenario.specialRules.map((rule, index) => (
								<Badge key={index} variant="outline" className="text-xs">
									{rule}
								</Badge>
							))}
						</div>
					</div>
				)}
				{matchCount > 0 && (
					<p className="text-xs text-muted-foreground pt-1">
						Played {matchCount} {matchCount === 1 ? "time" : "times"}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
