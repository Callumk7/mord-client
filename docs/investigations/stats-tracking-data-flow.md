# Stats Tracking Data Flow Investigation

**Date:** 2024-01-XX  
**Investigator:** AI Assistant  
**Scope:** Complete review of data flow for warband/warrior stats tracking

## Executive Summary

This investigation examines the current implementation of stats tracking for warbands and warriors in the Mord Stats application. The primary finding is that **stats are stored denormalized in the database tables but are NOT automatically updated when events, casualties, or matches are created**. This creates a data integrity risk where leaderboards may display incorrect information.

## Current Implementation Analysis

### 1. Warband Creation

**Location:** `src/components/warbands/create-warband-form.tsx`

**Current Flow:**
- Creates warband with initial values:
  - `rating: 0`
  - `treasury: 0`
- No automatic stat updates
- Stats are stored directly in `warbands` table

**Schema Fields:**
```typescript
rating: integer("rating").notNull()
treasury: integer("treasury").notNull()
```

**Status:** ✅ **Working as expected** - Initial values are set correctly.

---

### 2. Warrior Creation

**Location:** `src/components/warriors/create-warrior-form.tsx`

**Current Flow:**
- Creates warrior with initial values:
  - `experience: 0`
  - `kills: 0`
  - `injuriesCaused: 0`
  - `injuriesReceived: 0`
  - `gamesPlayed: 0`
  - `isAlive: true`
- No automatic stat updates after creation
- Stats are stored directly in `warriors` table

**Schema Fields:**
```typescript
experience: integer("experience").notNull()
kills: integer("kills").notNull()
injuriesCaused: integer("injuries_caused").notNull()
injuriesReceived: integer("injuries_received").notNull()
gamesPlayed: integer("games_played").notNull()
isAlive: boolean("is_alive").notNull()
```

**Status:** ✅ **Working as expected** - Initial values are set correctly.

---

### 3. Match Creation

**Location:** `src/components/matches/create-match-form.tsx`

**Current Flow:**
1. Creates match with `status: "scheduled"`
2. Match participants are added separately via `AddParticipantsForm`
3. **NO automatic stat updates** when:
   - Match is created
   - Participants are added
   - Match status changes to "ended"

**Schema Fields:**
```typescript
status: text("status").notNull().$type<"active" | "ended" | "scheduled">()
winnerId: integer("winner_id").references(() => warbands.id)
loserId: integer("loser_id").references(() => warbands.id)
```

**Missing Functionality:**
- ❌ `gamesPlayed` is NOT incremented for participating warriors
- ❌ `gamesPlayed` is NOT incremented for participating warbands (would need to be calculated)
- ❌ Match win/loss records are NOT tracked in warband stats (only in `matches.winnerId`/`loserId`)

**Status:** ⚠️ **INCOMPLETE** - Matches are created but don't update warrior/warband stats.

---

### 4. Event Creation

**Location:** `src/components/events/create-event-form.tsx`

**Current Flow:**
1. Creates event record in `events` table
2. Event types: `"knock_down"` or `"moment"`
3. Links to `warriorId` (attacker/actor) and optional `defenderId` (victim)
4. **NO automatic stat updates** when events are created

**Schema Fields:**
```typescript
type: text("type").notNull().$type<"knock_down" | "moment">()
warriorId: integer("warrior_id").notNull()
defenderId: integer("defender_id").references(() => warriors.id)
```

**Missing Functionality:**
- ❌ `knock_down` events should increment `injuriesCaused` for the warrior
- ❌ `knock_down` events should increment `injuriesReceived` for the defender (if present)
- ❌ `moment` events might contribute to experience (depending on game rules)

**Status:** ⚠️ **INCOMPLETE** - Events are created but don't update warrior stats.

---

### 5. Casualty Creation

**Location:** Currently no UI form found (only in seed script)

**Current Flow:**
- Casualties are created in seed script but no user-facing form exists
- Casualties link:
  - `victimWarriorId` and `victimWarbandId`
  - `killerWarriorId` and `killerWarbandId`
  - `type: "killed" | "injured" | "stunned" | "escaped"`

