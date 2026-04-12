## REMOVED Requirements

### Requirement: Random 1–3 sushi items dropped on barrel destruction
**Reason**: Multi-drop (1–3 items) is replaced by a single probabilistic drop. The new model: at most one item drops, and whether it drops is determined by a per-prop `dropChance` value. This matches the revised design where barrels may drop nothing.
**Migration**: Remove `ITEM_DROP_COUNT_MIN/MAX` usage from `DestructibleProp.ts`. The constants may remain in `GameConfig.ts` for future use. Callers of `onSpawnItem` now call it at most once per destruction event.

### Requirement: Item spawn positions scattered within ground plane
**Reason**: Only one item can drop per barrel now, making scatter/spacing logic unnecessary. The single item spawns at the barrel's world position directly.
**Migration**: Remove scatter radius and minimum spacing logic from the drop code. `ITEM_DROP_SCATTER_RADIUS` and `ITEM_DROP_MIN_SPACING` constants may remain for future use.

## MODIFIED Requirements

### Requirement: Probabilistic single health item dropped on barrel destruction
When a `DestructibleProp` of subtype `barrel` is destroyed, it SHALL call `onSpawnItem` at most once. The drop SHALL only occur if `Math.random() < def.dropChance`. If `def.dropChance === 0` or `def.dropItemType === null`, no item is spawned.

#### Scenario: Item spawned when random roll succeeds
- **WHEN** a barrel is destroyed and `Math.random()` returns a value less than `def.dropChance`
- **THEN** `onSpawnItem` is called exactly once with `type: 'health'` at the barrel's world position

#### Scenario: No item when random roll fails
- **WHEN** a barrel is destroyed and `Math.random()` returns a value greater than or equal to `def.dropChance`
- **THEN** `onSpawnItem` is NOT called

#### Scenario: No item when dropChance is zero
- **WHEN** a barrel with `dropChance === 0` is destroyed
- **THEN** `onSpawnItem` is not called regardless of the random roll

#### Scenario: No item when dropItemType is null
- **WHEN** a barrel with `dropItemType === null` is destroyed
- **THEN** `onSpawnItem` is not called

### Requirement: Sushi sprite variant selected randomly per item
Each dropped health item SHALL use one of the two registered sushi sprite keys (`ASSET_KEY_PROP_SUSHI_1` or `ASSET_KEY_PROP_SUSHI_2`). The variant SHALL be chosen independently using uniform random selection at drop time.

#### Scenario: Variant 1 or 2 selected
- **WHEN** `onSpawnItem` is called for a sushi drop
- **THEN** the `ItemPickup` created in `StageManager` uses either `ASSET_KEY_PROP_SUSHI_1` or `ASSET_KEY_PROP_SUSHI_2`

### Requirement: Drop constants named
All drop-related probability values SHALL be defined as named constants. No magic numbers may appear inline in the drop logic.

#### Scenario: Drop chance constant referenced
- **WHEN** a barrel def with no explicit `dropChance` is configured
- **THEN** `BARREL_DROP_CHANCE_DEFAULT` from `GameConfig.ts` is used as a fallback
