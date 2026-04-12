## ADDED Requirements

### Requirement: Base enemy patrol behaviour
`EnemyController` SHALL implement patrol: move at `patrolSpeed` toward the current patrol target; when reaching the zone boundary, flip direction and repeat. Runs only in Patrol state. References: FR-EA-06.

#### Scenario: Enemy reverses at zone boundary
- **WHEN** enemy sprite x reaches the right boundary of its spawn zone
- **THEN** patrol direction flips to left and the enemy continues moving

#### Scenario: Patrol speed is constant
- **WHEN** enemy is in Patrol state
- **THEN** horizontal velocity magnitude equals `patrolSpeed` each fixed tick

### Requirement: Aggro movement toward player
`EnemyController` SHALL move toward `playerX` at `walkSpeed` each fixed tick when in Aggro state. Facing is updated to match movement direction. References: FR-EA-08.

#### Scenario: Enemy moves left when player is to the left
- **WHEN** playerX < enemy.x and state is Aggro
- **THEN** enemy.x decreases by walkSpeed each tick

#### Scenario: Enemy stops moving when within attack range
- **WHEN** distance to player ≤ attackRange and state is Aggro
- **THEN** enemy transitions to Attack state

### Requirement: Hurt interrupt
Any incoming HitEvent MUST immediately transition the enemy to Hurt state (except when in Death state). Hurt state lasts `hitStunFrames` ticks before returning to Aggro. References: FR-EA-11.

#### Scenario: Hit interrupts Patrol
- **WHEN** enemy is in Patrol state and receives a HitEvent
- **THEN** state transitions to Hurt

#### Scenario: Hit does not interrupt Death
- **WHEN** enemy is in Death state and receives a HitEvent
- **THEN** state remains Death and no further transition fires

### Requirement: Knockdown accumulation
`EnemyController` SHALL accumulate knockback magnitude from HitEvents. When accumulated knockback exceeds `KNOCKDOWN_THRESHOLD`, the enemy transitions to Knockdown state and the accumulator resets. References: FR-EA-12.

#### Scenario: Knockdown triggers when threshold exceeded
- **WHEN** cumulative knockbackX values received exceed KNOCKDOWN_THRESHOLD
- **THEN** enemy transitions to Knockdown state

### Requirement: Death sequence with item drop
When HP reaches zero, enemy MUST transition to Death state, play the death animation, call `EnemyManager.onEnemyDeath(id, dropTable)` for item-drop resolution, and then destroy itself after `DEATH_LINGER_FRAMES` ticks. References: FR-EA-13, FR-EA-14, FR-EA-15, FR-EA-25.

#### Scenario: Enemy is removed after death
- **WHEN** HP reaches zero and DEATH_LINGER_FRAMES ticks elapse
- **THEN** the sprite is destroyed and the hurtbox is removed from CombatSystem

#### Scenario: At most one item dropped per death
- **WHEN** `resolveItemDrop(dropTable)` is called
- **THEN** it returns at most one item type (or null) based on probability weights

### Requirement: CombatSystem hurtbox registration lifecycle
`EnemyController` SHALL register its hurtbox with CombatSystem on construction and remove it on `destroy()`. Hurtbox position is updated each fixed tick via `hurtbox.update(sprite.x, sprite.y)`. References: FR-EA-11.

#### Scenario: Hurtbox exists after construction
- **WHEN** an EnemyController is constructed with a CombatSystem
- **THEN** `combatSystem.getHurtbox(id)` returns a non-null HurtboxComponent

#### Scenario: Hurtbox removed on destroy
- **WHEN** `destroy()` is called on the controller
- **THEN** `combatSystem.getHurtbox(id)` returns undefined

### Requirement: No phase-through between enemies
`EnemyController` SHALL maintain a minimum horizontal separation of `ENEMY_SEPARATION_MIN_PX` from any other active enemy. Position is clamped after movement each tick. References: FR-EA-17.

#### Scenario: Two enemies cannot fully overlap
- **WHEN** two enemies are at the same x position
- **THEN** after one fixed tick, their x positions differ by at least ENEMY_SEPARATION_MIN_PX
