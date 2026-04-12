## 1. Types and Data Structures

- [ ] 1.1 Create `src/stage/StageData.ts`: define `ParallaxLayerDef`, `ScrollTriggerDef`, `SpawnZoneData`, `SpawnEntryDef`, `PropDef`, `StageData` interfaces/types
- [ ] 1.2 Create `src/data/stage1Data.ts`: export `stage1Data` constant with `id:1`, `stageWidth:6000`, 6 parallax layers, 3 scroll triggers, 3 spawn zones, ≥4 props
- [ ] 1.3 Create `src/data/stage2Data.ts`: export `stage2Data` constant with `id:2`, `stageWidth:6000`, 6 parallax layers, 4 spawn zones, ≥4 props
- [ ] 1.4 Create `src/data/stage3Data.ts`: export `stage3Data` constant with `id:3`, `stageWidth:7000`, 6 parallax layers, 5 spawn zones, ≥6 props

## 2. GameConfig Constants

- [ ] 2.1 Add `SPAWN_OFFSCREEN_MARGIN = 64` to `GameConfig.ts`
- [ ] 2.2 Add `ITEM_DESPAWN_TICKS = 900` (15 s × 60 fps) to `GameConfig.ts`
- [ ] 2.3 Add `ITEM_HEALTH_RESTORE_AMOUNT = 30` to `GameConfig.ts`
- [ ] 2.4 Add `PROP_BARREL_HP = 3` and `PROP_CRATE_HP = 2` to `GameConfig.ts`
- [ ] 2.5 Add `STAGE_TRANSITION_FADE_MS = 500` to `GameConfig.ts`
- [ ] 2.6 Add `PLAYER_BODY_HALF_WIDTH = 20` to `GameConfig.ts`

## 3. ParallaxBackground

- [ ] 3.1 Create `src/stage/ParallaxBackground.ts`: constructor accepts `scene` and `ParallaxLayerDef[]`; creates one `TileSprite` per layer
- [ ] 3.2 Implement `fixedUpdate(cameraDeltaX: number)`: update each layer's `tilePositionX` by `cameraDeltaX × speedFactor`
- [ ] 3.3 Register `fixedUpdate` via `scene.registerFixedUpdate` in constructor; unregister in `destroy()`
- [ ] 3.4 Ensure layers are added in depth order so rearmost (index 0) renders behind all others

## 4. StageTimer

- [ ] 4.1 Create `src/stage/StageTimer.ts`: constructor accepts `scene`; initialise `ticksRemaining = 180 * GameConfig.TARGET_FPS`
- [ ] 4.2 Implement `fixedUpdate()`: decrement `ticksRemaining`; when it reaches 0 emit `scene.events.emit('timeUp')` and stop decrementing
- [ ] 4.3 Expose `secondsRemaining` getter: `Math.floor(ticksRemaining / TARGET_FPS)`
- [ ] 4.4 Register/unregister `fixedUpdate` via `scene.registerFixedUpdate` / `scene.unregisterFixedUpdate`

## 5. SpawnController

- [ ] 5.1 Create `src/stage/SpawnController.ts`: constructor accepts `scene` and `SpawnZoneData`; initialises enemy-remaining count
- [ ] 5.2 Implement `activate(cameraX: number)`: start staggered spawn timers using Phaser `scene.time.addEvent`
- [ ] 5.3 Each timer callback calls `scene.events.emit('enemySpawn', { archetype, x: cameraX + CANVAS_WIDTH + SPAWN_OFFSCREEN_MARGIN, y: groundMidY })`
- [ ] 5.4 Listen for `scene.events.on('enemyDefeated')`: decrement living count; when 0 emit `'zoneCleared'` on this SpawnController
- [ ] 5.5 Expose `isCleared` boolean getter

## 6. DestructibleProp

- [ ] 6.1 Create `src/stage/DestructibleProp.ts`: constructor accepts `scene`, `PropDef`, `cameraXRef: { value: number }`; creates sprite at `worldX - cameraX`, depth-sorted
- [ ] 6.2 Store `hp`, `worldX`, `worldY` from `PropDef`; implement `hit(damage: number)` method
- [ ] 6.3 Implement screen-space update in `fixedUpdate(cameraX)`: `sprite.x = worldX - cameraX`
- [ ] 6.4 When `hp <= 0`: play Phaser tween (scale 1→1.3 in 150ms, then alpha 1→0 in 200ms) then call `sprite.destroy()`
- [ ] 6.5 After destruction, if `PropDef.dropItemType` is not null: call `spawnItemCallback(type, worldX, worldY)`
- [ ] 6.6 Register hurtbox overlap check in `fixedUpdate` against `scene.playerHitboxGroup` active bodies

