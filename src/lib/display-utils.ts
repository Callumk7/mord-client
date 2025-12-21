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

// Carousel gradients: keep everything in the same "Sky Mord" dark broadcast palette.
export const gradients = [
	"from-slate-950 via-red-700/35 to-blue-700/35",
	"from-slate-950 via-blue-700/35 to-indigo-700/35",
	"from-slate-950 via-amber-600/30 to-red-700/30",
	"from-slate-950 via-cyan-600/25 to-blue-700/35",
	"from-slate-950 via-emerald-600/25 to-lime-600/25",
];
