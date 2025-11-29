import { createFileRoute } from "@tanstack/react-router";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { seriousInjuries } from "~/types/injuries";

export const Route = createFileRoute("/reference/injuries")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Injury</TableHead>
					<TableHead>Role</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Stat Effect</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{seriousInjuries.map((i) => (
					<TableRow key={i.name}>
						<TableCell>{i.name}</TableCell>
						<TableCell>
							{Array.isArray(i.roll) ? `${i.roll[0]}–${i.roll[1]}` : i.roll}
						</TableCell>
						<TableCell>
							<div className="whitespace-pre-wrap">{i.description}</div>
						</TableCell>
						<TableCell>{i.statEffect}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
