# Mord Stats

A web-based companion app for tracking weekend Mordheim tabletop wargaming campaigns. Built for ease of use and fun statistics tracking rather than full roster management.

## Overview

Mord Stats is designed to enhance a weekend Mordheim campaign experience by providing:

- **Quick Match Recording** - Log game results in under 2 minutes
- **Sports-Style Leaderboards** - Track warband and warrior rankings
- **Event Timeline** - Record memorable moments and career histories
- **Display Mode** - Real-time stats display for external screens
- **Multiple Victory Paths** - Different ways to "win" the weekend campaign

**Key Features:**
- Support for 1v1, 2v2, and battle royale matches
- Individual warrior stats (kills, injuries, experience)
- Warband progression tracking (rating, treasury, win/loss records)
- Real-time leaderboards and breaking news updates
- No authentication required - simple warband selector

See [docs/overview.md](docs/overview.md) for complete feature requirements.

## How We Track Stats with Events and Delta Snapshots

Mord Stats uses an **event-driven architecture with delta snapshots** to track stats efficiently and maintain data integrity.

### Architecture Overview

Stats are stored in two places:
1. **Denormalized Stats** - Cached in `warriors` and `warbands` tables for fast reads
2. **Source Events** - The true source of truth stored in `events`, `matches`, and `warbandStateChanges` tables

### Event-Driven Updates

When game events occur:

1. **Events are created** - Each knock down, moment, or outcome is recorded as an event
2. **Delta snapshots are calculated** - The change to warrior/warband stats is determined
3. **Stats are updated atomically** - Both the event and stat updates happen in a database transaction
4. **State changes are logged** - Changes to warband state (rating, treasury) are recorded as snapshots

### Example Flow: Recording a Knock Down

```typescript
// 1. Event is created
await db.insert(events).values({
  type: "knock_down",
  warriorId: attackerId,
  defenderId: victimId,
  matchId: matchId,
  resolved: false
});

// 2. When resolved, stats are updated
await db.transaction(async (tx) => {
  // Update event as resolved
  await tx.update(events)
    .set({ resolved: true, injury: true })
    .where(eq(events.id, eventId));
  
  // Apply delta to attacker
  await tx.update(warriors)
    .set({ injuriesCaused: sql`injuries_caused + 1` })
    .where(eq(warriors.id, attackerId));
  
  // Apply delta to defender
  await tx.update(warriors)
    .set({ injuriesReceived: sql`injuries_received + 1` })
    .where(eq(warriors.id, victimId));
});
```

### Warband State Changes

Warband stats (rating, treasury, experience) are tracked using **delta snapshots** in the `warbandStateChanges` table:

```typescript
await db.insert(warbandStateChanges).values({
  warbandId: warbandId,
  matchId: matchId,
  ratingDelta: +5,
  treasuryDelta: +20,
  experienceDelta: +3,
  timestamp: new Date()
});

// Update warband's current state
await db.update(warbands)
  .set({
    rating: sql`rating + 5`,
    treasury: sql`treasury + 20`,
    experience: sql`experience + 3`
  })
  .where(eq(warbands.id, warbandId));
```

This approach provides:
- **Fast reads** - Leaderboards query pre-calculated stats
- **Data integrity** - Transaction-based updates ensure consistency
- **Audit trail** - State changes are logged for history/debugging
- **Flexibility** - Can recalculate stats from events if needed

See [docs/investigations/stats-tracking-data-flow.md](docs/investigations/stats-tracking-data-flow.md) for detailed implementation notes.

## Display Route

The **display route** (`/display/$campaignId`) is designed for viewing campaign stats on an external screen during the gaming weekend.

### Features

The display route provides real-time updates with:

1. **Match Center** - Current live matches with scores
2. **Recent Results** - Latest completed games with outcomes
3. **News Ticker** - Breaking news style updates for major events
   - "Snikch the Assassin just claimed his 5th kill!"
   - "The Reiklanders are on a 3-game winning streak!"
4. **Leaderboards** - Top warbands and warriors across categories
5. **Timeline View** - Chronological campaign history
6. **Casualty Reports** - Recent warrior deaths and injuries
7. **Stat Carousel** - Rotating stats and fun facts

### Accessing Display Mode

Navigate to `/display` to see all campaigns, or directly to `/display/$campaignId` for a specific campaign:

```
http://localhost:3000/display/1
```

### Display Components

Display-specific components are located in `src/components/events/display/`:
- `broadcast-header.tsx` - Campaign header with title and date
- `live-score-card.tsx` - Active match display
- `recent-results-slide.tsx` - Recent match outcomes
- `news-ticker.tsx` - Scrolling news updates
- `casualty-report.tsx` - Injury and death notifications
- `timeline-view.tsx` - Full campaign timeline
- `stat-carousel.tsx` - Rotating statistics display

### Real-Time Updates

The display route uses TanStack Query with polling to provide near-real-time updates:

```typescript
const { data } = useBroadcastData(Number(campaignId), {
  refetchInterval: 5000, // Update every 5 seconds
});
```

See `src/hooks/use-broadcast-data.ts` for the data fetching implementation.

## Running the App Locally

### Prerequisites

- **Node.js 18+** (recommended: use asdf or nvm)
- **pnpm** (fast package manager)
- **PostgreSQL** database

### Setup

1. **Clone the repository** (if applicable)

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/mord_stats
   ```

4. **Set up the database:**
   
   Create the PostgreSQL database:
   ```bash
   createdb mord_stats
   ```
   
   Push the schema to the database:
   ```bash
   pnpm db:push
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   
   The app will be available at `http://localhost:3000`

### Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm serve

# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format

# Check code (lint + format)
pnpm check

# Type check
pnpm typecheck

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Database Management

```bash
# Push schema changes to database (development)
pnpm db:push

# Generate migrations after schema changes
pnpm db:generate

# Run migrations (production)
pnpm db:migrate

# Pull schema from database
pnpm db:pull

# Open Drizzle Studio (visual database editor)
pnpm db:studio
```

## Development Workflow

### Branch Strategy

**All development must happen on a separate branch.** Do not commit directly to `main`.

### Creating a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Conventions

- `feature/` - New features (e.g., `feature/add-scenario-generator`)
- `fix/` - Bug fixes (e.g., `fix/leaderboard-sorting`)
- `refactor/` - Code refactoring (e.g., `refactor/event-mutations`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)

### Pull Request Requirements

1. **Create a PR** when your feature is ready for review
2. **Provide a clear description** of changes and why they're needed
3. **Ensure all tests pass** (`pnpm test`)
4. **Ensure code is formatted** (`pnpm check`)
5. **Request review** from team members
6. **Address feedback** and make requested changes
7. **Squash commits** if needed to keep history clean

### PR Checklist

Before submitting a PR, verify:

- [ ] Code follows project conventions (tabs, double quotes, TypeScript strict mode)
- [ ] All tests pass (`pnpm test`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] Database schema changes have migrations
- [ ] New features have tests
- [ ] README or docs updated if needed

## Using the Seed Scripts

Seed scripts populate the database with test data for development and testing.

### Available Seed Scripts

#### 1. Full Seed Script (`scripts/seed.ts`)

Creates a complete campaign with matches, events, and casualties:

```bash
pnpm tsx scripts/seed.ts
```

**What it creates:**
- 1 campaign ("Weekend of Shadows")
- 6 warbands (one per faction)
- 20-30 warriors (distributed across warbands)
- 16 matches (various formats: 1v1, 2v2, battle royale)
- 80-192 events (knock downs and moments)
- Warriors with realistic stats (kills, injuries, deaths)
- Match participants and winners

**Use this when:**
- You want to test the full app with realistic data
- Testing leaderboards and statistics display
- Developing display mode features

#### 2. Campaign-Only Seed Script (`scripts/seed-campaign.ts`)

Creates just a campaign with warbands and warriors (no matches):

```bash
pnpm tsx scripts/seed-campaign.ts
```

**What it creates:**
- 1 campaign (randomly generated name)
- 9 warbands (one per faction)
- 40-70 warriors (distributed across warbands)
- Warriors with equipment and skills
- Initial warband ratings calculated

**Use this when:**
- Testing warband/warrior creation flows
- Starting a fresh campaign for manual match recording
- Testing match creation without existing data

### Seed Script Features

Both scripts include:
- **Random name generation** for campaigns and warbands
- **Faction-specific names** for warriors
- **Random equipment** from weapon/armor pools
- **Random skills** for heroes
- **Automatic rating calculation** for warbands

### Clearing the Database

Both seed scripts automatically clear existing data before seeding:

```typescript
// Data is cleared in reverse order of dependencies
await db.delete(events);
await db.delete(warbandStateChanges);
await db.delete(matchWinners);
await db.delete(matchParticipants);
await db.delete(matches);
await db.delete(warriors);
await db.delete(warbands);
await db.delete(campaigns);
```

**Warning:** Running a seed script will delete ALL existing data.

### Customizing Seed Data

You can modify the seed scripts to create custom scenarios:

**Example: Change the number of warbands**
```typescript
// In seed-campaign.ts
const warbandData = factionList.map((faction, index) => ({
  // ... warband properties
}));

// Limit to first 5 factions
const warbandData = factionList.slice(0, 5).map((faction, index) => ({
  // ... warband properties
}));
```

**Example: Guarantee specific events**
```typescript
// In seed.ts, force a death event
const shouldForceDeathEvent = 
  guaranteedDeathCount < targetDeaths && 
  isKnockDown && 
  i === 0; // First event of the match
```

### Verifying Seed Data

After running a seed script, verify the data:

1. **Check the console output:**
   ```
   🎉 Database seeding completed successfully!
   
   📊 Summary:
      Campaign: Weekend of Shadows
      Warbands: 6
      Warriors: 25 (2 dead)
      Matches: 16
      Events: 128
   ```

2. **Open Drizzle Studio:**
   ```bash
   pnpm db:studio
   ```
   
   Browse tables to verify data structure and relationships.

3. **Visit the app:**
   ```bash
   pnpm dev
   ```
   
   Navigate to the campaign page to see leaderboards and stats.

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Start** - SSR framework
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Biome** - Linter and formatter
- **Vitest** - Testing framework

See [AGENTS.md](AGENTS.md) for complete development documentation.

## Project Structure

```
mord-client/
├── src/
│   ├── routes/              # File-based routing
│   ├── components/          # React components
│   ├── db/                  # Database schema and connection
│   ├── lib/                 # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── api/                 # Server functions
│   └── types/               # TypeScript types
├── scripts/                 # Seed and utility scripts
├── docs/                    # Project documentation
└── public/                  # Static assets
```

## Learn More

- [Project Overview](docs/overview.md) - Complete feature requirements
- [TanStack Start Docs](https://tanstack.com/start)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [shadcn/ui Components](https://ui.shadcn.com)
