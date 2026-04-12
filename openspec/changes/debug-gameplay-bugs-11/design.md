## Context

Five gameplay bugs affect three subsystems (DestructibleProp, EnemyController, StageManager). All bugs are integration-level: they either misuse Phaser Arcade physics (wrong body type), apply incorrect numeric multipliers (knockback), or contain a wrong conditional guard in an event handler (gate unlock). No new architectural patterns are required — fixes are surgical changes within existing classes.

Current state:
- `DestructibleProp` uses `scene.add.image()` — no physics body at all. Player sprite has an Arcade body; if the game wires a collider between player and any barrel sprite group, it would block movement. Bug 1 requires verifying and removing any such collider or ensuring barrels use no blocking body.
- `DestructibleProp` has one sprite field `_sprite`. Bug 2 requires adding a second sprite for the crushed state and a hit counter capped at 3.
- `EnemyController._applyHit()` applies `event.knockbackY * 20` as Arcade velocity. With `PLAYER_HEAVY_KNOCKBACK_Y = -4`, this is −80 px/s upward — enough to exit the visible area on small canvases. Bug 3 requires zeroing Y knockback velocity.
- `StageManager._onZoneCleared()` only unlocks when `_zonesCleared >= _zonesTotal`. In stage 1 (3 zones), clearing zone 1 increments to 1 which is < 3, so `_locked` stays `true`. Bug 5 requires unconditional unlock on each zone clear.
- Stage 1 zone-1a specifies `count: 2`. `SpawnController` emits two separate `enemySpawn` events. **Bug 4 is confirmed to be intended behaviour** — no code change.

## Goals / Non-Goals

**Goals:**
- Player walks through barrel sprites without physics resistance
- `DestructibleProp` tracks hits (counter, not HP-based) up to 3; third hit swaps to crushed sprite then destroys
- Enemy knockback is horizontal-only; enemies cannot leave the visible canvas vertically
- Stage gate unlocks immediately after each wave is cleared, regardless of remaining zones
- Existing 288 tests continue to pass; affected tests updated to match new behaviour

**Non-Goals:**
- Health item drop from barrels (deferred per spec)
- Crushed barrel dedicated sprite asset (use existing barrel asset or a placeholder tint)
- Changing spawn zone enemy counts (Bug 4 is intentional)
- Player knockback changes
- New animation frames

## Decisions

### D-01: Barrel physics body strategy
**Options considered:**
- A) Keep `scene.add.image` (no body) and ensure no collider is registered — simplest
- B) Use `scene.physics.add.image` with `setImmovable(true)` and `body.setAllowGravity(false)`, but mark body as sensor — Arcade doesn't support sensors natively

**Decision:** Option A — remove any `physics.add.collider(player, barrels)` wiring from `GameScene`. `DestructibleProp` stays as `scene.add.image`. CombatSystem's rect-based overlap handles hit detection without a physics body.

**Rationale:** Simpler, no Arcade sensor workaround needed. CombatSystem already handles hitbox/hurtbox detection via rect math, not Arcade overlap events.

### D-02: 3-hit counter vs. HP-based threshold
**Options considered:**
- A) Keep HP field, set `def.hp = 3` in data — HP already exists but is arbitrary
- B) Dedicated integer hit counter, independent of HP — clearer intent

**Decision:** Option B — add `_hitCount: number` alongside existing `_hp`. `hit()` increments `_hitCount`; destruction triggers when `_hitCount >= 3`. Keep `_hp` field for backward compatibility with tests.

**Rationale:** Bug report explicitly says "3 hits to destroy", not "30 HP threshold". Decoupling count from HP avoids data coupling.

### D-03: Dual-state sprite management
**Decision:** Add `_spriteHealthy` and `_spriteCrushed` (both `Phaser.GameObjects.Image`). On construction: healthy visible, crushed invisible. On third hit: swap visibility, then `scene.time.delayedCall(300, destroy)`.

**Rationale:** Two independent images at the same world position are the simplest toggle — no texture swapping, no animation frames required.

### D-04: Y-knockback zeroing
**Decision:** In `EnemyController._applyHit()`, zero the Y-component entirely (`this._sprite.setVelocityY(0)`). Do not apply any upward launch.

**Alternatives considered:** Cap at −60 px/s. Rejected — a beat-'em-up on a 224px tall canvas should not have vertical launches at all. Horizontal-only knockback matches the genre.

**Gravity:** Ensure `this._sprite.setGravityY(GameConfig.GRAVITY_Y)` is called in the constructor (or verify the scene's global physics gravity applies). Ensure `this._sprite.setCollideWorldBounds(true)` is called.

### D-05: Stage gate unlock condition
**Decision:** Remove the `if (this._zonesCleared >= this._zonesTotal)` guard. Always set `this._locked = false` inside `_onZoneCleared()`.

**Rationale:** Each scroll trigger re-locks the camera when the next zone boundary is crossed. Unlocking on every zone clear is safe — the trigger mechanism handles re-locking.

## Risks / Trade-offs

- [Risk] Removing the HP-from-data usage for barrels may break existing `DestructibleProp.test.ts` tests → **Mitigation:** Keep `_hp` field but add `_hitCount`; update tests to assert `hitCount` not `hp`.
- [Risk] Zeroing Y knockback changes all enemy archetypes uniformly → **Mitigation:** Y knockback in `CombatConfig.ts` is already 0 for light attacks (`PLAYER_LIGHT_KNOCKBACK_Y = 0`) and −4 for heavy. Zeroing the Y velocity application is safe.
- [Risk] Unconditional gate unlock could allow multiple unlock events (zone-1a clears, unlocks; zone-1b clears, unlocks again while nothing is locked) → **Mitigation:** Setting `_locked = false` when already `false` is a no-op; no observable side-effect.
