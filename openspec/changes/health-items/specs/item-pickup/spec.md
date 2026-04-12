## MODIFIED Requirements

### Requirement: FR-IP-01 Item collected on entity overlap (player or enemy)
An `ItemPickup` SHALL be collected immediately when **the player or any enemy** walks over it (their ground-plane Y band overlaps the item's position). Collection applies the item effect to the collecting entity and destroys the object. The item is marked inactive on first contact; a simultaneous overlap by a second entity in the same tick is ignored.

#### Scenario: Health pickup restores player HP
- **WHEN** the player overlaps a health `ItemPickup`
- **THEN** `player.heal(ITEM_HEALTH_RESTORE_AMOUNT)` is called and the pickup is destroyed

#### Scenario: Health pickup restores enemy HP
- **WHEN** an enemy entity overlaps a health `ItemPickup`
- **THEN** `enemy.heal(ITEM_HEALTH_RESTORE_AMOUNT)` is called and the pickup is destroyed

#### Scenario: Score pickup awards points (unchanged)
- **WHEN** the player overlaps a score `ItemPickup`
- **THEN** a `'scorePickup'` event is emitted on the scene event bus and the pickup is destroyed

#### Scenario: Already-collected item not collected again
- **WHEN** a second entity overlaps an `ItemPickup` that was already collected in the same tick
- **THEN** no effect is applied and no event is emitted

#### Scenario: Entity in knockdown state cannot collect
- **WHEN** an entity in knockdown, death, or invincibility state overlaps a health `ItemPickup`
- **THEN** the overlap is ignored and the item remains on the stage

### Requirement: FR-IP-02 Despawn timer is optional per item type
An `ItemPickup` SHALL accept a `despawnTicks: number | null` constructor parameter. When `despawnTicks` is a positive number, the pickup auto-despawns after that many fixed ticks as before. When `despawnTicks` is `null`, no despawn timer is created and the item persists indefinitely until collected or the scene ends.

#### Scenario: Pickup with timer despawns after timeout
- **WHEN** an `ItemPickup` is created with `despawnTicks: 900` and 900 ticks elapse without collection
- **THEN** the pickup plays a brief fade-out tween and is destroyed

#### Scenario: Pickup with null timer does not despawn
- **WHEN** an `ItemPickup` is created with `despawnTicks: null` and 1000 ticks elapse without collection
- **THEN** the pickup remains active on the stage

#### Scenario: Collected pickup cancels timer (unchanged)
- **WHEN** the collecting entity overlaps the pickup before the timer expires
- **THEN** the despawn timer is cancelled and no tween plays after collection
