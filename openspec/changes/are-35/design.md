## Context

The `PlayerController` already has a state machine (`PlayerStateMachine`) with Idle and Walk states. The `_onEnterState` method plays the correct animation key with looping enabled for both Idle and Walk. The `_processInput` method transitions from Idle→Walk when directional input is detected and Walk→Idle when all directional input is released.

The one gap is the boundary-stop case: when the player is walking purely vertically (up/down) and hits the ground-plane boundary (GROUND_TOP or GROUND_BOTTOM), the y-position is clamped but the Walk state persists as long as the key is held — even though there is no effective movement. The acceptance criteria require a transition to Idle in this case.

## Goals / Non-Goals

**Goals:**
- Ensure the Walk→Idle transition fires when the player is clamped at a vertical boundary with only vertical input held (no horizontal input).
- Validate that Idle and Walk animations loop continuously without frame drops or resets on repeated ticks.
- Confirm immediate animation switch on state transition (no delay frames).

**Non-Goals:**
- Changing the Walk animation frame count or frame rate.
- Modifying horizontal boundary behaviour (camera-scroll-locked).
- Adding new animation states beyond Idle and Walk.

## Decisions

1. **Boundary-stop detection in `_applyMovement`**: After clamping `_baseY`, check if the player's effective vertical movement is zero (position unchanged) AND no horizontal input is held. If so, transition to Idle. This keeps the logic co-located with the existing clamping code and avoids adding frame-delay checks.

   *Alternative considered*: Detecting boundary in `_processInput` — rejected because position clamping hasn't happened yet at that point; we'd need to pre-compute it.

2. **No changes to animation system**: The existing `_createAnimations` already defines Idle with `repeat: -1` and Walk with `repeat: -1`. The `_onEnterState` correctly calls `sprite.play(key, true)` which restarts from frame 0 and loops. No modification needed.

## Risks / Trade-offs

- [Risk] False Idle triggers: Player holding up+right at top boundary still has horizontal movement → only trigger Idle when *all* effective movement is zero. Mitigation: Check that no horizontal input is also active before forcing Idle.
- [Risk] One-frame flicker: If boundary detection runs before movement application, could cause a single-frame Idle flash. Mitigation: Place check after clamping, in the same tick's movement pass.
