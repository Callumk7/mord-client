import { useEffect, useRef, useState } from "react";
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

// Easing function for smooth animation (outside component to avoid re-creation)
function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function CasualtyReport({
	kills,
	injuriesTaken,
	injuriesInflicted,
}: CasualtyReportProps) {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [shouldScroll, setShouldScroll] = useState(false);

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

	// Check if content overflows and enable auto-scroll
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		const content = contentRef.current;

		if (!scrollContainer || !content) return;

		const checkOverflow = () => {
			const containerHeight = scrollContainer.clientHeight;
			const contentHeight = content.scrollHeight;
			setShouldScroll(contentHeight > containerHeight);
		};

		checkOverflow();
		window.addEventListener("resize", checkOverflow);

		return () => window.removeEventListener("resize", checkOverflow);
	});

	// Auto-scroll animation
	useEffect(() => {
		if (!shouldScroll) return;

		const scrollContainer = scrollContainerRef.current;
		const content = contentRef.current;

		if (!scrollContainer || !content) return;

		const contentHeight = content.scrollHeight;
		const containerHeight = scrollContainer.clientHeight;
		const scrollDistance = contentHeight - containerHeight;

		// Scroll speed: pixels per second
		const scrollSpeed = 30;
		const duration = ((scrollDistance * 2) / scrollSpeed) * 1000; // Time for full cycle (up and down)

		let animationFrame: number;
		let startTime: number | null = null;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const elapsed = timestamp - startTime;
			const progress = (elapsed % duration) / duration;

			// Smooth easing: scroll down, pause, scroll up, pause
			let scrollPosition: number;
			if (progress < 0.45) {
				// Scroll down (0% to 45%)
				const t = progress / 0.45;
				scrollPosition = easeInOutCubic(t) * scrollDistance;
			} else if (progress < 0.55) {
				// Pause at bottom (45% to 55%)
				scrollPosition = scrollDistance;
			} else if (progress < 0.95) {
				// Scroll up (55% to 95%)
				const t = (progress - 0.55) / 0.4;
				scrollPosition = scrollDistance * (1 - easeInOutCubic(t));
			} else {
				// Pause at top (95% to 100%)
				scrollPosition = 0;
			}

			scrollContainer.scrollTop = scrollPosition;
			animationFrame = requestAnimationFrame(animate);
		};

		animationFrame = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(animationFrame);
	}, [shouldScroll]);

	return (
		<div className="relative flex h-full flex-col overflow-hidden rounded-lg p-1 bg-linear-to-br from-red-600/80 via-blue-600/60 to-amber-500/80">
			<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-slate-950">
				{/* Decorative blur elements - fixed position */}
				<div className="pointer-events-none absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-12 rounded-full bg-linear-to-br from-red-600/30 via-blue-600/20 to-amber-500/30 blur-3xl" />
				<div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 -translate-x-8 translate-y-8 rounded-full bg-linear-to-br from-blue-600/20 to-red-600/20 blur-2xl" />

				{/* Fixed header */}
				<div className="relative z-10 shrink-0 p-6 pb-4">
					<div className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">
						Casualty Desk
					</div>
				</div>

				{/* Scrollable content */}
				<div
					ref={scrollContainerRef}
					className="relative z-10 min-h-0 flex-1 overflow-hidden px-6 pb-6"
				>
					{/* Gradient fade at top */}
					{shouldScroll && (
						<div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-8 bg-linear-to-b from-slate-950 to-transparent" />
					)}

					<div ref={contentRef} className="space-y-6">
						{sections.map((section, sectionIdx) => (
							<div key={section.title}>
								<div className="mb-3 flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600/30 to-red-600/30 text-lg">
										{section.icon}
									</div>
									<div className="text-sm font-bold uppercase tracking-wider text-foreground">
										{section.title}
									</div>
								</div>
								{section.entries.length === 0 ? (
									<div className="ml-10 rounded-lg bg-background/20 px-4 py-3 text-xs text-muted-foreground backdrop-blur-sm">
										No data yet.
									</div>
								) : (
									<div className="space-y-2">
										{section.entries.map((entry, idx) => (
											<div
												key={`${section.title}-${entry.name}`}
												className="group relative overflow-hidden rounded-lg bg-background/30 p-4 backdrop-blur-sm transition-all hover:bg-background/40"
											>
												{/* Ranking number */}
												<div className="absolute left-0 top-0 flex h-full w-12 items-center justify-center bg-linear-to-r from-blue-600/20 to-transparent">
													<span className="text-xl font-black text-foreground/40">
														{idx + 1}
													</span>
												</div>

												{/* Content */}
												<div className="ml-8 flex items-center justify-between">
													<div className="min-w-0 flex-1">
														<div className="font-bold text-foreground">
															{entry.name}
														</div>
														<div className="text-xs text-foreground/60">
															{entry.warband}
														</div>
													</div>
													<div className="ml-4 flex flex-col items-end">
														<div className="text-2xl font-black text-foreground">
															{entry.value.split(" ")[0]}
														</div>
														<div className="text-xs uppercase tracking-wider text-foreground/60">
															{entry.value.split(" ").slice(1).join(" ")}
														</div>
													</div>
												</div>

												{/* Hover effect bar */}
												<div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-linear-to-r from-red-600 via-blue-600 to-amber-500 transition-transform group-hover:scale-x-100" />
											</div>
										))}
									</div>
								)}
								{/* Separator between sections except last */}
								{sectionIdx < sections.length - 1 && (
									<div className="mt-6 h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />
								)}
							</div>
						))}
					</div>

					{/* Gradient fade at bottom */}
					{shouldScroll && (
						<div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-8 bg-linear-to-t from-slate-950 to-transparent" />
					)}
				</div>
			</div>
		</div>
	);
}