**Schema Fields:**
```typescript
victimWarriorId: integer("victim_warrior_id").notNull()
killerWarriorId: integer("killer_warrior_id").notNull()
type: text("type").notNull().$type<"killed" | "injured" | "stunned" | "escaped">()
```

**Missing Functionality:**
- ❌ `killed` casualties should increment `kills` for `killerWarriorId`
- ❌ `killed` casualties should set `isAlive: false` and `deathDate` for `victimWarriorId`
- ❌ `injured` casualties should increment `injuriesCaused` for killer and `injuriesReceived` for victim
- ❌ Casualties should update warband-level stats (total kills, etc.)

**Status:** ⚠️ **INCOMPLETE** - Casualties exist in schema but no creation flow exists, and no stat updates occur.

---

### 6. Leaderboard Queries

**Location:** `src/routes/$campaign/index.tsx`

**Current Implementation:**
- **The Tyrant (Most Wins):** Calculated from `matches.winnerId` - ✅ **Works correctly**
- **The Survivor (Most Experience):** Sums `warriors.experience` - ⚠️ **Depends on stats being updated**
- **The Opportunist (Richest):** Reads `warbands.treasury` - ⚠️ **Depends on stats being updated**
- **Most Kills:** Reads `warriors.kills` - ⚠️ **Depends on stats being updated**
- **Most Injuries Taken:** Reads `warriors.injuriesReceived` - ⚠️ **Depends on stats being updated**

**Status:** ⚠️ **POTENTIALLY INACCURATE** - Leaderboards read from denormalized stats that may not be updated.

---

## Data Flow Diagram

### Current State (Broken)
```
┌─────────────┐
│   Events    │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐
│ Casualties  │──┼───▶│  Warriors    │ (Stats NOT updated)
└─────────────┘  │    └──────────────┘
                 │
┌─────────────┐  │    ┌──────────────┐
│   Matches   │──┘    │  Warbands    │ (Stats NOT updated)
└─────────────┘       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Leaderboards │ (Reads stale data)
                       └──────────────┘
```

### Desired State (Option 1: Direct Updates)
```
┌─────────────┐
│   Events    │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐
│ Casualties  │──┼───▶│  Warriors    │ (Stats updated immediately)
└─────────────┘  │    └──────────────┘
                 │
┌─────────────┐  │    ┌──────────────┐
│   Matches   │──┘    │  Warbands    │ (Stats updated immediately)
└─────────────┘       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Leaderboards │ (Reads current data)
                       └──────────────┘
```

### Alternative State (Option 2: Calculated Stats)
```
┌─────────────┐
│   Events    │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐
│ Casualties  │──┼───▶│  Warriors    │ (Stats calculated on-demand)
└─────────────┘  │    └──────────────┘
                 │
┌─────────────┐  │    ┌──────────────┐
│   Matches   │──┘    │  Warbands    │ (Stats calculated on-demand)
└─────────────┘       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Leaderboards │ (Calculates from source data)
                       └──────────────┘
```

---

## Options Analysis

### Option 1: Direct Stat Updates (Denormalized Approach)

**How it works:**
- When an event/casualty/match is created or updated, immediately update the corresponding warrior/warband stats
- Stats remain stored in `warriors` and `warbands` tables
- Leaderboards read directly from these tables

**Implementation Requirements:**

1. **Event Creation (`createEventFn`):**
   ```typescript
   // When type === "knock_down"
   if (event.defenderId) {
     // Increment injuriesCaused for warrior
     await db.update(warriors)
       .set({ injuriesCaused: sql`injuries_caused + 1` })
       .where(eq(warriors.id, event.warriorId));
     
     // Increment injuriesReceived for defender
     await db.update(warriors)
       .set({ injuriesReceived: sql`injuries_received + 1` })
       .where(eq(warriors.id, event.defenderId));
   }
   ```

