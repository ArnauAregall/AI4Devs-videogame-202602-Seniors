## 1. Constants

- [x] 1.1 Add `BARREL_DAMAGED_TINT` constant (e.g. `0xffaa88`) to `GameConfig.ts` for the intermediate damage visual state
- [x] 1.2 Add `BARREL_CRUSHED_TINT` constant (already used as `0x888888` inline in `DestructibleProp.ts` — extract to config)
- [x] 1.3 Add `ITEM_DROP_COUNT_MIN = 1` and `ITEM_DROP_COUNT_MAX = 3` constants to `GameConfig.ts`
- [x] 1.4 Add `ITEM_DROP_SCATTER_RADIUS` (e.g. 48 px) and `ITEM_DROP_MIN_SPACING` (e.g. 24 px) constants to `GameConfig.ts`
- [x] 1.5 Update `ITEM_HEALTH_RESTORE_AMOUNT` from `30` to `25` in `GameConfig.ts` to match FR-HI-30

## 2. DestructibleProp — Damage States

- [x] 2.1 In `DestructibleProp.hit()`, after incrementing `_hitCount`, apply `BARREL_DAMAGED_TINT` to `_spriteHealthy` when `_hitCount === 1`
- [x] 2.2 In `DestructibleProp.hit()`, swap to the crushed sprite (hide healthy, show crushed with `BARREL_CRUSHED_TINT`) when `_hitCount === 2`, consistent with existing `_spriteCrushed` infrastructure
- [x] 2.3 Remove inline `0x888888` hex literal from `DestructibleProp` constructor and reference `GameConfig.BARREL_CRUSHED_TINT`

## 3. DestructibleProp — Multi-Drop

- [x] 3.1 Replace the existing single `onSpawnItem(def.dropItemType, ...)` call in `_scheduleDestroy` with a loop that calls `onSpawnItem` N times, where N = `Math.floor(Math.random() * (COUNT_MAX - COUNT_MIN + 1)) + COUNT_MIN`
- [x] 3.2 Apply scatter to each item: offset world X per item by `i * ITEM_DROP_MIN_SPACING + randomOffset` (clamped to stage bounds), keeping world Y on the ground plane
- [x] 3.3 Pass sushi sprite variant key per item randomly (`ASSET_KEY_PROP_SUSHI_1` or `ASSET_KEY_PROP_SUSHI_2`) via the item type or a separate param to `onSpawnItem`; if `ItemType` doesn't support variant, add it to `StageData.ts`

## 4. ItemPickup — Optional Timer

- [x] 4.1 Add optional `despawnTicks: number | null = GameConfig.ITEM_DESPAWN_TICKS` parameter to `ItemPickup` constructor
- [x] 4.2 Guard the despawn countdown in `_fixedUpdate`: skip tick decrement and despawn logic when `despawnTicks` was `null`
- [x] 4.3 Update `StageManager.ts` and `GameScene.ts` call sites that create `ItemPickup` instances to pass `null` for sushi/health drops from barrels

## 5. ItemPickup — Enemy Collection & Sushi Sprite

- [x] 5.1 Replace `private readonly getPlayer: () => PlayerController | null` with a broader `getEntities: () => Array<{ sprite: ...; heal: (n: number) => void; state?: string; isInvincible?: boolean }>` callback, or add a separate `getEnemies` callback alongside the existing `getPlayer`
- [x] 5.2 In `_fixedUpdate`, after the player overlap check, iterate over all active non-dead enemies and apply the same proximity overlap check; call `_collect(entity)` on first match
- [x] 5.3 In `_collect`, add a state-exclusion guard: skip collection if the entity is in knockdown, death, or invincibility state
- [x] 5.4 Update `ItemPickup` sprite texture: sushi items should use `ASSET_KEY_PROP_SUSHI_1` or `ASSET_KEY_PROP_SUSHI_2` instead of `ASSET_KEY_CYBERPUNK_DECORATIONS`; pass the texture key as a constructor argument
- [x] 5.5 On collection emit a `'healthRestored'` event on `scene.events` so enemy overhead bars and the HUD update

## 6. GameScene Wiring — Enemy Hitboxes Against Props

- [x] 6.1 In `GameScene.fixedUpdate()`, after the existing player-hitbox-vs-prop check, add a loop that queries each active enemy's current hitbox bounds against each active `DestructibleProp` hurtbox and calls `prop.hit(1)` on overlap
- [x] 6.2 Ensure the enemy hitbox query respects the same "once per attack active-frame window" guard that the player hitbox uses (no repeated hits from the same swing)

## 7. Tests

- [x] 7.1 Update `DestructibleProp.test.ts`: add tests for damaged tint after hit 1, crushed sprite after hit 2, and multi-drop count range [1, 3]
- [x] 7.2 Update `ItemPickup.test.ts`: add tests for `despawnTicks: null` (no despawn), enemy collection happy path, and state-exclusion (knockdown entity does not collect)
- [ ] 7.3 Create `HealthItemDrop.test.ts`: test scatter positioning (items not fully overlapping), drop count distribution (all values in [1,3] observed), and sushi variant randomness

## 8. Verification

- [x] 8.1 Run `npm run test` in `finalfight-AAA/` — all tests must pass (0 failures)
- [x] 8.2 Run `npm run build` in `finalfight-AAA/` — TypeScript strict build must succeed with 0 errors
