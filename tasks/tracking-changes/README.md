# Event-Driven Campaign Progress Tracking - Implementation Tasks

This directory contains the step-by-step implementation plan for adding historical campaign progress tracking to the Mord Stats application.

## Overview

The goal is to track warband state changes (rating, treasury, experience) over time and visualize them with charts. Instead of just storing current values, we'll record every change as an event, allowing us to reconstruct the full campaign history.

## Task Order

The tasks should be completed in numerical order as they have dependencies on each other.

### Phase 1: Database Schema (Tasks 1-2)
1. **Task 01:** Add State Changes Table to Schema
2. **Task 02:** Generate and Run Database Migration

### Phase 2: API Updates (Tasks 3-4)
3. **Task 03:** Update Gold Resolution API to Record State Changes
4. **Task 04:** Update Experience Resolution API to Record State Changes

### Phase 3: Component Updates (Tasks 5-6)
5. **Task 05:** Update Gold Resolution Component to Pass matchId
6. **Task 06:** Update Experience Resolution Component to Pass matchId

### Phase 4: Query & Visualization (Tasks 7-11)
7. **Task 07:** Create Campaign History API
8. **Task 08:** Create Campaign History Helper Functions
9. **Task 09:** Install Chart Library (Recharts)
10. **Task 10:** Create Campaign Progress Page with Charts
11. **Task 11:** Add Navigation Link to Progress Page

### Phase 5: Testing & Future (Tasks 12-13)
12. **Task 12:** Test End-to-End Flow
13. **Task 13:** Optional Enhancements (Future Ideas)

## Quick Start

1. Start with Task 01 and work through them sequentially
2. Each task file contains:
   - Status indicator
   - Description
   - Dependencies
   - Files to modify/create
   - Implementation details
   - Testing instructions
   - Notes

3. Update the status in each file as you progress:
   - ⏳ Not Started
   - 🚧 In Progress
   - ✅ Complete
   - ⚠️ Blocked

## Key Concepts

### Event-Driven Architecture
- Instead of only storing current warband values, we record every change
- Each state change has a delta (what changed) and snapshot (state after)
- This allows us to reconstruct history at any point in time

### State Change Record
Each state change captures:
- **Deltas:** `treasuryDelta`, `experienceDelta`, `ratingDelta`
- **Snapshots:** `treasuryAfter`, `experienceAfter`, `ratingAfter`
- **Context:** `changeType`, `description`, `timestamp`
- **Relations:** `warbandId`, `matchId`

### Benefits
- ✅ Complete audit trail
- ✅ Can answer "when did this happen?"
- ✅ Can reconstruct state at any point
- ✅ Enables rich visualizations
- ✅ No data loss or approximation

## Estimated Time

- **Phase 1 (Schema):** 30 minutes
- **Phase 2 (API):** 1-2 hours
- **Phase 3 (Components):** 30 minutes
- **Phase 4 (Visualization):** 2-3 hours
- **Phase 5 (Testing):** 1-2 hours

**Total:** ~6-9 hours for core implementation

## Dependencies

### Required Packages (to be installed)
- `recharts` - Chart library
- `@types/recharts` - TypeScript types

### Existing Stack
- Drizzle ORM - Database layer
- TanStack Query - Data fetching
- TanStack Router - Routing
- React 19 - UI framework
- Tailwind CSS - Styling

## Support

If you encounter issues:
1. Check the task file for troubleshooting notes
2. Review the implementation details carefully
3. Ensure all dependencies are met
4. Run `pnpm typecheck` frequently
5. Use Drizzle Studio to inspect database state

## Notes

- Tasks can be completed in a single session or spread across multiple sessions
- Each task is designed to be atomic and testable
- Type safety is maintained throughout
- All changes are backward compatible
- No existing functionality is broken
