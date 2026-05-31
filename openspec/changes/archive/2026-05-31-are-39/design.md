## Context

The InputManager already implements the full default keyboard mapping (Arrow/WASD for movement, Z/J light attack, X/K heavy attack, C/L grab, Space jump, Enter special) and is polled inside `PlayerController.fixedUpdate()`, which is registered as a fixed-timestep callback in GameScene's accumulator loop. The implementation is correct; this change strengthens the spec to explicitly require the once-per-tick polling guarantee.

## Goals / Non-Goals

**Goals:**
- Codify that `InputManager.poll()` MUST be called exactly once per fixed-timestep update, not per render frame.
- Ensure the spec explicitly documents all default key bindings as normative requirements.
- Provide testable scenarios for the deterministic polling contract.

**Non-Goals:**
- Remapping or rebinding keys at runtime.
- Adding new input actions beyond the existing set.
- Changing the existing implementation (it already conforms).

## Decisions

1. **No code changes required** — The existing `PlayerController.fixedUpdate()` already calls `poll()` once per tick inside the GameScene accumulator. The spec update formalises this existing behaviour.
2. **Spec delta on `input-manager`** — A MODIFIED requirement will strengthen the polling contract with an explicit "once per fixed-timestep" clause and a scenario verifying it is not called per render frame.

## Risks / Trade-offs

- [Risk] Spec tightening could make future refactors (e.g., moving poll to GameScene directly) require a spec update → Acceptable; the contract is intentional.
- [Risk] No code change means nothing to "implement" → Tasks will focus on verification and test coverage.