2. **Casualty Creation (new function needed):**
   ```typescript
   // When type === "killed"
   await db.update(warriors)
     .set({ 
       kills: sql`kills + 1`,
       isAlive: false,
       deathDate: new Date()
     })
     .where(eq(warriors.id, casualty.killerWarriorId));
   
   await db.update(warriors)
     .set({ 
       isAlive: false,
       deathDate: new Date()
     })
     .where(eq(warriors.id, casualty.victimWarriorId));
   ```

3. **Match Completion (new function needed):**
   ```typescript
   // When match status changes to "ended"
   // Increment gamesPlayed for all participating warriors
   const participants = await db.select()
     .from(matchParticipants)
     .where(eq(matchParticipants.matchId, matchId));
   
   for (const participant of participants) {
     const warriors = await db.select()
       .from(warriors)
       .where(eq(warriors.warbandId, participant.warbandId));
     
     for (const warrior of warriors) {
       await db.update(warriors)
         .set({ gamesPlayed: sql`games_played + 1` })
         .where(eq(warriors.id, warrior.id));
     }
   }
   ```

**Pros:**
- ✅ Fast reads (leaderboards are simple SELECT queries)
- ✅ Simple queries (no complex aggregations)
- ✅ Familiar pattern (current codebase structure)
- ✅ Easy to understand and maintain

**Cons:**
- ❌ Risk of data inconsistency if updates fail
- ❌ Need to handle rollbacks if transaction fails
- ❌ Updates must happen in same transaction as event/casualty creation
- ❌ If events are deleted, stats become stale (need cleanup logic)
- ❌ Multiple update points (harder to debug)

**Complexity:** Medium  
**Performance:** Fast reads, slower writes  
**Data Integrity Risk:** Medium-High (requires careful transaction handling)

---

### Option 2: Calculated Stats (Normalized Approach)

**How it works:**
- Remove or deprecate stat fields from `warriors` and `warbands` tables
- Calculate all stats on-demand from `events`, `casualties`, and `matches` tables
- Use database views or computed queries for leaderboards

**Implementation Requirements:**

1. **Update Leaderboard Queries:**
   ```typescript
   // Most Kills - calculate from casualties
   const killsLeaderboard = await db
     .select({
       warriorId: warriors.id,
       name: warriors.name,
       kills: sql<number>`COUNT(CASE WHEN ${casualties.type} = 'killed' THEN 1 END)`
     })
     .from(warriors)
     .leftJoin(casualties, eq(casualties.killerWarriorId, warriors.id))
     .where(eq(warriors.campaignId, campaignId))
     .groupBy(warriors.id)
     .orderBy(desc(sql`COUNT(...)`));
   ```

2. **Update Warrior Queries:**
   ```typescript
   // When displaying warrior stats, calculate on-the-fly
   const warriorStats = await db
     .select({
       warrior: warriors,
       kills: sql<number>`COUNT(CASE WHEN ${casualties.type} = 'killed' AND ${casualties.killerWarriorId} = ${warriors.id} THEN 1 END)`,
       injuriesCaused: sql<number>`COUNT(CASE WHEN ${events.type} = 'knock_down' AND ${events.warriorId} = ${warriors.id} THEN 1 END)`,
       injuriesReceived: sql<number>`COUNT(CASE WHEN ${events.type} = 'knock_down' AND ${events.defenderId} = ${warriors.id} THEN 1 END)`,
       gamesPlayed: sql<number>`COUNT(DISTINCT ${matchParticipants.matchId})`
     })
     .from(warriors)
     .leftJoin(casualties, ...)
     .leftJoin(events, ...)
     .leftJoin(matchParticipants, ...)
     .where(eq(warriors.id, warriorId))
     .groupBy(warriors.id);
   ```

**Pros:**
- ✅ Single source of truth (events/casualties/matches)
- ✅ No data inconsistency risk
- ✅ Automatic accuracy (always reflects current data)
- ✅ Easy to add new stat types
- ✅ No need to handle rollbacks or cleanup

**Cons:**
- ❌ Slower reads (complex aggregations on every query)
- ❌ More complex queries (harder to write and maintain)
- ❌ Potential performance issues with large datasets
- ❌ Requires database indexes on foreign keys
- ❌ Breaking change (would need migration)

