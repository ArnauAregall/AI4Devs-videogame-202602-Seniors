## Why

The player subsystem is the second subsystem in build order and the heart of all gameplay interaction. Without a controllable character with defined state machine, input handling, health management, and attack hitboxes, no combat, enemy-AI, or HUD subsystem can be meaningfully implemented. The game-loop subsystem is archived and provides the fixed-timestep hook this subsystem registers against.

## What Changes

- Introduce a `PlayerState` enum covering all 11 character states: Idle, Walk, Jump, LightAttack, HeavyAttack, JumpAttack, Grab, Hurt, Knockdown, GetUp, SpecialAttack.
- Introduce a `PlayerController` class that owns the state machine, physics body, animation playback, and hitbox lifecycle.
- Introduce an `InputManager` class that polls keyboard and gamepad every fixed-timestep tick and exposes a normalised `InputState` snapshot for the player controller to read.
- Implement health, lives, invincibility frame (iFrame) tracking, and respawn logic.
- Implement stage boundary clamping (ground-plane top/bottom edges).
- Implement the special attack: health cost, 10-second cooldown, area damage dispatch.
- Register `PlayerController.fixedUpdate` with `GameScene.registerFixedUpdate`.

## Capabilities

### New Capabilities

- `player-state-machine`: PlayerState enum + transition rules — legal transitions, interruptibility, and priority for all 11 states.
- `player-controller`: PlayerController class: physics body, animation playback, hitbox spawn/despawn, registration with GameScene fixed-timestep hook.
- `input-manager`: InputManager: keyboard mapping (FR-PL-12), gamepad mapping (FR-PL-13), normalised InputState snapshot, gamepad connect/disconnect handling.
- `player-health`: Health, lives, damage intake, iFrame system, respawn, game-over trigger (FR-PL-14 → FR-PL-18).
- `player-movement`: Walk speed, jump arc, ground-plane boundary clamping, camera-speed constraint (FR-PL-19, FR-PL-20).
- `player-special-attack`: Health-cost guard, 10-second cooldown, area-effect damage dispatch (FR-PL-11, FR-PL-22).

### Modified Capabilities

- `game-scene`: GameScene gains a `getPlayer()` accessor so combat-system and HUD can reference the player instance. No spec-level requirement changes — additive only.

## Impact

- New source directory: `finalfight-AAA/src/player/`
- New source directory: `finalfight-AAA/src/input/`
- `GameScene.ts` gains `getPlayer(): PlayerController | null` accessor.
- `AssetKeys.ts` updated: player frame dimensions corrected to 96×63; 4 placeholder keys added (knockdown, getup, grab, special — use hurt.png until dedicated sprites are sourced).
- No new npm dependencies — uses Phaser Arcade Physics and built-in gamepad API.
