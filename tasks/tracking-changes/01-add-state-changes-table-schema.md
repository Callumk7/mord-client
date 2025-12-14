# Task 01: Add State Changes Table to Schema

## Status
✅ Complete

## Description
Add the `warbandStateChanges` table to the database schema to track all warband state changes over time.

## Dependencies
None - This is the first step

## Files to Modify
- `src/db/schema.ts`

## Implementation Details

### 1. Add the table definition
Add this table definition to `src/db/schema.ts`:

```typescript
export const warbandStateChanges = pgTable("warband_state_changes", {
	id: serial("id").primaryKey(),
	warbandId: integer("warband_id")
		.notNull()
		.references(() => warbands.id),
	matchId: integer("match_id")
		.notNull()
		.references(() => matches.id),

	// Deltas (changes), not absolute values
	treasuryDelta: integer("treasury_delta").default(0).notNull(),
	experienceDelta: integer("experience_delta").default(0).notNull(),
	ratingDelta: integer("rating_delta").default(0).notNull(),

	// Snapshot of state AFTER this change (for verification)
	treasuryAfter: integer("treasury_after").notNull(),
	experienceAfter: integer("experience_after").notNull(),
	ratingAfter: integer("rating_after").notNull(),

	// Context
	changeType: text("change_type")
		.notNull()
		.$type<"post_match_gold" | "post_match_experience" | "rating_update" | "manual_adjustment">(),
	description: text("description"),

	timestamp: timestamp("timestamp").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 2. Add type exports
```typescript
export type WarbandStateChange = typeof warbandStateChanges.$inferSelect;
export type NewWarbandStateChange = typeof warbandStateChanges.$inferInsert;
```

### 3. Add relations
```typescript
export const warbandStateChangesRelations = relations(
	warbandStateChanges,
	({ one }) => ({
		warband: one(warbands, {
			fields: [warbandStateChanges.warbandId],
			references: [warbands.id],
		}),
		match: one(matches, {
			fields: [warbandStateChanges.matchId],
			references: [matches.id],
		}),
	}),
);
```

### 4. Update warband relations
Add state changes to the warband relations:

```typescript
export const warbandsRelations = relations(warbands, ({ one, many }) => ({
	campaign: one(campaigns, {
		fields: [warbands.campaignId],
		references: [campaigns.id],
	}),
	warriors: many(warriors),
	matchParticipants: many(matchParticipants),
	wins: many(matchWinners),
	stateChanges: many(warbandStateChanges), // ADD THIS
}));
```

## Testing
After implementing:
1. Run `pnpm typecheck` to ensure no TypeScript errors
2. The table will be created in the next task when we run migrations

## Notes
- **Deltas** track what changed (e.g., "gained 50gc")
- **Snapshots** (the "After" fields) provide validation and debugging capability
- `changeType` allows us to categorize different kinds of changes
- `description` provides human-readable context
