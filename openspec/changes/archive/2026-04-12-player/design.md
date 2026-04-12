## Context

The game-loop subsystem is archived and provides `GameScene` with a fixed-timestep update hook. The player subsystem builds on top: `PlayerController` registers a `fixedUpdate` callback and reads a normalised `InputState` each tick. Phaser 3 Arcade Physics handles the physics body; no custom physics engine is needed. The sprite pack (Brawler Girl, 9 spritesheets at 96×63 px) is now provisioned under `public/assets/player/`. Four animation states (grab, knockdown, get-up, special) have no dedicated sprites and will use the hurt animation as a placeholder.

## Goals / Non-Goals

**Goals:**
- Full 11-state player state machine with deterministic transitions.
- Keyboard + gamepad input normalised to a single `InputState` snapshot polled every fixed tick.
- Health, lives, iFrames, and respawn all managed within `PlayerController`.
- Stage boundary clamping on the Y axis (ground plane top/bottom).
- Special attack with health cost and cooldown.

**Non-Goals:**
- Two-player mode, character select, or any second playable character (FR-PL-21).
- Combo chain input sequences beyond light/heavy/jump/special (Open Question deferred).
- Networked input or replay recording.
- Camera scroll logic (belongs to `stage` subsystem).

## Decisions

**D-01 — Finite state machine as a class, not a switch statement**
`PlayerStateMachine` is a separate class that owns the current state and the legal transition table. `PlayerController` calls `stateMachine.transition(newState)` which validates the transition and runs enter/exit hooks. *Alternative:* a large switch in `update()` — rejected because it becomes unmaintainable as state count grows.

**D-02 — InputManager as a singleton registered to GameScene**
`InputManager` is created once in `GameScene.create()` and its `poll()` method is called first in every fixed tick before `PlayerController.fixedUpdate`. This ensures all subsystems read the same snapshot for the same tick. *Alternative:* each subsystem queries Phaser's keyboard/gamepad directly — rejected because it introduces per-subsystem polling divergence.

**D-03 — Hitboxes as Phaser GameObjects added to a dedicated physics group**
Each attack state spawns a hitbox `Phaser.GameObjects.Rectangle` in a `playerHitboxGroup` Arcade Physics group. The combat-system subsystem queries this group. Hitboxes are destroyed when the attack state exits. *Alternative:* overlap callbacks registered directly — deferred to combat-system, which owns hit resolution. PlayerController only manages hitbox lifecycle.

**D-04 — iFrame timer as a countdown number in fixed ticks**
`iFramesRemaining` counts down by 1 each fixed tick. Damage is blocked while `iFramesRemaining > 0`. This avoids `Date.now()` calls in hot path and remains deterministic. Respawn grants `GameConfig.RESPAWN_IFRAMES` ticks; get-up grants `GameConfig.GETUP_IFRAMES` ticks.

**D-05 — Special attack cooldown as a fixed-tick countdown**
Same pattern as iFrames: `specialCooldownTicks` counts down by 1 each tick. At 60 fps, 10 seconds = 600 ticks = `GameConfig.SPECIAL_COOLDOWN_TICKS`.

## Risks / Trade-offs

- **[Risk] Placeholder animations for grab/knockdown/getup/special look wrong** → Mitigation: documented in AssetKeys.ts comments; visual impact is cosmetic, logic is correct.
- **[Risk] Gamepad API not available in test environments** → Mitigation: `InputManager` wraps gamepad access in `try/catch`; tests inject a mock `InputState` directly.
- **[Risk] Arcade Physics body registration order may affect collision detection** → Mitigation: `PlayerController` is constructed in `GameScene.create()` before enemy spawners (which belong to later subsystems).
