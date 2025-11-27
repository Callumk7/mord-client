# Post Match Processing

## Tasks

- We need to render a list or table of all match events, and resolve them. Events may have already been resolved, but we need to display how many events need to be processed.
    - processing events generally means applying an injury to the knock down. This updates the event and marks it as resolved. It also handles the death and injury booleans for the event. If the knock down resulted in a death, mark death as true. If it resulted in an injury, mark injury as true.
    - For moments, these just get marked as resolved. Nothing else really happens

- We need to provide an interface to then update the warriors. 
    - The user can mark the warrior as dead (this is not related to any events, so has to be done manually)
    - They can add a death description (and the death date can be updated automatically based on current time)
    - we need to update experience
        - we should have an interface for accumulating experience. For each warrior we can list
            - +1 experience if survived
            - +1 for each knock down event if the warrior is a hero
            - +1 for the leader of the winning warband (we have no record of this, so the user can select a hero to apply this too)
            - custom additions for scenario rules (user can add a row)
        - We can then let the user submit this, and add the calculated total to the warrior's previous experience. 
