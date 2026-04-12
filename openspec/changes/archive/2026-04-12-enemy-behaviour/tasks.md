## 1. Asset & Config

- [x] 1.1 Add animation-clip constants to `EnemyConfig.ts`: `PUNK_ANIM_IDLE`, `PUNK_ANIM_WALK`, `PUNK_ANIM_ATTACK`, `PUNK_ANIM_HURT`, `PUNK_ANIM_DEATH` string keys; `PUNK_IDLE_FRAME_COUNT` (4), `PUNK_WALK_FRAME_COUNT` (4), `PUNK_ATTACK_FRAME_COUNT` (3), `PUNK_HURT_FRAME_COUNT` (4), `PUNK_DEATH_FRAME_COUNT` (4); frame-rate constants (`PUNK_IDLE_FPS`, `PUNK_WALK_FPS`, `PUNK_ATTACK_FPS`, `PUNK_HURT_FPS`, `PUNK_DEATH_FPS`)
- [x] 1.2 Add `PUNK_ATTACK_ACTIVE_START_FRAME` and `PUNK_ATTACK_ACTIVE_END_FRAME` constants in `EnemyConfig.ts` for the punch hitbox window

## 2. Phaser Animation Registration Helper

- [x] 2.1 Create exported function `registerPunkAnims(scene: Phaser.Scene): void` in a new file `finalfight-AAA/src/enemy/EnemyAnimations.ts`; use `if (!scene.anims.exists(key))` guard before each `scene.anims.create()` call
- [x] 2.2 Register: idle (repeat:-1), walk (repeat:-1), attack (repeat:0), hurt (repeat:0), death (repeat:0) using `ASSET_KEY_PUNK_IDLE`, `ASSET_KEY_PUNK_WALK`, `ASSET_KEY_PUNK_PUNCH`, `ASSET_KEY_PUNK_HURT`, `ASSET_KEY_PUNK_DEATH`

## 3. EnemyController — Animation & Flip

- [x] 3.1 Add `animKeys: Readonly<Record<EnemyState, string>>` and `showHealthBar?: boolean` to `EnemyControllerConfig` interface
- [x] 3.2 Store `_animKeys` as `protected readonly` in `EnemyController`; call `this._sprite.play(this._animKeys[state], true)` inside `_onEnterState()` for every state
- [x] 3.3 Add `this._sprite.setFlipX(!this._facingRight)` call inside `fixedUpdate()` (after the early-return guard)

## 4. EnemyHealthBar

- [x] 4.1 Create `finalfight-AAA/src/enemy/EnemyHealthBar.ts` with exported constants: `HP_BAR_WIDTH`, `HP_BAR_HEIGHT`, `HP_BAR_OFFSET_Y`, `HP_BAR_BG_COLOR`, `HP_BAR_FILL_COLOR`; class owns a `Phaser.GameObjects.Graphics` at depth `GameConfig.ENTITY_DEPTH + 1`
- [x] 4.2 Implement `update(hp: number, maxHp: number, x: number, y: number): void` — clear, draw background rect, draw fill rect proportional to `hp/maxHp`; skip redraw if hp unchanged (cache `_lastHp`)
- [x] 4.3 Implement `destroy(): void` — destroy the Graphics object
- [x] 4.4 Add `_healthBar: EnemyHealthBar | null` to `EnemyController`; create in constructor when `showHealthBar !== false`; call `_healthBar?.destroy()` in `_onEnterState(Death)` and in `destroy()`; call `_healthBar?.update(...)` in `fixedUpdate()`

## 5. Archetype Controllers — Anim Registration & Config

- [x] 5.1 `BrawlerController`: import `registerPunkAnims` and call in constructor; build `animKeys` map with punk constants and pass to `super()`
- [x] 5.2 `RusherController`: same — call `registerPunkAnims`, build `animKeys`, pass to `super()`
- [x] 5.3 `KnifeThrowerController`: same
- [x] 5.4 `BossController`: call `registerPunkAnims`, build `animKeys`, pass `showHealthBar: false` to `super()`

## 6. PlayerController — applyHit

- [x] 6.1 Add `applyHit(event: HitEvent): void` to `PlayerController`; call `this.takeDamage(event.damage)`, apply `event.knockbackX`/`event.knockbackY` as sprite velocity, transition player to Hurt state; no-op if invincible

## 7. GameScene — Enemy-Hit Wiring

- [x] 7.1 Inside `GameScene.create()`, extend the existing `onHit` lambda: add branch `if (targetId === 'player' && event.teamTag === 'enemy') { this._player?.applyHit(event); }`

## 8. PreloadScene — Load punk-death

- [x] 8.1 Ensure `PreloadScene` (or equivalent) loads `ASSET_KEY_PUNK_DEATH` as a spritesheet using `ASSET_FRAME_CONFIG[ASSET_KEY_PUNK_DEATH]`

## 9. Tests

- [x] 9.1 Update all enemy controller test mocks to add `play: vi.fn()` and `anims: { create: vi.fn(), exists: vi.fn() }` to the sprite mock
- [x] 9.2 Add tests in `EnemyController.test.ts`: animation key played on each state transition; `setFlipX` called every fixedUpdate tick; health bar `update` called every tick; health bar `destroy` called on Death entry and on `destroy()`
- [x] 9.3 Add tests in `BrawlerController.test.ts`: `registerPunkAnims` called on construction; `animKeys` map passed to base
- [x] 9.4 Create `EnemyHealthBar.test.ts`: bar width proportional to HP; full bar at max HP; empty bar at 0 HP; `destroy` destroys Graphics object
- [x] 9.5 Add tests in `PlayerController.test.ts` (or `PlayerHealth.test.ts`): `applyHit` reduces HP; no-op when invincible; knockback velocity applied
- [x] 9.6 Add test in `GameScene.test.ts` (or integration test): enemy-team hit event calls `player.applyHit`; combo counter not incremented on enemy hit
