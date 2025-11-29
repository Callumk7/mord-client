import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Format a date as relative time ago (e.g., "2 hours ago", "3 days ago")
 */
export function formatTimeAgo(date: Date | string): string {
	const now = new Date();
	const past = new Date(date);
	const diffMs = now.getTime() - past.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) {
		return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
	}
	if (diffHours > 0) {
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	}
	if (diffMins > 0) {
		return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
	}
	return "Just now";
}

/**
 * Format time only from timestamp (e.g., "2:30 PM")
 */
export function formatEventTime(timestamp: Date | string): string {
	return new Date(timestamp).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}
