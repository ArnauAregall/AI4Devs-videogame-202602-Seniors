## Why

The player character must display the correct looping animation (Idle or Walk) based on directional input state. Without these two base animation states working correctly, every other player animation and state transition is built on a broken visual foundation. The state machine and controller already handle transitions between Idle and Walk, but there is no dedicated verification that the animation loops and transitions happen immediately when input is pressed/released or when the player is clamped at a stage boundary.

## What Changes

- Verify and enforce that `PlayerController._onEnterState(Idle)` plays the Idle animation on a continuous loop with no exit until a state change occurs.
- Verify and enforce that `PlayerController._onEnterState(Walk)` plays the Walk animation on a continuous loop for as long as directional input is held.
- Ensure that releasing all directional inputs in Walk state immediately transitions to Idle (already in `_processInput`).
- Ensure that when the player reaches a vertical ground-plane boundary and stops (y clamped), the Walk→Idle transition fires if no other directional key remains held.

## Capabilities

### New Capabilities

- `player-idle-walk-animation`: Defines the acceptance criteria for Idle and Walk animation looping, immediate transitions on input press/release, and boundary-stop behaviour.

### Modified Capabilities

## Impact

- `finalfight-AAA/src/player/PlayerController.ts` — potential minor fix to ensure Walk→Idle fires when the player is clamped at boundary with no effective movement.
- Existing test suites for player state machine and controller may need new test cases to cover boundary-stop scenarios.
