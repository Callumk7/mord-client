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

			{/* Scoreboard rows (fill available height so content isn't clipped) */}
			<div className="flex w-full min-h-0 flex-1 flex-col gap-3">
				{rows.map((match) => {
					const incidents = match.kills + match.injuries;
					const winnerIds = new Set(match.winners.map((winner) => winner.id));

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
										<div className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.32em] text-slate-300">
											{match.name}
										</div>
										<div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
											{formatShortDate(match.date)} • {formatTime(match.date)}
										</div>
									</div>

									<div className="mt-3 flex min-w-0 items-stretch gap-2">
										{match.participants.map((team, index) => {
											const isWinner = winnerIds.has(team.id);
											const label = withIcon(team.icon, team.name);

											return (
												<div key={team.id} className="contents">
													{index > 0 ? (
														<div className="flex items-center justify-center">
															<span className="rounded bg-slate-50/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-slate-100">
																VS
															</span>
														</div>
													) : null}

													<div
														className={`relative min-w-0 flex-1 overflow-hidden rounded-lg border px-3 py-2 ${
															isWinner
																? "border-amber-500/40 bg-amber-500/5"
																: "border-slate-50/10 bg-slate-50/5"
														}`}
														style={{
															borderLeftColor: team.color ?? undefined,
															borderLeftWidth: team.color ? 4 : undefined,
														}}
													>
														<div className="flex items-start justify-between gap-3">
															<div className="min-w-0">
																<div className="flex items-center gap-2">
																	<span
																		className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400"
																		style={{
																			backgroundColor: team.color ?? undefined,
																		}}
																	/>
																	<div className="min-w-0 truncate text-[13px] font-black uppercase tracking-wide text-slate-50">
																		{label}
																	</div>
																</div>
																<div className="mt-2 flex flex-wrap items-center gap-2">
																	<span className="rounded bg-slate-950/60 px-2 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
																		W {team.wins}
																	</span>
																	<span className="rounded bg-slate-950/60 px-2 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
																		XP {team.experience}
																	</span>
																</div>
															</div>

															{isWinner ? (
																<span className="rounded bg-amber-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-amber-200">
																	WIN
																</span>
															) : null}
														</div>
													</div>
												</div>
											);
										})}
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
