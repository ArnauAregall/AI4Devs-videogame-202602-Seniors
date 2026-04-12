## ADDED Requirements

### Requirement: EnemyManager creates enemies from spawn events
`EnemyManager` SHALL listen for `enemySpawn` events from the scene event emitter. Each event contains `{ type: 'brawler'|'rusher'|'knife-thrower'|'boss', x: number, y: number, zoneId: string }`. The manager instantiates the correct controller and registers it. References: FR-EA-01, FR-EA-25.

#### Scenario: Brawler is created on spawn event with type='brawler'
- **WHEN** 'enemySpawn' event fires with type='brawler'
- **THEN** a BrawlerController is created and tracked by the manager

#### Scenario: One-time spawn per zone
- **WHEN** a 'enemySpawn' event fires for a zoneId that has already been spawned
- **THEN** the manager ignores the event (no duplicate enemy)

### Requirement: EnemyManager pauses attacks during grab
`EnemyManager` SHALL listen for `playerGrabStart` and `playerGrabEnd` events. During grab, all active enemies in Attack state must exit Attack and may not re-enter Attack until `playerGrabEnd` fires. References: FR-EA-18.

#### Scenario: Enemies exit Attack on grab start
- **WHEN** 'playerGrabStart' fires and an enemy is in Attack state
- **THEN** that enemy transitions to Aggro state

#### Scenario: Enemies resume after grab end
- **WHEN** 'playerGrabEnd' fires
- **THEN** enemies may re-enter Attack state normally

### Requirement: EnemyManager resolves item drops
`EnemyManager.onEnemyDeath(id, dropTable)` SHALL select at most one item using the probability weights in `dropTable`. If an item is selected, it emits `itemDrop` with `{ type, x, y }`. References: FR-EA-14, FR-EA-15.

#### Scenario: Drop probability is respected
- **WHEN** dropTable has one item with probability 0.0 (never)
- **THEN** no item is dropped

#### Scenario: At most one item per death
- **WHEN** onEnemyDeath is called with a drop table
- **THEN** at most one itemDrop event fires

### Requirement: EnemyManager routes HitEvents to correct enemy
`EnemyManager` SHALL subscribe to `combatSystem.onHit` and route each HitEvent to the enemy controller matching `targetId`. References: FR-EA-11, NFR-EA-02.

#### Scenario: HitEvent reaches the correct enemy
- **WHEN** CombatSystem dispatches a HitEvent with targetId = 'enemy_1'
- **THEN** the controller with id = 'enemy_1' receives the hit

#### Scenario: Unknown targetId is ignored
- **WHEN** HitEvent targetId does not match any active enemy
- **THEN** no action is taken
