import { useMemo, useEffect, useRef } from "react";
import type { MatchCenterMatch } from "~/types/display";
import { FixtureRow } from "./fixture-row";
import { LiveScoreCard } from "./live-score-card";

interface LiveNowGridProps {
	matches: MatchCenterMatch[];
}

function LiveNowGrid({ matches }: LiveNowGridProps) {
	if (matches.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
				<div className="text-sm font-semibold text-muted-foreground">
					No games in progress.
				</div>
				<div className="mt-1 text-xs text-muted-foreground">
					Start a match to light up the broadcast.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground">
					Live Now
				</div>
				<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
					<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
					LIVE
				</div>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{matches.slice(0, 4).map((match) => (
					<LiveScoreCard key={match.id} match={match} />
				))}
			</div>
			{matches.length > 4 && (
				<div className="text-xs text-muted-foreground">
					Showing 4 of {matches.length} live matches.
				</div>
			)}
		</div>
	);
}

interface UpcomingFixturesProps {
	matches: MatchCenterMatch[];
}

function UpcomingFixtures({ matches }: UpcomingFixturesProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!scrollRef.current || !contentRef.current || matches.length === 0) {
			return;
		}

		const scrollContainer = scrollRef.current;
		const content = contentRef.current;
		let animationId: number;
		let scrollPosition = 0;

		// Calculate scroll speed based on content (pixels per frame)
		const scrollSpeed = 0.3;

		const animate = () => {
			scrollPosition += scrollSpeed;

			// Get the height of a single set of fixtures
			const contentHeight = content.offsetHeight / 2;

			// Reset scroll position when we've scrolled past one full set
			if (scrollPosition >= contentHeight) {
				scrollPosition = 0;
			}

			scrollContainer.scrollTop = scrollPosition;
			animationId = requestAnimationFrame(animate);
		};

		// Start animation
		animationId = requestAnimationFrame(animate);

		// Pause on hover
		const handleMouseEnter = () => {
			cancelAnimationFrame(animationId);
		};

		const handleMouseLeave = () => {
			animationId = requestAnimationFrame(animate);
		};

		scrollContainer.addEventListener("mouseenter", handleMouseEnter);
		scrollContainer.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			cancelAnimationFrame(animationId);
			scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
			scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [matches]);

	return (
		<div className="flex h-full flex-col space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground">
					Upcoming
				</div>
				<div className="text-xs font-semibold text-muted-foreground">
					Next up
				</div>
			</div>
			{matches.length === 0 ? (
				<div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
					No scheduled fixtures yet.
				</div>
			) : (
				<div
					ref={scrollRef}
					className="min-h-0 flex-1 overflow-hidden"
					style={{
						maskImage:
							"linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
					}}
				>
					<div ref={contentRef} className="space-y-2">
						{/* First set of fixtures */}
						{matches.map((match) => (
							<FixtureRow key={`first-${match.id}`} match={match} />
						))}
						{/* Duplicate set for seamless loop */}
						{matches.map((match) => (
							<FixtureRow key={`second-${match.id}`} match={match} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export interface MatchCenterProps {
	matches: MatchCenterMatch[];
}

export function MatchCenter({ matches }: MatchCenterProps) {
	const { live, scheduled } = useMemo(() => {
		const liveMatches = matches
			.filter((match) => match.status === "active")
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		const scheduledMatches = matches
			.filter((match) => match.status === "scheduled")
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		return { live: liveMatches, scheduled: scheduledMatches };
	}, [matches]);

	return (
		<div className="h-full min-h-0">
			<div className="h-full min-h-0 overflow-hidden rounded-lg border bg-card shadow-lg">
				<div className="border-b bg-muted/20 px-4 py-2">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							<div className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
								Match Center
							</div>
							<div className="truncate text-base font-black uppercase tracking-wider text-foreground">
								Live &amp; Upcoming
							</div>
						</div>
						<div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
							{live.length} live • {scheduled.length} next
						</div>
					</div>
				</div>

				<div className="grid h-[calc(100%-3rem)] min-h-0 gap-3 p-3 lg:grid-cols-3">
					<div className="min-h-0 overflow-hidden lg:col-span-2">
						<LiveNowGrid matches={live} />
					</div>
					<div className="min-h-0 overflow-hidden lg:col-span-1">
						<UpcomingFixtures matches={scheduled} />
					</div>
				</div>
			</div>
		</div>
	);
}