**Complexity:** High  
**Performance:** Slower reads, faster writes  
**Data Integrity Risk:** Low (single source of truth)

---

### Option 3: Hybrid Approach (Cached Calculated Stats)

**How it works:**
- Keep stat fields in `warriors` and `warbands` tables
- Calculate stats from source data (events/casualties/matches)
- Update denormalized stats periodically or on-demand
- Use database triggers or application-level sync jobs

**Implementation Requirements:**

1. **Create Sync Function:**
   ```typescript
   export const syncWarriorStats = createServerFn({ method: "POST" })
     .inputValidator(z.object({ warriorId: z.number() }))
     .handler(async ({ data }) => {
       const warrior = await db.query.warriors.findFirst({
         where: eq(warriors.id, data.warriorId)
       });
       
       if (!warrior) throw new Error("Warrior not found");
       
       // Calculate actual stats from source data
       const actualStats = await calculateStatsFromSource(data.warriorId);
       
       // Update warrior record
       await db.update(warriors)
         .set({
           kills: actualStats.kills,
           injuriesCaused: actualStats.injuriesCaused,
           injuriesReceived: actualStats.injuriesReceived,
           gamesPlayed: actualStats.gamesPlayed,
           experience: actualStats.experience
         })
         .where(eq(warriors.id, data.warriorId));
     });
   ```

2. **Call Sync After Events/Casualties:**
   ```typescript
   // In createEventFn, after creating event
   await syncWarriorStats({ data: { warriorId: event.warriorId } });
   if (event.defenderId) {
     await syncWarriorStats({ data: { warriorId: event.defenderId } });
   }
   ```

3. **Or Use Background Job:**
   - Run periodic sync job (e.g., every 5 minutes)
   - Or sync on-demand when viewing leaderboards

**Pros:**
- ✅ Fast reads (denormalized stats)
- ✅ Accurate stats (calculated from source)
- ✅ Can fix inconsistencies (re-sync anytime)
- ✅ Flexible (can choose when to sync)

**Cons:**
- ❌ More complex (two systems to maintain)
- ❌ Potential for temporary inconsistency
- ❌ Requires sync mechanism (background job or on-demand)
- ❌ More code to maintain

**Complexity:** High  
**Performance:** Fast reads, slower writes (if sync on write)  
**Data Integrity Risk:** Low-Medium (can be fixed with sync)

---

## Recommendation

**Recommended Approach: Option 1 (Direct Stat Updates) with Transaction Safety**

**Rationale:**
1. **Matches Current Architecture:** The codebase already uses denormalized stats, so this is the path of least resistance
2. **Performance:** Leaderboards need to be fast for real-time display during weekend campaigns
3. **Simplicity:** Easier to understand and maintain than hybrid approach
4. **User Experience:** Stats update immediately when events are recorded (important for "quick entry" goal)

**Critical Requirements:**
1. **Use Database Transactions:** Wrap event/casualty creation and stat updates in transactions
2. **Error Handling:** If stat update fails, rollback the entire operation
3. **Idempotency:** Ensure updates can be safely retried
4. **Testing:** Comprehensive tests for all stat update scenarios

**Implementation Priority:**
1. **High Priority:**
   - Casualty creation with stat updates (kills, deaths)
   - Match completion with `gamesPlayed` updates
   - Event creation with injury stat updates

2. **Medium Priority:**
   - Experience calculation (may depend on game rules)
   - Warband-level stat aggregation
   - Treasury updates (if tracked through matches)

3. **Low Priority:**
   - Stat recalculation/repair utilities
   - Migration script for existing data

---

## Migration Considerations

If implementing Option 1, existing data will need to be migrated:

1. **Calculate Stats from Existing Data:**
   ```typescript
   // One-time migration script
   const allWarriors = await db.select().from(warriors);
   
   for (const warrior of allWarriors) {
     const actualKills = await db
       .select({ count: count() })
       .from(casualties)
       .where(
         and(
           eq(casualties.killerWarriorId, warrior.id),
           eq(casualties.type, "killed")
         )
       );
     
     await db.update(warriors)
       .set({ kills: actualKills[0].count })
       .where(eq(warriors.id, warrior.id));
   }
   ```

