# Display Route Breakdown

**Route:** `/display/$campaignId`

**Purpose:** Provides a live broadcast-style view of an ongoing Mordheim campaign, styled like a sports broadcast network ("Sky Mord Sports News"). This view is designed for display on a second screen during campaign events, showing real-time statistics, match progress, and campaign highlights.

---

## Route Overview

The display route creates an immersive, TV-style broadcast experience with:

- **Live updating header** with campaign stats and breaking news
- **Auto-rotating carousel** showing stats and charts
- **Match center** displaying active and scheduled matches
- **Warband spotlight** highlighting the campaign leader
- **Casualty report** tracking top warriors and injuries
- **News ticker** scrolling recent events and campaign updates

---

## File Structure

```
src/
├── routes/display/$campaignId.tsx          # Main route file (data fetching & composition)
├── components/events/display/              # Display-specific components
│   ├── broadcast-header.tsx                # Header with stats and breaking news
│   ├── stat-carousel.tsx                   # Auto-rotating stats/charts carousel
│   ├── match-center.tsx                    # Live and upcoming matches
│   ├── live-score-card.tsx                 # Individual live match card
│   ├── fixture-row.tsx                     # Upcoming fixture row
│   ├── recent-results-slide.tsx            # Recent results carousel slide
│   ├── warband-spotlight.tsx               # Leading warband spotlight
│   ├── casualty-report.tsx                 # Casualty statistics
│   └── news-ticker.tsx                     # Scrolling news ticker
├── hooks/use-broadcast-data.ts             # Custom hooks for data processing
├── lib/display-utils.ts                    # Utility functions
└── types/display.ts                        # TypeScript type definitions
```

---

## Main Route Component

**File:** `src/routes/display/$campaignId.tsx`

### Responsibilities

1. **Route Configuration**
   - Parses and validates `campaignId` from URL params
   - Defines data loader to prefetch all required data

2. **Data Fetching**
   - Fetches campaign metadata
   - Retrieves warband statistics (games won, treasury, rating)
   - Loads warrior statistics (kills, injuries)
   - Fetches matches and events
   - Retrieves campaign history for progress charts

3. **Data Processing**
   - Calculates aggregate statistics (casualties, active warriors, etc.)
   - Processes data using custom hooks
   - Builds carousel items combining stats and charts

4. **Component Composition**
   - Renders the full broadcast layout
   - Passes processed data to display components

### Key Data Points

```typescript
// Fetched data
campaign; // Campaign metadata (name, dates)
gamesWon; // Warband win counts
treasury; // Warband treasury amounts
rating; // Warband ratings
killsFromEvents; // Warrior kill statistics
injuriesFromEvents; // Injuries received by warriors
injuriesInflictedFromEvents; // Injuries inflicted by warriors
matches; // All matches in campaign
events; // All events (kills, injuries, moments)
warbands; // Warband details with warriors
history; // Campaign state changes over time

// Computed statistics
totalMatches; // Total number of matches
casualtyCount; // Total deaths
injuryCount; // Total non-fatal injuries
activeWarbands; // Number of active warbands
activeWarriors; // Number of living warriors
```

---

## Components

### 1. BroadcastHeader

**File:** `src/components/events/display/broadcast-header.tsx`

**Purpose:** Displays the main header with "Sky Mord Sports News" branding, campaign information, live stats, and breaking news.

**Features:**

- **Sky Mord Branding:** Red/blue color scheme mimicking sports network branding
- **Live Clock:** Updates every second showing current time
- **Campaign Info:** Name and date range
- **Quick Stats:** Top warband, total matches, casualties, active warbands
- **Breaking News Strip:** Highlighted breaking news headline

**Props:**

```typescript
{
  campaign: Campaign | null | undefined       // Campaign metadata
  topWarbandName?: string                     // Leading warband name
  totalMatches: number                        // Total matches played
  casualtyCount: number                       // Total casualties
  activeWarbands: number                      // Active warband count
  breaking?: string                           // Breaking news headline
}
```

**Visual Design:**

- Two-tier header (main stats + breaking news)
- Pulsing red "LIVE" indicator
- Timeframe display (campaign start/end dates)
- Badge-style stat pills (matches, casualties, warbands)

