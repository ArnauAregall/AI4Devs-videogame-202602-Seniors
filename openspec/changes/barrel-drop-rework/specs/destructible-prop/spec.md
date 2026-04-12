## MODIFIED Requirements

### Requirement: FR-DP-01 Two destructible prop subtypes
The stage SHALL support at least two destructible prop subtypes differentiated by data: `barrel` and `crate`. Both use the same `DestructibleProp` class; subtype is passed as a constructor argument. Each `DestructibleProp` SHALL use a **single sprite** object. No second hidden sprite is created at construction time.

#### Scenario: Barrel prop created from data
- **WHEN** `new DestructibleProp(scene, propDef)` is called with `{ type: 'barrel', ... }`
- **THEN** the sprite texture key `ASSET_KEY_PROP_BARREL` is used, and only one `scene.add.image()` call is made for this prop

#### Scenario: Crate prop created from data
- **WHEN** `new DestructibleProp(scene, propDef)` is called with `{ type: 'crate', ... }`
- **THEN** the sprite texture key `ASSET_KEY_PROP_BARREL` is used as a placeholder (no dedicated asset available; noted in AssetKeys.ts), and only one `scene.add.image()` call is made

### Requirement: FR-DP-04 Item reveal on destruction
When a prop is destroyed it SHALL optionally reveal an `ItemPickup` at the prop's world position. Both the item type and drop probability are defined in the `PropDef` data object. The drop is executed by evaluating `Math.random() < def.dropChance` at the moment of destruction. If the roll fails, no item is created.

#### Scenario: Item spawned on prop destruction when roll succeeds
- **WHEN** a prop with `dropItemType: 'health'` and `dropChance > 0` is destroyed and the random roll succeeds
- **THEN** an `ItemPickup` of type `'health'` is created at the prop's world position

#### Scenario: No item when dropItemType is null
- **WHEN** a prop with `dropItemType: null` is destroyed
- **THEN** no `ItemPickup` is created

#### Scenario: No item when dropChance roll fails
- **WHEN** a prop with `dropItemType: 'health'` is destroyed but the random roll value is >= `dropChance`
- **THEN** no `ItemPickup` is created