## 7. ItemPickup

- [ ] 7.1 Create `src/stage/ItemPickup.ts`: constructor accepts `scene`, `type: 'health'|'score'`, `worldX`, `worldY`, `cameraXRef`; creates image sprite
- [ ] 7.2 Register `fixedUpdate` to update screen position: `sprite.x = worldX - cameraX`
- [ ] 7.3 Implement `ticksRemaining = ITEM_DESPAWN_TICKS`; decrement each tick; at 0 call `despawn()`
- [ ] 7.4 `despawn()`: play alpha-fade tween (500ms) then destroy
- [ ] 7.5 Implement overlap check against player sprite in `fixedUpdate`; on overlap call `collect()`
- [ ] 7.6 `collect()`: apply effect (`player.heal()` or `scene.events.emit('scorePickup')`); cancel despawn timer; destroy sprite

## 8. StageManager

- [ ] 8.1 Create `src/stage/StageManager.ts`: constructor accepts `scene`, `StageData`, `stageIndex`; stores camera state `cameraX = 0`
- [ ] 8.2 Instantiate `ParallaxBackground`, `StageTimer`, one `SpawnController` per spawn zone, and all `DestructibleProp` / `ItemPickup` from data
- [ ] 8.3 Implement `fixedUpdate(dt)`: (a) advance `cameraX` toward player position if not locked; (b) clamp; (c) check scroll triggers; (d) update `scene.cameras.main.scrollX`
- [ ] 8.4 Implement scroll-trigger check: if `cameraX + CANVAS_WIDTH >= trigger.worldX` and trigger not yet fired → lock camera, activate matching SpawnController
- [ ] 8.5 Listen for each SpawnController's `'zoneCleared'`; when all zones cleared AND player worldX >= stageWidth → unlock camera, emit `'stageClear'`
- [ ] 8.6 On `'stageClear'`: freeze all movement; call `scene.cameras.main.fadeOut(STAGE_TRANSITION_FADE_MS)`; in `'camerafadeoutcomplete'` callback: start next stage or end screen
- [ ] 8.7 Create two static Arcade wall bodies at `worldX=0` and `worldX=stageWidth`; clamp player X against them each fixed tick
- [ ] 8.8 Register `fixedUpdate` via `scene.registerFixedUpdate`; unregister in `destroy()`

## 9. GameScene Integration

- [ ] 9.1 Add `private _stageManager: StageManager | null = null` field to `GameScene`
- [ ] 9.2 Add `itemPickupGroup: Phaser.GameObjects.Group` field; initialise in `create()`
- [ ] 9.3 Instantiate `StageManager` in `GameScene.create()` using `stage1Data` (hardcoded for Phase 3; runtime switching deferred)
- [ ] 9.4 Implement `getStageManager(): StageManager | null` accessor

## 10. Tests

- [ ] 10.1 Write `src/__tests__/StageTimer.test.ts`: timer decrements, `secondsRemaining` getter, `timeUp` event at zero, no double-fire
- [ ] 10.2 Write `src/__tests__/ParallaxBackground.test.ts`: layer count ≥ 3, `tilePositionX` updates proportional to delta, rearmost layer has smallest speed factor
- [ ] 10.3 Write `src/__tests__/SpawnController.test.ts`: stagger delay respected, `enemySpawn` event emitted, `zoneCleared` after all enemies defeated, no premature clear
- [ ] 10.4 Write `src/__tests__/StageManager.test.ts`: camera one-way advance, lock on trigger, unlock after `zoneCleared`, stage-clear detection, boundary clamping
- [ ] 10.5 Write `src/__tests__/DestructibleProp.test.ts`: `hit()` reduces HP, no response when dead, item spawn on destruction, no item when `dropItemType` null
- [ ] 10.6 Write `src/__tests__/ItemPickup.test.ts`: collect applies effect, despawn after 900 ticks, collected pickup does not fire despawn
- [ ] 10.7 Run `npm test` and confirm all tests pass (exit 0)
