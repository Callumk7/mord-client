export interface StateChangeRecord {
	id: number;
	warbandId: number;
	warbandName: string | null;
	warbandColor: string | null;
	warbandIcon: string | null;
	matchId: number;
	matchName: string | null;
	matchDate: Date | null;
	treasuryDelta: number;
	experienceDelta: number;
	ratingDelta: number;
	treasuryAfter: number;
	experienceAfter: number;
	ratingAfter: number;
	changeType: string;
	description: string | null;
	timestamp: Date;
}

export interface TimeSeriesDataPoint {
	timestamp: Date;
	matchName: string;
	warbandId: number;
	warbandName: string;
	warbandColor: string | null;
	warbandIcon: string | null;
	rating: number;
	treasury: number;
	experience: number;
}

export type ProgressMetric = "rating" | "treasury" | "experience";

export interface WarbandMeta {
	warbandId: number;
	warbandName: string;
	warbandColor: string | null;
	warbandIcon: string | null;
}

export interface MatchWarbandPoint extends WarbandMeta {
	x: number;
	matchId: number;
	matchName: string;
	rating: number;
	treasury: number;
	experience: number;
}

export interface WarbandTimeSeries {
	warbandId: number;
	warbandName: string;
	warbandColor: string | null;
	warbandIcon: string | null;
	dataPoints: TimeSeriesDataPoint[];
}

// Type alias for clarity when used in grouped contexts
export type WarbandGroup = WarbandTimeSeries;

/**
 * Transform state change records into time series data points
 */
export function buildTimeSeriesData(
	stateChanges: StateChangeRecord[],
): TimeSeriesDataPoint[] {
	return stateChanges.map((change) => ({
		timestamp: change.timestamp,
		matchName: change.matchName || "Unknown Match",
		warbandId: change.warbandId,
		warbandName: change.warbandName || "Unknown Warband",
		warbandColor: change.warbandColor,
		warbandIcon: change.warbandIcon,
		rating: change.ratingAfter,
		treasury: change.treasuryAfter,
		experience: change.experienceAfter,
	}));
}

/**
 * Aggregate state changes to one point per (matchId, warbandId).
 * Uses matchDate as X (fallback to timestamp).
 */
export function buildPerMatchWarbandPoints(
	stateChanges: StateChangeRecord[],
): MatchWarbandPoint[] {
	// Assumes `stateChanges` are sorted ascending by `timestamp` (API does this).
	// If they aren't, last-write-wins still yields the latest encountered record.
	const latestByKey = new Map<string, StateChangeRecord>();

	for (const change of stateChanges) {
		const key = `${change.matchId}:${change.warbandId}`;
		latestByKey.set(key, change);
	}

	const points: MatchWarbandPoint[] = [];

	for (const change of latestByKey.values()) {
		const date = change.matchDate ?? change.timestamp;
		points.push({
			x: date.getTime(),
			matchId: change.matchId,
			matchName: change.matchName || "Unknown Match",
			warbandId: change.warbandId,
			warbandName: change.warbandName || "Unknown Warband",
			warbandColor: change.warbandColor,
			warbandIcon: change.warbandIcon,
			rating: change.ratingAfter,
			treasury: change.treasuryAfter,
			experience: change.experienceAfter,
		});
	}

	points.sort((a, b) => {
		if (a.x !== b.x) return a.x - b.x;
		if (a.matchId !== b.matchId) return a.matchId - b.matchId;
		return a.warbandId - b.warbandId;
	});

	return points;
}

export function getWarbandsFromPoints(
	points: MatchWarbandPoint[],
): WarbandMeta[] {
	const byId = new Map<number, WarbandMeta>();

	for (const point of points) {
		if (!byId.has(point.warbandId)) {
			byId.set(point.warbandId, {
				warbandId: point.warbandId,
				warbandName: point.warbandName,
				warbandColor: point.warbandColor,
				warbandIcon: point.warbandIcon,
			});
		}
	}

	return Array.from(byId.values()).sort((a, b) =>
		a.warbandName.localeCompare(b.warbandName),
	);
}

/**
 * Group time series data by warband for multi-line charts
 */
export function groupByWarband(
	data: TimeSeriesDataPoint[],
): Record<number, WarbandTimeSeries> {
	return data.reduce(
		(acc, point) => {
			if (!acc[point.warbandId]) {
				acc[point.warbandId] = {
					warbandId: point.warbandId,
					warbandName: point.warbandName,
					warbandColor: point.warbandColor,
					warbandIcon: point.warbandIcon,
					dataPoints: [],
				};
			}
			acc[point.warbandId].dataPoints.push(point);
			return acc;
		},
		{} as Record<number, WarbandTimeSeries>,
	);
}

export interface ProgressChartRow {
	// Match index (1..N) for X-axis steps
	x: number;
	// Underlying match date (ms) for tooltip/context
	matchDate: number;
	matchId: number;
	matchName: string;
	[seriesKey: string]: number | string | null;
}

export function seriesKeyFor(
	warbandId: number,
	metric: ProgressMetric,
): string {
	return `warband_${warbandId}_${metric}`;
}

/**
 * Build a shared (wide) dataset suitable for Recharts where each row is one match
 * and each warband is its own series key.
 */
export function buildProgressChartData(
	points: MatchWarbandPoint[],
	metric: ProgressMetric,
): ProgressChartRow[] {
	const rowsByMatchId = new Map<number, ProgressChartRow>();
	const warbandIds = new Set<number>();

	for (const point of points) {
		warbandIds.add(point.warbandId);
		let row = rowsByMatchId.get(point.matchId);
		if (!row) {
			row = {
				x: 0,
				matchDate: point.x,
				matchId: point.matchId,
				matchName: point.matchName,
			};
			rowsByMatchId.set(point.matchId, row);
		}

		// Prefer earliest matchDate for that matchId if inconsistent (shouldn’t happen).
		if (point.x < row.matchDate) {
			row.matchDate = point.x;
		}

		row[seriesKeyFor(point.warbandId, metric)] = point[metric];
	}

	const rows = Array.from(rowsByMatchId.values());
	rows.sort((a, b) => {
		if (a.matchDate !== b.matchDate) return a.matchDate - b.matchDate;
		return a.matchId - b.matchId;
	});

	for (let i = 0; i < rows.length; i++) {
		rows[i].x = i + 1;
	}

	// Forward-fill missing series values so lines remain continuous.
	for (const warbandId of warbandIds) {
		const key = seriesKeyFor(warbandId, metric);
		let last: number | undefined;

		for (const row of rows) {
			const current = row[key];
			if (typeof current === "number" && Number.isFinite(current)) {
				last = current;
				continue;
			}

			if (last !== undefined) {
				row[key] = last;
			} else {
				// Keep as null until the first real value for this warband.
				row[key] = null;
			}
		}
	}

	return rows;
}

/**
 * Format timestamp for chart display
 */
export function formatChartTimestamp(
	timestamp: Date | string | number,
): string {
	const date =
		typeof timestamp === "number"
			? new Date(timestamp)
			: typeof timestamp === "string"
				? new Date(timestamp)
				: timestamp;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

/**
 * Format timestamp for tooltip
 */
export function formatTooltipTimestamp(
	timestamp: Date | string | number,
): string {
	const date =
		typeof timestamp === "number"
			? new Date(timestamp)
			: typeof timestamp === "string"
				? new Date(timestamp)
				: timestamp;
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}
