# Turn-Based Draft Logic Implementation Report

**Date:** November 10, 2025  
**Status:** ✅ Implemented - Ready for Testing

## Overview

The turn-based draft logic has been successfully implemented for the Cannabis Fantasy League. The system now supports both snake and linear draft orders, validates picks to ensure only the correct team can draft, prevents duplicate selections, and automatically advances to the next pick after each selection.

## Key Features Implemented

### 1. Draft State Management

**Schema Updates:**
- Added `draftStarted` field to track if draft has begun
- Added `draftCompleted` field to track if draft is finished
- Added `currentDraftPick` to track overall pick number
- Added `currentDraftRound` to track current round (1-9)
- Added `draftPickTimeLimit` for future timer implementation (default: 90 seconds)

**Draft Picks Table:**
- Records all draft selections with league, team, round, pick number, asset type, and asset ID
- Unique constraint on (leagueId, pickNumber) to prevent duplicate picks
- Timestamp for each pick

### 2. Turn Calculation Logic

**Snake Draft Algorithm:**
- Odd rounds (1, 3, 5, 7, 9): Teams draft in order 1→2→3→4
- Even rounds (2, 4, 6, 8): Teams draft in reverse order 4→3→2→1
- Example for 4 teams:
  - Round 1: Team 1, Team 2, Team 3, Team 4
  - Round 2: Team 4, Team 3, Team 2, Team 1
  - Round 3: Team 1, Team 2, Team 3, Team 4
  - And so on...

**Linear Draft Algorithm:**
- All rounds follow the same order: 1→2→3→4
- Simpler but less fair than snake draft

### 3. Draft Pick Validation

The `validateDraftPick()` function performs comprehensive validation:

**Turn Validation:**
- Checks if it's the team's turn to pick
- Compares team ID against calculated next pick
- Returns error: "It's not your turn to pick" if validation fails

**Duplicate Prevention:**
- Queries draftPicks table for existing picks of the same asset
- Prevents the same player from being drafted twice
- Returns error: "This player has already been drafted"

**Roster Limits:**
- Enforces 2-player limit per position type (MFG, CSTR, PRD, PHM)
- Allows FLEX position to be filled by any type once position limits are reached
- Maximum 9 total players per roster
- Returns error: "Roster is full" if limits exceeded

### 4. Draft Progression

**Automatic Advancement:**
- After each successful pick, `advanceDraftPick()` is called
- Increments `currentDraftPick` by 1
- Calculates new round number: `Math.ceil(pickNumber / teamCount)`
- Updates league record with new pick and round numbers

**Draft Completion:**
- Detects when all 9 rounds are complete (teamCount × 9 picks)
- Sets `draftCompleted` to true
- Changes league status from "draft" to "active"
- Prevents further picks

### 5. Real-Time Notifications

**Player Picked Event:**
- Broadcasts to all clients in draft room
- Includes: team name, player name, asset type, pick number
- Triggers UI refresh to remove picked player from available list

**Next Pick Event:**
- Calculates next team to pick
- Broadcasts: team ID, team name, pick number, round number
- Allows UI to highlight whose turn it is
- Prepares for future timer implementation

**Draft Complete Event:**
- Notifies all participants when draft ends
- Triggers transition to active season

## API Endpoints

### Draft Pick Mutation

```typescript
makeDraftPick({
  leagueId: number,
  teamId: number,
  assetType: "manufacturer" | "cannabis_strain" | "product" | "pharmacy",
  assetId: number
})
```

**Process Flow:**
1. Validate it's the team's turn
2. Validate asset hasn't been drafted
3. Validate roster has room
4. Add player to roster
5. Record pick in draftPicks table
6. Broadcast player_picked event
7. Advance to next pick
8. Calculate and broadcast next_pick event
9. Return success with player name

**Error Handling:**
- Throws error with descriptive message if validation fails
- Frontend displays error in toast notification
- No state changes occur on validation failure

### Draft Status Query

```typescript
getDraftStatus(leagueId: number)
```

**Returns:**
```typescript
{
  draftStarted: boolean,
  draftCompleted: boolean,
  currentPick: number,
  currentRound: number,
  totalRounds: 9,
  totalPicks: number, // teamCount * 9
  nextTeam: {
    teamId: number,
    teamName: string,
    pickNumber: number,
    round: number
  },
  draftType: "snake" | "linear",
  pickTimeLimit: number
}
```

## WebSocket Events

### Outgoing Events (Server → Client)

**player_picked:**
```json
{
  "type": "player_picked",
  "teamId": 16,
  "teamName": "Green Dragons",
  "assetType": "manufacturer",
  "assetId": 1,
  "assetName": "Aurora",
  "pickNumber": 10,
  "timestamp": 1699612345678
}
```

**next_pick:**
```json
{
  "type": "next_pick",
  "teamId": 17,
  "teamName": "Blue Flames",
  "pickNumber": 11,
  "round": 2,
  "timestamp": 1699612345678
}
```

