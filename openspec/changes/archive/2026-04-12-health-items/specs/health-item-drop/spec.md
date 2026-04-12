## ADDED Requirements

### Requirement: Random 1–3 sushi items dropped on barrel destruction
When a `DestructibleProp` of subtype `barrel` is destroyed, it SHALL call `onSpawnItem` between one and three times. The count SHALL be determined by uniform random selection over the integer range [1, 3] using a seeded or standard `Math.random()` call at the moment of destruction.

#### Scenario: At least one item spawned
- **WHEN** a barrel is destroyed
- **THEN** `onSpawnItem` is called at least once with `type: 'health'` and world coordinates near the barrel's last position

#### Scenario: At most three items spawned
- **WHEN** a barrel is destroyed
- **THEN** `onSpawnItem` is called at most three times in the same destruction event

#### Scenario: Drop count random over [1, 3]
- **WHEN** a barrel is destroyed 100 times in sequence
- **THEN** the observed drop counts include 1, 2, and 3, with no count outside that range

### Requirement: Sushi sprite variant selected randomly per item
Each dropped health item SHALL use one of the two registered sushi sprite keys (`ASSET_KEY_PROP_SUSHI_1` or `ASSET_KEY_PROP_SUSHI_2`). The variant SHALL be chosen independently for each item using uniform random selection.

#### Scenario: Variant 1 or 2 selected
- **WHEN** `onSpawnItem` is called for a sushi drop
- **THEN** the item type is `'health'` and the `ItemPickup` created in `GameScene` uses `ASSET_KEY_PROP_SUSHI_1` or `ASSET_KEY_PROP_SUSHI_2`

### Requirement: Item spawn positions scattered within ground plane
All dropped items SHALL be spawned at distinct world positions within a scatter radius of `ITEM_DROP_SCATTER_RADIUS` pixels from the barrel's last world X/Y position. No spawn position may fall outside the walkable ground-plane Y boundaries.

#### Scenario: Items do not fully overlap at spawn
- **WHEN** three items are dropped from the same barrel
- **THEN** each item's world X position differs from the others by at least `ITEM_DROP_MIN_SPACING` pixels

#### Scenario: Spawn Y clamped to ground plane
- **WHEN** a random scatter Y would exceed the ground-plane boundary
- **THEN** the spawn Y is clamped to the nearest valid ground-plane Y value

### Requirement: Drop constants named
All drop-related numeric values — scatter radius, minimum item spacing, drop count range min and max — SHALL be defined as named constants. No magic numbers may appear inline in the drop logic.

#### Scenario: Constants used in drop code
- **WHEN** the drop code is reviewed
- **THEN** `ITEM_DROP_SCATTER_RADIUS`, `ITEM_DROP_MIN_SPACING`, `ITEM_DROP_COUNT_MIN`, `ITEM_DROP_COUNT_MAX` (or equivalent names) are present as exports in a config file
