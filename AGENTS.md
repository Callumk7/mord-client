# Claude Code Instructions for Mord Stats

## Project Overview

**Mord Stats** is a web-based companion app for tracking a weekend Mordheim tabletop wargaming campaign. The app focuses on ease of use and fun statistics tracking rather than full roster management.

**Key Design Goals:**
- Quick match recording (< 2 minutes per game)
- Sports-style leaderboards and rankings
- Track individual warrior achievements and warband progression
- Support for 1v1, 2v2, and battle royale matches
- Real-time campaign timeline and memorable moments
- No authentication required - simple warband selector

**Domain Context:**
- Mordheim is a tabletop wargame where players control warbands (5-6 in this campaign)
- Warriors can get kills, injuries, experience, and eventually die
- Matches involve 2-4 warbands with various formats (competitive, team battles, free-for-all)
- Campaign tracks progression over a weekend with multiple games
- See `docs/overview.md` for complete feature requirements

## Technology Stack

### Core Framework
- **React 19.2.0** - UI framework
- **TypeScript 5.7.2** - Type safety (strict mode enabled)
- **TanStack Start** - SSR framework built on TanStack Router
- **Vite 7** - Build tool and dev server
- **Nitro** - SSR server

### Data & State Management
- **Drizzle ORM 0.39.0** - Type-safe database ORM
- **PostgreSQL** - Primary database (connection via `pg` driver)
- **TanStack Query** - Server state management and caching
- **TanStack DB** - Client-side database integration
- **Zod 4.0** - Runtime validation and schema parsing

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library (New York style)
- **Base UI Components** - Headless UI primitives. NOTE: IT IS IMPORTANT TO NOT USE THE RADIX API. Please read the Components section below for more information. 
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **next-themes** - Dark mode support
- **Sonner** - Toast notifications

### Development Tools
- **Biome** - Fast linter and formatter (replaces ESLint + Prettier)
- **Vitest** - Unit testing framework
- **Testing Library** - React testing utilities
- **TanStack Devtools** - React Query and Router devtools
- **pnpm** - Fast, efficient package manager

### Components (Differences from Radix)
Radix UI and Base UI are both excellent libraries for building web applications. However, they differ in their approach to component architecture. This guide will help you migrate your shadcn/ui components from Radix UI to Base UI.

<Steps>
  <Step>
    ### `asChild` to `render` Prop

    Radix UI uses an `asChild` prop, while Base UI uses a `render` prop.

    In Radix UI, the `Slot` component lets you implement an `asChild` prop.

    ```tsx
    import { Slot } from 'radix-ui';

    function Button({ asChild, ...props }) {
      const Comp = asChild ? Slot.Root : 'button';
      return <Comp {...props} />;
    }

    // Usage
    <Button asChild>
      <a href="/contact">Contact</a>
    </Button>
    ```

    In Base UI, `useRender` lets you implement a render prop. The example below shows the equivalent implementation to the Radix example above.

    ```tsx
    import { useRender } from '@base-ui-components/react/use-render';

    function Button({ render = <button />, ...props }) {
      return useRender({ render, props });
    }

    // Usage 1
    <Button render={<a href="/contact">Contact</a>} />

    // Usage 2
    <Button render={<a href="/contact"/>}>Contact</Button>
    ```
  </Step>
  <Step>
    ### Positioning Content Popups

    In Radix UI, for components such as `Select`, `Tooltip`, `Popover`, `Dropdown Menu`, `HoverCard`, etc., you can position or align the content popup by passing props such as `side` or `align` to the `Content` component.

    ```tsx
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>

      // [!code highlight]
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    ```

    With Base UI, to position or align the content popup by passing props such as `side` or `align`, you'll need to use the positioner component instead of the content component. This is a required component, and your `Content` component should be wrapped with `Positioner`. The example below shows the equivalent implementation to the Radix example above.

    ```tsx
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Open
      </DropdownMenuTrigger>

      // [!code highlight]
      <DropdownMenuPositioner side="left" align="start">
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuContent>
      // [!code highlight]
      </DropdownMenuPositioner>
    </DropdownMenu>
    ```
  </Step>
  <Step>
    ### Using Labels in Popups

    In Radix UI, you can use the `Label` component to add a label to the popup content. It can be used anywhere in the popup content.

    ```tsx
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        // [!code highlight]
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    ```

    With Base UI, you must ensure that the label is wrapped with the `Group` component. The example below shows the equivalent implementation to the Radix example above.

    ```tsx
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Open
      </DropdownMenuTrigger>

      <DropdownMenuPositioner>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            // [!code highlight]
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenu>
    ```
  </Step>
  <Step>
    ### Component Props

    Radix UI and Base UI have different prop names for the same components. You'll need to ensure that you're using the correct prop names for each component when migrating. We have a migration guide for each component to help you with this process.

  </Step>
</Steps>

## Project Structure