2. **Validate Data Integrity:**
   - Compare calculated stats vs. stored stats
   - Flag discrepancies for manual review
   - Provide admin tool to recalculate stats

---

## Testing Strategy

**Unit Tests:**
- Test stat updates for each event type
- Test stat updates for each casualty type
- Test match completion stat updates
- Test transaction rollback on errors

**Integration Tests:**
- Test full match workflow (create → add participants → add events → add casualties → complete)
- Test leaderboard accuracy after multiple matches
- Test concurrent updates (multiple users recording events)

**Data Integrity Tests:**
- Verify stats match source data after operations
- Test edge cases (deleting events, modifying matches)
- Test orphaned data scenarios

---

## Handling Updates and Deletions

This is a **critical consideration** for Option 1 (Direct Stat Updates). When events, casualties, or matches are updated or deleted, the associated stats must be properly reverted or recalculated.

### Strategy: Revert-and-Recalculate

**For Updates:**
1. Revert stats from the old values
2. Apply stats from the new values
3. All within a single transaction

**For Deletions:**
1. Revert stats that were applied when the record was created
2. Or prevent deletion if stats have been applied (soft delete)

### Implementation Patterns

#### Event Update
```typescript
export const updateEventFn = createServerFn({ method: "PUT" })
  .inputValidator(updateEventSchema)
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      // Get old event to revert stats
      const oldEvent = await tx.query.events.findFirst({
        where: eq(events.id, data.eventId)
      });
      
      if (!oldEvent) throw new Error("Event not found");
      
      // Revert old stats
      if (oldEvent.type === "knock_down") {
        await tx.update(warriors)
          .set({ injuriesCaused: sql`injuries_caused - 1` })
          .where(eq(warriors.id, oldEvent.warriorId));
        
        if (oldEvent.defenderId) {
          await tx.update(warriors)
            .set({ injuriesReceived: sql`injuries_received - 1` })
            .where(eq(warriors.id, oldEvent.defenderId));
        }
      }
      
      // Update event
      const [updatedEvent] = await tx.update(events)
        .set({
          type: data.type,
          warriorId: data.warriorId,
          defenderId: data.defenderId,
          description: data.description
        })
        .where(eq(events.id, data.eventId))
        .returning();
      
      // Apply new stats
      if (updatedEvent.type === "knock_down") {
        await tx.update(warriors)
          .set({ injuriesCaused: sql`injuries_caused + 1` })
          .where(eq(warriors.id, updatedEvent.warriorId));
        
        if (updatedEvent.defenderId) {
          await tx.update(warriors)
            .set({ injuriesReceived: sql`injuries_received + 1` })
            .where(eq(warriors.id, updatedEvent.defenderId));
        }
      }
      
      return updatedEvent;
    });
  });
```

#### Event Deletion
```typescript
export const deleteEventFn = createServerFn({ method: "DELETE" })
  .inputValidator(z.object({ eventId: z.number() }))
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      // Get event to revert stats
      const event = await tx.query.events.findFirst({
        where: eq(events.id, data.eventId)
      });
      
      if (!event) throw new Error("Event not found");
      
      // Revert stats
      if (event.type === "knock_down") {
        await tx.update(warriors)
          .set({ injuriesCaused: sql`injuries_caused - 1` })
          .where(eq(warriors.id, event.warriorId));
        
        if (event.defenderId) {
          await tx.update(warriors)
            .set({ injuriesReceived: sql`injuries_received - 1` })
            .where(eq(warriors.id, event.defenderId));
        }
      }
      
      // Delete event
      await tx.delete(events).where(eq(events.id, data.eventId));
      
      return { success: true };
    });
  });
```

