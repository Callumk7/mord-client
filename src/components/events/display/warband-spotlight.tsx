import type { WarbandSpotlightData } from "~/types/display";

export interface WarbandSpotlightProps {
	data: WarbandSpotlightData | null;
}

export function WarbandSpotlight({ data }: WarbandSpotlightProps) {
	if (!data) {
		return (
			<div className="rounded-lg border bg-card p-4 shadow">
				<p className="text-sm text-muted-foreground">
					No warband spotlight yet. Play a match to crown a leader.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card p-5 shadow">
			<div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
				Warband Spotlight
			</div>
			<div className="mt-2 text-2xl font-black text-foreground">
				{data.icon ? `${data.icon} ` : ""}
				{data.name}
			</div>
			<div className="text-sm text-muted-foreground">{data.faction}</div>
			<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">Wins</div>
					<div className="text-xl font-bold">{data.wins}</div>
				</div>
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">
						Treasury
					</div>
					<div className="text-xl font-bold">{data.treasury} gc</div>
				</div>
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">
						Warriors Alive
					</div>
					<div className="text-xl font-bold">{data.warriorsAlive}</div>
				</div>
				<div className="rounded-lg bg-muted/40 p-3">
					<div className="text-xs uppercase text-muted-foreground">
						Event Impact
					</div>
					<div className="text-xl font-bold">
						{data.eventsInflicted} / {data.eventsSuffered}
					</div>
				</div>
			</div>
		</div>
	);
}