```
mord-client/
├── src/
│   ├── routes/                 # File-based routing (TanStack Router)
│   │   ├── __root.tsx          # Root layout component
│   │   ├── index.tsx           # Homepage route
│   │   ├── $campaign/          # Dynamic campaign routes
│   │   └── demo/               # Demo/example pages
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── db/
│   │   ├── schema.ts           # Drizzle database schema
│   │   └── index.ts            # Database connection
│   ├── lib/                    # Utility functions
│   ├── types/                  # TypeScript type definitions
│   ├── styles.css              # Global Tailwind styles
│   └── routeTree.gen.ts        # Auto-generated (DO NOT EDIT)
├── drizzle/                    # Database migrations
├── public/                     # Static assets
├── docs/                       # Project documentation
│   └── overview.md             # Feature requirements
├── drizzle.config.ts           # Drizzle ORM configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
├── biome.json                  # Biome linter/formatter config
├── components.json             # shadcn/ui configuration
└── package.json                # Dependencies and scripts
```

### Path Aliases

The project uses path aliases configured in `tsconfig.json`:
- `~/` maps to `./src/`
- Example: `import { Button } from '~/components/ui/button'`

## Code Conventions

### Biome Formatting Rules
- **Indentation:** TABS (not spaces) - this is critical
- **Quotes:** Double quotes for strings
- **Line Width:** Default (80 characters)
- **Auto-organize imports:** Enabled

### TypeScript
- Strict mode enabled (always type your code)
- Use `noUnusedLocals` and `noUnusedParameters`
- Prefer explicit types over `any`
- Use Zod schemas for runtime validation
- Database types are inferred from Drizzle schema

### Component Patterns
- Use functional components with hooks
- Prefer composition over complex component hierarchies
- Use TypeScript interfaces for props
- Export component types for reusability

### File Naming
- React components: PascalCase (e.g., `MatchEntry.tsx`)
- Utilities/hooks: camelCase (e.g., `useMatchData.ts`)
- Route files: kebab-case or TanStack Router conventions
- Types: PascalCase (e.g., `MatchType.ts`)

## Database Schema Overview

The database schema (`src/db/schema.ts`) includes these tables:

- **campaigns** - Campaign metadata (name, dates)
- **warbands** - Warband info (name, faction, rating, treasury)
- **warriors** - Individual warriors (stats, equipment, alive status)
- **matches** - Match records (type, scenario, result)
- **matchParticipants** - Tracks which warbands played in each match
- **teams** - Team formations for 2v2 matches
- **teamMembers** - Warband membership in teams
- **placements** - Final standings for battle royale matches
- **casualties** - Individual warrior casualties during matches

All tables have:
- Serial primary keys (`id`)
- `createdAt` and `updatedAt` timestamps (most tables)
- Foreign key relationships with proper references

## Development Workflow

### Starting Development

```bash
# Install dependencies
pnpm install

# Start dev server (runs on port 3000)
pnpm dev

# Run database migrations
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Database Management

```bash
# Generate migrations after schema changes
pnpm db:generate

# Push schema changes directly (development)
pnpm db:push

# Pull schema from database
pnpm db:pull

# Run migrations (production)
pnpm db:migrate
```

**Important:** Always update `src/db/schema.ts` first, then ask the user to handle the migration.

### Code Quality

```bash
# Run linter
pnpm lint

# Run typecheck
pnpm typecheck

# Format code
pnpm format

# Check code (lint + format)
pnpm check

# Run tests
pnpm test
```
Run the linter and type check yourself and address feedback. You can inform the user when they should format the final code.

### Building for Production

```bash
# Build for production
pnpm build

# Preview production build
pnpm serve
```

## Adding New Features

### Adding a New Route

TanStack Router uses file-based routing. Create files in `src/routes/`:

```tsx
// src/routes/leaderboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  return <div>Leaderboard content</div>
}
```

After creating a route file, TanStack Router will regenerate `src/routeTree.gen.ts` automatically.

### Adding a New UI Component

Use the shadcn/ui CLI to add pre-built components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
```

Components are added to `src/components/ui/` and can be customized.

### Creating Custom Components

```tsx
// src/components/MatchCard.tsx
import type { Match } from '~/db/schema'
import { Card } from '~/components/ui/card'

interface MatchCardProps {
  match: Match
  onClick?: () => void
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <Card onClick={onClick}>
      {/* Component content */}
    </Card>
  )
}
```

### Adding Database Queries

Use Drizzle ORM with TanStack Query for data fetching:

```tsx
import { useQuery } from '@tanstack/react-query'
import { db } from '~/db'
import { warbands } from '~/db/schema'

export function useWarbands(campaignId: number) {
  return useQuery({
    queryKey: ['warbands', campaignId],
    queryFn: async () => {
      return db
        .select()
        .from(warbands)
        .where(eq(warbands.campaignId, campaignId))
    },
  })
}
```

### Modifying Database Schema

1. Edit `src/db/schema.ts` to add/modify tables
2. Run `pnpm db:push` to sync changes to database
3. For production, use `pnpm db:generate` to create migrations

