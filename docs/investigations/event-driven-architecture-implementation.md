# Event-Driven Architecture Implementation Strategy

**Date:** 2025-01-21
**Approach:** Option A - Simple In-Memory Event Bus
**Status:** Proposed
**Complexity:** Medium
**Risk:** Low

---

## Executive Summary

This document outlines the implementation strategy for an event-driven architecture to handle automatic stat updates in Mord Stats. The approach uses a simple in-memory event bus pattern that decouples "what happened" (domain events) from "how we react to it" (stat updates, side effects).

**Key Benefits:**
- ✅ Decoupled components (events vs. handlers)
- ✅ Easy to test (mock event bus)
- ✅ Easy to extend (just add new handlers)
- ✅ No external dependencies
- ✅ Simple to understand and maintain
- ✅ Suitable for monolithic architecture

**Trade-offs:**
- ⚠️ Events not persisted (no audit trail by default)
- ⚠️ No automatic retry on handler failure
- ⚠️ In-memory only (lost on server restart)

---

## Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │ Create Forms │        │ Update Forms │                   │
│  │              │        │              │                   │
│  │ - Casualty   │        │ - Match      │                   │
│  │ - Event      │        │ - Event      │                   │
│  │ - Match      │        │ - Casualty   │                   │
│  └──────┬───────┘        └──────┬───────┘                   │
│         │                       │                           │
│         │ publish()             │ publish()                 │
│         ▼                       ▼                           │
│  ┌─────────────────────────────────────────┐                │
│  │         Event Bus (In-Memory)           │                │
│  │                                         │                │
│  │  - on(eventType, handler)               │                │
│  │  - publish(eventType, data)             │                │
│  │  - off(eventType, handler)              │                │
│  └─────────────┬───────────────────────────┘                │
│                │                                            │
│                │ notify subscribers                         │
│                ▼                                            │
│  ┌─────────────────────────────────────────┐                │
│  │         Event Handlers                  │                │
│  │                                         │                │
│  │  - Update warrior kills                 │                │
│  │  - Update injury stats                  │                │
│  │  - Increment games played               │                │
│  │  - Mark warriors as dead                │                │
│  │  - [Future: notifications, etc.]        │                │
│  └─────────────┬───────────────────────────┘                │
│                │                                            │
│                ▼                                            │
│  ┌─────────────────────────────────────────┐                │
│  │        Database Updates                 │                │
│  │                                         │                │
│  │  - warriors table (stats)               │                │
│  │  - warbands table (stats)               │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Event Flow

```typescript
// 1. User action triggers form submission
createCasualtyFn({ type: 'killed', killerId: 1, victimId: 2 })

// 2. Server function creates record
const casualty = await db.insert(casualties).values(data)

// 3. Server function publishes event
await eventBus.publish('CasualtyRecorded', { casualtyId: casualty.id, ... })

// 4. Event bus notifies all registered handlers
handlers.forEach(handler => handler({ casualtyId: casualty.id, ... }))

// 5. Handlers update stats asynchronously
await db.update(warriors).set({ kills: sql`kills + 1` })
await db.update(warriors).set({ isAlive: false })
```

---

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Create Event Bus

**File:** `src/lib/event-bus.ts`

```typescript
type EventHandler<T = any> = (data: T) => Promise<void> | void

class EventBus {
	private handlers: Map<string, Set<EventHandler>> = new Map()

	/**
	 * Register an event handler
	 */
	on<T>(eventType: string, handler: EventHandler<T>) {
		if (!this.handlers.has(eventType)) {
			this.handlers.set(eventType, new Set())
		}
		this.handlers.get(eventType)!.add(handler)
	}

	/**
	 * Unregister an event handler
	 */
	off<T>(eventType: string, handler: EventHandler<T>) {
		this.handlers.get(eventType)?.delete(handler)
	}

	/**
	 * Publish an event to all registered handlers
	 * Handlers run in parallel, errors are logged but don't break other handlers
	 */
	async publish<T>(eventType: string, data: T) {
		const handlers = this.handlers.get(eventType)
		if (!handlers || handlers.size === 0) {
			console.warn(`No handlers registered for event: ${eventType}`)
			return
		}

		// Run all handlers in parallel
		const results = await Promise.allSettled(
			Array.from(handlers).map((handler) =>
				Promise.resolve(handler(data)).catch((err) => {
					console.error(`Error in ${eventType} handler:`, err)
					// Re-throw to be caught by Promise.allSettled
					throw err
				}),
			),
		)

		// Log any failures
		const failures = results.filter((r) => r.status === "rejected")
		if (failures.length > 0) {
			console.error(
				`${failures.length}/${handlers.size} handlers failed for ${eventType}`,
			)
		}
	}

	/**
	 * Clear all handlers (useful for testing)
	 */
	clear() {
		this.handlers.clear()
	}

	/**
	 * Get count of handlers for an event (useful for debugging)
	 */
	getHandlerCount(eventType: string): number {
		return this.handlers.get(eventType)?.size || 0
	}
}

export const eventBus = new EventBus()
```

