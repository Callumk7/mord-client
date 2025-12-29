import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { BroadcastChart, BroadcastStat } from "~/types/display";

export interface StatCarouselProps {
	items: (BroadcastStat | BroadcastChart)[];
	headline: string;
}

export function StatCarousel({ items, headline }: StatCarouselProps) {
	const [current, setCurrent] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const durationMs = 7_000;

	useEffect(() => {
		if (items.length <= 1 || isPaused) return;

		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % items.length);
		}, durationMs);

		return () => clearInterval(interval);
	}, [items.length, isPaused]);

	useEffect(() => {
		// Clamp for dynamic item arrays.
		if (items.length > 0 && current >= items.length) {
			setCurrent(0);
		}
	}, [current, items.length]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === " " || event.key.toLowerCase() === "p") {
				event.preventDefault();
				setIsPaused((prev) => !prev);
				return;
			}
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				setCurrent((prev) => (prev - 1 + items.length) % items.length);
				return;
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				setCurrent((prev) => (prev + 1) % items.length);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [items.length]);

	const currentItem = items[current];

	return (
		<div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg">
			<div
				className={`absolute inset-0 rounded-lg p-1 transition-all duration-500 bg-linear-to-br ${currentItem?.gradient}`}
			>
				<div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-linear-to-br from-slate-950 via-slate-900/30 to-slate-950">
					<button
						type="button"
						aria-label={`${isPaused ? "Resume" : "Pause"} autoplay (${headline})`}
						onClick={() => setIsPaused((prev) => !prev)}
						className="absolute right-4 top-4 z-30 rounded-full bg-blue-600 p-2 text-white shadow-sm transition hover:bg-blue-700"
					>
						{isPaused ? (
							<Play className="h-4 w-4" />
						) : (
							<Pause className="h-4 w-4" />
						)}
					</button>

					<div className="flex min-h-0 flex-1 flex-col pt-4">
						{currentItem?.type === "stat" ? (
							<>
								<div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-linear-to-br from-red-600/20 via-blue-600/15 to-amber-500/20 blur-3xl" />
								{currentItem.leaderboard ? (
									<div className="relative z-10 space-y-4 px-8 pb-8 pt-4">
										<div className="text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground">
											{currentItem.title}
										</div>
										<div className="space-y-3">
											{currentItem.leaderboard.map((entry, idx) => (
												<div
													key={`${entry.name}-${idx}`}
													className="flex items-center justify-between rounded-lg bg-background/30 p-4 backdrop-blur-sm"
												>
													<div className="flex items-center gap-3">
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600/20 to-amber-500/20 text-xl font-bold text-foreground">
															{idx + 1}
														</div>
														<div>
															<div className="text-lg font-bold text-foreground">
																{entry.name}
															</div>
															{entry.subtitle && (
																<div className="text-sm text-foreground/60">
																	{entry.subtitle}
																</div>
															)}
														</div>
													</div>
													<div className="text-2xl font-black text-foreground">
														{entry.value}
													</div>
												</div>
											))}
										</div>
										{currentItem.description && (
											<div className="border-t border-border/50 pt-4 text-sm text-foreground/60">
												{currentItem.description}
											</div>
										)}
									</div>
								) : (
									<div className="relative z-10 space-y-2 px-8 pb-8 pt-4">
										<div className="text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground">
											{currentItem.title}
										</div>
										<div className="text-5xl font-black text-foreground">
											{currentItem.value}
										</div>
										<div className="text-lg text-foreground/80">
											{currentItem.statLine}
										</div>
										<div className="border-t border-border/50 pt-4 text-sm text-foreground/60">
											{currentItem.description}
										</div>
									</div>
								)}
								<div className="relative z-10 flex items-center justify-between p-8 pt-0 text-xs text-foreground/60">
									<span>{currentItem.footnote}</span>
									<span>
										{String(current + 1).padStart(2, "0")} /{" "}
										{String(items.length).padStart(2, "0")}
									</span>
								</div>
							</>
						) : currentItem?.type === "chart" ? (
							<>
								<div className="relative z-10 flex-1 overflow-hidden">
									{currentItem.content}
								</div>
								<div className="relative z-10 flex items-center justify-end p-4 text-xs text-foreground/60">
									<span>
										{String(current + 1).padStart(2, "0")} /{" "}
										{String(items.length).padStart(2, "0")}
									</span>
								</div>
							</>
						) : null}
					</div>
				</div>
			</div>
			{items.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Previous item"
						onClick={() =>
							setCurrent((prev) => (prev - 1 + items.length) % items.length)
						}
						className="absolute left-4 z-20 rounded-full bg-blue-600 p-3 text-white transition hover:bg-blue-700"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Next item"
						onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
						className="absolute right-4 z-20 rounded-full bg-red-600 p-3 text-white transition hover:bg-red-700"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
					<div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
						{items.map((item, index) => (
							<button
								key={item.id}
								type="button"
								aria-label={`Go to item ${index + 1}`}
								onClick={() => setCurrent(index)}
								className={`h-2 rounded-full transition-all ${
									index === current
										? "w-8 bg-linear-to-r from-red-600 via-blue-600 to-amber-500"
										: "w-2 bg-foreground/30 hover:bg-foreground/60"
								}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
