# destructible-prop Specification

## Purpose
TBD - created by archiving change stage. Update Purpose after archive.
## Requirements
### Requirement: FR-DP-01 Two destructible prop subtypes
The stage SHALL support at least two destructible prop subtypes differentiated by data: `barrel` and `crate`. Both use the same `DestructibleProp` class; subtype is passed as a constructor argument.

#### Scenario: Barrel prop created from data
- **WHEN** `new DestructibleProp(scene, propDef)` is called with `{ type: 'barrel', ... }`
- **THEN** the sprite texture key `ASSET_KEY_PROP_BARREL` is used

#### Scenario: Crate prop created from data
- **WHEN** `new DestructibleProp(scene, propDef)` is called with `{ type: 'crate', ... }`
- **THEN** the sprite texture key `ASSET_KEY_PROP_BARREL` is used as a placeholder (no dedicated asset available; noted in AssetKeys.ts)

### Requirement: FR-DP-02 Hit detection via hitbox overlap
A `DestructibleProp` SHALL register a hurtbox (static Arcade body rectangle). When an active player **or enemy** hitbox overlaps the hurtbox, the prop SHALL take one hit. The prop's hit registration uses hit count, not accumulated damage: each overlapping hitbox event counts as exactly one hit regardless of the hitbox's damage value.

#### Scenario: Prop takes a hit on player hitbox overlap
- **WHEN** an active player attack hitbox rect overlaps the prop's hurtbox rect
- **THEN** `_hitCount` increments by one

#### Scenario: Prop takes a hit on enemy hitbox overlap
- **WHEN** an active enemy attack hitbox rect overlaps the prop's hurtbox rect
- **THEN** `_hitCount` increments by one

#### Scenario: Dead prop does not respond to hits
- **WHEN** prop `_hitCount` has already reached `def.hp`
- **THEN** further overlap events are ignored

### Requirement: FR-DP-03 Destruction animation and despawn
When a prop's HP reaches zero the `DestructibleProp` SHALL play a destruction sequence (scale-up Phaser tween, then fade-out) completing within 500 ms, then destroy the game object.

#### Scenario: Destruction completes within 500 ms
- **WHEN** prop HP drops to 0
- **THEN** the sprite is fully destroyed within 500 ms

### Requirement: FR-DP-04 Item reveal on destruction
When a prop is destroyed it SHALL optionally reveal an `ItemPickup` at the prop's world position. The reveal probability and item type are defined in the `PropDef` data object.

#### Scenario: Item spawned on prop destruction
- **WHEN** a prop with `dropItemType: 'health'` is destroyed
- **THEN** an ItemPickup of type `'health'` is created at the prop's world position

#### Scenario: No item when dropItemType is null
- **WHEN** a prop with `dropItemType: null` is destroyed
- **THEN** no ItemPickup is created

