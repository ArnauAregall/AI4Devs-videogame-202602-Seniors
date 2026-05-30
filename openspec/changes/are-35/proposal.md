## Why

The player character's Idle and Walk animation states already exist in code (PlayerState, PlayerStateMachine, PlayerController) but lack a critical behaviour: when the character reaches the top or bottom walkable boundary while holding a directional input, the movement is clamped but the animation stays in Walk state. This breaks the expected Idle ↔ Walk contract — at the boundary the character should return to Idle since no effective movement occurs.

## What Changes

- Add boundary-aware Idle transition: when the player is at the top or bottom walkable boundary and the held input would only push against the boundary, transition from Walk to Idle
- Ensure releasing all directional inputs immediately transitions from Walk to Idle (already implemented, verify)
- Ensure the Idle animation loops continuously and the Walk animation plays only during effective movement
- No new states, no structural refactors — purely a behavioural fix in the existing Idle/Walk transition logic

## Capabilities

### New Capabilities
- `player-idle-walk-boundary`: Boundary-aware idle/walk state management — the player character loops Idle when not moving or when movement is blocked by the walkable boundary, and loops Walk only during effective directional movement

### Modified Capabilities
- *(none — no existing spec changes needed)*

## Impact

- `finalfight-AAA/src/player/PlayerController.ts` — modify `_processInput` and/or `_applyMovement` to detect boundary-blocked input and force Idle
