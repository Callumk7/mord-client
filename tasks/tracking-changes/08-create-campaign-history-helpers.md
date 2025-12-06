# Task 08: Create Campaign History Helper Functions

## Status
⏳ Not Started

## Description
Create utility functions to transform state change data into chart-ready formats.

## Dependencies
- Task 07: Create Campaign History API

## Files to Create
- `src/lib/campaign-history.ts`

## Implementation Details

### 1. Create the new file

Create `src/lib/campaign-history.ts` with the following content:

```typescript
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

export interface WarbandTimeSeries {
	warbandId: number;
	warbandName: string;
	warbandColor: string | null;
	warbandIcon: string | null;
	dataPoints: TimeSeriesDataPoint[];
}

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

/**
 * Format timestamp for chart display
 */
export function formatChartTimestamp(timestamp: Date | string): string {
	const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

/**
 * Format timestamp for tooltip
 */
export function formatTooltipTimestamp(timestamp: Date | string): string {
	const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}
```

## Testing
After implementing:
1. Run `pnpm typecheck` to check for TypeScript errors
2. These functions will be used in the chart components (Task 10)

## Notes
- These helper functions transform raw database records into chart-friendly formats
- The `groupByWarband` function enables multi-line charts (one line per warband)
- Timestamp formatting functions provide consistent date display across charts
- TypeScript interfaces ensure type safety when working with chart data
