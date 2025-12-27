import { pluralize } from "~/lib/display-utils";
import type {
	WarriorInjuriesInflictedRow,
	WarriorInjuriesTakenRow,
	WarriorKillsRow,
} from "~/types/display";

export interface CasualtyReportProps {
	kills: WarriorKillsRow[];
	injuriesTaken: WarriorInjuriesTakenRow[];
	injuriesInflicted: WarriorInjuriesInflictedRow[];
}

export function CasualtyReport({
	kills,
	injuriesTaken,
	injuriesInflicted,
}: CasualtyReportProps) {
	const sections = [
		{
			title: "Lethal Warriors",
			icon: "⚔️",
			entries: kills.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: pluralize(entry.kills, "kill"),
			})),
		},
		{
			title: "Walking Wounded",
			icon: "🩹",
			entries: injuriesTaken.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: pluralize(entry.injuriesReceived, "hit"),
			})),
		},
		{
			title: "Delivery Squad",
			icon: "🔥",
			entries: injuriesInflicted.map((entry) => ({
				name: entry.warrior.name,
				warband: entry.warbandName,
				value: pluralize(entry.injuriesInflicted, "injury"),
			})),
		},
	];

	return (
		<div className="rounded-lg border bg-card p-5 shadow">
			<div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
				Casualty Desk
			</div>
			<div className="mt-4 space-y-4">
				{sections.map((section) => (
					<div key={section.title}>
						<div className="text-sm font-semibold text-foreground">
							{section.icon} {section.title}
						</div>
						{section.entries.length === 0 ? (
							<p className="text-xs text-muted-foreground">No data yet.</p>
						) : (
							<div className="mt-2 space-y-1 text-sm">
								{section.entries.map((entry) => (
									<div
										key={`${section.title}-${entry.name}`}
										className="flex justify-between text-foreground/90"
									>
										<div className="truncate">
											<span className="font-semibold">{entry.name}</span>{" "}
											<span className="text-muted-foreground">
												({entry.warband})
											</span>
										</div>
										<div className="text-right font-semibold">
											{entry.value}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
