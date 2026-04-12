## 1. Investigation

- [ ] 1.1 Confirm Bug 4 finding: read stage1Data.ts zone-1a entry — `count: 2` is intentional; two separate brawlers spawn per wave. **CONFIRMED TWO SEPARATE PUNKS — no fix applied.**

## 2. Bug 1 — Barrel Passthrough

- [ ] 2.1 Audit `GameScene.create()` for any `physics.add.collider(player, barrels)` or group-based collider wiring and remove it
- [ ] 2.2 Confirm `DestructibleProp` constructor uses `scene.add.image()` (not `scene.physics.add.image()`); if physics body is present, replace with plain `Image`
- [ ] 2.3 Update `DestructibleProp.test.ts` to assert no physics body on the sprite

## 3. Bug 2 — Barrel Dual-State Rendering

- [ ] 3.1 Add `_spriteHealthy` and `_spriteCrushed` fields to `DestructibleProp`; create both sprites in constructor at same world position
- [ ] 3.2 On construction set `_spriteHealthy.setVisible(true)` and `_spriteCrushed.setVisible(false)`
- [ ] 3.3 Add `_hitCount: number = 0` field to `DestructibleProp`; in `hit()` increment `_hitCount` instead of (or alongside) decrementing `_hp`
- [ ] 3.4 When `_hitCount >= 3`: call `_spriteCrushed.setVisible(true)`, `_spriteHealthy.setVisible(false)`, then `scene.time.delayedCall(300, () => this._destroy())`
- [ ] 3.5 Update `_fixedUpdate` to reposition both sprites from `def.worldX - getCameraX()`
- [ ] 3.6 Update `destroy()` to call `.destroy()` on both sprites
- [ ] 3.7 Update `DestructibleProp.test.ts`: assert healthy sprite visible on creation; assert crushed sprite visible after third hit; assert destroy fires after delay

## 4. Bug 3 — Punk Vertical Knockback

- [ ] 4.1 In `EnemyController._applyHit()`, replace `this._sprite.setVelocityY(event.knockbackY * 20)` with `this._sprite.setVelocityY(0)` (zero Y velocity regardless of event value)
- [ ] 4.2 In `EnemyController` constructor, call `this._sprite.setCollideWorldBounds(true)` after sprite creation
- [ ] 4.3 Verify scene physics gravity is set to a positive value in `GameScene` or `main.ts`; if not, add `gravity: { y: 300 }` to the Phaser config
- [ ] 4.4 Update `EnemyController.test.ts` (or `BrawlerController.test.ts`) to assert Y velocity is 0 after a hit with `knockbackY: -4`

## 5. Bug 5 — Stage Gate Not Releasing

- [ ] 5.1 In `StageManager._onZoneCleared()`, remove the `if (this._zonesCleared >= this._zonesTotal)` guard and always set `this._locked = false`
- [ ] 5.2 Update `StageManager.test.ts`: add a test that asserts `_locked === false` after the FIRST zone clears in a multi-zone stage (not after all zones)

## 6. Test Verification

- [ ] 6.1 Run `npm test` from `finalfight-AAA/` and confirm all 288+ tests pass with zero failures
- [ ] 6.2 Fix any broken tests introduced by the above changes (mock updates for new sprite fields, etc.)

## 7. Commit

- [ ] 7.1 Stage all changed files and commit: `fix(gameplay): barrel passthrough, states, knockback bounds, punk identity, stage gate release`