Example schema addition:

```typescript
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  playerCount: integer("player_count").notNull(),
  specialRules: jsonb("special_rules").$type<string[]>(),
})
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mord_stats
```

This file is gitignored and should never be committed.

## Testing Guidelines

Write tests using Vitest and Testing Library:

```tsx
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MatchCard } from '~/components/MatchCard'

test('renders match card with warband names', () => {
  const match = { /* mock match data */ }
  render(<MatchCard match={match} />)
  expect(screen.getByText('Warband Name')).toBeDefined()
})
```

Run tests with:
```bash
pnpm test
```

## Common Patterns

### Loading States

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['warbands'],
  queryFn: fetchWarbands,
})

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>
return <div>{/* Render data */}</div>
```

### Form Validation with Zod

```tsx
import { z } from 'zod'

const matchSchema = z.object({
  matchNumber: z.number().positive(),
  date: z.date(),
  matchType: z.enum(['1v1', '2v2', 'battle_royale']),
  winnerId: z.number(),
})

type MatchInput = z.infer<typeof matchSchema>

function validateMatch(data: unknown): MatchInput {
  return matchSchema.parse(data)
}
```

### Server Functions (TanStack Start)

```tsx
// src/routes/api/matches.ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '~/db'
import { matches } from '~/db/schema'

export const getMatches = createServerFn('GET', async () => {
  return db.select().from(matches)
})
```

## Important Notes for Claude Code

### When Editing Code

1. **Always use TABS for indentation** - Biome is configured for tabs
2. **Use double quotes** for string literals
3. **Do not edit** `src/routeTree.gen.ts` - it's auto-generated
4. **Do not edit** `src/styles.css` unless adding new Tailwind utilities
5. **Check types** - ensure TypeScript strict mode compliance
6. **Run Biome** after significant changes: `pnpm check`

### When Adding Features

1. **Check `docs/overview.md`** for feature requirements and context
2. **Consider mobile/tablet UX** - this app is designed for quick entry
3. **Think about the 2-minute goal** for match recording
4. **Support all match types** - 1v1, 2v2, and battle royale
5. **Track everything** - warriors, warbands, matches, casualties
6. **Make it fun** - leaderboards, achievements, memorable moments

### Database Changes

1. **Always update schema.ts first** before running migrations
2. **Use transactions** for complex multi-table operations
3. **Consider performance** - add indexes for frequently queried fields
4. **Preserve data integrity** - proper foreign key relationships

### UI Components

1. **Use shadcn/ui components** as building blocks
2. **Maintain consistent spacing** - use Tailwind's spacing scale
3. **Support dark mode** - use CSS variables from Tailwind config
4. **Keep it responsive** - mobile-first approach
5. **Use Lucide icons** for consistency

### Performance Considerations

1. **Use TanStack Query caching** - avoid redundant fetches
2. **Optimize database queries** - use `select` with specific fields
3. **Lazy load routes** - TanStack Router handles this automatically
4. **Debounce user input** for search/filter operations

### Testing Strategy

1. **Test critical paths** - match recording, warband creation
2. **Mock database calls** in component tests
3. **Test edge cases** - empty states, error handling
4. **Integration tests** for complex flows

## Useful Commands Reference

```bash
# Development
pnpm dev                  # Start dev server (localhost:3000)
pnpm build               # Build for production
pnpm serve               # Preview production build

# Database
pnpm db:generate         # Generate migrations
pnpm db:migrate          # Run migrations
pnpm db:push            # Push schema changes (dev)
pnpm db:pull            # Pull schema from database
pnpm db:studio          # Open Drizzle Studio GUI

# Code Quality
pnpm lint               # Run Biome linter
pnpm format             # Format code with Biome
pnpm check              # Lint + format check
pnpm test               # Run Vitest tests

# Package Management
pnpm install            # Install dependencies
pnpm add <package>      # Add new dependency
pnpm add -D <package>   # Add dev dependency
```

## Additional Resources

- **Project Overview:** `docs/overview.md`
- **TanStack Start Docs:** https://tanstack.com/start
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **shadcn/ui Components:** https://ui.shadcn.com
- **Tailwind CSS v4:** https://tailwindcss.com
- **Biome:** https://biomejs.dev

## Quick Start Checklist

When starting work on this project:

1. Read `docs/overview.md` for full feature context
2. Review `src/db/schema.ts` for data model
3. Check existing routes in `src/routes/` for patterns
4. Ensure `.env.local` has valid `DATABASE_URL`
5. Run `pnpm install` and `pnpm dev`
6. Open Drizzle Studio (`pnpm db:studio`) to inspect data
7. Use TanStack Router Devtools (enabled in dev mode)
8. Follow Biome conventions (tabs, double quotes)

---

**Remember:** This is a weekend campaign tracker focused on fun stats and quick entry. Keep the UX simple, fast, and enjoyable. The goal is to enhance the gaming experience, not burden it with complex data entry.