**Features:**
- Singleton pattern (one instance per server)
- Parallel handler execution (for performance)
- Error isolation (one handler failure doesn't break others)
- Clear method for testing
- Diagnostic method for debugging

---

#### 1.2 Define Event Types

**File:** `src/events/types.ts`

```typescript
/**
 * Base event interface
 */
export interface DomainEvent {
	type: string
	timestamp?: Date
}

/**
 * Published when a casualty is recorded
 */
export interface CasualtyRecordedEvent extends DomainEvent {
	type: "CasualtyRecorded"
	casualtyId: number
	casualtyType: "killed" | "injured" | "stunned" | "escaped"
	killerWarriorId: number
	victimWarriorId: number
	killerWarbandId: number
	victimWarbandId: number
	matchId: number
	timestamp: Date
}

/**
 * Published when a casualty is updated
 */
export interface CasualtyUpdatedEvent extends DomainEvent {
	type: "CasualtyUpdated"
	casualtyId: number
	oldCasualtyType: "killed" | "injured" | "stunned" | "escaped"
	newCasualtyType: "killed" | "injured" | "stunned" | "escaped"
	oldKillerWarriorId: number
	newKillerWarriorId: number
	oldVictimWarriorId: number
	newVictimWarriorId: number
	matchId: number
	timestamp: Date
}

/**
 * Published when a casualty is deleted
 */
export interface CasualtyDeletedEvent extends DomainEvent {
	type: "CasualtyDeleted"
	casualtyId: number
	casualtyType: "killed" | "injured" | "stunned" | "escaped"
	killerWarriorId: number
	victimWarriorId: number
	matchId: number
	timestamp: Date
}

/**
 * Published when an event (knock down, moment) is recorded
 */
export interface EventRecordedEvent extends DomainEvent {
	type: "EventRecorded"
	eventId: number
	eventType: "knock_down" | "moment"
	warriorId: number
	defenderId?: number
	matchId: number
	timestamp: Date
}

/**
 * Published when an event is updated
 */
export interface EventUpdatedEvent extends DomainEvent {
	type: "EventUpdated"
	eventId: number
	oldEventType: "knock_down" | "moment"
	newEventType: "knock_down" | "moment"
	oldWarriorId: number
	newWarriorId: number
	oldDefenderId?: number
	newDefenderId?: number
	matchId: number
	timestamp: Date
}

/**
 * Published when an event is deleted
 */
export interface EventDeletedEvent extends DomainEvent {
	type: "EventDeleted"
	eventId: number
	eventType: "knock_down" | "moment"
	warriorId: number
	defenderId?: number
	matchId: number
	timestamp: Date
}

/**
 * Published when a match is completed (status changes to 'ended')
 */
export interface MatchCompletedEvent extends DomainEvent {
	type: "MatchCompleted"
	matchId: number
	winnerId?: number
	loserId?: number
	participantWarbandIds: number[]
	timestamp: Date
}

/**
 * Published when a match status changes from 'ended' to something else
 * (requires reverting gamesPlayed)
 */
export interface MatchUncompletedEvent extends DomainEvent {
	type: "MatchUncompleted"
	matchId: number
	participantWarbandIds: number[]
	timestamp: Date
}

/**
 * Published when a match is deleted
 */
export interface MatchDeletedEvent extends DomainEvent {
	type: "MatchDeleted"
	matchId: number
	wasEnded: boolean
	participantWarbandIds: number[]
	timestamp: Date
}

/**
 * Published when a warrior is created
 */
export interface WarriorCreatedEvent extends DomainEvent {
	type: "WarriorCreated"
	warriorId: number
	warbandId: number
	campaignId: number
	timestamp: Date
}

/**
 * Published when a warband is created
 */
export interface WarbandCreatedEvent extends DomainEvent {
	type: "WarbandCreated"
	warbandId: number
	campaignId: number
	timestamp: Date
}

/**
 * Union type of all domain events
 */
export type AnyDomainEvent =
	| CasualtyRecordedEvent
	| CasualtyUpdatedEvent
	| CasualtyDeletedEvent
	| EventRecordedEvent
	| EventUpdatedEvent
	| EventDeletedEvent
	| MatchCompletedEvent
	| MatchUncompletedEvent
	| MatchDeletedEvent
	| WarriorCreatedEvent
	| WarbandCreatedEvent
```

**Features:**
- Strong typing for all events
- Separate events for create/update/delete operations
- Timestamps for audit trail
- All data needed for stat updates included in event

---

#### 1.3 Create Event Handlers

**File:** `src/events/handlers.ts`

```typescript
import { eventBus } from "~/lib/event-bus"
import { db } from "~/db"
import { warriors } from "~/db/schema"
import { eq, sql, inArray } from "drizzle-orm"
import type {
	CasualtyRecordedEvent,
	CasualtyUpdatedEvent,
	CasualtyDeletedEvent,
	EventRecordedEvent,
	EventUpdatedEvent,
	EventDeletedEvent,
	MatchCompletedEvent,
	MatchUncompletedEvent,
	MatchDeletedEvent,
} from "./types"

// =====================================================
// CASUALTY EVENT HANDLERS
// =====================================================

/**
 * Handle new casualty - update warrior stats
 */
eventBus.on<CasualtyRecordedEvent>("CasualtyRecorded", async (event) => {
	console.log(`[CasualtyRecorded] Processing casualty ${event.casualtyId}`)

	if (event.casualtyType === "killed") {
		// Increment kills for killer
		await db
			.update(warriors)
			.set({ kills: sql`kills + 1` })
			.where(eq(warriors.id, event.killerWarriorId))

		// Mark victim as dead
		await db
			.update(warriors)
			.set({
				isAlive: false,
				deathDate: event.timestamp,
			})
			.where(eq(warriors.id, event.victimWarriorId))

		console.log(
			`[CasualtyRecorded] Updated kills for warrior ${event.killerWarriorId}, marked warrior ${event.victimWarriorId} as dead`,
		)
	}

	if (
		event.casualtyType === "injured" ||
		event.casualtyType === "killed"
	) {
		// Increment injuries caused for killer
		await db
			.update(warriors)
			.set({ injuriesCaused: sql`injuries_caused + 1` })
			.where(eq(warriors.id, event.killerWarriorId))

		// Increment injuries received for victim
		await db
			.update(warriors)
			.set({ injuriesReceived: sql`injuries_received + 1` })
			.where(eq(warriors.id, event.victimWarriorId))

		console.log(
			`[CasualtyRecorded] Updated injury stats for warriors ${event.killerWarriorId} and ${event.victimWarriorId}`,
		)
	}
})

/**
 * Handle casualty update - revert old stats, apply new stats
 */
eventBus.on<CasualtyUpdatedEvent>("CasualtyUpdated", async (event) => {
	console.log(`[CasualtyUpdated] Processing casualty ${event.casualtyId}`)

	// Use transaction to ensure atomicity
	await db.transaction(async (tx) => {
		// REVERT OLD STATS
		if (event.oldCasualtyType === "killed") {
			await tx
				.update(warriors)
				.set({ kills: sql`kills - 1` })
				.where(eq(warriors.id, event.oldKillerWarriorId))

			// Note: We don't automatically revive warriors on update
			// This should be handled manually or with a separate operation
		}

		if (
			event.oldCasualtyType === "injured" ||
			event.oldCasualtyType === "killed"
		) {
			await tx
				.update(warriors)
				.set({ injuriesCaused: sql`injuries_caused - 1` })
				.where(eq(warriors.id, event.oldKillerWarriorId))

			await tx
				.update(warriors)
				.set({ injuriesReceived: sql`injuries_received - 1` })
				.where(eq(warriors.id, event.oldVictimWarriorId))
		}

		// APPLY NEW STATS
		if (event.newCasualtyType === "killed") {
			await tx
				.update(warriors)
				.set({ kills: sql`kills + 1` })
				.where(eq(warriors.id, event.newKillerWarriorId))

			await tx
				.update(warriors)
				.set({
					isAlive: false,
					deathDate: event.timestamp,
				})
				.where(eq(warriors.id, event.newVictimWarriorId))
		}

		if (
			event.newCasualtyType === "injured" ||
			event.newCasualtyType === "killed"
		) {
			await tx
				.update(warriors)
				.set({ injuriesCaused: sql`injuries_caused + 1` })
				.where(eq(warriors.id, event.newKillerWarriorId))

			await tx
				.update(warriors)
				.set({ injuriesReceived: sql`injuries_received + 1` })
				.where(eq(warriors.id, event.newVictimWarriorId))
		}
	})

	console.log(`[CasualtyUpdated] Updated stats for casualty ${event.casualtyId}`)
})

/**
 * Handle casualty deletion - revert stats
 */
eventBus.on<CasualtyDeletedEvent>("CasualtyDeleted", async (event) => {
	console.log(`[CasualtyDeleted] Processing casualty ${event.casualtyId}`)

	await db.transaction(async (tx) => {
		if (event.casualtyType === "killed") {
			await tx
				.update(warriors)
				.set({ kills: sql`kills - 1` })
				.where(eq(warriors.id, event.killerWarriorId))

			// Revive victim (remove death date)
			// Note: Consider if this is desired behavior
			await tx
				.update(warriors)
				.set({
					isAlive: true,
					deathDate: null,
					deathDescription: null,
				})
				.where(eq(warriors.id, event.victimWarriorId))
		}

		if (event.casualtyType === "injured" || event.casualtyType === "killed") {
			await tx
				.update(warriors)
				.set({ injuriesCaused: sql`injuries_caused - 1` })
				.where(eq(warriors.id, event.killerWarriorId))

			await tx
				.update(warriors)
				.set({ injuriesReceived: sql`injuries_received - 1` })
				.where(eq(warriors.id, event.victimWarriorId))
		}
	})

	console.log(`[CasualtyDeleted] Reverted stats for casualty ${event.casualtyId}`)
})

// =====================================================
// EVENT (KNOCK DOWN / MOMENT) HANDLERS
// =====================================================

/**
 * Handle new event - update injury stats for knock downs
 */
eventBus.on<EventRecordedEvent>("EventRecorded", async (event) => {
	console.log(`[EventRecorded] Processing event ${event.eventId}`)

	if (event.eventType === "knock_down" && event.defenderId) {
		await db
			.update(warriors)
			.set({ injuriesCaused: sql`injuries_caused + 1` })
			.where(eq(warriors.id, event.warriorId))

		await db
			.update(warriors)
			.set({ injuriesReceived: sql`injuries_received + 1` })
			.where(eq(warriors.id, event.defenderId))

		console.log(
			`[EventRecorded] Updated injury stats for warriors ${event.warriorId} and ${event.defenderId}`,
		)
	}
})

/**
 * Handle event update - revert old stats, apply new stats
 */
eventBus.on<EventUpdatedEvent>("EventUpdated", async (event) => {
	console.log(`[EventUpdated] Processing event ${event.eventId}`)

	await db.transaction(async (tx) => {
		// REVERT OLD STATS
		if (event.oldEventType === "knock_down" && event.oldDefenderId) {
			await tx
				.update(warriors)
				.set({ injuriesCaused: sql`injuries_caused - 1` })
				.where(eq(warriors.id, event.oldWarriorId))

			await tx
				.update(warriors)
				.set({ injuriesReceived: sql`injuries_received - 1` })
				.where(eq(warriors.id, event.oldDefenderId))
		}

		// APPLY NEW STATS
		if (event.newEventType === "knock_down" && event.newDefenderId) {
			await tx
				.update(warriors)
				.set({ injuriesCaused: sql`injuries_caused + 1` })
				.where(eq(warriors.id, event.newWarriorId))

			await tx
				.update(warriors)
				.set({ injuriesReceived: sql`injuries_received + 1` })
				.where(eq(warriors.id, event.newDefenderId))
		}
	})

	console.log(`[EventUpdated] Updated stats for event ${event.eventId}`)
})

/**
 * Handle event deletion - revert stats
 */
eventBus.on<EventDeletedEvent>("EventDeleted", async (event) => {
	console.log(`[EventDeleted] Processing event ${event.eventId}`)

	if (event.eventType === "knock_down" && event.defenderId) {
		await db.transaction(async (tx) => {
			await tx
				.update(warriors)
				.set({ injuriesCaused: sql`injuries_caused - 1` })
				.where(eq(warriors.id, event.warriorId))

			await tx
				.update(warriors)
				.set({ injuriesReceived: sql`injuries_received - 1` })
				.where(eq(warriors.id, event.defenderId))
		})
	}

	console.log(`[EventDeleted] Reverted stats for event ${event.eventId}`)
})

// =====================================================
// MATCH EVENT HANDLERS
// =====================================================

/**
 * Handle match completion - increment games played for all participating warriors
 */
eventBus.on<MatchCompletedEvent>("MatchCompleted", async (event) => {
	console.log(`[MatchCompleted] Processing match ${event.matchId}`)

	// Get all warriors from participating warbands
	const participatingWarriors = await db
		.select({ id: warriors.id })
		.from(warriors)
		.where(inArray(warriors.warbandId, event.participantWarbandIds))

	if (participatingWarriors.length === 0) {
		console.warn(
			`[MatchCompleted] No warriors found for warbands: ${event.participantWarbandIds.join(", ")}`,
		)
		return
	}

	const warriorIds = participatingWarriors.map((w) => w.id)

	// Increment games played for all warriors
	await db
		.update(warriors)
		.set({ gamesPlayed: sql`games_played + 1` })
		.where(inArray(warriors.id, warriorIds))

	console.log(
		`[MatchCompleted] Incremented games_played for ${warriorIds.length} warriors`,
	)
})

/**
 * Handle match uncompleted - decrement games played
 */
eventBus.on<MatchUncompletedEvent>("MatchUncompleted", async (event) => {
	console.log(`[MatchUncompleted] Processing match ${event.matchId}`)

	const participatingWarriors = await db
		.select({ id: warriors.id })
		.from(warriors)
		.where(inArray(warriors.warbandId, event.participantWarbandIds))

	if (participatingWarriors.length === 0) {
		return
	}

	const warriorIds = participatingWarriors.map((w) => w.id)

	await db
		.update(warriors)
		.set({ gamesPlayed: sql`games_played - 1` })
		.where(inArray(warriors.id, warriorIds))

	console.log(
		`[MatchUncompleted] Decremented games_played for ${warriorIds.length} warriors`,
	)
})

/**
 * Handle match deletion - revert games played if match was ended
 */
eventBus.on<MatchDeletedEvent>("MatchDeleted", async (event) => {
	console.log(`[MatchDeleted] Processing match ${event.matchId}`)

	if (event.wasEnded) {
		const participatingWarriors = await db
			.select({ id: warriors.id })
			.from(warriors)
			.where(inArray(warriors.warbandId, event.participantWarbandIds))

		if (participatingWarriors.length > 0) {
			const warriorIds = participatingWarriors.map((w) => w.id)

			await db
				.update(warriors)
				.set({ gamesPlayed: sql`games_played - 1` })
				.where(inArray(warriors.id, warriorIds))

			console.log(
				`[MatchDeleted] Decremented games_played for ${warriorIds.length} warriors`,
			)
		}
	}
})

console.log("✅ Event handlers registered successfully")
```

**Features:**
- All stat update logic in one place
- Console logging for debugging
- Transaction support for updates
- Handles create/update/delete operations
- Defensive checks (null defenders, etc.)

---

#### 1.4 Initialize Handlers on App Startup

**File:** `src/events/index.ts`

```typescript
/**
 * Event system entry point
 * Import this file to register all event handlers
 */

import "./handlers" // This registers all handlers with the event bus

export { eventBus } from "~/lib/event-bus"
export * from "./types"
```

**File:** `src/router.tsx` (or wherever app initializes)

```typescript
import { createRouter } from "@tanstack/react-router"
import "~/events" // ← Register event handlers on app startup

// ... rest of router setup
```

---

### Phase 2: Integrate with Server Functions

#### 2.1 Update Casualty Creation

**File:** `src/components/casualties/create-casualty-form.tsx` (or server function file)

```typescript
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { db } from "~/db"
import { casualties } from "~/db/schema"
import { eventBus } from "~/events"
import type { CasualtyRecordedEvent } from "~/events/types"

const casualtySchema = z.object({
	type: z.enum(["killed", "injured", "stunned", "escaped"]),
	killerWarriorId: z.number(),
	victimWarriorId: z.number(),
	killerWarbandId: z.number(),
	victimWarbandId: z.number(),
	matchId: z.number(),
	description: z.string().optional(),
})

export const createCasualtyFn = createServerFn({ method: "POST" })
	.inputValidator(casualtySchema)
	.handler(async ({ data }) => {
		// 1. Create casualty record
		const [casualty] = await db.insert(casualties).values(data).returning()

		// 2. Publish event
		await eventBus.publish<CasualtyRecordedEvent>("CasualtyRecorded", {
			type: "CasualtyRecorded",
			casualtyId: casualty.id,
			casualtyType: casualty.type,
			killerWarriorId: casualty.killerWarriorId,
			victimWarriorId: casualty.victimWarriorId,
			killerWarbandId: casualty.killerWarbandId,
			victimWarbandId: casualty.victimWarbandId,
			matchId: casualty.matchId,
			timestamp: casualty.createdAt,
		})

		return casualty
	})
```

#### 2.2 Update Event Creation

**File:** `src/components/events/create-event-form.tsx` (or server function file)

```typescript
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { db } from "~/db"
import { events } from "~/db/schema"
import { eventBus } from "~/events"
import type { EventRecordedEvent } from "~/events/types"

const eventSchema = z.object({
	type: z.enum(["knock_down", "moment"]),
	warriorId: z.number(),
	defenderId: z.number().optional(),
	matchId: z.number(),
	description: z.string().optional(),
})

export const createEventFn = createServerFn({ method: "POST" })
	.inputValidator(eventSchema)
	.handler(async ({ data }) => {
		// 1. Create event record
		const [event] = await db.insert(events).values(data).returning()

		// 2. Publish event
		await eventBus.publish<EventRecordedEvent>("EventRecorded", {
			type: "EventRecorded",
			eventId: event.id,
			eventType: event.type,
			warriorId: event.warriorId,
			defenderId: event.defenderId ?? undefined,
			matchId: event.matchId,
			timestamp: event.createdAt,
		})

		return event
	})
```

#### 2.3 Update Match Completion

**File:** `src/components/matches/update-match-status.tsx` (or server function file)

```typescript
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { db } from "~/db"
import { matches, matchParticipants } from "~/db/schema"
import { eq } from "drizzle-orm"
import { eventBus } from "~/events"
import type {
	MatchCompletedEvent,
	MatchUncompletedEvent,
} from "~/events/types"

const updateMatchStatusSchema = z.object({
	matchId: z.number(),
	status: z.enum(["scheduled", "active", "ended"]),
	winnerId: z.number().optional(),
	loserId: z.number().optional(),
})

export const updateMatchStatusFn = createServerFn({ method: "PUT" })
	.inputValidator(updateMatchStatusSchema)
	.handler(async ({ data }) => {
		// Get old match state
		const oldMatch = await db.query.matches.findFirst({
			where: eq(matches.id, data.matchId),
		})

		if (!oldMatch) {
			throw new Error("Match not found")
		}

		// Update match
		const [updatedMatch] = await db
			.update(matches)
			.set({
				status: data.status,
				winnerId: data.winnerId,
				loserId: data.loserId,
			})
			.where(eq(matches.id, data.matchId))
			.returning()

		// Get participants
		const participants = await db
			.select()
			.from(matchParticipants)
			.where(eq(matchParticipants.matchId, data.matchId))

		const participantWarbandIds = participants.map((p) => p.warbandId)

		// Publish appropriate event
		if (oldMatch.status === "ended" && data.status !== "ended") {
			// Match was ended, now it's not → revert games played
			await eventBus.publish<MatchUncompletedEvent>("MatchUncompleted", {
				type: "MatchUncompleted",
				matchId: data.matchId,
				participantWarbandIds,
				timestamp: new Date(),
			})
		} else if (oldMatch.status !== "ended" && data.status === "ended") {
			// Match wasn't ended, now it is → increment games played
			await eventBus.publish<MatchCompletedEvent>("MatchCompleted", {
				type: "MatchCompleted",
				matchId: data.matchId,
				winnerId: data.winnerId,
				loserId: data.loserId,
				participantWarbandIds,
				timestamp: new Date(),
			})
		}

		return updatedMatch
	})
```

---

### Phase 3: Handle Updates and Deletions

#### 3.1 Update Event Update/Delete Functions

```typescript
// Update Event
export const updateEventFn = createServerFn({ method: "PUT" })
	.inputValidator(updateEventSchema)
	.handler(async ({ data }) => {
		const oldEvent = await db.query.events.findFirst({
			where: eq(events.id, data.eventId),
		})

		if (!oldEvent) throw new Error("Event not found")

		const [updatedEvent] = await db
			.update(events)
			.set({
				type: data.type,
				warriorId: data.warriorId,
				defenderId: data.defenderId,
			})
			.where(eq(events.id, data.eventId))
			.returning()

		await eventBus.publish<EventUpdatedEvent>("EventUpdated", {
			type: "EventUpdated",
			eventId: data.eventId,
			oldEventType: oldEvent.type,
			newEventType: updatedEvent.type,
			oldWarriorId: oldEvent.warriorId,
			newWarriorId: updatedEvent.warriorId,
			oldDefenderId: oldEvent.defenderId ?? undefined,
			newDefenderId: updatedEvent.defenderId ?? undefined,
			matchId: updatedEvent.matchId,
			timestamp: new Date(),
		})

		return updatedEvent
	})

// Delete Event
export const deleteEventFn = createServerFn({ method: "DELETE" })
	.inputValidator(z.object({ eventId: z.number() }))
	.handler(async ({ data }) => {
		const event = await db.query.events.findFirst({
			where: eq(events.id, data.eventId),
		})

		if (!event) throw new Error("Event not found")

		await eventBus.publish<EventDeletedEvent>("EventDeleted", {
			type: "EventDeleted",
			eventId: data.eventId,
			eventType: event.type,
			warriorId: event.warriorId,
			defenderId: event.defenderId ?? undefined,
			matchId: event.matchId,
			timestamp: new Date(),
		})

		await db.delete(events).where(eq(events.id, data.eventId))

		return { success: true }
	})
```

#### 3.2 Update Casualty Update/Delete Functions

Similar pattern to events - get old data, publish update/delete event, perform database operation.

---

### Phase 4: Testing

#### 4.1 Unit Tests for Event Bus

**File:** `tests/lib/event-bus.test.ts`

```typescript
import { describe, test, expect, beforeEach } from "vitest"
import { EventBus } from "~/lib/event-bus"

describe("EventBus", () => {
	let bus: EventBus

	beforeEach(() => {
		bus = new EventBus()
	})

	test("should register and trigger handler", async () => {
		let called = false
		bus.on("TestEvent", () => {
			called = true
		})

		await bus.publish("TestEvent", {})
		expect(called).toBe(true)
	})

	test("should call multiple handlers", async () => {
		let count = 0
		bus.on("TestEvent", () => count++)
		bus.on("TestEvent", () => count++)

		await bus.publish("TestEvent", {})
		expect(count).toBe(2)
	})

	test("should pass data to handler", async () => {
		let receivedData: any
		bus.on("TestEvent", (data) => {
			receivedData = data
		})

		await bus.publish("TestEvent", { foo: "bar" })
		expect(receivedData).toEqual({ foo: "bar" })
	})

	test("should handle async handlers", async () => {
		let asyncCalled = false
		bus.on("TestEvent", async () => {
			await new Promise((resolve) => setTimeout(resolve, 10))
			asyncCalled = true
		})

		await bus.publish("TestEvent", {})
		expect(asyncCalled).toBe(true)
	})

	test("should not break if one handler fails", async () => {
		let handler2Called = false

		bus.on("TestEvent", () => {
			throw new Error("Handler 1 failed")
		})
		bus.on("TestEvent", () => {
			handler2Called = true
		})

		await bus.publish("TestEvent", {})
		expect(handler2Called).toBe(true)
	})

	test("should unregister handler", async () => {
		let called = false
		const handler = () => {
			called = true
		}

		bus.on("TestEvent", handler)
		bus.off("TestEvent", handler)

		await bus.publish("TestEvent", {})
		expect(called).toBe(false)
	})

	test("should clear all handlers", async () => {
		let called = false
		bus.on("TestEvent", () => {
			called = true
		})

		bus.clear()

		await bus.publish("TestEvent", {})
		expect(called).toBe(false)
	})
})
```

#### 4.2 Integration Tests for Event Handlers

**File:** `tests/events/casualty-events.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { db } from "~/db"
import { warriors, casualties } from "~/db/schema"
import { eq } from "drizzle-orm"
import { eventBus } from "~/events"
import type { CasualtyRecordedEvent } from "~/events/types"

describe("Casualty Event Handlers", () => {
	beforeEach(async () => {
		// Clean database
		await db.delete(casualties)
		await db.delete(warriors)

		// Re-register handlers
		await import("~/events/handlers")
	})

	afterEach(() => {
		// Clear event bus
		eventBus.clear()
	})

	test("should increment kills when killed casualty recorded", async () => {
		// Setup
		const [killer, victim] = await db
			.insert(warriors)
			.values([
				{
					name: "Killer",
					kills: 0,
					warbandId: 1,
					campaignId: 1,
					// ... other required fields
				},
				{
					name: "Victim",
					isAlive: true,
					warbandId: 2,
					campaignId: 1,
					// ... other required fields
				},
			])
			.returning()

		// Publish event
		await eventBus.publish<CasualtyRecordedEvent>("CasualtyRecorded", {
			type: "CasualtyRecorded",
			casualtyId: 1,
			casualtyType: "killed",
			killerWarriorId: killer.id,
			victimWarriorId: victim.id,
			killerWarbandId: 1,
			victimWarbandId: 2,
			matchId: 1,
			timestamp: new Date(),
		})

		// Wait for async handlers
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Assert
		const updatedKiller = await db.query.warriors.findFirst({
			where: eq(warriors.id, killer.id),
		})
		expect(updatedKiller?.kills).toBe(1)

		const updatedVictim = await db.query.warriors.findFirst({
			where: eq(warriors.id, victim.id),
		})
		expect(updatedVictim?.isAlive).toBe(false)
		expect(updatedVictim?.deathDate).toBeTruthy()
	})

	// More tests...
})
```

---

## Migration Strategy

### Step 1: Add Event System (No Breaking Changes)

1. Create event bus, types, and handlers
2. Deploy to production
3. Test event publication (log events but don't rely on them)

### Step 2: Gradual Rollout

1. Start with **one entity** (e.g., casualties)
2. Update server functions to publish events
3. Monitor logs for errors
4. Fix any issues
5. Repeat for other entities (events, matches)

### Step 3: Deprecate Manual Stat Updates

1. Once events are proven to work, remove manual stat update code
2. Add safeguards to prevent direct stat manipulation

---

## Monitoring and Debugging

### Add Logging

```typescript
// In event bus
async publish<T>(eventType: string, data: T) {
  console.log(`📢 Publishing ${eventType}`, data)
  // ... rest of implementation
}
```

### Add Metrics

```typescript
// Track event publishing metrics
const eventMetrics = {
	published: 0,
	handlerFailures: 0,
}

// Expose via admin endpoint
export const getEventMetrics = createServerFn({ method: "GET" }).handler(
	async () => {
		return eventMetrics
	},
)
```

### Add Admin Dashboard

Create an admin page to:

- View recent events
- Retry failed events
- View handler status
- Trigger manual stat recalculation

---

## Future Enhancements

### 1. Event Persistence (Upgrade to Option B)

Add database table for events:

```typescript
export const domainEvents = pgTable("domain_events", {
	id: serial("id").primaryKey(),
	eventType: text("event_type").notNull(),
	payload: jsonb("payload").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	processedAt: timestamp("processed_at"),
})
```

### 2. Event Replay

```typescript
async function replayEvents(fromDate: Date) {
	const events = await db
		.select()
		.from(domainEvents)
		.where(gte(domainEvents.createdAt, fromDate))
		.orderBy(domainEvents.createdAt)

	for (const event of events) {
		await eventBus.publish(event.eventType, event.payload)
	}
}
```

### 3. Dead Letter Queue

For failed events:

```typescript
export const failedEvents = pgTable("failed_events", {
	id: serial("id").primaryKey(),
	eventType: text("event_type").notNull(),
	payload: jsonb("payload").notNull(),
	error: text("error").notNull(),
	attemptCount: integer("attempt_count").notNull().default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
})
```

### 4. More Event Types

- `ExperienceAwarded`
- `TreasuryUpdated`
- `WarriorPromoted`
- `WarbandRatingChanged`
- `AchievementUnlocked`

---

## Pros and Cons

### Advantages

- ✅ **Decoupled:** Forms don't know about stat updates
- ✅ **Testable:** Easy to test handlers in isolation
- ✅ **Extensible:** Add new handlers without changing existing code
- ✅ **Debuggable:** Clear event logs show what happened
- ✅ **Simple:** No external dependencies
- ✅ **Fast:** In-memory, no network calls

### Disadvantages

- ❌ **Not durable:** Events lost on server restart
- ❌ **No retry:** Failed handlers are just logged
- ❌ **No ordering guarantees:** Handlers run in parallel
- ❌ **Memory only:** Can't replay events
- ❌ **Single server:** Doesn't work across multiple servers

### Mitigations

- Use database transactions in handlers (ensures atomicity)
- Add reconciliation job (catches any missed updates)
- Upgrade to event store later if needed (easy migration path)

---

## Success Metrics

After implementation, verify:

1. **Correctness:** Stats match source data
2. **Performance:** Event publishing adds < 50ms to requests
3. **Reliability:** No handler failures in production
4. **Maintainability:** New features are easy to add

---

## Next Steps

1. ✅ Review this document with team
2. ⬜ Create event bus (`src/lib/event-bus.ts`)
3. ⬜ Define event types (`src/events/types.ts`)
4. ⬜ Implement handlers (`src/events/handlers.ts`)
5. ⬜ Update casualty creation to publish events
6. ⬜ Test in development
7. ⬜ Deploy to production
8. ⬜ Monitor for issues
9. ⬜ Expand to other entities (events, matches)
10. ⬜ Add reconciliation job as safety net

---

## References

- [Stats Tracking Data Flow Investigation](./stats-tracking-data-flow.md)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [Domain Events in DDD](https://leanpub.com/implementing-domain-driven-design)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-21
**Status:** Ready for Implementation
