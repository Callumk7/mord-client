# Task 04: Update Experience Resolution API to Record State Changes

## Status
✅ Complete

## Description
Modify the `addExperienceToWarbandFn` to accept `matchId`, calculate rating changes, and create state change records.

## Dependencies
- Task 01: Add State Changes Table to Schema
- Task 02: Generate and Run Database Migration

## Files to Modify
- `src/api/warbands.ts`

## Implementation Details

### 1. Update the input validator for `addExperienceToWarbandFn`

Find the current implementation around line 154 and update it:

```typescript
export const addExperienceToWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			warbandId: z.number(),
			matchId: z.number(), // NEW: need match context
			experience: z.number().min(0, "Experience amount is required"),
			description: z.string().optional(), // NEW: optional description
		}),
	)
	.handler(async ({ data }) => {
		const { warbandId, matchId, experience, description } = data;

		// Get current warband state
		const [currentWarband] = await db
			.select()
			.from(warbands)
			.where(eq(warbands.id, warbandId));

		if (!currentWarband) {
			throw new Error("Warband not found");
		}

		const oldRating = currentWarband.rating;

		// Update warband experience
		const [updatedWarband] = await db
			.update(warbands)
			.set({
				experience: sql`${warbands.experience} + ${experience}`,
				updatedAt: new Date(),
			})
			.where(eq(warbands.id, warbandId))
			.returning();

		// Calculate new rating
		const warriorCountResult = await db
			.select({ count: count() })
			.from(warriors)
			.where(and(eq(warriors.warbandId, warbandId), eq(warriors.isAlive, true)));

		const warriorCount = Number(warriorCountResult[0]?.count || 0);
		const newRating = calculateRating(warriorCount, updatedWarband.experience);
		const ratingDelta = newRating - oldRating;

		// Update rating if it changed
		let finalWarband = updatedWarband;
		if (ratingDelta !== 0) {
			[finalWarband] = await db
				.update(warbands)
				.set({ rating: newRating })
				.where(eq(warbands.id, warbandId))
				.returning();
		}

		// NEW: Record state change
		await db.insert(warbandStateChanges).values({
			warbandId,
			matchId,
			treasuryDelta: 0,
			experienceDelta: experience,
			ratingDelta: ratingDelta,
			treasuryAfter: finalWarband.treasury,
			experienceAfter: finalWarband.experience,
			ratingAfter: newRating,
			changeType: "post_match_experience",
			description: description || "Experience gained from match",
			timestamp: new Date(),
		});

		return { ...finalWarband, rating: newRating };
	});
```

### 2. Import necessary functions

Make sure these are imported:

```typescript
import { count, and } from "drizzle-orm";
import { calculateRating } from "~/lib/ratings";
import { warbandStateChanges, warriors } from "~/db/schema";
```

### 3. Update the mutation options

```typescript
export const increaseExpereienceMutation = mutationOptions({
	mutationFn: (data: { warbandId: number; matchId: number; experience: number; description?: string }) =>
		addExperienceToWarbandFn({ data }),
});
```

## Testing
After implementing:
1. Run `pnpm typecheck` to check for TypeScript errors
2. Test the post-match experience resolution flow
3. Verify that rating is recalculated correctly
4. Verify in Drizzle Studio that state change records include both experience and rating deltas

## Notes
- This function now calculates rating changes based on the new experience
- Both experience and rating deltas are recorded in the same state change event
- The rating calculation uses warrior count and total experience
