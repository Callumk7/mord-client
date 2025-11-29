# **FINALIZED PLAN: Timeline View - Step 1 (MVP)**

## **Overview**
Create a chronological timeline view that displays all campaign events grouped by match, with rich context about warriors, warbands, and match details. This view will serve as a narrative-focused "story of the campaign" interface.

---

## **Implementation Checklist**

### **1. Create New Route**
**File:** `src/routes/$campaignId/timeline/index.tsx`

**Requirements:**
- Create file-based route at `/$campaignId/timeline`
- Implement loader to preload all necessary data (events, matches, warbands)
- Use TanStack Query for data fetching with proper query options
- Handle loading and empty states
- Follow existing route patterns from `$campaignId/events/index.tsx`

**Data Dependencies:**
```typescript
- campaignEventsQueryOptions(campaignId) // events with warrior, defender, match
- getCampaignMatchesOptions(campaignId)  // matches with participants
- campaignWarbandsQueryOptions(campaignId) // for warband colors/icons
```

**Key Features:**
- Parallel data loading in loader for performance
- Proper TypeScript typing using existing types
- Responsive container with proper padding
- Page title: "Campaign Timeline"

---

### **2. Create Timeline View Component**
**File:** `src/components/events/display/timeline-view.tsx`

**Purpose:** Main container that orchestrates the timeline display

**Props:**
```typescript
interface TimelineViewProps {
	events: EventWithParticipants[];
	matches: CampaignMatch[];
	warbands: Warband[];
	campaignId: number;
}
```

**Responsibilities:**
1. **Group events by match** - Transform flat event list into match-grouped structure
2. **Sort matches** - Most recent first (descending by date)
3. **Sort events within matches** - Most recent first (descending by timestamp)
4. **Create warband lookup map** - For efficient color/name retrieval
5. **Render match groups** - Map over sorted matches and render TimelineMatchGroup
6. **Handle empty state** - Display helpful message when no events exist

**Implementation Details:**
```typescript
// Group events by matchId
const eventsByMatch = useMemo(() => {
	return events.reduce((acc, event) => {
		if (!acc[event.matchId]) acc[event.matchId] = [];
		acc[event.matchId].push(event);
		return acc;
	}, {} as Record<number, EventWithParticipants[]>);
}, [events]);

// Create warband lookup
const warbandMap = useMemo(() => {
	return new Map(warbands.map(wb => [wb.id, wb]));
}, [warbands]);

// Sort matches by date (newest first)
const sortedMatches = useMemo(() => {
	return [...matches].sort((a, b) => 
		new Date(b.date).getTime() - new Date(a.date).getTime()
	);
}, [matches]);

// For each match, sort its events by timestamp (newest first)
const sortedEventsByMatch = useMemo(() => {
	return Object.entries(eventsByMatch).reduce((acc, [matchId, events]) => {
		acc[matchId] = [...events].sort((a, b) => 
			new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
		return acc;
	}, {} as Record<string, EventWithParticipants[]>);
}, [eventsByMatch]);
```

**Styling:**
- Use `space-y-6` for vertical spacing between match groups
- Apply responsive padding and margins
- Empty state should be centered with muted text

---

### **3. Create Timeline Match Group Component**
**File:** `src/components/events/display/timeline-match-group.tsx`

**Purpose:** Displays a single match with all its events in a timeline format

**Props:**
```typescript
interface TimelineMatchGroupProps {
	match: CampaignMatch;
	events: EventWithParticipants[];
	warbandMap: Map<number, Warband>;
}
```

**Responsibilities:**
1. **Render match header** with:
   - Match name and icon (⚔️ Swords icon from Lucide)
   - Relative time since match started (e.g., "2 hours ago")
   - Participating warbands (from match.participants)
2. **Render event timeline**:
   - List events in chronological order (pre-sorted)
   - Visual timeline connector (border-left accent)
   - Each event rendered with TimelineEventItem
3. **Handle match with no events** - Still show match card but indicate no events

**Component Structure:**
```typescript
<Card className="relative">
	<CardHeader className="pb-4">
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Swords className="h-5 w-5 text-muted-foreground" />
				<CardTitle>{match.name}</CardTitle>
			</div>
			<span className="text-sm text-muted-foreground">
				{formatTimeAgo(match.date)}
			</span>
		</div>
		<CardDescription>
			{/* List participating warbands */}
		</CardDescription>
	</CardHeader>
	
	<CardContent>
		{events.length > 0 ? (
			<div className="space-y-3 border-l-2 border-muted pl-4 ml-2">
				{events.map(event => (
					<TimelineEventItem 
						key={event.id} 
						event={event}
						warbandMap={warbandMap}
					/>
				))}
			</div>
		) : (
			<p className="text-sm text-muted-foreground text-center py-4">
				No events recorded for this match
			</p>
		)}
	</CardContent>
</Card>
```

