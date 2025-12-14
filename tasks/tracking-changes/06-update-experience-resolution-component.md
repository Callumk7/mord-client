# Task 06: Update Experience Resolution Component to Pass matchId

## Status
Completed

## Description
Update the `PostMatchExperienceResolution` component to pass `matchId` to the API mutation.

## Dependencies
- Task 04: Update Experience Resolution API to Record State Changes

## Files to Modify
- `src/components/matches/post-match-experience-resolution.tsx`

## Implementation Details

### 1. Update the `ExperienceCard` component's `handleUpdateExperience` function

Find the function around line 78 and update it:

```typescript
const handleUpdateExperience = (warbandId: number, experience: number) => {
	experienceMutation.mutate(
		{
			warbandId,
			matchId, // ADD THIS - it's already available from props
			experience,
			description: `Experience from ${match.name}`, // OPTIONAL: Add context
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: getMatchDetailsOptions(matchId).queryKey,
				});
				setExperienceValue("");
				setError(null);
			},
		},
	);
};
```

### 2. Access match name for better descriptions

Add `matchName` prop to `ExperienceCard`:

```typescript
interface ExperienceCardProps {
	warband: Warband;
	matchId: number;
	matchName?: string; // OPTIONAL: Add this for better descriptions
}

function ExperienceCard({ warband, matchId, matchName }: ExperienceCardProps) {
	// ... existing code ...
	
	const handleUpdateExperience = (warbandId: number, experience: number) => {
		experienceMutation.mutate(
			{
				warbandId,
				matchId,
				experience,
				description: matchName ? `Experience from ${matchName}` : undefined,
			},
			// ... rest of mutation
		);
	};
	
	// ... rest of component
}
```

### 3. Update parent component to pass matchName

In `PostMatchExperienceResolution` function, update the mapping:

```typescript
<div className="space-y-4">
	{participants.map((warband) => (
		<ExperienceCard
			key={warband.id}
			warband={warband}
			matchId={matchId}
			matchName={match.name} // ADD THIS
		/>
	))}
</div>
```

## Testing
After implementing:
1. Run `pnpm typecheck` to check for TypeScript errors
2. Test the experience resolution flow in the UI
3. Check Drizzle Studio to see state changes with descriptions
4. Verify that rating changes are being calculated and recorded

## Notes
- The `matchId` is already available in the component props
- Adding `matchName` to descriptions makes the history more readable
- Experience changes should automatically trigger rating recalculation
