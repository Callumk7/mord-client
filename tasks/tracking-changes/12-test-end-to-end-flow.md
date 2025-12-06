# Task 12: Test End-to-End Flow

## Status
⏳ Not Started

## Description
Test the complete flow of recording state changes and viewing them in charts.

## Dependencies
- All previous tasks (1-11)

## Testing Checklist

### 1. Database Verification
- [ ] Open Drizzle Studio: `pnpm db:studio`
- [ ] Verify `warband_state_changes` table exists
- [ ] Check table has correct columns and foreign keys

### 2. Post-Match Gold Resolution
- [ ] Create a test match
- [ ] Add participants
- [ ] End the match
- [ ] Go to post-match resolution
- [ ] Add gold to a warband
- [ ] Verify in Drizzle Studio:
  - [ ] `warbands.treasury` updated
  - [ ] New record in `warband_state_changes`
  - [ ] Record has correct `treasuryDelta` and `treasuryAfter`
  - [ ] Record has `changeType = 'post_match_gold'`
  - [ ] Record has description

### 3. Post-Match Experience Resolution
- [ ] Continue from previous match
- [ ] Add experience to a warband
- [ ] Verify in Drizzle Studio:
  - [ ] `warbands.experience` updated
  - [ ] `warbands.rating` updated (if it changed)
  - [ ] New record in `warband_state_changes`
  - [ ] Record has correct `experienceDelta` and `experienceAfter`
  - [ ] Record has correct `ratingDelta` and `ratingAfter`
  - [ ] Record has `changeType = 'post_match_experience'`

### 4. Campaign Progress Page
- [ ] Navigate to campaign progress page
- [ ] Verify all three charts display:
  - [ ] Rating Progression
  - [ ] Treasury Progression
  - [ ] Experience Progression
- [ ] Verify each warband appears as separate line
- [ ] Verify warband colors match database colors
- [ ] Verify tooltips show on hover
- [ ] Verify legend displays warband names
- [ ] Verify x-axis shows dates correctly
- [ ] Verify y-axis scales appropriately

### 5. Multiple Matches Flow
- [ ] Create and resolve 2-3 more matches
- [ ] Add varying amounts of gold and experience
- [ ] Navigate to progress page
- [ ] Verify charts show progression over time
- [ ] Verify timeline flows left to right chronologically
- [ ] Verify data points match what you entered

### 6. Dark Mode Testing
- [ ] Toggle dark mode
- [ ] Verify charts are readable
- [ ] Verify tooltips have correct colors
- [ ] Verify grid lines are visible but subtle
- [ ] Verify text labels are readable

### 7. Edge Cases
- [ ] Test with no data (empty campaign)
- [ ] Verify empty state message displays
- [ ] Test with single warband
- [ ] Test with multiple warbands (5-6)
- [ ] Test with negative values (if possible)
- [ ] Test with very large numbers

### 8. Type Safety
- [ ] Run `pnpm typecheck`
- [ ] Verify no TypeScript errors
- [ ] Check IDE autocomplete works for new functions

### 9. Performance
- [ ] Check page load time with ~20 state changes
- [ ] Verify charts render smoothly
- [ ] Check for console errors or warnings

### 10. User Experience
- [ ] Navigation is intuitive
- [ ] Charts are easy to understand
- [ ] Colors are distinguishable
- [ ] Mobile responsive (if applicable)

## Issues to Document

If you find any issues during testing, document them with:
- What you expected
- What actually happened
- Steps to reproduce
- Screenshots if helpful

## Success Criteria

✅ All checklist items pass
✅ No console errors
✅ TypeScript compiles without errors
✅ Charts accurately reflect database state
✅ User flow feels natural and intuitive

## Next Steps After Testing

Once testing is complete:
1. Document any bugs found and fix them
2. Consider performance optimizations if needed
3. Plan future enhancements (see task 13)
