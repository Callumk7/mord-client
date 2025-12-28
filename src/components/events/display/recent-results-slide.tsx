import { formatShortDate, formatTime, withIcon } from "~/lib/display-utils";
import type { MatchHighlight } from "~/types/display";

export interface RecentResultsSlideProps {
	highlights: MatchHighlight[];
}

export function RecentResultsSlide({ highlights }: RecentResultsSlideProps) {
	if (highlights.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No completed matches to recap yet.
			</div>
		);
	}

	const rows = highlights.slice(0, 3);

	return (
		<div className="flex h-full min-h-0 flex-col">
			{/* Broadcast header strip */}
			<div className="mb-3 overflow-hidden rounded-lg border bg-linear-to-r from-slate-950 via-slate-900 to-slate-950">
				<div className="flex items-center justify-between px-4 py-3">
					<div className="min-w-0">
						<div className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-300">
							Full time
						</div>
						<div className="truncate text-xl font-black uppercase tracking-wider text-slate-50">
							Results Board
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
							FT
						</span>
						<span className="rounded bg-slate-50/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-200">
							Last 3
						</span>
					</div>
				</div>
				<div className="h-1 w-full bg-linear-to-r from-red-600 via-blue-700 to-amber-500" />
			</div>

			{/* Scoreboard rows (fill available height so content isn't clipped) */}
			<div className="flex w-full min-h-0 flex-1 flex-col gap-3">
				{rows.map((match) => {
					const participantNames = match.participants
						.slice(0, 4)
						.map((p) => withIcon(p.icon, p.name));
					const participantsLine =
						participantNames.length === 0
							? "Participants TBD"
							: `${participantNames.join(" • ")}${match.participants.length > 4 ? ` • +${match.participants.length - 4}` : ""}`;

					const winnersNames = match.winners
						.slice(0, 2)
						.map((w) => withIcon(w.icon, w.name));
					const winnersLine =
						winnersNames.length === 0
							? "TBD"
							: `${winnersNames.join(" & ")}${match.winners.length > 2 ? ` & +${match.winners.length - 2}` : ""}`;

					const incidents = match.kills + match.injuries;

					// Determine match format based on participant count
					const matchFormat = match.participants.length === 2 ? "1V1" : "MULTI";

					return (
						<div
							key={match.id}
							className="flex w-full min-h-0 flex-1 overflow-hidden rounded-lg border bg-linear-to-r from-slate-950 via-slate-950 to-slate-900 text-slate-50 shadow"
						>
							<div className="flex h-full w-full items-stretch">
								<div className="flex w-[92px] flex-col items-center justify-center gap-2 border-r border-slate-50/10 bg-linear-to-b from-blue-700/35 via-slate-950 to-red-700/30 px-3">
									<div className="rounded bg-slate-50/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-slate-200">
										{matchFormat}
									</div>
									<div className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
										FT
									</div>
								</div>

								<div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-3">
									<div className="flex items-baseline justify-between gap-4">
										<div className="min-w-0 truncate text-base font-black uppercase tracking-wide">
											{match.name}
										</div>
										<div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
											{formatShortDate(match.date)} • {formatTime(match.date)}
										</div>
									</div>

									<div className="mt-1 flex min-w-0 items-center gap-2">
										<span className="shrink-0 rounded bg-amber-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-amber-200">
											WIN
										</span>
										<span className="min-w-0 truncate text-xs font-semibold text-slate-100">
											{winnersLine}
										</span>
									</div>

									<div className="mt-2 min-w-0 truncate text-[11px] font-semibold text-slate-200">
										<span className="text-slate-400">Players:</span>{" "}
										{participantsLine}
									</div>
								</div>

								<div className="flex w-[170px] flex-col items-center justify-center gap-1 border-l border-slate-50/10 bg-slate-50/5 px-3 py-3 text-center">
									<div className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-300">
										Incidents
									</div>
									<div className="text-2xl font-black tabular-nums text-slate-50">
										{incidents}
									</div>
									<div className="flex items-center gap-3 text-[11px] font-semibold text-slate-200">
										<span>
											<span className="text-slate-400">☠️</span>{" "}
											<span className="font-mono">{match.kills}</span>
										</span>
										<span>
											<span className="text-slate-400">🩸</span>{" "}
											<span className="font-mono">{match.injuries}</span>
										</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
