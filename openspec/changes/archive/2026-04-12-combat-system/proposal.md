## Why

The player and stage subsystems exist but there is no mechanism for attacks to deal damage, register hit/hurt collisions, or reward sustained offensive play. Without a combat system the game has no mechanical feedback loop — characters can't hurt each other, enemies can't respond to being struck, and the combo window that defines the game's skill ceiling is absent.

## What Changes

- Introduce a per-tick hit-detection pass that tests active hitboxes against active hurtboxes using rectangular overlap.
- Add a `CombatSystem` class that owns the detection loop, applies damage and knockback, manages the combo counter, and enforces the one-hit-per-swing rule.
- Add a `HurtboxComponent` that each damageable character registers to declare its vulnerable region.
- Add a `HitEvent` value type that carries damage, knockback vector, hit-stun duration, and team tag so the detection engine is decoupled from character-specific logic.
- Add a `ComboTracker` that counts hits on a target within a sliding window, applies diminishing damage returns, and scales hit-stun with combo depth.
- Wire debug rendering: when a `debugHitboxes` flag is set, draw coloured rectangles over every active hitbox and hurtbox each frame.
- Modify `game-scene`: expose the `CombatSystem` instance via `getCombatSystem()` and register it in the fixed-update loop.
- Modify `player-controller`: call `CombatSystem.registerHitbox()` / `removeHitbox()` during attack frames; call `takeDamage()` with a full `HitEvent` on the receiving side.

## Capabilities

### New Capabilities

- `combat-system`: Central hit-detection engine — per-tick rectangular overlap test, HitEvent dispatch, one-hit-per-swing guard, team tag filtering.
- `hurtbox-component`: Damageable region definition per character; always-active unless character is in an invincible state.
- `hit-event`: Immutable value type: `{ damage, knockbackX, knockbackY, hitStunFrames, attackerFacing, teamTag }`.
- `combo-tracker`: Per-target sliding combo window; combo counter; diminishing returns (−10 % per hit, floor 1); hit-stun scaling (+N frames per combo depth).
- `combat-config`: Named constants for every hitbox/hurtbox dimension, base-damage, knockback, hit-stun, combo-window duration, diminishing-returns cap, and debug flag.
- `debug-renderer`: Toggleable overlay that draws hitboxes (red) and hurtboxes (green) each Phaser `update` call.

### Modified Capabilities

- `game-scene`: Add `getCombatSystem()` accessor and `itemPickupGroup` already exists; no requirement change, only integration wiring.
- `player-controller`: Grab attack uses proximity range check instead of hurtbox overlap (FR-CS-15); grants invincibility during grab sequence.

## Impact

- New files: `src/combat/CombatSystem.ts`, `src/combat/HurtboxComponent.ts`, `src/combat/HitEvent.ts`, `src/combat/ComboTracker.ts`, `src/combat/CombatConfig.ts`, `src/combat/DebugRenderer.ts`
- Modified: `src/game/scenes/GameScene.ts`, `src/player/PlayerController.ts`, `src/config/GameConfig.ts`
- No new external dependencies; uses Phaser `Graphics` for debug overlay.
