## 1. Data Model

- [x] 1.1 Add `dropChance: number` field to `PropDef` interface in `StageData.ts`
- [x] 1.2 Add `BARREL_DROP_CHANCE_DEFAULT` constant to `GameConfig.ts`
- [x] 1.3 Update `stage1Data` barrel and crate entries in `StageData.ts` with appropriate `dropChance` values (barrels: ~0.5, crates: 0)

## 2. DestructibleProp Simplification

- [x] 2.1 Remove `_spriteCrushed` field and its `scene.add.image()` creation call from the constructor
- [x] 2.2 Rename `_spriteHealthy` to `_sprite` for clarity (single sprite)
- [x] 2.3 Remove the intermediate hit-1 tint logic (no more `BARREL_DAMAGED_TINT` application on first hit)
- [x] 2.4 Update `_scheduleDestroy()` to apply `BARREL_CRUSHED_TINT` to `_sprite` before the fade tween
- [x] 2.5 Remove hit-2 sprite swap logic (`_spriteHealthy.setVisible(false)` / `_spriteCrushed.setVisible(true)`)
- [x] 2.6 Update `tick()` to only update `_sprite` screen position (remove `_spriteCrushed` position sync)

## 3. Drop Logic

- [x] 3.1 Replace multi-drop loop in `_destroy()` with a single probabilistic call: `if (Math.random() < def.dropChance) onSpawnItem(...)`
- [x] 3.2 Remove scatter positioning logic from the drop call (spawn at barrel world position directly)
- [x] 3.3 Ensure sushi sprite variant is still randomly selected by `StageManager._spawnItem()` (no change needed if already random)

## 4. Tests

- [x] 4.1 Update `DestructibleProp.test.ts`: remove intermediate hit-1 tint tests and hit-2 crushed sprite tests
- [x] 4.2 Add test: single sprite created in constructor (assert `_spriteCrushed` does not exist or scene.add.image called once)
- [x] 4.3 Add test: crushed tint applied to `_sprite` when `_scheduleDestroy()` is called
- [x] 4.4 Add test: `onSpawnItem` called when `Math.random()` mocked below `dropChance`
- [x] 4.5 Add test: `onSpawnItem` NOT called when `Math.random()` mocked at or above `dropChance`
- [x] 4.6 Add test: `onSpawnItem` NOT called when `dropItemType === null` regardless of `dropChance`
- [x] 4.7 Run full test suite; all tests must pass

## 5. Build & Cleanup

- [x] 5.1 Run `npm run build` — zero TypeScript errors
- [x] 5.2 Remove `BARREL_DAMAGED_TINT` constant from `GameConfig.ts` if no longer used
- [x] 5.3 Verify in-game: single barrel sprite renders correctly (no side-by-side duplicates)