#### Match Update (Status Change)
```typescript
export const updateMatchStatusFn = createServerFn({ method: "PUT" })
  .inputValidator(z.object({ 
    matchId: z.number(), 
    status: z.enum(["scheduled", "active", "ended"]),
    winnerId: z.number().optional(),
    loserId: z.number().optional()
  }))
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      // Get old match state
      const oldMatch = await tx.query.matches.findFirst({
        where: eq(matches.id, data.matchId)
      });
      
      if (!oldMatch) throw new Error("Match not found");
      
      // If match was previously ended, revert gamesPlayed
      if (oldMatch.status === "ended") {
        const participants = await tx.query.matchParticipants.findMany({
          where: eq(matchParticipants.matchId, data.matchId)
        });
        
        for (const participant of participants) {
          const warbandWarriors = await tx.query.warriors.findMany({
            where: eq(warriors.warbandId, participant.warbandId)
          });
          
          for (const warrior of warbandWarriors) {
            await tx.update(warriors)
              .set({ gamesPlayed: sql`games_played - 1` })
              .where(eq(warriors.id, warrior.id));
          }
        }
      }
      
      // Update match
      const [updatedMatch] = await tx.update(matches)
        .set({
          status: data.status,
          winnerId: data.winnerId,
          loserId: data.loserId
        })
        .where(eq(matches.id, data.matchId))
        .returning();
      
      // If match is now ended, apply gamesPlayed
      if (data.status === "ended") {
        const participants = await tx.query.matchParticipants.findMany({
          where: eq(matchParticipants.matchId, data.matchId)
        });
        
        for (const participant of participants) {
          const warbandWarriors = await tx.query.warriors.findMany({
            where: eq(warriors.warbandId, participant.warbandId)
          });
          
          for (const warrior of warbandWarriors) {
            await tx.update(warriors)
              .set({ gamesPlayed: sql`games_played + 1` })
              .where(eq(warriors.id, warrior.id));
          }
        }
      }
      
      return updatedMatch;
    });
  });
```

#### Match Deletion
```typescript
export const deleteMatchFn = createServerFn({ method: "DELETE" })
  .inputValidator(z.object({ matchId: z.number() }))
  .handler(async ({ data }) => {
    return await db.transaction(async (tx) => {
      const match = await tx.query.matches.findFirst({
        where: eq(matches.id, data.matchId)
      });
      
      if (!match) throw new Error("Match not found");
      
      // If match was ended, revert gamesPlayed for all participants
      if (match.status === "ended") {
        const participants = await tx.query.matchParticipants.findMany({
          where: eq(matchParticipants.matchId, data.matchId)
        });
        
        for (const participant of participants) {
          const warbandWarriors = await tx.query.warriors.findMany({
            where: eq(warriors.warbandId, participant.warbandId)
          });
          
          for (const warrior of warbandWarriors) {
            await tx.update(warriors)
              .set({ gamesPlayed: sql`games_played - 1` })
              .where(eq(warriors.id, warrior.id));
          }
        }
      }
      
      // Revert all events from this match
      const matchEvents = await tx.query.events.findMany({
        where: eq(events.matchId, data.matchId)
      });
      
      for (const event of matchEvents) {
        if (event.type === "knock_down") {
          await tx.update(warriors)
            .set({ injuriesCaused: sql`injuries_caused - 1` })
            .where(eq(warriors.id, event.warriorId));
          
          if (event.defenderId) {
            await tx.update(warriors)
              .set({ injuriesReceived: sql`injuries_received - 1` })
              .where(eq(warriors.id, event.defenderId));
          }
        }
      }
      
      // Revert all casualties from this match
      const matchCasualties = await tx.query.casualties.findMany({
        where: eq(casualties.matchId, data.matchId)
      });
      
      for (const casualty of matchCasualties) {
        if (casualty.type === "killed") {
          // Revert kill
          await tx.update(warriors)
            .set({ kills: sql`kills - 1` })
            .where(eq(warriors.id, casualty.killerWarriorId));
          
          // Revert death (if still marked as dead)
          await tx.update(warriors)
            .set({ 
              isAlive: true,
              deathDate: null,
              deathDescription: null
            })
            .where(eq(warriors.id, casualty.victimWarriorId));
        } else if (casualty.type === "injured") {
          await tx.update(warriors)
            .set({ injuriesCaused: sql`injuries_caused - 1` })
            .where(eq(warriors.id, casualty.killerWarriorId));
          
          await tx.update(warriors)
            .set({ injuriesReceived: sql`injuries_received - 1` })
            .where(eq(warriors.id, casualty.victimWarriorId));
        }
      }
      
      // Delete all related records (cascade)
      await tx.delete(events).where(eq(events.matchId, data.matchId));
      await tx.delete(casualties).where(eq(casualties.matchId, data.matchId));
      await tx.delete(matchParticipants).where(eq(matchParticipants.matchId, data.matchId));
      await tx.delete(matches).where(eq(matches.id, data.matchId));
      
      return { success: true };
    });
  });
```

