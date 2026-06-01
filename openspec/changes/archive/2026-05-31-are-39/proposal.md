## Why

The game requires a well-defined, documented default keyboard input mapping that covers all player actions. Input polling must occur exactly once per fixed-timestep update to guarantee deterministic behaviour independent of frame rate. The existing InputManager already implements this, but the spec needs to explicitly codify the fixed-timestep polling contract and validate that the mapping is complete and correct.

## What Changes

- Validate and enforce that `InputManager.poll()` is called exactly once per fixed-timestep update (not per render frame).
- Confirm the default keyboard mapping covers all required actions: Arrow keys/WASD for movement, Z/J for light attack, X/K for heavy attack, C/L for grab, Space for jump, Enter for special attack.
- Add explicit spec coverage for the once-per-tick polling guarantee tied to the fixed-timestep loop.
- Update `InputManager.poll()` JSDoc to document the fixed-timestep-only calling contract.
- Add inline comment at the `poll()` call site in `PlayerController.ts` to reinforce the contract.

## Capabilities

### New Capabilities

_(none — this ticket validates and strengthens existing capability coverage)_

### Modified Capabilities

- `input-manager`: Add explicit requirement that `poll()` MUST be invoked exactly once per fixed-timestep update (not per render frame), ensuring deterministic input regardless of frame rate.

## Impact

- `finalfight-AAA/src/input/InputManager.ts` — `poll()` JSDoc updated with `@remarks` documenting the fixed-timestep-only calling contract and determinism warning.
- `finalfight-AAA/src/player/PlayerController.ts` — inline comment added at the `poll()` call site reinforcing the once-per-tick rule.
- `finalfight-AAA/src/game/scenes/GameScene.ts` — verify `poll()` is called inside the fixed-timestep accumulator loop (no code changes; contract enforced via PlayerController's registered fixed-update callback).
- `openspec/specs/input-manager/spec.md` — new "Fixed-Timestep Polling Contract" section formally stating the once-per-tick invariant; validated "Default Keyboard Mapping" table with all bindings marked as required/mandatory.