**Icons Needed:**
- `Swords` from lucide-react (match header)

**Styling:**
- Card with subtle shadow
- Timeline connector: `border-l-2 border-muted` with left padding
- Responsive text sizes

---

### **4. Create Timeline Event Item Component**
**File:** `src/components/events/display/timeline-event-item.tsx`

**Purpose:** Displays a single event with all relevant context

**Props:**
```typescript
interface TimelineEventItemProps {
	event: EventWithParticipants;
	warbandMap: Map<number, Warband>;
}
```

**Responsibilities:**
1. **Display event type** with appropriate icon:
   - `Skull` for death events
   - `UserX` for knock downs
   - `Sparkles` for memorable moments
2. **Show warrior and defender names** with warband context
3. **Display timestamp** in readable format (time only, not date)
4. **Show resolution status** with Badge component
5. **Highlight special outcomes** (death, injury) with visual emphasis
6. **Optional description** if present

**Component Structure:**
```typescript
<div className="group relative">
	{/* Timeline dot/marker */}
	<div className="absolute -left-[1.3rem] top-2 h-3 w-3 rounded-full bg-primary" />
	
	<div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
		<div className="flex-1 space-y-1">
			{/* Event type with icon */}
			<div className="flex items-center gap-2">
				{getEventIcon(event)}
				<span className="font-medium text-sm capitalize">
					{event.type.replace('_', ' ')}
				</span>
			</div>
			
			{/* Warrior → Defender */}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>{event.warrior.name}</span>
				{event.defender && (
					<>
						<span>→</span>
						<span>{event.defender.name}</span>
					</>
				)}
			</div>
			
			{/* Warband context */}
			<div className="flex items-center gap-2 text-xs">
				{renderWarbandBadges(event, warbandMap)}
			</div>
			
			{/* Description if present */}
			{event.description && (
				<p className="text-sm text-muted-foreground italic">
					"{event.description}"
				</p>
			)}
			
			{/* Injury details if resolved */}
			{event.resolved && event.injuryType && (
				<div className="text-xs text-muted-foreground">
					Injury: {formatInjuryType(event.injuryType)}
				</div>
			)}
		</div>
		
		{/* Right column: time + status */}
		<div className="flex flex-col items-end gap-2">
			<span className="text-xs text-muted-foreground whitespace-nowrap">
				{formatEventTime(event.timestamp)}
			</span>
			{renderStatusBadge(event)}
		</div>
	</div>
</div>
```

**Helper Functions:**
```typescript
function getEventIcon(event: EventWithParticipants) {
	if (event.death) return <Skull className="h-4 w-4 text-destructive" />;
	if (event.type === 'knock_down') return <UserX className="h-4 w-4" />;
	if (event.type === 'moment') return <Sparkles className="h-4 w-4" />;
	return null;
}

function renderStatusBadge(event: EventWithParticipants) {
	if (event.death) {
		return <Badge variant="destructive">Death</Badge>;
	}
	if (event.injury) {
		return <Badge variant="secondary">Injured</Badge>;
	}
	if (event.resolved) {
		return <Badge variant="success">Resolved</Badge>;
	}
	return <Badge variant="outline">Pending</Badge>;
}

function formatEventTime(timestamp: Date | string) {
	return new Date(timestamp).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
	});
}

function formatInjuryType(injuryType: string) {
	return injuryType.replace(/_/g, ' ');
}
```

**Icons Needed:**
- `Skull` from lucide-react (death)
- `UserX` from lucide-react (knock down)
- `Sparkles` from lucide-react (memorable moment)

**Styling:**
- Timeline dot positioned absolutely at left edge
- Hover effect on event card
- Warband badges with colors if available
- Death events: red accent
- Responsive flex layout

---

### **5. Add Utility Functions**
**File:** `src/lib/utils.ts` (append to existing)

**Add:**
```typescript
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
		return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
	}
	if (diffHours > 0) {
		return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
	}
	if (diffMins > 0) {
		return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
	}
	return 'Just now';
}

/**
 * Format time only from timestamp (e.g., "2:30 PM")
 */
export function formatEventTime(timestamp: Date | string): string {
	return new Date(timestamp).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
	});
}
```

---

### **6. Update Navigation**
**File:** `src/components/header.tsx`

**Add Timeline Link:**
Insert after the "Events" NavigationMenuItem (around line 117):