---

### 2. StatCarousel

**File:** `src/components/events/display/stat-carousel.tsx`

**Purpose:** Auto-rotating carousel displaying campaign statistics and charts with smooth transitions.

**Features:**

- **Auto-advance:** Rotates every 7 seconds
- **Progress Bar:** Visual progress indicator for current slide
- **Manual Controls:** Previous/next buttons, pause/play, dot navigation
- **Keyboard Shortcuts:**
  - Space/P: Pause/play
  - Arrow Left/Right: Navigate slides
- **Two Content Types:**
  - **Stat Cards:** Large display of single statistics
  - **Chart Slides:** Embedded charts and data visualizations

**Props:**

```typescript
{
  items: (BroadcastStat | BroadcastChart)[]  // Carousel items
  headline: string                            // Current headline for "On Now" strip
}
```

**Carousel Items Include:**

1. **Campaign Leader** - Top warband by wins
2. **Treasure Hoard** - Richest warband
3. **Fiercest Warrior** - Most kills
4. **Casualty Watch** - Total deaths and injuries
5. **Active Forces** - Warbands and warriors count
6. **Warpstone Index** - Incidents per match ratio
7. **Recent Results** - Last 3 completed matches
8. **Warband Standings** - Grouped bar chart (treasury, rating, wins)
9. **Rating Progression** - Line chart over time
10. **Treasury Progression** - Line chart over time
11. **Experience Progression** - Line chart over time

**Visual Design:**

- Gradient background matching broadcast theme
- "On Now" strip at top
- Large, bold typography for readability
- Smooth fade transitions between slides

---

### 3. MatchCenter

**File:** `src/components/events/display/match-center.tsx`

**Purpose:** Central hub displaying live matches and upcoming fixtures.

**Features:**

- **Live Now Grid:** Shows up to 4 active matches in grid layout
- **Upcoming Fixtures:** Lists next 6 scheduled matches
- **Match Count Badges:** "X live • Y next" indicator

**Props:**

```typescript
{
  matches: MatchCenterMatch[]  // All matches (active, scheduled, ended)
}
```

**Subcomponents:**

- `LiveNowGrid` - Grid of live matches
- `UpcomingFixtures` - List of scheduled matches

**Visual Design:**

- Card-based layout with shadow
- Muted header with match counts
- Two-column layout (2/3 live, 1/3 upcoming)
- Empty states for when no matches exist

---

### 4. LiveScoreCard

**File:** `src/components/events/display/live-score-card.tsx`

**Purpose:** Individual scorecard for a live match showing real-time statistics.

**Features:**

- **Two Display Modes:**
  - **Head-to-Head (1v1):** Side-by-side scoreboards with kills/injuries
  - **Multiplayer:** Leaderboard table sorted by kills
- **Live Scoring:** Calculates kills and injuries from match events
- **Leader Indicator:** "Lead" badge for warband with most kills
- **Event Counter:** Shows total logged events

**Props:**

```typescript
{
  match: MatchCenterMatch; // Match data with events and participants
}
```

**Data Processing:**

- Filters events by warband to calculate individual scores
- Determines leader based on kill count
- Displays as scoreboard (1v1) or table (multiplayer)

**Visual Design:**

- Dark slate background with gradient header
- Large center score display (1v1)
- Color-coded warband indicators
- "Sky Desk" branding footer

---

### 5. FixtureRow

**File:** `src/components/events/display/fixture-row.tsx`

**Purpose:** Compact row displaying an upcoming match fixture.

**Features:**

- **Match Information:** Name, date, time, type
- **Participant Summary:**
  - Shows "vs" format for 1v1
  - Shows count for multiplayer
- **Status Badge:** "Scheduled" indicator

**Props:**

```typescript
{
  match: MatchCenterMatch; // Match data
}
```

**Visual Design:**

- Compact horizontal layout
- Muted background
- Date/time in small caps
- Badge for status

---

### 6. RecentResultsSlide

**File:** `src/components/events/display/recent-results-slide.tsx`

**Purpose:** Carousel slide showing the last 3 completed matches with full results.

**Features:**

