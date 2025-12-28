import { useMemo } from "react";
import { formatShortDate, formatTime } from "~/lib/display-utils";
import type { MatchCenterMatch } from "~/types/display";

export interface FixtureRowProps {
	match: MatchCenterMatch;
}

export function FixtureRow({ match }: FixtureRowProps) {
	const vsLine = useMemo(() => {
		if (match.participants.length === 0) {
			return "Participants TBD";
		}
		if (match.participants.length === 2) {
			const left = match.participants[0];
			const right = match.participants[1];
			return `${left.name} vs ${right.name}`;
		}
		return `${match.participants.length} warbands scheduled`;
	}, [match.participants]);

	// Determine match format based on participant count
	const matchFormat = match.participants.length === 2 ? "1V1" : "MULTI";

	return (
		<div className="rounded-lg border bg-muted/20 px-3 py-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
						{formatShortDate(match.date)} • {formatTime(match.date)}
					</div>
					<div className="truncate text-sm font-bold text-foreground">
						{match.name}
					</div>
					<div className="truncate text-xs text-muted-foreground">{vsLine}</div>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2">
					<div className="rounded bg-chart-2/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-chart-2">
						Scheduled
					</div>
					<div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
						{matchFormat}
					</div>
				</div>
			</div>
		</div>
	);
}
