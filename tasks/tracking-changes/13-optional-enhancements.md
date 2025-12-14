# Task 13: Optional Enhancements (Future Ideas)

## Status
⏳ Not Started

## Description
Ideas for future enhancements to the campaign progress tracking system.

## Dependencies
- Task 12: Test End-to-End Flow (complete and working)

## Enhancement Ideas

### 1. Individual Warband Detail Page
**Description:** Add progression charts to individual warband pages.

**Implementation:**
- Create route: `src/routes/$campaignId/warbands/$warbandId/progress.tsx`
- Use `getWarbandProgressionOptions` from campaign-history API
- Show detailed breakdown of that warband's progression
- Add annotations for key events (deaths, big wins, etc.)

**Benefits:**
- Focused view for a single warband
- Can show more detailed stats
- Easier to spot trends for specific warbands

---

### 2. Match Impact View
**Description:** Show how each match affected the standings.

**Implementation:**
- Create a "Match Impact" section on match detail pages
- Show before/after snapshots of warband stats
- Visualize who gained/lost the most from this match
- Use bar charts or delta indicators

**Benefits:**
- See immediate impact of each game
- Great for post-match discussion
- Helps identify high-impact matches

---

### 3. Comparative Analytics
**Description:** Add stat comparisons and insights.

**Features:**
- "Who gained the most gold this match?"
- "Biggest rating swing in a single match"
- "Most consistent performer"
- "Comeback story" (biggest improvement from last place)

**Implementation:**
- Create `src/lib/analytics.ts` with comparison functions
- Add an "Insights" section to progress page
- Use badges/highlights for interesting stats

---

### 4. Date Range Filtering
**Description:** Allow users to filter charts by date range.

**Implementation:**
- Add date picker component
- Filter state changes by selected range
- Show "Last 7 days", "Last match", "All time" presets
- Update charts based on filter

**Benefits:**
- Focus on recent activity
- Compare different campaign periods
- Better for long campaigns

---

### 5. Export Functionality
**Description:** Allow users to export data for external analysis.

**Features:**
- Export to CSV
- Export to JSON
- Copy chart data to clipboard
- Print-friendly view

**Implementation:**
- Add export buttons to progress page
- Use browser download API
- Format data appropriately

**Benefits:**
- External analysis in Excel/Google Sheets
- Backup of campaign data
- Sharing with players

---

### 6. Annotations and Milestones
**Description:** Mark important events on charts.

**Features:**
- Add vertical lines for major events
- Annotate "First death", "First 200 rating", etc.
- Allow custom annotations
- Show event markers on timeline

**Implementation:**
- Add `annotations` table to schema
- Use Recharts `ReferenceLine` or `ReferenceArea`
- Add UI to create/edit annotations

**Benefits:**
- Context for spikes/drops
- Tell the story of the campaign
- Memorable moments highlighted

---

### 7. Predictive Trends
**Description:** Simple trend analysis and predictions.

**Features:**
- Linear regression trendlines
- "At this rate, X will reach 200 rating by match 10"
- "Based on trends, Y is likely to win"

**Implementation:**
- Add simple math/stats functions
- Calculate trends from historical data
- Display with dotted lines on charts
- Add disclaimers (just for fun!)

**Benefits:**
- Fun speculation
- Helps set player goals
- Adds engagement

---

### 8. Scenario-Based Analytics
**Description:** Track which scenarios give the most gold/experience.

**Features:**
- Average gold per scenario type
- Experience distribution by scenario
- "Most profitable scenario" insights
- Scenario performance matrix

**Implementation:**
- Join state changes with match scenarios
- Aggregate by scenario type
- Create dedicated analytics page

**Benefits:**
- Strategic planning for future matches
- Balance scenario selection
- Interesting meta-analysis

---

### 9. Head-to-Head Historical Charts
**Description:** Show progression when two specific warbands face each other.

**Features:**
- Filter to matches between two warbands
- Show their relative progression
- Highlight direct confrontations
- "Rivalry timeline"

**Implementation:**
- Filter by match participants
- Create comparison charts
- Show win/loss indicators on timeline

**Benefits:**
- Track rivalries
- See competitive balance over time
- Narrative storytelling

---

### 10. Mobile-Optimized Charts
**Description:** Improve chart experience on mobile devices.

**Features:**
- Simplified charts for small screens
- Swipeable chart carousel
- Tap-optimized tooltips
- Vertical orientation support

**Implementation:**
- Use `useMediaQuery` hook
- Create mobile-specific chart variants
- Test on actual devices

**Benefits:**
- Better mobile UX
- Matches the "weekend campaign" use case
- Quick checks between games

---

## Prioritization

### High Value, Low Effort
1. Match Impact View (Task 2)
2. Individual Warband Detail Page (Task 1)
3. Date Range Filtering (Task 4)

### High Value, Medium Effort
4. Comparative Analytics (Task 3)
5. Annotations and Milestones (Task 6)
6. Scenario-Based Analytics (Task 8)

### Medium Value, Medium Effort
7. Export Functionality (Task 5)
8. Head-to-Head Historical Charts (Task 9)

### Lower Priority
9. Predictive Trends (Task 7) - fun but not essential
10. Mobile-Optimized Charts (Task 10) - depends on usage patterns

## Notes
- These are all optional and can be implemented incrementally
- Each can be a separate task/PR
- Consider user feedback to prioritize
- Some ideas might not fit your specific use case