- **Results Board Header:** "Full Time" branding with "Last 3" badge
- **Match Cards:** Shows winners, participants, incidents (kills + injuries)
- **Color-Coded Gradient:** Blue/red broadcast theme

**Props:**

```typescript
{
  highlights: MatchHighlight[]  // Last 3 completed matches
}
```

**Match Card Sections:**

- **Left Column:** Match type badge, "FT" (Full Time) indicator
- **Center Column:** Match name, winners, participant list
- **Right Column:** Incident count with kill/injury breakdown

**Visual Design:**

- Three stacked horizontal cards
- Gradient backgrounds (slate with blue/red accents)
- Large incident numbers for visual impact
- Icons for kills (☠️) and injuries (🩸)

---

### 7. WarbandSpotlight

**File:** `src/components/events/display/warband-spotlight.tsx`

**Purpose:** Highlights the leading warband with key statistics.

**Features:**

- **Warband Info:** Name, faction, icon
- **Key Stats Grid:**
  - Wins
  - Treasury (gold crowns)
  - Warriors Alive
  - Event Impact (inflicted/suffered ratio)

**Props:**

```typescript
{
  data: WarbandSpotlightData | null; // Leader warband data
}
```

**Data Structure:**

```typescript
{
  name: string; // Warband name
  faction: string; // Faction type
  icon: string | null; // Emoji icon
  color: string | null; // Brand color
  wins: number; // Total wins
  treasury: number; // Gold crowns
  warriorsAlive: number; // Living warriors
  eventsInflicted: number; // Events caused
  eventsSuffered: number; // Events received
}
```

**Visual Design:**

- Card layout with rounded borders
- 2x2 grid for stats
- Large icon and warband name
- Muted backgrounds for stat boxes

---

### 8. CasualtyReport

**File:** `src/components/events/display/casualty-report.tsx`

**Purpose:** Displays top warriors in three casualty categories.

**Features:**

- **Three Sections:**
  1. **Lethal Warriors (⚔️):** Most kills
  2. **Walking Wounded (🩹):** Most injuries received
  3. **Delivery Squad (🔥):** Most injuries inflicted
- **Top 3 Display:** Shows up to 3 warriors per category
- **Warband Attribution:** Shows warrior name and warband

**Props:**

```typescript
{
  kills: WarriorKillsRow[]                      // Top killers
  injuriesTaken: WarriorInjuriesTakenRow[]      // Most injured
  injuriesInflicted: WarriorInjuriesInflictedRow[]  // Injury dealers
}
```

**Visual Design:**

- Compact card layout
- Section headers with emoji icons
- Two-column rows (warrior name | stat value)
- Empty state: "No data yet" for each section

---

### 9. NewsTicker

**File:** `src/components/events/display/news-ticker.tsx`

**Purpose:** Scrolling footer ticker displaying campaign news, events, and lore.

**Features:**

- **Auto-Scroll Animation:** Smooth horizontal scroll at 36px/second
- **Infinite Loop:** Duplicates content for seamless looping
- **Respects Reduced Motion:** Disables animation if user prefers reduced motion
- **Content Mix:**
  - Breaking headline
  - Live match stats
  - Recent events (last 10)
  - Campaign lore/flavor text

**Props:**

```typescript
{
  items: string[]      // News items to display
  label?: string       // Label for ticker (default: "Breaking")
}
```

**News Items Include:**

- Desk stats (live games, fixtures, finals)
- Campaign leader and treasury
- Top kills and bloodwatch stats
- Recent event descriptions
- Flavor text (witch hunters, necromancers, market watch, etc.)

**Visual Design:**

- Full-width footer with gradient background
- Sky Mord branding on left
- Pulsing "Breaking" badge
- Diamond separator (◆) between items
- Gradient fade edges to hide scroll boundaries

---

## Custom Hooks

**File:** `src/hooks/use-broadcast-data.ts`

### useBreakingHeadline

Generates the main breaking news headline from latest events or campaign leader.

**Returns:** `string`

**Logic:**

1. Finds most recent event (by timestamp)
2. If event exists, formats as breaking news with icon
3. Otherwise, shows campaign leader or default message

---

