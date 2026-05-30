## Context

The player character's state machine already supports Idle ↔ Walk transitions via `PlayerController._processInput()`. The `_applyMovement()` method clamps `_baseY` to `[GROUND_TOP, GROUND_BOTTOM]` but the Walk state persists even when the clamp prevents effective movement. This is a single-file behavioural fix to `PlayerController.ts`.

## Goals / Non-Goals

**Goals:**
- Walk → Idle transition when the character reaches the top/bottom boundary and the held directional input would only push against the boundary
- Preserve existing Idle → Walk, attack-only, and other transition logic unchanged

**Non-Goals:**
- No new states, no refactors, no changes to PlayerState enum or PlayerStateMachine
- No changes to horizontal boundaries (left/right movement is unbounded within stage scroll)

## Decisions

- **Boundary check in `_applyMovement` rather than `_processInput`**: The boundary is a movement-level concern; clamping happens in `_applyMovement`. After clamping, if the clamped Y equals the held-direction boundary, force the state to Idle for that tick. This keeps the boundary awareness co-located with the bounding logic.

- **Re-evaluate on every tick**: Since the player can change direction or release input each tick, the boundary → Idle transition must be evaluated every fixed update, not just on state entry.

## Risks / Trade-offs

- [One-frame visual flicker] → Unlikely: the transition will be evaluated every tick; once the player moves away from the boundary, `_processInput` will immediately transition back to Walk on the next tick.
