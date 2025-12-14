# Task 03: Update Gold Resolution API to Record State Changes

## Status
✅ Complete

## Description
Modify the `addGoldToWarbandFn` to accept `matchId` and create state change records when gold is added.

## Dependencies
- Task 01: Add State Changes Table to Schema
- Task 02: Generate and Run Database Migration

## Files to Modify
- `src/api/warbands.ts`

## Implementation Details

### 1. Update the input validator for `addGoldToWarbandFn`

Find the current implementation around line 180 and update it:

```typescript
export const addGoldToWarbandFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			warbandId: z.number(),
			matchId: z.number(), // NEW: need match context
			gold: z.number(),
			description: z.string().optional(), // NEW: optional description
		}),
	)
	.handler(async ({ data }) => {
		const { warbandId, matchId, gold, description } = data;

		// Update warband treasury (existing logic)
		const [updatedWarband] = await db
			.update(warbands)
			.set({
				treasury: sql`${warbands.treasury} + ${gold}`,
				updatedAt: new Date(),
			})
			.where(eq(warbands.id, warbandId))
			.returning();

		// NEW: Record the state change event
		await db.insert(warbandStateChanges).values({
			warbandId,
			matchId,
			treasuryDelta: gold,
			experienceDelta: 0,
			ratingDelta: 0,
			treasuryAfter: updatedWarband.treasury,
			experienceAfter: updatedWarband.experience,
			ratingAfter: updatedWarband.rating,
			changeType: "post_match_gold",
			description: description || "Gold gained from match",
			timestamp: new Date(),
		});

		return updatedWarband;
	});
```

### 2. Import the new table

Add to the imports at the top of the file:

```typescript
import { warbandStateChanges } from "~/db/schema";
```

### 3. Update the mutation options signature

Update the mutation to reflect the new parameters:

```typescript
export const addGoldToWarbandMutation = mutationOptions({
	mutationFn: (data: { warbandId: number; matchId: number; gold: number; description?: string }) =>
		addGoldToWarbandFn({ data }),
});
```

## Testing
After implementing:
1. Run `pnpm typecheck` to check for TypeScript errors
2. Test the post-match gold resolution flow
3. Verify in Drizzle Studio that state change records are created

## Notes
- The `description` field is optional and can provide context like "Wyrdstone Hunt rewards"
- We record both the delta (what changed) and the snapshot (state after change)
- This preserves backward compatibility while adding historical tracking
