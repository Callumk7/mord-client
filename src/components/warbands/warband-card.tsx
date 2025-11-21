import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import type { Warband } from "~/db/schema";
import { deleteWarbandMutation } from "~/query/mutations";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WarbandCardProps {
	warband: Warband;
}

export function WarbandCard({ warband }: WarbandCardProps) {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation(deleteWarbandMutation);

	const handleDelete = () => {
		deleteMutation.mutate(warband.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["campaign", warband.campaignId, "warbands"],
				});
			},
		});
	};
	return (
		<Card>
			<CardHeader className="relative">
				<CardTitle>
					<Link
						to="/$campaign/warbands/$warband"
						params={{
							campaign: warband.campaignId.toString(),
							warband: warband.id.toString(),
						}}
					>
						{warband.name}
					</Link>
				</CardTitle>
				<Button
					className="absolute right-4"
					variant="outline"
					onClick={handleDelete}
				>
					<Trash2 />
				</Button>
			</CardHeader>
			<CardContent>
				<table>
					<tbody>
						<tr>
							<td>Faction</td>
							<td>{warband.faction}</td>
						</tr>
						<tr>
							<td>Rating</td>
							<td>{warband.rating}</td>
						</tr>
						<tr>
							<td>Treasury</td>
							<td>{warband.treasury}</td>
						</tr>
					</tbody>
				</table>
			</CardContent>
		</Card>
	);
}
