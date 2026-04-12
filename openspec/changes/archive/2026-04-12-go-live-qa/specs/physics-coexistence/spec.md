## ADDED Requirements

### Requirement: No physics body separation between player and enemy sprites
The game engine SHALL NOT register any `physics.add.collider()` call between the
player sprite and any enemy sprite. Phaser 3 Arcade physics MUST NOT apply
automatic velocity-transfer or separation impulses through body-to-body contact
between the player and enemies.

All velocity changes between the player and enemies SHALL be applied exclusively
through the hitbox/hurtbox overlap callback system (`CombatSystem.onHit`).

A comment `/* no player-enemy collider — intentional: FR-GOLV-01 */` SHALL be
present in `GameScene.create()` at the location where physics groups are
initialised, making the invariant explicit.

#### Scenario: Player can overlap an enemy position without being pushed
- **WHEN** the player sprite's world position equals an enemy sprite's world position
- **THEN** neither the player nor the enemy receives any velocity from body contact

#### Scenario: Wall boundary still blocks player
- **WHEN** the player walks to the left or right stage boundary
- **THEN** the player stops at the boundary (enforced by `StageManager._clampPlayer`)
  and is not pushed through it

#### Scenario: No collider registered in GameScene
- **WHEN** `GameScene.create()` executes
- **THEN** `scene.physics.world.colliders.getActive()` returns only the colliders
  associated with hitbox groups, never a player-vs-enemy body collider
