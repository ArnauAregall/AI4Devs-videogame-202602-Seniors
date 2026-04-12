## Why

Six gameplay bugs block the playable Final Fight clone demo from being fully functional: players cannot walk through barrels, barrel destruction renders both sprite states simultaneously, enemy knockback sends punks off-screen vertically, the stage gate never unlocks after clearing a wave, and a suspected duplicate-punk spawn needs investigation. These bugs break the core beat-'em-up loop and must be fixed before the game is releasable.

## What Changes

- **Barrel passthrough (Bug 1):** `DestructibleProp` sprite must not create a blocking physics body. The player must walk through barrels freely; only combat overlap (hitbox vs. barrel hurtbox) registers hits.
- **Barrel dual-state rendering (Bug 2):** `DestructibleProp` introduces two sprite states — healthy and crushed. On creation only the healthy sprite is visible. The barrel takes exactly 3 hits to destroy; on the third hit the crushed sprite replaces the healthy one, followed by a short destroy delay. Health item drop remains deferred.
- **Vertical knockback cap (Bug 3):** `EnemyController._applyHit()` applies `knockbackY * 20` as Arcade velocity, allowing enemies to fly off-screen upward. The Y-component of knockback is zeroed or hard-capped at −60 px/s, and enemy sprites must have gravity enabled and world-bounds enforced vertically.
- **Punk identity investigation (Bug 4):** Stage 1 zone-1a specifies `count: 2`. `SpawnController` emits one `enemySpawn` event per count iteration, so two brawlers are intentional. **CONFIRMED TWO SEPARATE PUNKS — no code change required.** Finding documented only.
- **Stage gate unlock (Bug 5):** `StageManager._onZoneCleared()` only sets `this._locked = false` when `_zonesCleared >= _zonesTotal`. In a multi-zone stage the gate never unlocks mid-stage. Fix: unlock immediately on any individual `zoneCleared` event, regardless of remaining total zones.

## Capabilities

### New Capabilities

_(none — all changes are bug fixes to existing implemented capabilities)_

### Modified Capabilities

- `destructible-prop`: Barrel passthrough behaviour changes (no blocking physics body); barrel hit counter increases to 3; dual-state sprite visibility (healthy/crushed) added.
- `enemy-controller`: Vertical knockback velocity clamped to 0 or ≤ −60 px/s; enemy physics body must have gravity and `collideWorldBounds` enabled.
- `stage-manager`: Zone gate unlock logic corrected — `_locked` set to `false` on every `zoneCleared` event, not only after all zones are cleared.

## Impact

- `finalfight-AAA/src/stage/DestructibleProp.ts` — sprite creation, hit counter, state visibility
- `finalfight-AAA/src/enemy/EnemyController.ts` — `_applyHit()` knockbackY handling; constructor physics body setup
- `finalfight-AAA/src/stage/StageManager.ts` — `_onZoneCleared()` unlock condition
- `finalfight-AAA/src/__tests__/DestructibleProp.test.ts` — update for 3-hit counter and dual-state
- `finalfight-AAA/src/__tests__/EnemyController.test.ts` — update knockback assertions
- `finalfight-AAA/src/__tests__/StageManager.test.ts` — update gate-release assertions
- No dependency on sprite assets beyond existing `ASSET_KEY_PROP_BARREL` (crushed state uses same asset key or a dedicated key if provisioned)
