/**
 * Utility functions for the display/broadcast view
 */

export function formatDate(date: Date | string | null | undefined) {
	if (!date) {
		return "Unknown date";
	}
	const parsed = new Date(date);
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatShortDate(date: Date | string | null | undefined) {
	if (!date) {
		return "TBD";
	}
	const parsed = new Date(date);
	return parsed.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function formatTime(date: Date | string | null | undefined) {
	if (!date) {
		return "TBD";
	}
	const parsed = new Date(date);
	return parsed.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function pluralize(value: number, singular: string, plural?: string) {
	const suffix = value === 1 ? singular : (plural ?? `${singular}s`);
	return `${value} ${suffix}`;
}

export function withIcon(icon: string | null | undefined, label: string) {
	return icon ? `${icon} ${label}` : label;
}

export function truncate(value: string, max: number) {
	if (value.length <= max) return value;
	return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/**
 * Centralized color system for the display/broadcast route
 * Uses the "Sky Mord" red/blue/amber theme consistently
 *
 * Note: Tailwind requires static class names, so we use predefined gradient strings
 */

// Brand color constants for reference (used in comments/docs)
export const DISPLAY_COLORS = {
	red: { 500: "red-500", 600: "red-600", 700: "red-700" },
	blue: { 500: "blue-500", 600: "blue-600", 700: "blue-700" },
	amber: { 400: "amber-400", 500: "amber-500" },
	slate: { 950: "slate-950", 900: "slate-900", 800: "slate-800" },
} as const;

/**
 * Carousel gradient variants using the red/blue/amber theme
 * All gradients start from slate-950 for consistency
 */
export const CAROUSEL_GRADIENTS = {
	"red-to-blue": "from-slate-950 via-red-700/35 to-blue-700/35",
	"blue-to-red": "from-slate-950 via-blue-700/35 to-red-700/35",
	"red-blue-amber":
		"from-slate-950 via-red-600/30 via-blue-600/30 to-amber-500/30",
	"blue-red-amber":
		"from-slate-950 via-blue-600/30 via-red-600/30 to-amber-500/30",
	"amber-red-blue":
		"from-slate-950 via-amber-500/25 via-red-600/30 to-blue-600/30",
	"red-amber-blue":
		"from-slate-950 via-red-600/30 via-amber-500/25 to-blue-600/30",
	"red-blue-heavy": "from-slate-950 via-red-600/40 to-blue-600/40",
	"blue-red-heavy": "from-slate-950 via-blue-600/40 to-red-600/40",
} as const;

/**
 * Header/bar gradients for breaking news, tickers, etc.
 */
export const HEADER_GRADIENTS = {
	default: "from-red-600/20 via-blue-600/10 to-amber-500/20",
	subtle: "from-red-600/15 via-blue-600/10 to-amber-500/15",
	strong: "from-red-600/30 via-blue-600/20 to-amber-500/30",
} as const;

/**
 * Chart progression gradients
 */
export const CHART_GRADIENTS = {
	rating: "from-slate-950 via-blue-700/30 to-cyan-600/25",
	treasury: "from-slate-950 via-emerald-700/25 to-teal-600/25",
	experience: "from-slate-950 via-amber-600/25 to-red-700/20",
} as const;

/**
 * Live score card gradients
 */
export const SCORE_CARD_GRADIENTS = {
	header: "from-blue-600/60 via-blue-600/30 to-red-600/60",
	background: "from-slate-950 via-slate-950 to-slate-900",
} as const;

// Carousel gradients array: using the centralized "Sky Mord" red/blue/amber theme
export const gradients = [
	CAROUSEL_GRADIENTS["red-to-blue"],
	CAROUSEL_GRADIENTS["blue-to-red"],
	CAROUSEL_GRADIENTS["red-blue-amber"],
	CAROUSEL_GRADIENTS["blue-red-amber"],
	CAROUSEL_GRADIENTS["amber-red-blue"],
	CAROUSEL_GRADIENTS["red-amber-blue"],
];