### useMatchCenterMatches

Transforms raw match data into MatchCenterMatch format suitable for display.

**Returns:** `MatchCenterMatch[]`

**Transformation:**

- Maps participants to simplified structure
- Filters events to only include relevant fields
- Preserves match status and metadata

---

### useRecentMatchHighlights

Generates array of last 3 completed matches with full details.

**Returns:** `MatchHighlight[]`

**Logic:**

1. Filters matches to "ended" or "resolved" status
2. Sorts by date (newest first)
3. Takes top 3
4. Calculates kills, injuries, and total events per match

---

### useWarbandSpotlight

Generates spotlight data for the campaign leader.

**Returns:** `WarbandSpotlightData | null`

**Logic:**

1. Finds leader from games won
2. Looks up warband roster
3. Calculates events inflicted/suffered
4. Retrieves treasury information
5. Counts living warriors

---

### useNewsItems

Generates array of news ticker items from various data sources.

**Returns:** `string[]`

**Logic:**

1. Compiles desk stats (match counts, leaders, treasury)
2. Formats recent events (last 10)
3. Adds flavor/lore text
4. De-duplicates and truncates to 120 chars
5. Returns top 22 items

---

## Utility Functions

**File:** `src/lib/display-utils.ts`

### formatDate

Formats a date as "Mon DD, YYYY" (e.g., "Dec 21, 2025").

```typescript
formatDate(date: Date | string | null | undefined): string
```

---

### formatShortDate

Formats a date as "Mon DD" (e.g., "Dec 21").

```typescript
formatShortDate(date: Date | string | null | undefined): string
```

---

### formatTime

Formats a time as "HH:MM AM/PM" (e.g., "02:30 PM").

```typescript
formatTime(date: Date | string | null | undefined): string
```

---

### pluralize

Automatically pluralizes words based on count.

```typescript
pluralize(value: number, singular: string, plural?: string): string

// Examples:
pluralize(1, "match")     // "1 match"
pluralize(5, "match")     // "5 matches"
pluralize(3, "injury", "injuries")  // "3 injuries"
```

---

### withIcon

Prepends an icon (emoji) to a label if the icon exists.

```typescript
withIcon(icon: string | null | undefined, label: string): string

// Examples:
withIcon("⚔️", "Warrior")    // "⚔️ Warrior"
withIcon(null, "Warrior")    // "Warrior"
```

---

### truncate

Truncates a string to max length, adding ellipsis (…) if needed.

```typescript
truncate(value: string, max: number): string

// Example:
truncate("This is a very long string", 10)  // "This is a…"
```

---

### gradients

Predefined gradient classes for consistent broadcast styling.

```typescript
const gradients = [
  "from-slate-950 via-red-700/35 to-blue-700/35",
  "from-slate-950 via-blue-700/35 to-indigo-700/35",
  "from-slate-950 via-amber-600/30 to-red-700/30",
  "from-slate-950 via-cyan-600/25 to-blue-700/35",
  "from-slate-950 via-emerald-600/25 to-lime-600/25",
];
```

---

## Type Definitions

**File:** `src/types/display.ts`

### BroadcastStat

Represents a single statistic card in the carousel.

```typescript
{
  type: "stat"
  id: string           // Unique identifier
  title: string        // Stat category
  value: string        // Main value to display
  statLine: string     // Supporting stat line
  description: string  // Additional context
  gradient: string     // Tailwind gradient class
  footnote?: string    // Optional footer text
}
```

---

### BroadcastChart

Represents a chart slide in the carousel.

```typescript
{
  type: "chart";
  id: string; // Unique identifier
  gradient: string; // Tailwind gradient class
  content: React.ReactNode; // Chart component
}
```

---

### MatchHighlight

Completed match with full results for recent results slide.

```typescript
{
  id: number;
  name: string;
  date: Date | string;
  matchType: string;
  status: string;
  winners: {
    (id, name, icon, color);
  }
  [];
  participants: {
    (id, name, icon, color);
  }
  [];
  kills: number;
  injuries: number;
  totalMoments: number;
}
```

---

### MatchCenterMatch

Match data for live display with events.