```typescript
<NavigationMenuItem>
	<NavigationMenuLink
		render={<Link to="/$campaignId/timeline" params={{ campaignId }} />}
	>
		Timeline
	</NavigationMenuLink>
</NavigationMenuItem>
```

**Position:** Between "Events" and right-side navigation items

**Optional:** Add icon from Lucide (e.g., `CalendarClock` or `History`)

---

## **Technical Requirements**

### **TypeScript**
- Use strict typing throughout
- Leverage existing types: `EventWithParticipants`, `CampaignMatch`, `Warband`
- No `any` types allowed
- Proper inference for useMemo return values

### **Performance**
- Use `useMemo` for expensive computations (grouping, sorting)
- Avoid recalculating on every render
- TanStack Query handles caching automatically
- No need for virtualization at MVP stage (unless 200+ events)

### **Styling**
- Use Tailwind utility classes exclusively
- Follow existing component patterns
- Use shadcn/ui components (Card, Badge, etc.)
- Maintain consistent spacing: `space-y-6` for major sections, `space-y-3` for events
- Responsive design: works on mobile, tablet, desktop
- Dark mode support (automatic via CSS variables)

### **Icons**
Import from lucide-react:
```typescript
import { Swords, Skull, UserX, Sparkles } from 'lucide-react';
```

### **Code Formatting**
- **TABS for indentation** (critical - Biome config)
- Double quotes for strings
- Consistent spacing and line breaks
- Follow existing code style in similar components

---

## **File Structure**

```
src/
├── routes/
│   └── $campaignId/
│       └── timeline/
│           └── index.tsx          [NEW - Route component]
├── components/
│   └── events/
│       └── display/
│           ├── events-list.tsx    [existing]
│           ├── timeline-view.tsx  [NEW - Main timeline container]
│           ├── timeline-match-group.tsx [NEW - Match grouping]
│           └── timeline-event-item.tsx  [NEW - Individual events]
├── lib/
│   └── utils.ts                   [MODIFY - Add time formatting]
└── components/
    └── header.tsx                 [MODIFY - Add navigation link]
```

---

## **Validation & Testing**

### **Manual Testing Checklist:**
- [ ] Route loads without errors
- [ ] Data fetches correctly (events, matches, warbands)
- [ ] Events are grouped by match correctly
- [ ] Matches are sorted newest-first
- [ ] Events within matches are sorted newest-first
- [ ] Timestamps display correctly
- [ ] Warband names/colors show correctly
- [ ] Status badges render with correct variants
- [ ] Death events show red styling
- [ ] Empty state displays when no events
- [ ] Navigation link works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark mode works correctly
- [ ] No TypeScript errors
- [ ] No console errors/warnings

### **Edge Cases:**
- [ ] Match with no events
- [ ] Event with no defender (defenderId is null)
- [ ] Event with no description
- [ ] Very long warrior/warband names
- [ ] Multiple events at same timestamp
- [ ] Campaign with no matches/events

### **Code Quality:**
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm typecheck` - no errors
- [ ] Code formatted with tabs (Biome)
- [ ] All imports organized

---

## **Success Criteria**

✅ **Functional:**
- Timeline displays all events grouped by match
- Events show warrior, defender, and warband context
- Chronological ordering (newest first)
- Navigation accessible from header
- Loading states work correctly

✅ **Visual:**
- Clean, readable design
- Timeline connector visual
- Color-coded status badges
- Death events prominently marked
- Responsive layout

✅ **Technical:**
- No TypeScript errors
- Proper data fetching with TanStack Query
- Optimized with useMemo
- Follows project conventions
- Code formatted correctly (TABS!)

---

## **Dependencies**

**Existing (no installation needed):**
- lucide-react (icons)
- @tanstack/react-query (data fetching)
- @tanstack/react-router (routing)
- shadcn/ui components (Card, Badge)
- Tailwind CSS (styling)

**No new packages required!**

---

## **Estimated Complexity**

- **Route setup:** Simple (pattern exists)
- **Timeline View:** Medium (grouping/sorting logic)
- **Match Group:** Simple (straightforward rendering)
- **Event Item:** Medium (multiple display cases)
- **Utils:** Trivial (standard time formatting)
- **Navigation:** Trivial (one line)

**Total: ~2-3 hours of focused implementation**

---

## **Post-Implementation Notes**

After completing Step 1, the following enhancements could be considered for future phases:
- Filtering by warband/warrior
- Search functionality
- Collapsible match groups
- Export timeline as report
- Real-time updates
- Click to expand event details
- Link directly to match detail page

---

This plan provides everything needed to implement a clean, functional timeline view that enhances the campaign tracking experience with a narrative, chronological perspective on all events.
