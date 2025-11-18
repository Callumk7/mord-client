import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface WarbandCardProps {
	warband: {
		id: number;
		name: string;
		faction: string;
		rating: number;
		treasury: number;
		color?: string | null;
		icon?: string | null;
	};
	campaignId: string;
	warriorCount?: number;
}

export function WarbandCard({
	warband,
	campaignId,
	warriorCount = 0,
}: WarbandCardProps) {
	return (
		<Link
			to="/$campaign/warband/$warbandId"
			params={{ campaign: campaignId, warbandId: String(warband.id) }}
		>
			<Card className="transition-all hover:shadow-md cursor-pointer">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<CardTitle className="text-lg">{warband.name}</CardTitle>
						<Badge variant="secondary">{warband.faction}</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Rating</p>
							<p className="font-semibold">{warband.rating}</p>
						</div>
						<div>
							<p className="text-muted-foreground">Treasury</p>
							<p className="font-semibold">{warband.treasury} GC</p>
						</div>
						<div className="col-span-2">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Users className="h-4 w-4" />
								<span>
									{warriorCount} {warriorCount === 1 ? "warrior" : "warriors"}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