```typescript
{
  id: number
  name: string
  date: Date | string
  matchType: string
  status: "active" | "ended" | "scheduled" | "resolved"
  participants: {
    id: number
    warbandId: number
    name: string
    icon: string | null
    color: string | null
  }[]
  events: {
    id: number
    death: boolean
    injury: boolean
    warrior?: { warbandId: number } | null
    defender?: { warbandId: number } | null
  }[]
}
```

---

### WarbandSpotlightData

Leading warband information for spotlight component.

```typescript
{
  name: string;
  faction: string;
  icon: string | null;
  color: string | null;
  wins: number;
  treasury: number;
  warriorsAlive: number;
  eventsInflicted: number;
  eventsSuffered: number;
}
```

---

## Visual Design Theme

The display route uses a consistent "Sky Mord Sports News" broadcast theme:

### Color Palette

- **Primary Red:** `bg-red-600` - Breaking news, live indicators
- **Primary Blue:** `bg-blue-700` - Branding, accents
- **Dark Slate:** `bg-slate-950` - Backgrounds
- **Amber:** `bg-amber-500` - Winner highlights
- **Gradients:** Subtle overlays using red/blue/amber

### Typography

- **Font Weight:**
  - Black (900) for major headings
  - Bold (700) for emphasis
  - Semibold (600) for labels
- **Letter Spacing:**
  - `tracking-[0.25em]` to `tracking-[0.45em]` for uppercase labels
  - Creates professional broadcast look
- **Text Transform:**
  - UPPERCASE for labels and headers
  - Mixed case for content

### Layout

- **Card-based Design:** Rounded corners, shadows, borders
- **Grid Layouts:** Responsive 2-column and 3-column grids
- **Flexbox:** For header and footer layouts
- **Min-height Control:** Prevents content overflow and clipping

### Animations

- **Pulse:** Red "LIVE" indicators
- **Scan Lines:** Subtle background animation for retro TV effect
- **Glow:** Ambient gradient glow effect
- **Smooth Transitions:** Fade between carousel slides
- **Scroll:** News ticker horizontal scroll

---

## Data Flow

```
Route Loader (Server)
  ↓
Prefetch all campaign data
  ↓
Route Component (Client)
  ↓
Process data with hooks
  ↓
Build carousel items
  ↓
Render layout with components
  ↓
Components receive props
  ↓
Display updates (via TanStack Query)
```

### Real-time Updates

The display view automatically updates when:

- New matches are created
- Events are logged during matches
- Matches change status (active → ended)
- Warbands are updated (treasury, rating)

Updates are handled by **TanStack Query** cache invalidation and refetching.

---

## Usage Example

To view the broadcast display for campaign ID 1:

```
http://localhost:3000/display/1
```

This is typically displayed on a second screen or TV during campaign events for all players to see live updates, standings, and statistics in a fun, immersive broadcast format.

---

## Future Enhancements

Potential improvements to the display route:

1. **Sound Effects:** Add audio cues for events (kills, match start/end)
2. **Video/GIF Support:** Embed clips or reactions for major moments
3. **Player Cameras:** Show player reactions during live matches
4. **Chat/Commentary:** Live text feed from campaign organizer
5. **Voting/Polls:** Let spectators vote on MVP, best moment, etc.
6. **Historical Stats:** Compare current campaign to past campaigns
7. **Achievement Popups:** Toast notifications for major achievements
8. **Custom Themes:** Allow theme customization per campaign
9. **Mobile View:** Optimized layout for phone/tablet viewing
10. **Export/Share:** Generate shareable images of key moments

---

## Key Takeaways

✅ **Broadcast-Style Design** - Mimics sports network presentation  
✅ **Real-time Updates** - Shows live match progress and stats  
✅ **Highly Modular** - Each component has single responsibility  
✅ **Data-Driven** - All content generated from campaign data  
✅ **Responsive Layout** - Works on various screen sizes  
✅ **Accessible** - Keyboard controls, reduced motion support  
✅ **Performant** - Efficient rendering with React hooks and memoization  
✅ **Themeable** - Consistent design system with gradients and colors

The display route transforms raw campaign data into an engaging, professional broadcast experience that enhances the tabletop gaming session!
