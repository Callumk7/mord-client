# Task 05: Update Gold Resolution Component to Pass matchId

## Status
Completed

## Description
Update the `PostMatchGoldResolution` component to pass `matchId` to the API mutation.

## Dependencies
- Task 03: Update Gold Resolution API to Record State Changes

## Files to Modify
- `src/components/matches/post-match-gold-resolution.tsx`

## Implementation Details

### 1. Update the `GoldCard` component's `handleUpdateGold` function

Find the function around line 74 and update it:

```typescript
const handleUpdateGold = (warbandId: number, gold: number) => {
	goldMutation.mutate(
		{
			warbandId,
			matchId, // ADD THIS - it's already available from props
			gold,
			description: `Gold from ${match.name}`, // OPTIONAL: Add context
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getMatchDetailsOptions(matchId).queryKey,
				});
				setGoldValue("");
				setError(null);
			},
		},
	);
};
```

### 2. Access match name for better descriptions

The `match` object is already available from the `useQuery` hook in the parent component. You can pass it down or access it in the `GoldCard`:

```typescript
interface GoldCardProps {
	warband: Warband;
	matchId: number;
	matchName?: string; // OPTIONAL: Add this for better descriptions
}

function GoldCard({ warband, matchId, matchName }: GoldCardProps) {
	// ... existing code ...
	
	const handleUpdateGold = (warbandId: number, gold: number) => {
		goldMutation.mutate(
			{
				warbandId,
				matchId,
				gold,
				description: matchName ? `Gold from ${matchName}` : undefined,
			},
			// ... rest of mutation
		);
	};
	
	// ... rest of component
}
```

### 3. Update parent component to pass matchName

In `PostMatchGoldResolution` function, update the mapping:

```typescript
<div className="space-y-4">
	{match.participants.map((p) => (
		<GoldCard
			key={p.warband.id}
			warband={p.warband}
			matchId={matchId}
			matchName={match.name} // ADD THIS
		/>
	))}
</div>
```

## Testing
After implementing:
1. Run `pnpm typecheck` to check for TypeScript errors
2. Test the gold resolution flow in the UI
3. Check Drizzle Studio to see state changes with descriptions

## Notes
- The `matchId` is already available in the component props
- Adding `matchName` to descriptions makes the history more readable
- This change is backward compatible if description is optional
