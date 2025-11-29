# New Overview

## Goals

1. Log matches and match outcomes
2. Track injuries and kills
3. Track other warband stats for the big screen

## Tracking Warbands

Pretty easy stuff, users should be able to log their main warband, and then add warriors. One core decision moment though is going to be how we track heroes vs. henchmen, largely because in the actual game, henchmen are tracked in groups. So whilst heroes gain experience from knock downs, henchmen don't. That being said, we still want to track henchmen's knockdowns for fun. So it becomes a question as to whether we diverge from the core rules here. 

I think a good option is to just keep each warrior as an individual. We don't want the app to be a mordheim warband manager, it is instead going to be a live feed of fun events, that we can explore on a big screen. As such the process should simply be 

- each warrior is its own entry
- we track each knock down from any warrior
- at the end of the match, we track experience manually, and update this on warriors
- we can maybe do a helper with groups
