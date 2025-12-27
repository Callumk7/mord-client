import { useQuery } from "@tanstack/react-query";
import { getMatchWarbandsOptions } from "~/api/matches";
import type { Warband, Warrior } from "~/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Table,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";

interface PostMatchGamesPlayedProps {
	matchId: number;
}

export function PostMatchGamesPlayed({ matchId }: PostMatchGamesPlayedProps) {
	const { data: match, isPending } = useQuery(getMatchWarbandsOptions(matchId));

	if (isPending) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			{match?.map((warband) => (
				<PostMatchWarbandCard
					key={warband.id}
					warband={warband}
					warriors={warband.warriors}
				/>
			))}
		</div>
	);
}

interface PostMatchWarbandCardProps {
	warband: Warband;
	warriors: Warrior[];
}

export function PostMatchWarbandCard({
	warband,
	warriors,
}: PostMatchWarbandCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{warband.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Warrior</TableHead>
							<TableHead>Games Played</TableHead>
						</TableRow>
					</TableHeader>
					{warriors.map((warrior) => (
						<TableRow key={warrior.id}>
							<TableCell>{warrior.name}</TableCell>
							<TableCell>{warrior.gamesPlayed}</TableCell>
						</TableRow>
					))}
				</Table>
			</CardContent>
		</Card>
	);
}
