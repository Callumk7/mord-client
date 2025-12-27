import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BroadcastChart, BroadcastStat } from "~/types/display";

export interface StatCarouselProps {
	items: (BroadcastStat | BroadcastChart)[];
	headline: string;
}

export function StatCarousel({ items, headline }: StatCarouselProps) {
	const [current, setCurrent] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [progress, setProgress] = useState(0);
	const durationMs = 7_000;
	const slideStartRef = useRef(0);

	useEffect(() => {
		if (items.length <= 1 || isPaused) return;

		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % items.length);
		}, durationMs);

		return () => clearInterval(interval);
	}, [items.length, isPaused]);

	useEffect(() => {
		// Reset progress when slide changes; also clamp for dynamic item arrays.
		if (items.length > 0 && current >= items.length) {
			setCurrent(0);
			return;
		}
		slideStartRef.current = performance.now();
		setProgress(0);
	}, [current, items.length]);

	useEffect(() => {
		let animationId = 0;

		const step = (now: number) => {
			if (!isPaused && items.length > 1) {
				const pct = Math.min(1, (now - slideStartRef.current) / durationMs);
				setProgress(pct);
				if (pct >= 1) {
					setProgress(0);
				} else {
					animationId = requestAnimationFrame(step);
				}
			}
		};

		setProgress(0);
		if (!isPaused && items.length > 1) {
			animationId = requestAnimationFrame(step);
		}

		return () => cancelAnimationFrame(animationId);
	}, [items.length, isPaused]);

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
				<div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-card">
					{/* ON NOW strip sits inside the card frame (avoids clipping the top border) */}
					<div className="absolute left-0 top-0 z-30 w-full">
						<div className="mx-1 mt-1 overflow-hidden rounded-md border bg-background/70 backdrop-blur">
							<div className="flex items-center justify-between gap-4 px-4 py-2">
								<div className="min-w-0 truncate text-xs font-black uppercase tracking-[0.35em] text-muted-foreground">
									On now • {headline}
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
										onClick={() => setIsPaused((prev) => !prev)}
										className="rounded-full bg-accent p-2 text-accent-foreground transition hover:bg-accent/80"
									>
										{isPaused ? (
											<Play className="h-4 w-4" />
										) : (
											<Pause className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>
							<div className="h-1 w-full bg-muted/40">
								<div
									className="h-full bg-accent transition-[width]"
									style={{ width: `${Math.round(progress * 100)}%` }}
								/>
							</div>
						</div>
					</div>

					<div className="flex min-h-0 flex-1 flex-col pt-16">
						{currentItem?.type === "stat" ? (
							<>
								<div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-accent/10 blur-3xl" />
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
						className="absolute left-4 z-20 rounded-full bg-accent p-3 text-accent-foreground transition hover:bg-accent/80"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Next item"
						onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
						className="absolute right-4 z-20 rounded-full bg-accent p-3 text-accent-foreground transition hover:bg-accent/80"
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
										? "w-8 bg-accent"
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
