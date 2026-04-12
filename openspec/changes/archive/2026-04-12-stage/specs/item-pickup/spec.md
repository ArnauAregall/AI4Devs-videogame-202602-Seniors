## ADDED Requirements

### Requirement: FR-IP-01 Item collected on player overlap
An `ItemPickup` SHALL be collected immediately when the player walks over it (their ground-plane Y band overlaps the item's position). Collection applies the item effect and destroys the object.

#### Scenario: Health pickup restores HP
- **WHEN** the player overlaps a health ItemPickup
- **THEN** `player.heal(ITEM_HEALTH_RESTORE_AMOUNT)` is called and the pickup is destroyed

#### Scenario: Score pickup awards points
- **WHEN** the player overlaps a score ItemPickup
- **THEN** a `'scorePickup'` event is emitted on the scene event bus and the pickup is destroyed

### Requirement: FR-IP-02 Auto-despawn after 15 seconds
An `ItemPickup` that has not been collected SHALL despawn automatically 15 seconds (900 fixed ticks at 60 fps) after appearing on the ground plane.

#### Scenario: Pickup despawns after timeout
- **WHEN** 900 fixed ticks have elapsed since the pickup was created
- **THEN** the pickup plays a brief fade-out tween and is destroyed

#### Scenario: Collected pickup does not despawn
- **WHEN** the player collects the pickup before the timer expires
- **THEN** the despawn timer is cancelled and no tween plays after collection

### Requirement: FR-IP-03 ItemPickup positioned on ground plane
The `ItemPickup` image SHALL be rendered at the world position of the destroyed prop, with its Y coordinate on the ground plane, translated to screen space each fixed tick.

#### Scenario: Pickup appears at prop world position
- **WHEN** a prop at world position (2000, groundMidY) is destroyed
- **THEN** the ItemPickup image is created at world position (2000, groundMidY)