**draft_complete:**
```json
{
  "type": "draft_complete",
  "timestamp": 1699612345678
}
```

## Testing Checklist

### Unit Tests Needed

- [ ] `calculateNextPick()` for snake draft with 4 teams
- [ ] `calculateNextPick()` for linear draft with 4 teams
- [ ] `isTeamsTurn()` returns true for correct team
- [ ] `isTeamsTurn()` returns false for wrong team
- [ ] `validateDraftPick()` rejects out-of-turn picks
- [ ] `validateDraftPick()` rejects duplicate picks
- [ ] `validateDraftPick()` rejects when roster full
- [ ] `advanceDraftPick()` increments pick number
- [ ] `advanceDraftPick()` calculates correct round
- [ ] `advanceDraftPick()` marks draft complete after final pick

### Integration Tests Needed

- [ ] Full 4-team snake draft (36 picks)
- [ ] Verify each team gets exactly 9 players
- [ ] Verify no duplicate players across teams
- [ ] Verify league status changes to "active" after draft
- [ ] WebSocket events received by all clients
- [ ] Error handling for invalid picks

### Manual Testing Scenarios

1. **Happy Path:**
   - Create league with 4 teams
   - Start draft
   - Each team drafts 9 players in correct order
   - Verify draft completes successfully

2. **Out of Turn:**
   - Team 2 tries to pick when it's Team 1's turn
   - Verify error message displayed
   - Verify no roster changes

3. **Duplicate Pick:**
   - Team 1 picks Aurora
   - Team 2 tries to pick Aurora
   - Verify error message
   - Verify Aurora not added to Team 2

4. **Roster Full:**
   - Team has 2 MFG, 2 CSTR, 2 PRD, 2 PHM, 1 FLEX (9 total)
   - Try to draft another player
   - Verify error message

5. **Snake Draft Order:**
   - 4 teams: A, B, C, D
   - Round 1: A, B, C, D
   - Round 2: D, C, B, A
   - Round 3: A, B, C, D
   - Verify correct order

## Next Steps

### Immediate (High Priority)

1. **Draft Timer Implementation**
   - Add countdown timer for each pick
   - Auto-pick random available player if time expires
   - Display timer in UI
   - Sync timer across all clients via WebSocket

2. **Start Draft Endpoint**
   - Add tRPC mutation for commissioner to start draft
   - Validate all teams have joined
   - Randomize or set draft order
   - Initialize draft state

3. **Frontend Integration**
   - Update Draft.tsx to show whose turn it is
   - Disable draft button when not user's turn
   - Display countdown timer
   - Show draft history/recent picks

### Secondary (Medium Priority)

4. **Draft Pause/Resume**
   - Allow commissioner to pause draft
   - Save draft state
   - Resume from saved state

5. **Auto-Pick System**
   - Pre-draft rankings
   - Best available player selection
   - Position-based auto-pick strategy

6. **Draft Recap**
   - View complete draft results
   - Export draft board
   - Grade each team's draft

### Future Enhancements

7. **Draft Chat**
   - Real-time chat during draft
   - Trade proposals during draft
   - Commissioner announcements

8. **Draft Analytics**
   - Live draft grades
   - Position scarcity indicators
   - Player comparison tools

## Known Limitations

1. **No Timer Yet:** Pick time limit is stored but not enforced
2. **No Auto-Pick:** Manual intervention required if player doesn't pick
3. **No Draft Pause:** Draft must complete in one session
4. **No Keeper Picks:** Pre-draft keeper selection not implemented
5. **No Trade Picks:** Draft pick trading not supported

## Database Schema Changes

### Leagues Table

```sql
ALTER TABLE leagues ADD COLUMN draftStarted INT DEFAULT 0;
ALTER TABLE leagues ADD COLUMN draftCompleted INT DEFAULT 0;
ALTER TABLE leagues ADD COLUMN currentDraftPick INT DEFAULT 1;
ALTER TABLE leagues ADD COLUMN currentDraftRound INT DEFAULT 1;
ALTER TABLE leagues ADD COLUMN draftPickTimeLimit INT DEFAULT 90;
```

### Draft Picks Table

Already exists in schema with correct structure.

## Code Files Modified

1. `/drizzle/schema.ts` - Added draft state fields to leagues table
2. `/server/draftLogic.ts` - New file with all draft calculation logic
3. `/server/draftRouter.ts` - Updated makeDraftPick with validation
4. `/server/websocket.ts` - Updated notifyNextPick signature

## Conclusion

The turn-based draft logic is now fully implemented and ready for testing. The system provides robust validation, real-time updates, and support for both snake and linear draft formats. The next critical step is implementing the draft timer to ensure picks happen in a timely manner.

Once the timer is added and the frontend is updated to display turn indicators, the draft experience will be complete and ready for alpha testing with multiple users.