### Alternative: Recalculation Approach

Instead of reverting stats, you could recalculate all affected warrior stats from scratch:

```typescript
async function recalculateWarriorStats(tx: Transaction, warriorId: number) {
  // Calculate from source data
  const kills = await tx
    .select({ count: count() })
    .from(casualties)
    .where(
      and(
        eq(casualties.killerWarriorId, warriorId),
        eq(casualties.type, "killed")
      )
    );
  
  const injuriesCaused = await tx
    .select({ count: count() })
    .from(events)
    .where(
      and(
        eq(events.warriorId, warriorId),
        eq(events.type, "knock_down")
      )
    );
  
  // ... calculate other stats
  
  // Update warrior
  await tx.update(warriors)
    .set({
      kills: kills[0]?.count || 0,
      injuriesCaused: injuriesCaused[0]?.count || 0,
      // ... other stats
    })
    .where(eq(warriors.id, warriorId));
}
```

**Pros of Recalculation:**
- Always accurate (single source of truth)
- Simpler logic (no need to track what to revert)
- Handles edge cases automatically

**Cons of Recalculation:**
- Slower (multiple queries per warrior)
- More complex queries
- Still need to know which warriors are affected

### Recommendation

**Use Revert-and-Recalculate for simple cases:**
- Event updates/deletions (only affects 1-2 warriors)
- Casualty updates/deletions (only affects 1-2 warriors)

**Use Full Recalculation for complex cases:**
- Match deletion (affects many warriors)
- Bulk operations
- Data repair/migration

**Prevent certain operations:**
- Consider preventing deletion of matches that have been "ended" (or require admin approval)
- Consider soft-delete for matches (mark as deleted but keep for stats)

## Open Questions

1. **Experience Calculation:** How is experience awarded? Per kill? Per match? Per event?
2. **Treasury Updates:** Are treasury changes tracked through matches or separately?
3. **Warband Rating:** How is warband rating calculated? Is it derived from warrior stats?
4. **Event Deletion:** Should events be deletable? Or only editable? (Recommend: Allow deletion with stat reversion)
5. **Match Modification:** Can matches be edited after completion? How should stats be handled? (Recommend: Allow editing, recalculate affected stats)
6. **Casualty UI:** Do we need a user-facing form for creating casualties, or are they created through events?
7. **Soft Delete:** Should we implement soft delete for matches/events to preserve history?

---

## Next Steps

1. **Decision:** Choose approach (recommend Option 1)
2. **Design:** Create detailed implementation plan for stat updates
3. **Implementation:** Add stat update logic to event/casualty/match creation
4. **Migration:** Create script to recalculate existing stats
5. **Testing:** Comprehensive test suite for stat updates
6. **Documentation:** Update developer docs with stat update patterns

---

## Appendix: Current Schema Reference

### Warriors Table Stats
- `experience: integer` - Total experience points
- `kills: integer` - Number of kills
- `injuriesCaused: integer` - Number of injuries caused
- `injuriesReceived: integer` - Number of injuries received
- `gamesPlayed: integer` - Number of games participated in
- `isAlive: boolean` - Whether warrior is alive

### Warbands Table Stats
- `rating: integer` - Warband power rating
- `treasury: integer` - Gold coins/treasury

### Source Data Tables
- `events` - Knock downs and memorable moments
- `casualties` - Kills, injuries, stuns, escapes
- `matches` - Match records with participants
- `matchParticipants` - Which warbands participated in each match

