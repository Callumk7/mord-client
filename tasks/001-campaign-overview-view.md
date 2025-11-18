# Task 001: Campaign Overview View

## Status
🔴 Not Started

## Priority
High

## Description
Build the main campaign overview page that serves as the central hub for campaign management. This view should provide quick access to all warbands and upcoming scenarios, with intuitive interfaces for creating new entries.

## Requirements

### Warband Management
- **Display All Warbands**
  - Show all warbands for the current campaign
  - Display key information: name, faction, rating, treasury, warband size
  - Visual indicators for warband health/status
  - Clickable cards that navigate to detailed warband view

- **Create Warband Interface**
  - Modal or slide-over form for warband creation
  - Required fields:
    - Warband name
    - Faction selection (dropdown)
    - Player name (optional)
  - Auto-initialize with default rating (e.g., 500gc) and empty treasury
  - Validation with Zod schema
  - Success toast notification on creation

### Scenario Management
- **Display Upcoming Scenarios**
  - List of planned/upcoming scenarios
  - Show: scenario name, player count, special rules (if any)
  - Visual distinction between played and unplayed scenarios
  - Order by creation date or manual ordering

- **Create Scenario Interface**
  - Modal or inline form for scenario creation
  - Required fields:
    - Scenario name
    - Player count (2-4)
  - Optional fields:
    - Description
    - Special rules (multi-line text or tags)
  - Validation with Zod schema
  - Success toast notification on creation

## Technical Implementation

### Route
- Path: `/campaign/:campaignId` or `/campaign/:campaignId/overview`
- File: `src/routes/$campaign/index.tsx` or `src/routes/$campaign/overview.tsx`

### Components to Create
- `WarbandCard.tsx` - Display individual warband summary
- `WarbandCreateForm.tsx` - Form for creating new warband
- `WarbandGrid.tsx` or `WarbandList.tsx` - Container for warband cards
- `ScenarioCard.tsx` - Display individual scenario
- `ScenarioCreateForm.tsx` - Form for creating new scenario
- `ScenarioList.tsx` - Container for scenario cards

### Database Queries
- Fetch warbands: `SELECT * FROM warbands WHERE campaign_id = ?`
- Fetch scenarios: `SELECT * FROM scenarios WHERE campaign_id = ?` (if scenario table exists)
- Create warband: `INSERT INTO warbands (...) VALUES (...)`
- Create scenario: `INSERT INTO scenarios (...) VALUES (...)`

### State Management
- Use TanStack Query for data fetching and caching
- Query keys:
  - `['warbands', campaignId]`
  - `['scenarios', campaignId]`
- Mutations for create operations with optimistic updates
- Invalidate queries on successful creation

### UI Components (shadcn/ui)
- `Card` - For warband and scenario cards
- `Button` - For create actions
- `Dialog` or `Sheet` - For create forms
- `Form` - For form handling
- `Input`, `Select`, `Textarea` - Form fields
- `Badge` - For faction/status indicators
- Use Sonner for toast notifications

### Validation Schemas
```typescript
// Warband creation
const createWarbandSchema = z.object({
  name: z.string().min(1, "Warband name required"),
  faction: z.string().min(1, "Faction required"),
  playerName: z.string().optional(),
  campaignId: z.number(),
})

// Scenario creation
const createScenarioSchema = z.object({
  name: z.string().min(1, "Scenario name required"),
  playerCount: z.number().min(2).max(4),
  description: z.string().optional(),
  specialRules: z.array(z.string()).optional(),
  campaignId: z.number(),
})
```

## Design Considerations
- **Mobile-first**: Ensure forms and cards work well on mobile devices
- **Quick access**: Prominent "+" buttons for creating warbands/scenarios
- **Visual hierarchy**: Clear sections for warbands vs. scenarios
- **Loading states**: Show skeletons while data loads
- **Empty states**: Helpful prompts when no warbands/scenarios exist
- **Responsive layout**: Grid for larger screens, list for mobile

## Acceptance Criteria
- [ ] Campaign overview route is accessible
- [ ] All warbands for the campaign are displayed
- [ ] Warband cards show key information (name, faction, rating, treasury)
- [ ] "Create Warband" button opens a form/modal
- [ ] Warband creation form validates input and creates warband
- [ ] Success toast appears after warband creation
- [ ] Newly created warband appears in the list immediately
- [ ] All scenarios are displayed with relevant information
- [ ] "Create Scenario" button opens a form/modal
- [ ] Scenario creation form validates input and creates scenario
- [ ] Success toast appears after scenario creation
- [ ] Newly created scenario appears in the list immediately
- [ ] Page is responsive and works on mobile/tablet/desktop
- [ ] Loading states are handled gracefully
- [ ] Empty states provide helpful guidance
- [ ] Dark mode support is consistent

## Dependencies
- Requires `scenarios` table in database schema (check if exists, add if needed)
- Requires shadcn/ui components: `dialog`, `form`, `input`, `select`, `card`, `button`, `badge`
- Sonner for toast notifications (already in package.json)

## Estimated Effort
4-6 hours

## Notes
- This is the primary landing page after selecting a campaign
- Should feel fast and responsive (< 2 second load time)
- Consider adding quick stats: total matches, active warriors, etc.
- Future enhancement: drag-and-drop scenario ordering
- Future enhancement: warband filtering/sorting options

## Related Tasks
- [ ] 002 - Warband Detail View
- [ ] 003 - Match Entry Interface
- [ ] 004 - Scenario Detail View
