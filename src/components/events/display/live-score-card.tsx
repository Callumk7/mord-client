import { useMemo, useEffect, useRef, useState } from "react";
import { formatTime, pluralize } from "~/lib/display-utils";
import type { MatchCenterMatch } from "~/types/display";

interface ScoreSideProps {
	align: "left" | "right";
	name: string;
	icon: string | null;
	color: string | null;
	rating: number;
}

interface ScrollingTextProps {
	children: string;
	className?: string;
}

function ScrollingText({ children, className }: ScrollingTextProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	const [shouldScroll, setShouldScroll] = useState(false);

	useEffect(() => {
		const checkOverflow = () => {
			if (containerRef.current && textRef.current) {
				const isOverflowing =
					textRef.current.scrollWidth > containerRef.current.clientWidth;
				setShouldScroll(isOverflowing);
			}
		};

		checkOverflow();
		const timer = setTimeout(checkOverflow, 100);
		window.addEventListener("resize", checkOverflow);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("resize", checkOverflow);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={`min-w-0 flex-1 overflow-hidden ${className ?? ""}`}
		>
			{shouldScroll ? (
				<div className="whitespace-nowrap">
					<span className="inline-block animate-marquee">
						{children}
						<span className="inline-block px-8">{children}</span>
					</span>
				</div>
			) : (
				<span ref={textRef} className="whitespace-nowrap">
					{children}
				</span>
			)}
		</div>
	);
}

function ScoreSide({ align, name, icon, color, rating }: ScoreSideProps) {
	const displayName = `${icon ? `${icon} ` : ""}${name}`;

	return (
		<div
			className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}
		>
			<div className="flex items-center gap-2">
				{align === "left" ? (
					<span
						className="h-3 w-3 shrink-0 rounded-full"
						style={{ backgroundColor: color ?? "#f4b400" }}
					/>
				) : null}
				<ScrollingText className="text-lg font-black uppercase tracking-wide">
					{displayName}
				</ScrollingText>
				{align === "right" ? (
					<span
						className="h-3 w-3 shrink-0 rounded-full"
						style={{ backgroundColor: color ?? "#f4b400" }}
					/>
				) : null}
			</div>
			<div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-300">
				<span className="uppercase tracking-[0.25em]">Rating</span>
				<span className="font-mono">{rating}</span>
			</div>
		</div>
	);
}

export interface LiveScoreCardProps {
	match: MatchCenterMatch;
}

export function LiveScoreCard({ match }: LiveScoreCardProps) {
	const scoreboard = useMemo(() => {
		const participants = match.participants.map((participant) => {
			const eventCount = match.events.filter(
				(event) => event.warrior?.warbandId === participant.warbandId,
			).length;

			return { ...participant, eventCount };
		});

		const ordered = [...participants].sort(
			(a, b) => b.eventCount - a.eventCount,
		);
		return { participants, ordered };
	}, [match.events, match.participants]);

	const recentEvents = useMemo(() => {
		return [...match.events]
			.sort(
				(a, b) =>
					new Date(b.timestamp ?? 0).getTime() -
					new Date(a.timestamp ?? 0).getTime(),
			)
			.slice(0, 2);
	}, [match.events]);

	const isHeadToHead = scoreboard.participants.length === 2;
	const left = isHeadToHead ? scoreboard.participants[0] : null;
	const right = isHeadToHead ? scoreboard.participants[1] : null;
	const leader =
		scoreboard.ordered[0] && scoreboard.ordered[0].eventCount > 0
			? scoreboard.ordered[0]
			: null;

	return (
		<div className="overflow-hidden rounded-lg border bg-linear-to-r from-slate-950 via-slate-950 to-slate-900 text-slate-50 shadow">
			<div className="flex items-center justify-between bg-linear-to-r from-blue-600/60 via-blue-600/30 to-red-600/60 px-3 py-2">
				<div className="text-xs font-semibold text-slate-200">
					{formatTime(match.date)}
				</div>
			</div>

			<div className="space-y-3 px-4 py-4">
				<div className="truncate text-sm font-semibold text-slate-200">
					{match.name}
				</div>

				{isHeadToHead && left && right ? (
					<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
						<ScoreSide
							align="right"
							name={left.name}
							icon={left.icon}
							color={left.color}
							rating={left.rating}
						/>
						<div className="flex flex-col items-center">
							<div className="rounded bg-slate-50 px-3 py-1 text-sm font-black text-slate-950">
								VS
							</div>
							<div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
								LIVE
							</div>
						</div>
						<ScoreSide
							align="left"
							name={right.name}
							icon={right.icon}
							color={right.color}
							rating={right.rating}
						/>
					</div>
				) : (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.35em] text-slate-300">
							<span>Warband</span>
							<span>Rating</span>
						</div>
						<div className="space-y-2">
							{scoreboard.ordered.slice(0, 4).map((participant) => {
								const displayName = `${participant.icon ? `${participant.icon} ` : ""}${participant.name}`;
								return (
									<div
										key={participant.warbandId}
										className="flex items-center justify-between gap-2 rounded bg-slate-50/5 px-3 py-2"
									>
										<div className="flex min-w-0 flex-1 items-center gap-2">
											<span
												className="h-2 w-2 shrink-0 rounded-full"
												style={{
													backgroundColor: participant.color ?? "#f4b400",
												}}
											/>
											<ScrollingText className="text-sm font-semibold">
												{displayName}
											</ScrollingText>
											{leader?.warbandId === participant.warbandId && (
												<span className="shrink-0 rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-950">
													Lead
												</span>
											)}
										</div>
										<div className="shrink-0 font-mono text-sm font-semibold">
											{participant.rating}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{recentEvents.length > 0 && (
					<div className="space-y-1.5 border-t border-slate-50/10 pt-3">
						<div className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-300">
							Recent Events
						</div>
						{recentEvents.map((event) => {
							const icon = event.death ? "☠" : event.injury ? "🩸" : "⚔";
							const text =
								event.description ??
								(event.warrior && event.defender
									? `${event.warrior.name} vs ${event.defender.name}`
									: (event.warrior?.name ?? "Event"));
							return (
								<div key={event.id} className="truncate text-xs text-slate-300">
									<span className="mr-1.5">{icon}</span>
									{text}
								</div>
							);
						})}
					</div>
				)}

				<div className="flex items-center justify-between border-t border-slate-50/10 pt-3 text-[11px] font-semibold text-slate-300">
					<span>{pluralize(match.events.length, "event")} logged</span>
					<span className="uppercase tracking-[0.25em]">Sky Desk</span>
				</div>
			</div>
		</div>
	);
}
