import { useEffect, useMemo, useRef } from "react";

export interface NewsTickerProps {
	items: string[];
	label?: string;
}

export function NewsTicker({ items, label = "Breaking" }: NewsTickerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const lastFrameRef = useRef<number | null>(null);

	useEffect(() => {
		if (!items.length) {
			return;
		}

		const reduceMotion =
			typeof window !== "undefined" &&
			(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
				false);
		if (reduceMotion) {
			return;
		}

		const container = containerRef.current;
		const content = contentRef.current;
		if (!container || !content) {
			return;
		}

		let animationId = 0;
		let offsetPx = 0;
		const pxPerSecond = 36;

		// Reset on item changes
		offsetPx = 0;
		lastFrameRef.current = null;
		content.style.transform = "translateX(0px)";

		const step = (now: number) => {
			const shouldAnimate =
				content.scrollWidth > container.clientWidth &&
				content.scrollWidth / 2 > 0;
			if (!shouldAnimate) {
				content.style.transform = "translateX(0px)";
				animationId = requestAnimationFrame(step);
				return;
			}

			const last = lastFrameRef.current ?? now;
			lastFrameRef.current = now;
			const dt = Math.min(50, now - last);
			const deltaPx = (pxPerSecond * dt) / 1000;

			const halfWidth = content.scrollWidth / 2;
			if (halfWidth <= 0) {
				animationId = requestAnimationFrame(step);
				return;
			}

			offsetPx += deltaPx;
			if (offsetPx >= halfWidth) {
				offsetPx = 0;
			}

			content.style.transform = `translateX(-${offsetPx}px)`;
			animationId = requestAnimationFrame(step);
		};

		animationId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(animationId);
	}, [items]);

	const loopItems = useMemo(() => {
		const primary = items.map((item, index) => ({
			id: `primary-${index}-${item}`,
			text: item,
		}));
		const duplicate = primary.map((entry) => ({
			id: `loop-${entry.id}`,
			text: entry.text,
		}));
		return [...primary, ...duplicate];
	}, [items]);

	return (
		<footer className="relative border-t border-border/60 bg-background/80 px-4 py-3 text-foreground backdrop-blur md:px-6">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-linear-to-r from-red-600/15 via-blue-600/10 to-amber-500/15" />
				<div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/80 to-transparent" />
				<div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/80 to-transparent" />
			</div>

			<div className="relative flex items-center gap-4">
				<div className="shrink-0">
					<div className="flex items-center gap-3">
						<div className="flex items-stretch overflow-hidden rounded border bg-card shadow-sm">
							<div className="bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
								SKY
							</div>
							<div className="bg-blue-700 px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
								MORD
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
							<span className="rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-white">
								{label}
							</span>
						</div>
					</div>
				</div>
				<div
					ref={containerRef}
					className="flex-1 overflow-hidden whitespace-nowrap"
				>
					<div ref={contentRef} className="flex gap-12 will-change-transform">
						{loopItems.map((entry) => (
							<span
								key={entry.id}
								className="text-sm font-semibold text-foreground/90"
							>
								<span className="text-foreground/40">◆</span>{" "}
								<span>{entry.text}</span>
							</span>
						))}
					</div>
				</div>
				<div className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground md:block">
					SMSN • LIVE FEED
				</div>
			</div>
		</footer>
	);
}
