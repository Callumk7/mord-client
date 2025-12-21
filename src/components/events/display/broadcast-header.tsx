import { useEffect, useState } from "react";
import type { Campaign } from "~/db/schema";
import { formatDate, pluralize } from "~/lib/display-utils";

export interface BroadcastHeaderProps {
	campaign: Campaign | null | undefined;
	topWarbandName?: string;
	totalMatches: number;
	casualtyCount: number;
	activeWarbands: number;
	breaking?: string;
}

export function BroadcastHeader({
	campaign,
	topWarbandName,
	totalMatches,
	casualtyCount,
	activeWarbands,
	breaking,
}: BroadcastHeaderProps) {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1_000);
		return () => clearInterval(interval);
	}, []);

	const timeframe = campaign
		? `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
		: "Schedule pending";

	return (
		<header className="relative border-b border-border/60 bg-background/70 text-foreground backdrop-blur">
			<div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
				<div className="flex items-center gap-4">
					<div className="flex items-stretch overflow-hidden rounded-md border bg-card shadow-sm">
						<div className="bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
							SKY
						</div>
						<div className="bg-blue-700 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
							MORD
						</div>
						<div className="px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
							SPORTS NEWS
						</div>
					</div>
					<div className="hidden h-10 w-px bg-border md:block" />
					<div className="min-w-0">
						<h1 className="truncate text-xl font-black tracking-wider md:text-2xl">
							{campaign?.name ?? "Mordheim Campaign Report"}
						</h1>
						<div className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
							{timeframe}
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
						<span className="rounded bg-red-600 px-2 py-1 text-xs font-black uppercase tracking-[0.25em] text-white">
							LIVE
						</span>
						<span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
							{now.toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})}
						</span>
					</div>

					<div className="flex flex-wrap gap-2 text-[11px] font-semibold">
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							Top warband:{" "}
							<span className="font-black text-foreground">
								{topWarbandName ?? "TBD"}
							</span>
						</span>
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							<span className="font-black text-foreground">
								{pluralize(totalMatches, "match")}
							</span>{" "}
							reported
						</span>
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							<span className="font-black text-foreground">
								{pluralize(casualtyCount, "casualty")}
							</span>{" "}
							logged
						</span>
						<span className="rounded-full border bg-card/70 px-3 py-1 text-muted-foreground">
							<span className="font-black text-foreground">
								{activeWarbands}
							</span>{" "}
							warbands
						</span>
					</div>
				</div>
			</div>

			<div className="border-t bg-linear-to-r from-red-600/20 via-blue-600/10 to-amber-500/20 px-4 py-2 md:px-6">
				<div className="flex items-center gap-3">
					<span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
						Breaking
					</span>
					<div className="min-w-0 truncate text-sm font-semibold">
						{breaking ?? "The desk is live — feed the ruins with events."}
					</div>
					<div className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground md:block">
						SMSN • Live feed
					</div>
				</div>
			</div>
		</header>
	);
}
