# Project Overview

A web-based companion app for tracking a weekend Mordheim campaign (5-6 warbands). The focus is on **ease of use** and **fun statistics tracking** rather than full roster management.

## Campaign Context

- **Duration:** Weekend blitz campaign
- **Players:** 5-6 warbands
- **Format:** As many games as possible over the weekend
- **Campaign Style:** Ongoing battles with different scenarios
- **Victory:** Multiple paths to "win" the weekend (side goal, not main focus)

## Design Philosophy

**What it IS:**

- Quick stats tracking after each game
- Sports-style leaderboards and rankings
- Scenario generation helper
- Campaign timeline and memorable moments

**What it ISN'T:**

- Full roster builder (pen and paper for that)
- Complex rules engine
- Requiring authentication/accounts

---

# Core Features

## 1. Warband & Warrior Management

- Pre-load all warbands at campaign start (5-6 warbands)
- Simple warband selector dropdown (no authentication needed)
- Track individual warriors within each warband
- Optional: Basic item/equipment tracking per warband
- Warriors have names and can accumulate stats over time

## 2. Quick Match Recording

**Target: < 2 minutes to log a game**

### Match Entry Fields:

- Select participating warbands (2-4 players)
  - Support for standard 1v1 matches
  - Support for team battles (2v2, 3v1, etc.)
  - Support for battle royale/free-for-all (3-4 players)
- Record winner(s)
  - Single winner for competitive scenarios
  - Team winners for allied scenarios
  - Placement tracking (1st, 2nd, 3rd, 4th) for battle royales
- Log casualties and injuries
- Track per warrior:
  - Kills scored
  - Injuries caused
  - Injuries received
  - Experience gained
- Track per warband:
  - Games won/lost (with context: team victory, solo victory, placement)
  - Treasury changes
  - Wyrdstone/loot collected
- Optional narrative notes field for memorable moments

### UX Considerations:

- Quick tap interface for common actions
- Auto-save as you go
- Option to "fill in details later" if needed
- Auto-generate basic battle report from logged data

## 3. Stats & Leaderboards

### Individual Warrior Rankings:

- **Most Kills** - The "Golden Daemon" for murder
- **Most Injuries Survived** - The iron warriors
- **Glass Cannon** - High damage dealt, low survivability
- **Iron Wall** - High survivability, low damage dealt
- **Luckiest** - Best exploration/treasure rolls
- **Underdog Tracker** - Knocked down most but keeps coming back

### Warband Rankings:

- Overall warband power ratings over time
- Games won/lost records
- Head-to-head records between specific warbands
- Treasury/wealth rankings
- Total kills/casualties as a warband

### Special Tracking:

- **Rivalry/Nemesis System**
  - Auto-detect when specific warriors face off repeatedly
  - Track personal grudge matches
  - "Nemesis" badges when two characters keep fighting
  - History of their encounters

## 4. Weekend Campaign Victory Paths

Multiple ways to "win" the weekend to accommodate different playstyles:

- **🏆 The Tyrant** - Most games won (for the competitive player)
- **💪 The Survivor** - Highest warband rating at end of weekend
- **⭐ The Legend** - Most individual warrior achievements/accolades
- **💰 The Opportunist** - Best treasury/wyrdstone collection
- **🎭 The Chaos Agent** - Most memorable moments (group voted?)

Each path is tracked separately so multiple players can feel like "winners"

## 5. Scenario Management

- **Random Scenario Generator**
  - Pull from pool of Mordheim scenarios
  - Display special rules for selected scenario
  - **Support for different player counts:**
    - 1v1 scenarios (standard competitive)
    - 2v2 scenarios (team battles, alliances)
    - 3-player free-for-all (battle royale)
    - 4-player free-for-all (chaos multiplayer)
  - Suggest appropriate scenarios based on available players
- **Scenario History Tracking**
  - Mark scenarios as played
  - Track player count and format for each scenario
  - Avoid repetition throughout weekend
- **Optional: Dynamic Scenario Weighting**
  - Give underdogs easier scenarios
  - Balance based on current standings

- Suggest team-ups to balance power levels in multiplayer games
- **Optional: Narrative Chains**
  - Scenarios loosely connect based on previous results
  - "The warband that won last game is defending..." type hooks

- Track alliances formed in team battles for future narrative hooks

## 6. Campaign Timeline & Visualization

### Event Log:

- Major moments: deaths, heroic actions, critical failures
- Auto-generated entries: "Game 5: Bjorn the Bold killed by Skaven assassin"
- Manual entries for memorable narrative beats
- "Obituaries" for fallen warriors with their career stats

### Data Visualization:

- Warband progression graphs (rating over time)
- Win/loss streaks
- "Hot streaks" and "cold spells" indicators
- Head-to-head comparison charts

### Live Display Features:

- **Real-time leaderboard** viewable between matches
- **"Breaking News"** style updates
  - "Snikch the Assassin just claimed his 5th kill!"
  - "The Reiklanders are on a 3-game winning streak!"
- Designed to generate friendly trash talk and hype

---

# Technical Approach

## Platform

- **Web-based** for flexibility
- Can be used on same laptop or multiple devices
- No authentication required
- Simple warband selector to switch context

## Key Technical Considerations

- Fast data entry is critical (< 2 min per game)
- Live updates if multiple devices accessing
- Responsive design for tablet/laptop use
- Ability to display leaderboards on external screen

---

# Open Questions & Future Considerations

- How detailed should item/equipment tracking be?
- Should "The Chaos Agent" award be voted on, or auto-calculated?

- How should we handle draws/ties in battle royale scenarios?
- Should team victories count the same as solo victories for rankings?
- Do we want to export/save campaign data at the end?
- Should there be a "pre-game" setup wizard to input initial warbands?
- Photo upload for warriors/warbands?
- Integration with dice rolling?

---

# Next Steps

1. Finalize feature priority list
2. Create wireframes/mockups for key screens
3. Set up development environment
4. Build MVP focusing on:
   - Warband creation
   - Match logging
   - Basic leaderboards
5. Iterate and add features as needed before campaign weekend
