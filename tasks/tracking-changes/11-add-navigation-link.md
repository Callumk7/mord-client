# Task 11: Add Navigation Link to Progress Page

## Status
✅ Completed

## Description
Add a navigation link in the header or campaign menu to access the new Campaign Progress page.

## Dependencies
- Task 10: Create Campaign Progress Page with Charts

## Files to Modify
- `src/components/header.tsx` (or wherever campaign navigation exists)
- Or create a navigation menu in `src/routes/$campaignId/route.tsx`

## Implementation Details

### Option A: Add to Header Component

If you have a header component with navigation, add a link:

```typescript
import { Link } from "~/components/ui/link";

// Inside your navigation component
<Link
	to="/$campaignId/progress"
	params={{ campaignId }}
	activeProps={{ className: "font-bold" }}
>
	Progress
</Link>
```

### Option B: Add to Campaign Layout

If you have a campaign-specific layout in `src/routes/$campaignId/route.tsx`, you can add a tab navigation:

```typescript
import { Link, Outlet } from "@tanstack/react-router";

export function CampaignLayout() {
	const { campaignId } = Route.useParams();

	return (
		<div>
			{/* Tab Navigation */}
			<nav className="border-b mb-6">
				<div className="flex gap-6 px-6">
					<Link
						to="/$campaignId"
						params={{ campaignId }}
						activeProps={{ className: "border-b-2 border-primary" }}
						className="py-4 px-2 hover:text-foreground transition-colors"
					>
						Overview
					</Link>
					<Link
						to="/$campaignId/progress"
						params={{ campaignId }}
						activeProps={{ className: "border-b-2 border-primary" }}
						className="py-4 px-2 hover:text-foreground transition-colors"
					>
						Progress
					</Link>
					<Link
						to="/$campaignId/matches"
						params={{ campaignId }}
						activeProps={{ className: "border-b-2 border-primary" }}
						className="py-4 px-2 hover:text-foreground transition-colors"
					>
						Matches
					</Link>
					<Link
						to="/$campaignId/warbands"
						params={{ campaignId }}
						activeProps={{ className: "border-b-2 border-primary" }}
						className="py-4 px-2 hover:text-foreground transition-colors"
					>
						Warbands
					</Link>
				</div>
			</nav>

			<Outlet />
		</div>
	);
}
```

### Option C: Add Icon to Campaign Dashboard

Add a card or button on the main campaign page:

```typescript
import { TrendingUp } from "lucide-react";
import { Link } from "~/components/ui/link";
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";

// On the campaign dashboard
<Link to="/$campaignId/progress" params={{ campaignId }}>
	<Card className="hover:bg-muted/50 transition-colors cursor-pointer">
		<CardHeader>
			<div className="flex items-center gap-3">
				<TrendingUp className="h-8 w-8 text-primary" />
				<div>
					<CardTitle>Campaign Progress</CardTitle>
					<CardDescription>
						View charts and historical data
					</CardDescription>
				</div>
			</div>
		</CardHeader>
	</Card>
</Link>
```

## Testing
After implementing:
1. Navigate to a campaign
2. Click the new "Progress" link
3. Verify it navigates to the progress page
4. Verify active states work correctly
5. Test back button and navigation flow

## Notes
- Choose the navigation style that fits your app's UX
- Make sure the link is accessible from relevant pages
- Consider adding an icon (e.g., TrendingUp from lucide-react)
- Ensure active state styling works with your theme

## Implementation
Added a "Progress" navigation link to the main header component:
- Location: `src/components/header.tsx`
- Positioned between "Timeline" and "Admin" in the main navigation
- Includes TrendingUp icon from lucide-react for visual clarity
- Uses the same styling pattern as other navigation items
- Links to `/$campaignId/progress` route
- Active state will be handled automatically by TanStack Router
